---
linear: https://linear.app/issue/SEI-34/wire-kb-evaluation-criteria-into-scoring-api
ticket: SEI-34
---

# Feature Specification: Wire KB Evaluation Criteria into Scoring API

**Feature Branch**: `SEI-34-wire-kb-evaluation-criteria-into-scoring-api`
**Created**: 2026-03-08
**Status**: Draft
**Linear Ticket**: [SEI-34](https://linear.app/issue/SEI-34/wire-kb-evaluation-criteria-into-scoring-api)
**Input**: Wire Knowledge Base "Evaluation Criteria" documents into the score-session API so scoring uses admin-managed criteria when present. No fallback when no docs are found (makes KB retrieval clearly visible during testing).

## User Scenarios & Testing (mandatory)

### User Story 1 - Scoring uses evaluation criteria from KB when available (Priority: P1)
When an admin has published one or more Knowledge Base documents in the "Evaluation Criteria" category assigned to the SPIN Sales Coach agent, the score-session API retrieves those documents and injects their content above the transcript in the user message sent to Claude. The model scores the session using both the session-type calibration and the KB evaluation criteria.
**Why this priority**: Core behavior of the feature.
**Independent Test**: Add a published Evaluation Criteria document in Admin → Knowledge Base (category Evaluation Criteria, assigned to the relevant agent). Complete a SPIN session and open the scorecard. In server logs, confirm `[score-session] eval docs retrieved: { count: 1, ids: [...], error: null }`. Confirm the returned scorecard reflects the criteria (e.g. different commentary or scores when criteria emphasize specific signals).
**Acceptance Scenarios**:
1. **Given** at least one published KB document with category `evaluation_criteria` assigned to the active SPIN agent, **When** POST /api/score-session is called with a valid transcript and sessionType, **Then** the API retrieves those documents, logs count/ids/error, and injects their content (rubric) above the transcript in the user message sent to Anthropic.
2. **Given** no evaluation criteria documents exist (or none assigned to the active agent), **When** POST /api/score-session is called, **Then** the API proceeds with no rubric (user message contains only the transcript in `<transcript>`); logs show count 0 and no error.
3. **Given** multiple evaluation criteria documents exist, **When** the API builds the rubric, **Then** document contents are concatenated in order by weight descending (highest weight first), separated by `\n\n`.

### User Story 2 - Prompt templates retain calibration and schema only (Priority: P2)
The scoring prompt templates in lib/scoringPrompts.ts no longer contain inline dimension-level rubric text. They retain only the session-type calibration (e.g. "for 15-min outreach, S+P are the priority") and the JSON output schema and formatting rules.
**Why this priority**: Ensures scoring criteria are driven by the KB, not hardcoded.
**Independent Test**: Open lib/scoringPrompts.ts and confirm each of the four prompts (outreach_15, outreach_30, discovery_15, discovery_30) contains only the session-type expectations and OUTPUT_SCHEMA; no inline rubric or dimension-level instructions beyond the schema.
**Acceptance Scenarios**:
1. **Given** the codebase after the change, **When** a developer reads SCORING_PROMPTS in lib/scoringPrompts.ts, **Then** each prompt includes session-type framing and the shared OUTPUT_SCHEMA (with {{TRANSCRIPT}} placeholder), and does not include hardcoded evaluation criteria text.
2. **Given** the API is invoked with no evaluation criteria docs in the KB, **When** the model is called, **Then** the user message still contains the session-type calibration and JSON instructions plus only `<transcript>...</transcript>` (no rubric block).

### Edge Cases
- **Active agent has no id in KB assignment**: Documents use `agents` array (agent UUID or `'all'`). The route must resolve the active SPIN Sales Coach agent's UUID (e.g. from the same source as getActiveSpinCoachPrompt) and filter documents by that UUID or `'all'`. If the agent table does not expose id in the current getActiveSpinCoachPrompt path, the implementation must obtain the active agent id (e.g. extend agents module or query) for the KB filter.
- **Prisma vs Supabase**: KB documents live in `knowledge_base_documents` (Prisma). Agents live in Supabase `agents` table. Retrieval of evaluation criteria MUST use Prisma for `knowledge_base_documents` (category = 'evaluation_criteria', status = 'published', agents has active agent id or 'all'), ordered by weight descending.
- **No fallback**: If no evaluation criteria documents are found, do not inject any default rubric text; proceed with only the transcript in the user message. This makes it obvious in testing whether KB retrieval is working.
- **Logging**: Log retrieval result (count, document ids, and error if any) with a clear prefix (e.g. `[score-session] eval docs retrieved:`) so it is visible during testing without implementing a separate debug endpoint.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: Before calling the Anthropic API in POST /api/score-session, the route MUST query for evaluation criteria documents: `knowledge_base_documents` where `category` = `'evaluation_criteria'`, `status` = `'published'`, and `agents` contains the active SPIN Sales Coach agent UUID or `'all'`, ordered by `weight` descending (Directory Contract: API route in `app/api/score-session/route.ts`; data access via Prisma in `lib/` if a helper is used).
- **FR-002**: The route MUST log the retrieval result (count, list of document ids, and error message if any) with a stable prefix so it is visible during testing (e.g. `console.log('[score-session] eval docs retrieved:', { count, ids, error })`).
- **FR-003**: If one or more documents are found, the route MUST build a rubric string by concatenating each document's `content` in order (by weight desc), separated by `\n\n`, and inject it above the transcript in the user message. Format: `rubric + '\n\n<transcript>\n' + transcript + '\n</transcript>'`. If no documents are found, the user message MUST contain only `'<transcript>\n' + transcript + '\n</transcript>'` (no fallback rubric).
- **FR-004**: In lib/scoringPrompts.ts, the four scoring prompts (outreach_15, outreach_30, discovery_15, discovery_30) MUST retain only (1) the session-type calibration framing and (2) the JSON output schema and formatting rules (OUTPUT_SCHEMA). All inline dimension-level rubric or evaluation-criteria text MUST be removed.
- **FR-005**: No evaluation criteria documents MUST be inserted by code or migration; admins will add them manually via the Admin Knowledge Base tab for end-to-end testing.

### Key Entities (if feature involves data)
- **KnowledgeBaseDocument** (existing): Used for retrieval; `category = 'evaluation_criteria'`, `status = 'published'`, `agents` array must include the active SPIN agent id or `'all'`; `weight` used for ordering.
- **Agent** (existing, Supabase): Active SPIN Sales Coach agent id is required to filter documents. Resolved: `getActiveSpinCoachAgentId()` added in lib/agents.ts (queries Supabase for name = 'SPIN Sales Coach', status = 'active', returns UUID; throws clear error if none). Route imports and calls it; no inline agent fetch.

### Non-Functional Requirements
- **NFR-001**: Scoring API behavior (transcript validation, sessionType, system prompt from DB, JSON parsing, response shape) MUST remain unchanged except for the addition of rubric retrieval and injection into the user message.
- **NFR-002**: `npm run lint` and `npm run build` MUST pass after implementation.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: With at least one published Evaluation Criteria document assigned to the active SPIN agent, POST /api/score-session logs `[score-session] eval docs retrieved:` with count ≥ 1 and ids array; the user message sent to Claude includes the rubric content above the transcript.
- **SC-002**: With zero matching evaluation criteria documents, the same log shows count 0 and the user message contains only the transcript inside `<transcript></transcript>`; no fallback rubric.
- **SC-003**: lib/scoringPrompts.ts contains no inline dimension-level rubric text; only session-type calibration and OUTPUT_SCHEMA remain.
- **SC-004**: All existing score-session acceptance tests (if any) and manual scorecard flow still pass; JSON scorecard shape and client behavior unchanged.
