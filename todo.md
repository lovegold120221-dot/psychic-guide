# Orbit / Psychic Guide — File-by-File Strike Report

## Verdict

This project is a strong UI prototype, but the original zip was **not production-ready**. The biggest issues were not styling problems; they were auth, meeting routing, token minting, and environment hygiene.

I patched the highest-risk blockers directly in the project and left a clear remaining punch list.

## Critical fixes applied

| Area | Original problem | Fix applied |
|---|---|---|
| `/api/meetings` auth | Used the service-role Supabase client to call `auth.getUser()`, which does not read the user session from request cookies correctly. Meeting API could fail auth or behave incorrectly. | Added server-session auth through `createServerSupabase()`, then uses admin client only after authentication. |
| Stream token endpoint | Accepted arbitrary `userId` from request body and minted a Stream token for it. | Ignores client-supplied identity and mints tokens only for the authenticated Supabase user. |
| Stream chat rooms | Every meeting used the same `orbit_meeting_room_main` channel. | Channel now derives from `callId`, isolating chats per meeting. |
| Join flow | `/join?mid=...` did not populate the form, and joining navigated to `/meeting` without preserving the selected meeting ID. | `JoinClient` now reads `mid`, pre-fills the ID, and routes to `/meeting?call=<meetingId>`. |
| Public Stream key fallback | Client fallback used a hardcoded Stream API key. | Removed hardcoded fallback; missing env now fails cleanly. |
| Meeting link copy | Used hardcoded `https://orbit.vercel.app`. | Uses `window.location.origin`. |
| Meeting ID entropy | Used `Math.random()` for meeting IDs. | Uses `crypto.getRandomValues()` when available. |
| Route protection | Middleware omitted `/meeting`. | Added `/meeting` to protected paths. |
| Env setup | README referenced `.env.example`, but file was missing. | Added `.env.example`. |
| Lint setup | `npm run lint` launched an interactive ESLint setup prompt. | Added `.eslintrc.json` and ESLint dev dependencies. |
| Supabase temp files | `supabase/.temp` included local/project metadata and pooler URL. | Removed from the cleaned project. |

## Validation performed

| Check | Result |
|---|---|
| `npm ci --ignore-scripts` | Passed. |
| `npx tsc --noEmit --pretty false` | Passed after patches. |
| `npm run lint` | Passed with warnings only. Warnings are image optimization and two React hook warnings in Settings. |
| `npm audit` | Still reports vulnerable dependency chain around Next/PostCSS. Fix path requires a breaking Next upgrade according to npm audit. |
| `next build` | Compiled, type-checked, and generated static pages in the sandbox. It did not return a clean exit before sandbox timeout while collecting build traces, so I cannot honestly mark full production build as fully verified. |

## Remaining production blockers

1. **Passcodes are stored in plaintext** and are not enforced when joining. Add hash storage plus a meeting lookup/verify endpoint before users enter a call.
2. **Guest/no-account joining is advertised but not actually implemented.** `/meeting` is protected. Decide whether guests are allowed, then implement either authenticated-only UX or a scoped guest-token flow.
3. **Next/PostCSS advisories remain.** `npm audit fix --force` wants a breaking upgrade to Next 16.x. Schedule that migration rather than forcing it blindly.
4. **Recording controls are UI-wired but not storage/retention/policy-ready.** Production needs permission checks, recording state persistence, and storage lifecycle rules.
5. **Settings effects are local-only.** Camera/audio selections are not applied to the actual Stream call media pipeline yet.
6. **Host controls rely on client-side role detection.** Server-issued Stream roles and meeting ownership must be enforced.
7. **No rate limiting.** Token, meeting create, reset, and join endpoints need abuse protection.
8. **RLS/admin split needs a final security pass.** I fixed the critical session-auth error, but production should minimize service-role usage.

## File-by-file strike

| File | Status | Strike notes |
|---|---:|---|
| `.env.example` | Patched | Added required environment placeholders. |
| `.eslintrc.json` | Patched | Added Next core-web-vitals lint config. |
| `.gitignore` | Keep | Reasonable baseline. Ensure `.env*`, `.next`, `node_modules`, and Supabase temp files stay excluded. |
| `README.md` | Needs update | Feature claims overstate current implementation: E2EE, no-account join, passcode enforcement, and production validation need correction. |
| `next-env.d.ts` | Added/generated | Normal Next TypeScript support file. |
| `next.config.js` | Keep | Remote image hosts are declared. Revisit if using Next Image extensively. |
| `package.json` | Patched | Added ESLint dev dependencies so lint command is non-interactive. Still needs Next security upgrade plan. |
| `package-lock.json` | Patched | Updated to reflect lint dependencies. |
| `postcss.config.js` | Keep | Standard Tailwind/PostCSS setup. |
| `tailwind.config.ts` | Keep | UI tokens look coherent. No immediate blocker. |
| `tsconfig.json` | Keep | Strict mode enabled. Good. |
| `vercel.json` | Keep | Basic Vercel configuration. Add env docs/checks before deploy. |
| `src/app/layout.tsx` | Keep | Root provider structure is okay. Consider server/client split later for lower hydration weight. |
| `src/app/page.tsx` | Patched | Removed unused `Link` import. |
| `src/app/LandingClient.tsx` | Needs update | Landing advertises no-account join, but meeting route is protected. Align UX with actual auth strategy. |
| `src/app/globals.css` | Keep | Visual foundation is strong. Needs accessibility contrast pass later. |
| `src/app/(app)/layout.tsx` | Keep | Client route guard works, but middleware now also protects `/meeting`. |
| `src/app/(app)/dashboard/page.tsx` | Keep | Thin wrapper. |
| `src/app/(app)/dashboard/DashboardClient.tsx` | Needs update | Fetch errors are swallowed; add visible error/retry state. |
| `src/app/(app)/meeting/page.tsx` | Keep | Thin wrapper. |
| `src/app/(app)/meeting/MeetingClient.tsx` | Needs update | Uses URL `call` with fallback main room. Should avoid default shared room in production. |
| `src/app/(app)/schedule/page.tsx` | Keep | Thin wrapper. |
| `src/app/(app)/schedule/ScheduleClient.tsx` | Needs update | Schedules meetings but passcodes remain plaintext and unenforced. |
| `src/app/(app)/settings/page.tsx` | Keep | Thin wrapper. |
| `src/app/(app)/settings/SettingsClient.tsx` | Needs update | Preview works separately from real call media; lint warns on hook dependencies/ref cleanup. |
| `src/app/api/meetings/route.ts` | Patched | Fixed auth, validation, ownership filtering, and update allowlist. |
| `src/app/api/stream-token/route.ts` | Patched | Fixed arbitrary token minting by using authenticated Supabase identity. |
| `src/app/auth/callback/page.tsx` | Keep | Recovery/callback logic present. Needs edge-case testing with Supabase email links. |
| `src/app/auth/login/page.tsx` | Keep | Works; lint warns about raw image tag. |
| `src/app/auth/login/LoginForm.tsx` | Keep | Form flow is clear. Add stricter redirect validation if extending. |
| `src/app/auth/reset-password/page.tsx` | Keep | Works; lint warns about raw image tag. |
| `src/app/auth/signup/page.tsx` | Keep | Works; lint warns about raw image tag. |
| `src/app/auth/update-password/page.tsx` | Keep | Works; lint warns about raw image tag. |
| `src/app/join/page.tsx` | Patched | Wrapped `JoinClient` in Suspense for `useSearchParams`. |
| `src/app/join/JoinClient.tsx` | Patched | Reads `mid`, pre-fills meeting ID, and preserves call ID when joining. |
| `src/components/dashboard/ActionButton.tsx` | Keep | Good small component. |
| `src/components/dashboard/Clock.tsx` | Keep | Good SSR-safe clock via hook. |
| `src/components/dashboard/CreateMeetingModal.tsx` | Patched | Copy link now uses current origin instead of hardcoded domain. |
| `src/components/dashboard/UpcomingMeetings.tsx` | Needs update | Displays passcode plainly; consider masking and role-based reveal. |
| `src/components/meeting/BottomToolbar.tsx` | Needs update | Good UX shell; verify controls map to real Stream state under poor network conditions. |
| `src/components/meeting/ChatSidebar.tsx` | Needs update | UI is good; private-message behavior depends on client metadata and should not be treated as secure. |
| `src/components/meeting/FloatingReactions.tsx` | Keep | Fine. |
| `src/components/meeting/ParticipantsPanel.tsx` | Needs update | Host actions must be enforced by Stream role/server permissions, not only local UI. |
| `src/components/meeting/Reactions.tsx` | Keep | Fine. |
| `src/components/meeting/SecurityPanel.tsx` | Needs update | Panel labels imply stronger security than implemented. Align claims with actual controls. |
| `src/components/meeting/VideoCell.tsx` | Needs update | Lint warns on raw image tags. This file appears legacy/unused compared with Stream `VideoGrid`. |
| `src/components/meeting/VideoGrid.tsx` | Keep | Uses Stream Video tiles. Still uses `any` for participant typing; improve with SDK types later. |
| `src/components/meeting/Whiteboard.tsx` | Needs update | Local-only whiteboard. Needs collaboration sync if marketed as meeting feature. |
| `src/components/shared/AuthLayout.tsx` | Keep | Good reusable wrapper. |
| `src/components/shared/DateTimePicker.tsx` | Keep | Good. Needs timezone semantics before production scheduling. |
| `src/components/shared/FormField.tsx` | Keep | Good reusable input. |
| `src/components/shared/GlassCard.tsx` | Keep | Good. |
| `src/components/shared/InitialAvatar.tsx` | Keep | Useful fallback component. |
| `src/components/shared/VideoPreview.tsx` | Needs update | Preview toggles are UI-level; joining does not yet pass those preferences into Stream call state. |
| `src/components/ui/MobileNav.tsx` | Keep | Good. |
| `src/components/ui/Sidebar.tsx` | Keep | Works; lint warns about raw image tag. |
| `src/components/ui/TitleBar.tsx` | Keep | Good visual detail. |
| `src/lib/auth-context.tsx` | Keep | Good base. Consider memoizing Supabase client to avoid re-creation per render. |
| `src/lib/constants.ts` | Needs update | Contains demo meetings/passcode. Do not ship mock credentials or sample passcodes as real data. |
| `src/lib/db.ts` | Needs update | Server helpers are admin-client based. Prefer RLS/session client for non-admin paths. |
| `src/lib/hooks.ts` | Patched | Meeting ID generator now uses Web Crypto when available. |
| `src/lib/meeting-store.tsx` | Patched | Passes `callId` into chat hook for per-meeting chat isolation. |
| `src/lib/stream.ts` | Patched | Removed dev token fallback and hardcoded key; chat channel is per meeting. |
| `src/lib/video.ts` | Needs update | Good Stream Video client hook. Should fail visibly when public Stream key is missing. |
| `src/lib/video-processor.ts` | Needs update | Lightweight effects only; not true segmentation. Consider MediaPipe/WebGPU if real virtual backgrounds are required. |
| `src/lib/supabase/admin.ts` | Keep | Safe if server-only and used after auth. Do not import into client code. |
| `src/lib/supabase/client.ts` | Keep | Standard browser client. Add env validation helper later. |
| `src/lib/supabase/middleware.ts` | Patched | Added `/meeting` to protected routes. |
| `src/lib/supabase/server.ts` | Keep | Standard server client. |
| `src/middleware.ts` | Needs update | Supabase middleware warning appears in Edge build path. Verify deployment runtime behavior on Vercel. |
| `supabase/migrations/20260611000000_orbit_meeting_schema.sql` | Needs update | Good base schema, but plaintext passcode and broad select policies are not production-grade. |

## Recommended next patch order

1. Add meeting lookup + passcode verification before joining.
2. Decide authenticated-only vs guest join and update landing/join flow accordingly.
3. Hash passcodes and migrate existing plaintext values.
4. Upgrade Next/PostCSS in a dedicated branch and retest Stream/Supabase compatibility.
5. Replace remaining raw `<img>` tags or disable that lint rule intentionally.
6. Wire camera/mic/background preferences into actual Stream tracks.
7. Add rate limiting and audit logging to API routes.
