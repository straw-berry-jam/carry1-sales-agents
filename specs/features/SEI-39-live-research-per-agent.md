---
linear: https://linear.app/issue/SEI-39/live-research-capability-per-agent-toggle
ticket: SEI-39
---

# Feature Specification: Live Research Capability (Per-Agent Toggle)

**Feature Branch**: `SEI-39-live-research-per-agent`
**Created**: 2026-03-16
**Status**: Draft
**Linear Ticket**: https://linear.app/issue/SEI-39/live-research-capability-per-agent-toggle
**Input**: "Build a lightweight live research capability that can be toggled per agent. This is a new foundational feature — build it cleanly so it can be reused by future agents."

## User Scenarios & Testing (mandatory)

### User Story 1 - Admin enables live research for an agent (Priority: P1)
An admin opens the Prompt Control tab, selects an agent, and toggles "Live Research" on. The setting is persisted to the agent record. Future sessions for that agent can pull live company intel at session start when a company is provided.
**Why this priority**: Without the per-agent toggle, the feature cannot be enabled or reused by future agents.
**Independent Test**: In Admin → Prompt Control, turn Live Research on for the SPIN Sales Coach, save; reload and confirm the toggle remains on. Turn it off and confirm it persists.
**Acceptance Scenarios**:
1. **Given** the admin is on the Prompt Control tab with an agent selected, **When** they toggle "Live Research" on and save, **Then** the agent's `live_research_enabled` is set to true and the UI shows the toggle on after reload.
2. **Given** Live Research is on for an agent, **When** the admin toggles it off and save, **Then** the agent's `live_research_enabled` is false and the toggle reflects that.

### User Story 2 - Consultant starts a voice session with a company and gets live intel (Priority: P1)
A consultant completes onboarding for the SPIN coach with a specific company name and chooses voice. The agent has Live Research enabled. When they start the voice session, the app shows "Researching [company]...", fetches a short company brief via live web search, stores it in session context, then connects to ElevenLabs. The coach's responses during the session are informed by that brief.
**Why this priority**: Core value — live company intel is fetched and injected into the coach experience.
**Independent Test**: Enable Live Research for SPIN, start a voice session with a company name in onboarding; confirm loading state appears, then connection; ask the coach something company-specific and verify the reply references the brief (or that the brief was injected in logs).
**Acceptance Scenarios**:
1. **Given** the agent has Live Research enabled and onboarding includes a company name, **When** the user starts the voice session, **Then** a loading state "Researching [company]..." is shown, then `/api/research/company` is called with that company name, and the returned brief is stored in session context and passed when requesting the signed URL.
2. **Given** the brief is in session context, **When** the voice LLM builds the system prompt, **Then** the brief is appended after the RAG context block under a "LIVE COMPANY INTELLIGENCE" section so the coach can use it in replies.

### User Story 3 - No live research when disabled or no company (Priority: P1)
When Live Research is off for the agent, or when the user has not provided a company name, no research request is made and the session starts without a research brief. Behavior matches current flow.
**Why this priority**: Ensures no regressions and correct gating of the feature.
**Independent Test**: With Live Research off (or company blank), start a voice session; confirm no "Researching..." step and no call to `/api/research/company`.
**Acceptance Scenarios**:
1. **Given** the agent has Live Research disabled, **When** the user starts a voice session (with or without company), **Then** no research API is called and no research brief is stored; session connects as today.
2. **Given** the agent has Live Research enabled but onboarding has no company name, **When** the user starts a voice session, **Then** no research API is called and session context has no research brief.
3. **Given** the user's session mode is text (not voice), **When** the session starts (with or without company, with or without Live Research enabled), **Then** no research API is called; the client proceeds directly to session start without calling `/api/research/company`.

### User Story 4 - Research API returns a structured brief (Priority: P2)
The system exposes an API that accepts a company name and returns a short, structured company brief (150–200 words) synthesized from live web search, with a timestamp. The brief is suitable for injection into the coach system prompt.
**Why this priority**: Defines the contract for the research capability so it can be reused by other agents or flows.
**Independent Test**: POST to `/api/research/company` with `{ companyName: "Acme Corp" }`; assert response shape and that the brief is non-empty and within word limit.
**Acceptance Scenarios**:
1. **Given** a valid company name, **When** the client POSTs to `/api/research/company` with `{ companyName: string }`, **Then** the API returns 200 with JSON `{ companyName, brief, retrievedAt }` where `brief` is 150–200 words and `retrievedAt` is ISO timestamp.
2. **Given** the API uses Anthropic with web search, **When** the request is processed, **Then** multiple targeted searches (e.g. recent news, supply chain, logistics tech, company overview) are run and the model synthesizes a single brief.

### Edge Cases
- **Research API failure or timeout**: If `/api/research/company` fails or times out, session MUST still start; connect without a research brief and do not block the user.
- **Empty or invalid company name**: If company name is blank or invalid, do not call the research API; proceed without a brief.
- **Multiple agents**: Only the agent for the current flow (e.g. SPIN) is checked for `live_research_enabled`; Assessment and other agents are unchanged unless they are explicitly given the same capability later.
- **Text-only sessions**: Run the company lookup only when session mode is **voice**. If mode is text, proceed directly to session start without calling `/api/research/company`. Text-only sessions skip live research entirely.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The system MUST add a boolean `live_research_enabled` to the agents table (default false), and expose it in the Prisma Agent model as `liveResearchEnabled` mapped to `live_research_enabled`.
- **FR-002**: An API route POST `/api/research/company` MUST accept body `{ companyName: string }`, run multiple web searches via Anthropic (e.g. using `claude-sonnet-4-20250514` with `web_search_20250305`), synthesize a 150–200 word company brief, and return JSON `{ companyName: string, brief: string, retrievedAt: string }` (ISO timestamp). Implementation MUST be in `app/api/research/company/route.ts` per Directory Contract.
- **FR-003**: The Admin Prompt Control tab MUST show a "Live Research" toggle below the system prompt field, with subtext "Pull live company intel at session start." The toggle MUST persist via the existing PATCH `/api/admin/agents/[id]` endpoint (body extended to include `live_research_enabled`); backend MUST accept and store this field on the agent record.
- **FR-004**: On the SPIN session page (`app/coach/spin/session/page.tsx`), run live research only when session mode is **voice**. Before initiating the ElevenLabs connection, if session mode is voice, the client MUST determine whether the current agent has Live Research enabled. If enabled and onboarding data contains a company name, the client MUST show a loading state "Researching [company]...", call `/api/research/company` with that company name, and pass the returned brief (e.g. as `researchBrief`) when calling the signed URL API so it can be stored in session context. If session mode is text, the client MUST NOT call `/api/research/company` and MUST proceed directly to session start.
- **FR-005**: The signed URL route `/api/elevenlabs-signed-url` MUST accept an optional `researchBrief` field in the request body and MUST store it in the voice session context (so `getLatestSessionContext()` and the voice LLM receive it).
- **FR-006**: In `lib/coaching.ts`, `streamCoachResponse()` (and any code path that builds the system prompt for the voice coach) MUST, when `sessionContext.researchBrief` is present, append a "LIVE COMPANY INTELLIGENCE" block after the existing RAG context block, with content and retrieved-at semantics. SPIN scoring logic and Assessment agent files MUST NOT be modified.
- **FR-007**: No changes MUST be made to admin tabs other than Prompt Control; no changes to Assessment agent pages or components unless explicitly required to reuse the research API in the future.

### Key Entities (if feature involves data)
- **Agent (existing)** — Extended with `live_research_enabled` (boolean, default false). Stored in Supabase; Prisma schema updated.
- **Voice session context (existing)** — Extended to optionally include `researchBrief` (string) and, if desired, `researchRetrievedAt` (ISO string). Stored in `voice_sessions.context` (JSON); no schema change required if context is flexible JSON.
- **Company research brief (response)** — Ephemeral; shape `{ companyName, brief, retrievedAt }`. Not persisted as a separate entity; injected into session context and system prompt.

### Non-Functional Requirements
- **NFR-001**: Research fetch MUST NOT block session start indefinitely; if the research API fails or is slow, the session MUST start without the brief (graceful degradation).
- **NFR-002**: Web search and synthesis MUST be performed server-side only; credentials for Anthropic MUST NOT be exposed to the client.
- **NFR-003**: The feature MUST be implemented so that other agents (e.g. Assessment) can reuse the same research API and toggle in a future iteration without duplication.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 acceptance scenarios pass: admin can toggle Live Research and it persists; consultant with company + Live Research on sees "Researching [company]..." and the coach receives the brief; with Live Research off or no company, no research call and no regression.
- **SC-002**: POST `/api/research/company` returns valid JSON with `companyName`, `brief` (150–200 words), and `retrievedAt`; brief is synthesized from web search (Anthropic with web_search tool).
- **SC-003**: `npm run lint` and `npm run build` pass; new code follows Directory Contract (migrations in `supabase/migrations/`, Prisma schema updated, API in `app/api/`, Prompt Control only in admin).
- **SC-004**: No changes to SPIN scoring logic, Assessment agent files, or admin tabs other than Prompt Control.
- **SC-005**: New code has tests per TDD (Red-Green-Refactor); coverage ≥ 80% for new code where applicable.

## Implementation Notes (reference)

The following concrete steps align with this spec and can be used during implementation:

1. **Database** — Add migration `supabase/migrations/20260316000000_add_live_research_to_agents.sql`:  
   `ALTER TABLE agents ADD COLUMN IF NOT EXISTS live_research_enabled boolean NOT NULL DEFAULT false;`

2. **Prisma** — In `Agent` model add:  
   `liveResearchEnabled Boolean @default(false) @map("live_research_enabled")`

3. **Research API** — Implement `app/api/research/company/route.ts`: POST `{ companyName: string }`; run 4 web searches (e.g. "{companyName} recent news 2026", "{companyName} supply chain operations challenges", "{companyName} logistics technology", "{companyName} company overview revenue employees"); use Anthropic `claude-sonnet-4-20250514` with `web_search_20250305`; return `{ companyName, brief, retrievedAt }` with brief 150–200 words.

4. **Admin** — In Prompt Control (`components/admin/PromptControlTab.tsx`), add Live Research toggle; extend PATCH body and `lib/agents` `updateAgent` to support `live_research_enabled`.

5. **Session page** — In `app/coach/spin/session/page.tsx`, run research only when session mode is **voice**. Before connecting (e.g. where VoiceCoach is used): if mode is voice and agent has `live_research_enabled` and company is present, show "Researching [company]...", call `/api/research/company`, then pass `researchBrief` (e.g. to VoiceCoach so it can send it in the signed-url request). If mode is text, skip research entirely and proceed directly to session start. Session page must obtain agent's `live_research_enabled` (e.g. from an API that returns the SPIN agent's config).

6. **Signed URL** — In `/api/elevenlabs-signed-url/route.ts`, read optional `researchBrief` from body and include it in `contextToStore`.

7. **Coaching** — In `lib/coaching.ts` `streamCoachResponse()`, extend `SessionContext` with optional `researchBrief`; when building system prompt, if `sessionContext.researchBrief` is present, append after RAG block:  
   `LIVE COMPANY INTELLIGENCE (retrieved at session start):\n${sessionContext.researchBrief}`  
   Voice LLM route must pass through `researchBrief` from stored context to `sessionContext`.

Commit message suggestion: `feat: add live research capability with per-agent toggle`
