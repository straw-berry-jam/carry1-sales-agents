# SEI Interview Coach

AI-powered interview practice tool backed by 30+ years of hiring expertise. Master every interview with personalized coaching, real-time feedback, and comprehensive scorecards.

## 🚀 Key Features

- **Expert-Backed Methodology:** Built on insights from 100,000+ real-world interviews conducted over 30 years.
- **RAG-Powered Intelligence:** Uses Retrieval-Augmented Generation (RAG) with OpenAI embeddings and `pgvector` to provide expert context during practice.
- **Real-time Voice Practice:** Realistic voice-based interview simulations with AI-driven feedback.
- **Knowledge Base Dashboard:** Full administrative suite to manage expert content, taxonomies, and retrieval logic.
- **Detailed Scorecards:** Comprehensive performance breakdown across technical depth, cultural fit, and communication.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** Supabase (PostgreSQL) with `pgvector`
- **ORM:** Prisma
- **AI Integration:** OpenAI API (`text-embedding-3-small`) for embeddings and Anthropic API (`claude-sonnet-4-5-20250929`) for the AI Coach.
- **Styling:** Tailwind CSS
- **Icons/UI:** Lucide React, Framer Motion, Shadcn UI (Radix)

## 📂 Project Structure

```
sei-interview-coach/
├── app/                    # Next.js app directory
│   ├── admin/             # Knowledge Base Dashboard & RAG Testing
│   ├── api/               # API Routes (Documents, Retrieval, etc.)
│   ├── coach/             # AI Interview Coach interface
│   ├── scorecard/         # Post-interview results
│   ├── setup/             # Pre-interview configuration
├── lib/                   # Core logic (Prisma Singleton, Embeddings, RAG Retrieval)
├── prisma/                # Database schema, migrations, and seed scripts
└── components/            # Shared UI components
```

## 🧠 RAG Implementation

The core of the AI coach is its ability to retrieve expert knowledge during an interview.

1.  **Ingestion Pipeline:** 
    - Documents are created in the Admin Panel.
    - On save, content is automatically chunked (approx. 800 chars) using sentence-boundary detection.
    - OpenAI `text-embedding-3-small` generates 1536-dimension vectors for each chunk.
    - Chunks and vectors are stored in Supabase via `pgvector`.
2.  **Retrieval Logic:**
    - When a user asks a question, we generate a query embedding.
    - A cosine similarity search (`<=>` operator) finds the most relevant chunks.
    - Results are filtered by `coach_id`, `status='active'`, and specific taxonomies (Roles, Stages, Document Types).
3.  **Testing:**
    - Use the **[RAG Retrieval Test](/admin/test-retrieval)** page to manually query the index and inspect similarity scores.

## 🛠️ Development Standards

- **Type Safety:** The project uses strict TypeScript. Recent refactors resolved complex type mismatches in the AI interaction layer to ensure predictable state management.
- **Singleton Pattern:** Database connections are managed via a Prisma singleton (`lib/prisma.ts`) to prevent exhaustion of connection pools in serverless environments.
- **Error Boundaries:** Embedding generation is decoupled from document persistence; if the AI service is down, the document is still saved, and an error is logged for manual retry.

## 🔐 Admin & Content Quality

The Knowledge Base is the primary source of truth for the AI.

- **Content Guidelines:** Access the full guidelines via the info banner on the Admin dashboard.
- **Workflow:** 
    - `Draft`: Use for initial creation and review. Drafts are *not* indexed for RAG.
    - `Active`: Once reviewed by an SEI expert, set to Active to enable RAG retrieval.
- **Batch Processing:** Document updates automatically regenerate and re-index embeddings in batches to ensure data consistency.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account (PostgreSQL with `pgvector` enabled)
- OpenAI API Key

### Installation

1.  **Clone & Install:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file:
    ```text
    DATABASE_URL="postgresql://..."
    DIRECT_URL="postgresql://..." # For migrations
    OPENAI_API_KEY="sk-..."
    ANTHROPIC_API_KEY="sk-ant-..."
    ```

3.  **Database Sync:**
    ```bash
    npx prisma db push
    npx prisma db seed
    ```

4.  **Launch:**
    ```bash
    npm run dev
    ```

## 🚀 Deployment

The project is configured for automated deployments to Vercel via GitHub.
- **Production Hook:** A manual deploy hook is available for triggering production builds after database schema changes.

---
© 2026 Systems Evolution, Inc. All rights reserved.


