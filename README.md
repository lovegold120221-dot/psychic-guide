# Orbit Meeting

> Secure video meetings, reimagined. A Zoom-inspired conferencing app with real-time chat powered by **Stream** and authentication, database, and storage backed by **Supabase**.

![Orbit Meeting](https://eburon.ai/icon-eburon.svg)

---

## ✨ Features

### 🎥 Video Conferencing
- **4 layout modes** — Speaker, Two-person, Gallery, and Full-screen views
- **Video tiles** with active-speaker highlighting, mute badges, camera-off avatars
- **Screen sharing** support
- **End-to-end encrypted** meeting rooms

### 💬 Real-time Chat (Stream)
- Live messaging via **Stream Chat SDK** with server-side JWT token generation
- Connection status indicator (Live / Connecting / Error / Offline)
- Reaction events broadcast across participants (👏 👍 ❤️ 😂 🎉)
- Floating animated reaction bubbles
- Message history auto-load on join

### 🔐 Authentication (Supabase)
- Email/password sign-up and sign-in
- Secure session management with HTTP-only cookies
- **Password reset flow**: forgot password → email link → set new password
- Auth middleware protecting dashboard, meeting, and schedule routes
- Auto-redirect: authenticated users skip the landing page

### 📋 Dashboard & Scheduling
- Personal workspace with clock and upcoming meetings
- **Create instant meetings** with auto-generated 9-digit ID
- **Join meetings** by entering or pasting a meeting ID (auto-formatted `xxx-xxx-xxx`)
- **Schedule meetings** with date/time picker, duration presets, passcode option
- Copy meeting ID and meeting link to clipboard

### 🎨 Design
- **Dark theme** with glassmorphism aesthetic
- macOS-style title bar with traffic light controls
- Responsive: mobile bottom nav bar, desktop sidebar
- Ambient glow effects, smooth animations, hover lifts
- iOS safe-area support, native-like touch feedback

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Real-time Chat** | Stream Chat SDK v8 |
| **Auth** | Supabase Auth (SSR) |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel-ready |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Clone & Install

```bash
git clone https://github.com/lovegold120221-dot/psychic-guide.git orbit-meeting
cd orbit-meeting
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `STREAM_API_KEY` | Stream API key | [Stream Dashboard](https://getstream.io/dashboard/) |
| `STREAM_SECRET_KEY` | Stream secret key | Stream Dashboard |
| `NEXT_PUBLIC_STREAM_API_KEY` | Stream public API key (same as above) | Stream Dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard > Settings > API |

### 3. Run

```bash
npm run dev
# → http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/            # Protected routes (auth required)
│   │   ├── dashboard/    # Workspace with clock + meetings
│   │   ├── meeting/      # Video meeting room with Stream Chat
│   │   └── schedule/     # Schedule a meeting
│   ├── api/
│   │   └── stream-token/ # Server-side Stream JWT generation
│   ├── auth/
│   │   ├── callback/     # Email verification & password recovery
│   │   ├── login/        # Sign in form
│   │   ├── reset-password/    # Request password reset
│   │   ├── signup/       # Create account
│   │   └── update-password/  # Set new password after recovery
│   ├── join/             # Join meeting by ID
│   ├── LandingClient.tsx # Public landing page
│   ├── globals.css       # Tailwind + Orbit design tokens
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── middleware.ts     # Route protection
│   └── page.tsx          # Landing route
├── components/
│   ├── dashboard/        # ActionButton, Clock, CreateMeetingModal, UpcomingMeetings
│   ├── meeting/          # BottomToolbar, ChatSidebar, Reactions, VideoCell, VideoGrid
│   ├── shared/           # AuthLayout, DateTimePicker, FormField, GlassCard, VideoPreview
│   └── ui/               # MobileNav, Sidebar, TitleBar
└── lib/
    ├── auth-context.tsx  # Supabase Auth React context
    ├── constants.ts      # Participants, layouts, reactions, meetings data
    ├── hooks.ts          # useMeetingState, useReactionAnimation, useClock, etc.
    ├── stream.ts         # Stream Chat client hook
    └── supabase/
        ├── client.ts     # Browser client (createBrowserClient)
        ├── middleware.ts  # Auth middleware logic
        └── server.ts     # Server client (createServerClient)
```

---

## 🧭 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with join + sign-up |
| `/auth/login` | Public | Sign in |
| `/auth/signup` | Public | Create account |
| `/auth/reset-password` | Public | Request password reset email |
| `/auth/update-password` | Public (recovery) | Set new password after email link |
| `/auth/callback` | Public | Email verification & recovery callback |
| `/dashboard` | Auth required | Personal workspace |
| `/meeting` | Auth required | Meeting room with video grid + chat |
| `/schedule` | Auth required | Schedule a meeting |
| `/join` | Auth required | Join meeting by ID |

---

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables (from `.env.local`)
4. Deploy 🚀

---

## 📸 Screenshots

| Desktop Landing | Meeting Room | Mobile |
|----------------|--------------|--------|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## 🧪 Validation

```bash
npm run build    # Zero errors expected
npm run dev      # Dev server on localhost:3000
npm run lint     # Next.js lint
```

---

## 📄 License

MIT — built by [Eburon AI](https://eburon.ai), founded by Joe Lernout.
