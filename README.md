# SEI Sales Coach

AI-powered sales practice platform. Run a short **demo** (text or voice) to experience the coach, then get in touch with SEI for full coaching built on your team's data.

## 🚀 Key Features

- **Sales-focused coaching:** Discovery, objection handling, value articulation, and closing. Configurable scenario types (Discovery Call, Product Demo, Objection Handling, Negotiation & Close).
- **Demo experience:** 30-second demo on the coach page; then a clear “Demo Complete” overlay with contact CTA and “End Session & Generate Scorecard.” Voice session disconnects automatically when the demo ends.
- **Dual modes:** Text chat or ElevenLabs voice. Same onboarding and demo timer for both.
- **RAG-powered intelligence:** Retrieval-Augmented Generation with OpenAI embeddings and pgvector for expert context during practice.
- **Central config:** All copy and behavior driven by `lib/agentConfig.ts` (persona, onboarding steps, durations, labels, landing, scorecard, admin).

## 📂 Documentation

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** — Full project doc: user flow, onboarding data mapping, demo behavior, config, file structure, and implementation notes.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Database (Supabase/pgvector), environment variables, and Vercel deployment.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL) with pgvector
- **ORM:** Prisma
- **AI:** OpenAI (embeddings), Anthropic Claude (coach), ElevenLabs (voice)
- **Styling:** Tailwind CSS, Framer Motion, Lucide React

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Supabase (PostgreSQL + pgvector)
- OpenAI API key, Anthropic API key; ElevenLabs optional for voice

### Install and run

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
# Optional: ELEVENLABS_AGENT_ID for voice
```

Then:

```bash
npx prisma db push
npx prisma db seed
npm run dev
```

## 📂 Project structure (high level)

| Path | Purpose |
|------|--------|
| `app/` | Pages: landing, setup, coach, scorecard, about, contact, admin, etc. |
| `app/api/` | Routes: coach, onboarding/session, elevenlabs-signed-url, admin, voice-llm |
| `components/` | DemoBanner, VoiceCoach, landing (Hero, WhatYoullMaster, YourPath, etc.) |
| `lib/` | agentConfig, coaching (RAG + Claude), retrieval, embeddings, prisma, strictness |
| `prisma/` | Schema, seed |

For detailed structure and behavior, see **PROJECT_DOCUMENTATION.md**.

---

© 2026 Systems Evolution, Inc. All rights reserved.
