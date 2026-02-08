# Deployment Guide: SEI Interview Coach

This guide details the steps to deploy the SEI Interview Coach to production using Vercel and Supabase.

## 1. Database Setup (Supabase)

The project requires a PostgreSQL database with the `pgvector` extension.

1.  **Create a Supabase Project:**
    - Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Enable `pgvector`:**
    - In the Supabase SQL Editor, run:
      ```sql
      CREATE EXTENSION IF NOT EXISTS vector;
      ```
3.  **Get Connection Strings:**
    - Go to **Project Settings > Database**.
    - Copy the **Transaction Connection String** (for `DATABASE_URL`).
    - Copy the **Session Connection String** (for `DIRECT_URL` used for migrations).

## 2. Environment Variables

You will need to set the following environment variables in Vercel:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Transactional database connection string (Supabase). |
| `DIRECT_URL` | Direct database connection string (Supabase). |
| `OPENAI_API_KEY` | For generating text embeddings (`text-embedding-3-small`). |
| `ANTHROPIC_API_KEY` | For the AI Coach (`claude-sonnet-4-5-20250929`). |

## 3. Deploy to Vercel

1.  **Push to GitHub:** Ensure your latest changes are pushed to your GitHub repository.
2.  **Connect to Vercel:**
    - Go to [Vercel](https://vercel.com/) and import your project.
    - Add the environment variables listed above.
3.  **Configure Build Command:**
    - Vercel should automatically detect Next.js.
    - Ensure the build command includes Prisma generation: `prisma generate && next build`. (Note: Next.js often handles this if `prisma` is in `postinstall` or `build` script).

## 4. Initialize Database

Once deployed, you need to sync the database schema and seed the initial data:

1.  **Run Migrations:**
    ```bash
    npx prisma db push
    ```
2.  **Seed Data:**
    ```bash
    npx prisma db seed
    ```
    *Note: You can run these from your local machine as long as your `.env` points to the production database.*

## 5. Verifying Deployment

1.  **Check Health:** Visit the deployment URL and ensure the landing page loads.
2.  **Test Interview:** Go through the setup flow and start an interview to verify the connection to Anthropic and the database.
3.  **Check Admin Dashboard:** Visit `/admin` to verify you can see and manage documents.
4.  **Test RAG:** Use the RAG Retrieval Test at `/admin/test-retrieval` to ensure similarity search is working.

---
© 2026 Systems Evolution, Inc.
