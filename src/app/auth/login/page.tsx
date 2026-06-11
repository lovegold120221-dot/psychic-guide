import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orbit-blue/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-orbit-panel border border-zinc-700/50 p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center mb-5">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Orbit Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back to Orbit</h1>
          <p className="text-sm text-zinc-400 mt-2">Sign in to your account</p>
        </div>

        <Suspense
          fallback={
            <div className="bg-orbit-panel/70 rounded-2xl p-8 text-center">
              <svg className="w-6 h-6 animate-spin text-orbit-blue mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
