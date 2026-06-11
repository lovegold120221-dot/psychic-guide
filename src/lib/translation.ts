"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleGenAI, LiveServerMessage, Modality, MediaResolution, Session } from "@google/genai";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  timestamp: string;
}

// Convert Float32Array (from Web Audio API) to 16-bit PCM Base64
function floatTo16BitPCMBase64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true for little-endian
  }
  
  // Convert ArrayBuffer to Base64
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [apiReady, setApiReady] = useState(true);
  
  const sessionRef = useRef<Session | null>(null);
  const idRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodesRef = useRef<Map<string, MediaStreamAudioSourceNode>>(new Map());
  
  // Audio playback for Gemini's output
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  
  // Accumulation refs for transcription to avoid react state race conditions
  const currentOriginalRef = useRef("");
  const currentTranslatedRef = useRef("");
  const activeEntryIdRef = useRef<string | null>(null);

  // Hook into Stream SDK to get remote participants
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const getLanguageName = useCallback((code: string) => {
    const langs: Record<string, string> = {
      "en": "English", "es": "Spanish", "fr": "French", "de": "German",
      "zh-CN": "Chinese", "ja": "Japanese", "ko": "Korean", "hi": "Hindi",
      "nl": "Dutch", "it": "Italian", "pt": "Portuguese", "ru": "Russian"
    };
    return langs[code] || code;
  }, []);

  const playAudioChunk = useCallback((float32Data: Float32Array) => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const ctx = playbackContextRef.current;
    
    // Create Audio Buffer
    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    const now = ctx.currentTime;
    let playTime = nextPlayTimeRef.current;
    if (playTime < now) {
      // Add a small safety buffer (50ms) to prevent glitching at start
      playTime = now + 0.05;
    }
    
    source.start(playTime);
    nextPlayTimeRef.current = playTime + buffer.duration;
  }, []);

  const stopTranslation = useCallback(async () => {
    setIsTranslating(false);
    
    // Stop Audio Contexts
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      try { playbackContextRef.current.close(); } catch (e) {}
      playbackContextRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (e) {}
      scriptProcessorRef.current = null;
    }
    
    sourceNodesRef.current.forEach(node => {
      try { node.disconnect(); } catch (e) {}
    });
    sourceNodesRef.current.clear();

    nextPlayTimeRef.current = 0;
    activeEntryIdRef.current = null;
    currentOriginalRef.current = "";
    currentTranslatedRef.current = "";

    // Stop Gemini Session
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }
  }, []);

  const startTranslation = useCallback(async (lang: string) => {
    setTargetLanguage(lang);
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
      setApiReady(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "models/gemini-3.5-live-translate-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
          contextWindowCompression: {
            triggerTokens: "0",
            slidingWindow: { targetTokens: "0" },
          },
          translationConfig: {
            targetLanguageCode: lang,
            echoTargetLanguage: true,
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        } as any,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setApiReady(true);
            setIsTranslating(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Play audio if present
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("audio/pcm")) {
                  // Decode base64 PCM16 back to audio buffer
                  const binary = atob(part.inlineData.data);
                  const buffer = new ArrayBuffer(binary.length);
                  const view = new DataView(buffer);
                  for (let i = 0; i < binary.length; i++) {
                    view.setUint8(i, binary.charCodeAt(i));
                  }
                  
                  // Convert PCM16 to Float32
                  const pcm16 = new Int16Array(buffer);
                  const float32 = new Float32Array(pcm16.length);
                  for (let i = 0; i < pcm16.length; i++) {
                    float32[i] = pcm16[i] / 32768.0;
                  }
                  
                  playAudioChunk(float32);
                }
              }
            }

            // Handle transcription (original and translated)
            const inputTrans = message.serverContent?.inputTranscription;
            const outputTrans = message.serverContent?.outputTranscription;
            
            if (inputTrans?.text || outputTrans?.text) {
              if (!activeEntryIdRef.current) {
                activeEntryIdRef.current = `t-${++idRef.current}`;
                currentOriginalRef.current = "";
                currentTranslatedRef.current = "";
              }
              
              const currentId = activeEntryIdRef.current;
              
              if (inputTrans?.text) {
                currentOriginalRef.current += inputTrans.text;
              }
              if (outputTrans?.text) {
                currentTranslatedRef.current += outputTrans.text;
              }
              
              const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              
              setEntries(prev => {
                const existingIndex = prev.findIndex(e => e.id === currentId);
                const updatedEntry: TranslationEntry = {
                  id: currentId,
                  original: currentOriginalRef.current.trim(),
                  translated: currentTranslatedRef.current.trim(),
                  timestamp,
                };
                
                if (existingIndex > -1) {
                  const copy = [...prev];
                  copy[existingIndex] = updatedEntry;
                  return copy;
                } else {
                  return [...prev.slice(-49), updatedEntry];
                }
              });
              
              if (inputTrans?.finished || outputTrans?.finished) {
                activeEntryIdRef.current = null;
              }
            }
          },
          onerror: (e) => {
            console.error("Gemini Live Error:", e);
            stopTranslation();
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            stopTranslation();
          }
        }
      });
      
      sessionRef.current = session;
      
      // Setup Web Audio API to capture incoming audio at 16kHz
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      // ScriptProcessor to capture mixed audio and stream it
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        if (!sessionRef.current) return;
        
        // Simple VAD check to avoid sending silence
        const isSilent = !inputData.some(val => Math.abs(val) > 0.005);
        if (isSilent) return;

        const base64Data = floatTo16BitPCMBase64(inputData);
        sessionRef.current.sendRealtimeInput({
          media: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Data
          }
        });
      };
      
      scriptProcessorRef.current = processor;
      processor.connect(audioContextRef.current.destination); // Required to trigger onaudioprocess

    } catch (err: any) {
      console.error("Translation start error:", err.message);
      setApiReady(false);
      setIsTranslating(false);
    }
  }, [stopTranslation, playAudioChunk]);

  // Sync participant audio tracks to AudioContext dynamically
  useEffect(() => {
    if (!isTranslating || !audioContextRef.current || !scriptProcessorRef.current) {
      sourceNodesRef.current.forEach(node => {
        try { node.disconnect(); } catch (e) {}
      });
      sourceNodesRef.current.clear();
      return;
    }
    
    const currentAudioContext = audioContextRef.current;
    const currentProcessor = scriptProcessorRef.current;
    const activeSourceIds = new Set<string>();
    
    const remoteParticipants = participants.filter(p => p.userId !== localParticipant?.userId);
    
    remoteParticipants.forEach(p => {
      // 1. Microphone audio track
      if (p.audioStream) {
        const sourceId = `${p.userId}-audio`;
        activeSourceIds.add(sourceId);
        if (!sourceNodesRef.current.has(sourceId)) {
          try {
            const sourceNode = currentAudioContext.createMediaStreamSource(p.audioStream);
            sourceNode.connect(currentProcessor);
            sourceNodesRef.current.set(sourceId, sourceNode);
          } catch (e) {
            console.error(`Error connecting remote audio for ${p.userId}:`, e);
          }
        }
      }
      
      // 2. Screen share audio track
      if (p.screenShareStream && p.screenShareStream.getAudioTracks().length > 0) {
        const sourceId = `${p.userId}-screen-audio`;
        activeSourceIds.add(sourceId);
        if (!sourceNodesRef.current.has(sourceId)) {
          try {
            const audioOnlyStream = new MediaStream(p.screenShareStream.getAudioTracks());
            const sourceNode = currentAudioContext.createMediaStreamSource(audioOnlyStream);
            sourceNode.connect(currentProcessor);
            sourceNodesRef.current.set(sourceId, sourceNode);
          } catch (e) {
            console.error(`Error connecting screen share audio for ${p.userId}:`, e);
          }
        }
      }
    });
    
    // Disconnect old sources
    sourceNodesRef.current.forEach((node, sourceId) => {
      if (!activeSourceIds.has(sourceId)) {
        try { node.disconnect(); } catch (e) {}
        sourceNodesRef.current.delete(sourceId);
      }
    });
    
  }, [participants, isTranslating, localParticipant?.userId]);

  const toggleTranslation = useCallback(async () => {
    if (isTranslating) {
      await stopTranslation();
    } else {
      await startTranslation(targetLanguage);
    }
  }, [isTranslating, targetLanguage, startTranslation, stopTranslation]);

  const translateText = useCallback(async (text: string) => {
    console.warn("translateText is deprecated in Live Translation mode");
  }, []);

  const changeLanguage = useCallback(async (code: string) => {
    setTargetLanguage(code);
    if (isTranslating) {
      await stopTranslation();
      await startTranslation(code);
    }
  }, [isTranslating, startTranslation, stopTranslation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTranslation();
    };
  }, [stopTranslation]);

  return {
    isTranslating,
    targetLanguage,
    targetLangName: getLanguageName(targetLanguage),
    entries,
    apiReady,
    toggleTranslation,
    changeLanguage,
    translateText,
    setEntries,
  };
}
