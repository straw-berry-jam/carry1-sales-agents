# SEI Sales Coach — Project Documentation

This document describes the current state of the SEI Sales Coach application: structure, features, configuration, and implementation details.

---

## 1. Overview

**SEI Sales Coach** is an AI-powered sales practice platform. Users can run short **demo** sessions (text or voice) to experience the coach, then are directed to contact SEI for full coaching built on their team’s data.

- **Product name:** SEI Sales Coach  
- **Metadata title:** "SEI Sales Coach | Master Every Sales Pitch"  
- **Primary contact:** cminer@sei.com (mailto used in banner, demo-over message, and CTAs)

---

## 2. User Flow

1. **Landing (`/`)** — Hero, value props, “Try the Demo” and “Contact Us”. Chat preview mockup with typewriter animation. Stats bar. Footer.
2. **Setup (`/setup`)** — 3-step onboarding:
   - **Step 1:** “Tell us about the deal” — What should we call you? (name), Prospect Company, Deal Context (optional).
   - **Step 2:** “What’s your scenario?” — Scenario type (Discovery Call, Product Demo, Objection Handling, Negotiation & Close), Session duration (Quick / Standard / Deep), and interaction mode (Voice or Text).
   - **Step 3:** “How would you like to practice?” — Voice or Text; mic test for voice.
   - On “Start Coaching”, onboarding data is synced and stored; user is sent to `/coach`.
3. **Coach (`/coach`)** — Coaching session (text or voice). After **30 seconds**, the demo ends: overlay appears, input is disabled, voice session disconnects (if active). User sees “Demo Complete” card with mailto and “End Session & Generate Scorecard” button.
4. **Scorecard (`/scorecard`)** — Email collection, then simulated scorecard (sales categories: Product Knowledge, Rapport Building, Communication, Problem Solving). “Back to Coach” and “Practice Again” links.

Additional pages: **About** (`/about`), **Contact** (`/contact`), **Privacy** (`/privacy`), **Terms** (`/terms`), **Admin** (`/admin`, `/admin/test-retrieval`).

---

## 3. Key Features

### 3.1 Demo experience

- **Demo banner** (`components/DemoBanner.tsx`): Fixed top bar, dismissible. “You are viewing a demo…” and “Contact us” mailto. Shown on setup, coach, and scorecard.
- **Demo timer (coach page):** 30-second timer starts when the session starts (`isStarted` true). When it fires:
  - `demoEnded` is set to `true`.
  - Text input (and send button) are disabled.
  - **Voice:** `VoiceCoach` receives `demoEnded` and calls `conversation.endSession()`; voice UI is hidden (`invisible`).
  - **Overlay:** Centered card in main content (both text and voice): “Demo Complete”, thanks message, “get in touch with us” mailto, “End Session & Generate Scorecard” button. No auto-redirect; user clicks to go to scorecard.

### 3.2 Onboarding data mapping (setup → coach/API)

Form fields are mapped so that coach and APIs receive a consistent sales context:

| Stored key       | Source / value |
|------------------|----------------|
| `preferredName`  | “What should we call you?” field (form value: `formData.role`) |
| `role`           | Hardcoded `"Sales Rep"` |
| `company`        | Prospect company (`formData.company`) |
| `resumeText`     | Deal context (`formData.jobDescription`) |
| `interviewType`  | Scenario type (e.g. Discovery Call) |
| `duration`       | quick / standard / deep |
| `interactionMode`| voice / text |
| `sessionId`      | Set by `/api/onboarding/session` when syncing |

Used in:

- `syncOnboardingData` (payload to `/api/onboarding/session` and `localStorage.setItem('onboarding-data', ...)`).
- `handleStartCoaching` (final `localStorage.setItem` via `mapFormDataToOnboarding`).

### 3.3 Voice

- **VoiceCoach** (`components/VoiceCoach.tsx`): ElevenLabs conversation; connects with onboarding context. Accepts `demoEnded`; when `demoEnded && status === 'connected'`, calls `conversation.endSession()`.
- **Coach page:** In voice mode, when `demoEnded` the VoiceCoach container is `invisible` so the overlay is the only visible UI.

### 3.4 AI coach (text)

- **lib/coaching.ts:** RAG + Claude. System prompt uses `agentConfig.userNoun` (“sales rep”), `agentConfig.sessionNoun` (“sales conversation”), “user’s preferred name”, “user’s background”. No interview/candidate wording.
- **API:** `POST /api/coach` (and streaming variant) use session context (role, company, interviewType, resumeText, preferredName, etc.) from onboarding.

### 3.5 Scorecard

- Categories: Product Knowledge, Rapport Building, Communication, Problem Solving.
- Copy is sales-focused (e.g. “Analyzing your sales conversation…”, “Our AI is evaluating your sales technique, discovery skills, and objection handling…”).
- “Back to Coach” and “Practice Again” link to `/coach`.

---

## 4. Configuration

Single source of truth: **`lib/agentConfig.ts`**.

- **Branding:** `agentName`, `orgName`, `fullTitle`, `coachId`, `elevenLabsAgentId`.
- **Persona / instructions:** `persona`, `systemInstructions`, `contextLabel`, `sessionNoun`, `userNoun`, `objectivesPrompt`, `initialMessage`, `fallbackGreeting`.
- **Onboarding:** `onboarding` (step titles, scenario types, durations, labels, placeholders, loading messages, etc.).
- **Coach UI:** `coachPage` (header, thinking/waiting/voice labels, end session label).
- **Landing:** `landing` (hero, whatYoullMaster, yourPath, finalCta, footer, `builtByExperts` — can be null to hide that section).
- **Scorecard:** `scorecard` (title, emailPrompt, generateButton).
- **Admin:** `admin` (stages, content quality note, dashboard subtitle).

Landing “Built by experts” block is only rendered when `agentConfig.landing.builtByExperts != null`.

---

## 5. Project structure (summary)

```
app/
  layout.tsx          # Metadata: title "SEI Sales Coach | Master Every Sales Pitch", description (sales)
  page.tsx            # Landing
  setup/page.tsx      # 3-step onboarding
  coach/page.tsx      # Text + voice coach, 30s demo timer, demo-over overlay
  scorecard/page.tsx  # Email → scorecard view
  about/, contact/, privacy/, terms/
  api/
    coach/            # POST coach, objectives
    onboarding/session # Session create/sync
    elevenlabs-signed-url/
    admin/, voice-llm/...

components/
  DemoBanner.tsx      # Fixed demo banner (setup, coach, scorecard)
  VoiceCoach.tsx      # ElevenLabs voice UI; demoEnded → endSession
  landing/            # Hero, WhatYoullMaster, YourPath, FinalCTA, Footer, BuiltByExperts

lib/
  agentConfig.ts     # All copy and config
  coaching.ts         # RAG + Claude (generateCoachResponse, streamCoachResponse, generateKeyObjectives)
  retrieval.ts, embeddings.ts, strictness.ts, prisma.ts, voiceSessionStore.ts, mock-data.ts
```

---

## 6. Important implementation details

- **Setup steps:** 3 steps only. No file upload step; deal context is the optional text area. Step titles: “Tell us about the deal”, “What’s your scenario?”, “How would you like to practice?”.
- **Coach demo:** One timer (30s) for both text and voice. No per-message or per-turn counting; `demoEnded` is purely time-based.
- **Hero chat preview:** Decorative typewriter animation (first coach bubble → user bubble → “Listening…” waveform → second coach bubble), then 3s pause and replay. Implemented with `useState` + `useEffect` and character index / visibility state.
- **DemoBanner:** Fixed `top-0 left-0 right-0 z-50`, `bg-black/60 backdrop-blur-sm`, dismissible.
- **About:** Copy is generic SEI AI/solutions (“designs and delivers innovative AI solutions that help clients build better businesses”); no hiring/interview/culture copy. Contact: same mailto and “Get in touch” style where used.

---

## 7. Environment and deployment

- **Env vars:** `DATABASE_URL`, `DIRECT_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `ELEVENLABS_AGENT_ID` (optional for voice).
- **Build:** `prisma generate && next build` (see `package.json` scripts).
- **Deploy:** Vercel; see `DEPLOYMENT.md` for Supabase (pgvector), env, and post-deploy DB steps.

---

## 8. References

- **README.md** — High-level features, tech stack, RAG, getting started.
- **DEPLOYMENT.md** — Database setup, env vars, Vercel, verify steps.
- **lib/agentConfig.ts** — Full copy and config for the app.

---

*Last updated to reflect the current SEI Sales Coach demo flow, 30s timer, onboarding mapping, and sales-focused copy and config.*
