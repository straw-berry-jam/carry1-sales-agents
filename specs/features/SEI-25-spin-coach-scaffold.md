---
linear: https://linear.app/issue/SEI-25/spin-selling-coach-scaffold
ticket: SEI-25
---

# Feature Specification: SPIN Selling Coach Scaffold

**Feature Branch**: `SEI-25-spin-coach-scaffold`
**Created**: 2026-03-07
**Status**: Draft
**Linear Ticket**: [SEI-25](https://linear.app/issue/SEI-25/spin-selling-coach-scaffold)
**Input**: User description: "We are building a new SPIN selling coach experience alongside the existing general sales coach. The existing coach must not be touched or modified in any way. Scaffold: branch, routes (copy from existing), agents table migration. Home CTA update deferred."

## Summary

Scaffold a separate SPIN selling coach experience alongside the existing general sales coach. No changes to existing coach code. This scope: new routes under `app/coach/spin/` (three pages, copied from existing coach) and a new Supabase `agents` table migration. Home CTA update is deferred; when added later, hardcode `/coach/spin` (no config layer for a single CTA; extract to config when there are multiple agents/entry points). Scaffolding only — no logic wiring, ElevenLabs, or knowledge base changes.

## User Scenarios & Testing (mandatory)

### User Story 1 - Branch and route structure (Priority: P1)
As a developer, I have a branch `feature/spin-scoring` and the folder structure `app/coach/spin/`, `app/coach/spin/session/`, and `app/coach/spin/scorecard/` with a `page.tsx` in each, so I can implement the SPIN flow without touching the existing coach.
**Why this priority**: Required for all subsequent work; defines the entry points.
**Independent Test**: Check out branch, run `npm run build`; navigate to `/coach/spin`, `/coach/spin/session`, `/coach/spin/scorecard` and confirm each page renders (layout/styling preserved from copied originals).
**Acceptance Scenarios**:
1. **Given** the repo on `feature/spin-scoring`, **When** I run `npm run build`, **Then** the build succeeds.
2. **Given** the three new pages exist, **When** I open `/coach/spin`, **Then** the session setup screen renders with the same layout/styling as the copied source (e.g. `app/setup/page.tsx` or equivalent).
3. **Given** the three new pages exist, **When** I open `/coach/spin/session`, **Then** the coaching session screen renders with the same layout/styling as the copied source (e.g. `app/coach/page.tsx`).
4. **Given** the three new pages exist, **When** I open `/coach/spin/scorecard`, **Then** the scorecard screen renders with the same layout/styling as the copied source (e.g. `app/scorecard/page.tsx`).

### User Story 2 - Agents table exists in Supabase (Priority: P2)
As a developer, the `agents` table exists in Supabase with the specified schema so future work can store and select agent configs (e.g. for SPIN vs general coach).
**Why this priority**: Data foundation for multi-coach support; not required for initial page render.
**Independent Test**: Run the migration (or apply SQL in Supabase); confirm table `agents` exists with columns `agent_id`, `name`, `prompt`, `document_tags`, `status`, `created_at` and constraints as specified.
**Acceptance Scenarios**:
1. **Given** the migration file exists under `supabase/migrations/`, **When** the migration is applied to Supabase, **Then** the `agents` table exists with the correct columns and types.
2. **Given** the table exists, **When** I insert a row with only `name` set, **Then** `agent_id` (uuid), `status` (default `'draft'`), and `created_at` (timestamptz) are set by the database.

### Edge Cases
- **Existing coach untouched**: No file under `app/coach/` (other than the new `app/coach/spin/` tree) is modified; no changes to `app/setup/`, `app/scorecard/` or shared components used only by the existing flow.
- **Migration idempotency**: Migration uses `CREATE TABLE IF NOT EXISTS` or is applied once; no failure if run twice.
- **Empty / no layout**: New pages are copies; if the app has a root layout, they inherit it and render without 404.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: A Git branch named `feature/spin-scoring` MUST exist and be the working branch for this feature.
- **FR-002**: The following structure MUST exist under `app/`: `app/coach/spin/page.tsx`, `app/coach/spin/session/page.tsx`, `app/coach/spin/scorecard/page.tsx`. Each file MUST be created by copying the closest equivalent from the existing coach (session setup → e.g. `app/setup/page.tsx` or `app/coach/page.tsx`; coaching session → e.g. `app/coach/page.tsx`; scorecard → `app/scorecard/page.tsx`). Layout, styling, and components MUST be preserved in the copies; originals MUST NOT be modified.
- **FR-003**: A Supabase migration file MUST exist at `supabase/migrations/[timestamp]_create_agents_table.sql` that creates a table `agents` with: `agent_id` uuid PRIMARY KEY DEFAULT gen_random_uuid(), `name` text NOT NULL, `prompt` text, `document_tags` text[], `status` text DEFAULT 'draft' (values: active | draft | archived), `created_at` timestamptz DEFAULT now().
- **FR-004**: No existing files under `app/coach/` (outside `app/coach/spin/`) MAY be modified. No changes to existing components, layouts, or styles used exclusively by the existing coach. No wiring of logic, ElevenLabs, or knowledge base for this scaffold.

### Key Entities (if feature involves data)
- **agents** (Supabase): Stores agent definitions for multiple coaches (e.g. general vs SPIN). Attributes: `agent_id`, `name`, `prompt`, `document_tags`, `status`, `created_at`. Used in future to drive which prompt and document tags a session uses.

### Non-Functional Requirements
- **NFR-001**: Scaffold MUST be implementable without modifying the existing coach code paths; existing coach behavior and tests MUST remain unchanged.
- **NFR-002**: New pages MUST follow Next.js App Router and project Directory Contract (pages in `app/**/page.tsx`).

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 acceptance scenarios pass (branch exists, three routes render).
- **SC-002**: No edits to `app/coach/page.tsx`, `app/setup/page.tsx`, `app/scorecard/page.tsx`, or shared components used only by the existing coach; `git diff` against main shows only new files under `app/coach/spin/` and the migration file.
- **SC-003**: Migration applies cleanly to Supabase; `agents` table exists with specified schema.
- **SC-004**: `npm run lint` and `npm run build` pass after scaffold.

## Out of Scope (this feature)
- Implementing SPIN-specific logic, scoring, or prompts.
- Wiring RAG, ElevenLabs, or knowledge base to the new routes.
- Changing existing coach flows, config, or API routes.
- Prisma schema changes or application code that reads/writes the `agents` table (migration only).
- **Home page CTA update** (deferred). When added in a later change: hardcode `/coach/spin` in the component that renders the CTA. Do not add a config layer (e.g. `primaryCtaHref`) for a single destination; extract to config only when there are multiple agents with multiple entry points.

## Implementation Notes
- **Copy sources**: Use `app/setup/page.tsx` for `app/coach/spin/page.tsx` (session setup), `app/coach/page.tsx` for `app/coach/spin/session/page.tsx` (coaching session), `app/scorecard/page.tsx` for `app/coach/spin/scorecard/page.tsx` (scorecard). Adjust only imports/paths if needed; do not change behavior in this scaffold.
- **Migration timestamp**: Use a single timestamp in format `YYYYMMDDHHMMSS` (e.g. `20260307120000`) for the migration filename.
