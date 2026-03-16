# Implementation Plan: Live Research Capability (Per-Agent Toggle)

**Branch**: `SEI-39-live-research-per-agent`  
**Spec**: [specs/features/SEI-39-live-research-per-agent.md](../features/SEI-39-live-research-per-agent.md)  
**Exploration**: Not yet run  
**Design**: Not yet run  
**Estimated Timeline**: 4–5 days — One new API, one DB change, small UI and session-flow changes; most time in research API and wiring.

---

## What We're Building (Summary)

Consultants who practice against a specific company in **voice** mode will get up-to-date company intel (recent news, operations, overview) at the start of the session so the coach can reference it. Admins turn this on or off per agent in Prompt Control. Text-only sessions never run research; if the research service is slow or fails, the session still starts without blocking the user.

---

## Technical Approach

We'll build this in four pieces:

1. **Data and admin toggle (1 day)** — Add a "Live Research" switch to the agents table and to Prompt Control. Admins can enable or disable it per agent; the setting is saved with the rest of the agent config. No new screens, just one toggle and backend support.

2. **Company research API (1–1.5 days)** — A single API that accepts a company name and returns a short written brief (150–200 words) by running several web searches and asking Claude to summarize. The brief is not stored; it’s generated on demand and passed into the session. This keeps the feature reusable for other agents later.

3. **Voice session wiring (1–1.5 days)** — On the SPIN session page, only when the user chose **voice** mode: before connecting to the voice service, check if this agent has Live Research on and a company name. If yes, show "Researching [company]...", call the research API, then pass the brief into the voice session so the coach can use it. If mode is text, or no company, or research is off, skip this step and start the session as today. If the research call fails or times out, start the session anyway without the brief.

4. **Coach prompt injection and tests (1 day)** — When the voice coach builds its system prompt, if a research brief was provided for this session, append it in a clear "LIVE COMPANY INTELLIGENCE" section after the existing knowledge-base context. Add tests for the research API, the toggle persistence, and the session flow (voice vs text, with/without company).

This order lets us validate the toggle and data first, then the research quality, then the full voice experience.

---

## Constitution Check

- ✅ **Follows Spec-Driven Development**: Implementation is fully specified in SEI-39 spec; no code without spec.
- ✅ **Uses approved tech stack**: Next.js App Router, TypeScript, Prisma + Supabase, Anthropic (Claude with web search), existing Tailwind/brand tokens.
- ✅ **Directory Contract**: Migrations in `supabase/migrations/`, API in `app/api/`, business logic in `lib/`, Prompt Control only in `components/admin/PromptControlTab.tsx`; no changes to other admin tabs or Assessment agent.
- ✅ **RAG & Knowledge Base**: Live research is additive context (appended after RAG block); no change to KB schema or retrieval.
- ✅ **Voice & Real-Time**: Research runs only before connecting to ElevenLabs; no change to voice lifecycle or scoring.
- ✅ **TDD**: Tests first for new behavior; coverage ≥ 80% for new code per constitution.
- ⚠️ **Exception needed**: None.

---

## Files That Will Be Created/Modified

**User-Facing Changes**

- **Prompt Control (Admin)** — One new toggle "Live Research" with subtext "Pull live company intel at session start," below the system prompt. Saving updates the agent record.
- **SPIN session page (Coach)** — When the user is in voice mode and is about to connect: optional "Researching [company]..." step when Live Research is on and a company is set; then connect as today. Text mode always skips this step.

**Behind-the-Scenes**

- **Database** — New migration adding `live_research_enabled` (boolean, default false) to `agents`.
- **Prisma** — Add `liveResearchEnabled` to the Agent model.
- **Research API** — New route `app/api/research/company/route.ts`: POST with company name; run web searches via Anthropic; return `{ companyName, brief, retrievedAt }`.
- **Agent config for session** — New or extended endpoint so the SPIN session page can read whether the current agent has Live Research enabled (e.g. `GET /api/coach/spin/agent-config` or include in existing agent lookup).
- **Agents lib and admin API** — Extend `lib/agents` and PATCH `app/api/admin/agents/[id]` to read/write `live_research_enabled`; extend GET agents list to include it so Prompt Control can show and persist the toggle.
- **Signed URL route** — Accept optional `researchBrief` in the request body and store it in voice session context.
- **Coaching** — In `lib/coaching.ts`, extend session context with optional `researchBrief`; in the code path that builds the voice system prompt, append a "LIVE COMPANY INTELLIGENCE" block after the RAG block when `researchBrief` is present. Voice LLM route passes `researchBrief` from stored context into `sessionContext`.
- **VoiceCoach component** — Accept optional `researchBrief` (and possibly `isResearching`) from the session page and include `researchBrief` in the signed URL request body when starting the conversation.

**Tests**

- **Research API** — Request shape, response shape (companyName, brief, retrievedAt), brief length, and error/timeout behavior.
- **Agent toggle** — Prompt Control saves and reloads `live_research_enabled`; list and PATCH include the field.
- **Session flow** — Voice + company + Live Research on → research step and brief in context; text mode or no company or Live Research off → no research call.

---

## Dependencies

**Must Be Done First**

- Migration and Prisma change must be applied before the admin toggle or session page can use `live_research_enabled`.
- Research API must exist before the session page can call it and pass the brief into the signed URL.

**Can Build in Parallel**

- Migration + Prisma + admin toggle (and agents lib/API) can be done in parallel with the research API implementation.
- Once research API and signed-URL/coaching wiring exist, the session-page and VoiceCoach changes can be done together.

**Blocks Future Work**

- Other agents (e.g. Assessment) can later reuse the same research API and toggle; this feature does not block them.

---

## Test Strategy

**What We'll Test**

- **Happy path**: Admin turns Live Research on for SPIN and saves; consultant starts a voice session with a company name; "Researching [company]..." appears, then voice connects; coach responses can reference the brief.
- **Error cases**: Research API returns an error or times out → session still starts without a brief. Empty or invalid company name → no research call.
- **Edge cases**: Text-only session → no research call. Live Research off → no research call. No company name → no research call. Toggle off and on in admin → state persists after reload.

**How We'll Know It Works**

- In Prompt Control, toggle Live Research on, save, reload: toggle stays on; database has `live_research_enabled = true` for that agent.
- Start a voice session with a company and Live Research on: see "Researching [company]..." then connection; in logs or by asking the coach, confirm the brief was injected.
- Start a text session or a voice session without company or with Live Research off: no "Researching..." step and no call to `/api/research/company`.

---

## Risks & Mitigations

| Risk | Impact on Business | How We'll Handle It |
|------|---------------------|---------------------|
| Research API slow or down | Users might wait or get no brief | Timeout and graceful fallback: session starts anyway without brief; no blocking. |
| Web search returns little or irrelevant content | Brief might be generic or thin | Rely on multiple search queries and Claude synthesis; accept "best effort" and document that brief quality depends on search. |
| Session page doesn't know agent's Live Research setting | Wrong behavior (research when off or skip when on) | Add a small, explicit way for the session page to get the SPIN agent's `live_research_enabled` (e.g. dedicated config endpoint or existing agent fetch). |

---

## Implementation Phases

**Phase 1: Data and admin toggle** (Day 1)

- Add migration `20260316000000_add_live_research_to_agents.sql` for `live_research_enabled`.
- Update Prisma Agent model with `liveResearchEnabled`.
- Extend `lib/agents` (types, listAgents select, updateAgent payload) and PATCH `/api/admin/agents/[id]` to support `live_research_enabled`.
- In Prompt Control tab, add Live Research toggle (label + subtext); include in save payload and in display when selecting an agent.
- **Deliverable**: Admin can turn Live Research on/off per agent and see it persist after reload.

**Phase 2: Research API and session wiring** (Days 2–3)

- Implement POST `/api/research/company`: validate body, call Anthropic with web_search tool (four queries per spec), parse and enforce 150–200 word brief, return `{ companyName, brief, retrievedAt }`. Add timeout and error handling; return 4xx/5xx on failure.
- Add a way for the SPIN session page to get the current agent's `live_research_enabled` (e.g. GET endpoint that returns `{ liveResearchEnabled }` for the SPIN agent).
- In signed URL route, accept optional `researchBrief` and store it in session context.
- In `lib/coaching.ts`, add optional `researchBrief` to session context; in the voice system-prompt path, append "LIVE COMPANY INTELLIGENCE" block when present. In voice-LLM route, pass `researchBrief` from stored context into `sessionContext`.
- **Deliverable**: Research API returns a valid brief; signed URL and coaching pipeline carry the brief through to the voice prompt.

**Phase 3: Session page and VoiceCoach** (Day 4)

- On SPIN session page, when mode is voice: fetch agent config (e.g. `liveResearchEnabled`); if enabled and company name present, set loading state "Researching [company]...", call `/api/research/company`, then pass `researchBrief` (and any needed flags) to VoiceCoach. On failure or timeout, proceed without brief. If mode is text, or no company, or not enabled, skip research and proceed to session start.
- In VoiceCoach, accept optional `researchBrief` (and optional pre-connection state); when calling `/api/elevenlabs-signed-url`, include `researchBrief` in the body when provided.
- **Deliverable**: End-to-end voice flow with optional research step; text and other cases unchanged.

**Phase 4: Tests and polish** (Day 5)

- TDD-style tests: research API (input/output, errors, timeout), agent toggle (save/load), session flow (voice vs text, with/without company, with/without Live Research). Ensure no changes to SPIN scoring or Assessment agent.
- Run `npm run lint` and `npm run build`; fix any issues. Manual smoke test: admin toggle, voice session with company, text session.
- **Deliverable**: Feature complete, tests passing, ready for review.

---

## Deployment Plan

**Feature Flag**: No — The feature is gated by the per-agent toggle in Prompt Control. New agents have Live Research off by default; only agents explicitly enabled will run research.

**Database Changes**: Yes — One new column `live_research_enabled` on `agents`, default false. Migration runs in Supabase; no downtime. Existing agents get default false.

**Rollback Strategy**: Turn off Live Research for all agents in Prompt Control to stop research calls. If needed, revert the migration (remove column) in a follow-up release; app should handle missing column gracefully if we read via Prisma with default.

---

## Success Metrics

- **Toggle and persistence**: Admins can enable/disable Live Research per agent and the setting persists across reloads.
- **Voice session with company**: When Live Research is on and a company is set, voice sessions show the research step and the coach can use the brief.
- **No regressions**: Text sessions, sessions without a company, and sessions with Live Research off behave as today (no research call, no extra delay).
- **Resilience**: If the research API fails or is slow, the session still starts; users are not blocked.

---

## Timeline Breakdown

| Phase | Duration | Why This Long |
|-------|----------|----------------|
| Phase 1 (Data + admin toggle) | 1 day | Single migration, Prisma, and one UI control; straightforward. |
| Phase 2 (Research API + wiring) | 1–1.5 days | New API with external calls and prompt design; signed URL and coaching changes touch several files. |
| Phase 3 (Session page + VoiceCoach) | 1 day | Conditional flow and loading state; need to fetch agent config and pass brief through. |
| Phase 4 (Tests + polish) | 1 day | TDD coverage for new API and flows; lint/build and manual verification. |

**Total**: 4–5 days  
**Confidence**: High — Spec is clear; stack and patterns are already in use. Main variable is Anthropic web-search behavior and brief quality.

---

## What Could Make This Take Longer

- Anthropic web_search tool usage or rate limits requiring iteration on prompts or retries.
- Needing a dedicated "agent config for session" endpoint and deciding exact shape (e.g. auth, caching) could add a few hours.

---

## What's NOT Included

- Enabling Live Research for the Assessment agent or other agents (foundation is reusable; enabling is a follow-up).
- Running research for **text** sessions (spec: text-only sessions skip research entirely).
- Storing or caching research results; each voice session with a company triggers a fresh research call.
- Changes to SPIN scoring logic, scorecard, or any admin tab other than Prompt Control.

---

## Next Steps

1. Review this plan.
2. Resolve any open questions (e.g. exact endpoint for "SPIN agent config" if you prefer a different pattern).
3. When ready: run `/implement` to start building; create branch `SEI-39-live-research-per-agent` and begin Phase 1.
