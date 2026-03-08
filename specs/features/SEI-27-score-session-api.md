---
linear: https://linear.app/sei-interview-app/issue/SEI-27/spin-score-session-api-and-scoring-prompts
ticket: SEI-27
---

# Feature Specification: SPIN Score-Session API and Scoring Prompts

**Feature Branch**: `SEI-27-score-session-api`
**Created**: 2026-03-08
**Status**: Draft
**Linear Ticket**: [SEI-27](https://linear.app/sei-interview-app/issue/SEI-27/spin-score-session-api-and-scoring-prompts)
**Input**: Add `lib/scoringPrompts.ts` with SPIN scoring prompt templates and `app/api/score-session/route.ts` POST endpoint that scores a session transcript using the active SPIN Sales Coach agent prompt from Supabase and returns a structured JSON scorecard. No UI wiring; no changes to existing files or admin/coach routes.

## User Scenarios & Testing (mandatory)

### User Story 1 - Scoring prompts available for all session types (Priority: P1)
As a developer or backend consumer, I can use `SCORING_PROMPTS` from `lib/scoringPrompts.ts` to get a prompt string for outreach_15, outreach_30, discovery_15, or discovery_30. Each prompt describes session type and duration expectations, includes a `{{TRANSCRIPT}}` placeholder, and instructs the model to return only valid JSON with the required scorecard structure (scores, strengths, growth_areas, next_step_quality, next_step_note, headline).
**Why this priority**: The API depends on these prompts; without them the score-session endpoint cannot produce consistent scorecards.
**Independent Test**: Import `SCORING_PROMPTS` and assert all four keys exist; assert each value is a string containing `{{TRANSCRIPT}}` and the required JSON schema description.
**Acceptance Scenarios**:
1. **Given** `lib/scoringPrompts.ts` exists, **When** I import `SCORING_PROMPTS`, **Then** it has keys `outreach_15`, `outreach_30`, `discovery_15`, `discovery_30`.
2. **Given** any value of `SCORING_PROMPTS`, **When** I inspect the string, **Then** it contains the literal `{{TRANSCRIPT}}` and instructs the model to return only valid JSON with `scores` (situation, problem, implication, need_payoff, overall), `strengths`, `growth_areas`, `next_step_quality`, `next_step_note`, `headline`.
3. **Given** the four prompts, **When** I compare calibration guidance, **Then** outreach_15 prioritizes S+P and lightly penalizes underdeveloped I; outreach_30 expects all four elements; discovery_15 rewards depth over breadth; discovery_30 expects full development and N-P explicitly connected to SEI capability.

### User Story 2 - POST /api/score-session returns scorecard from transcript (Priority: P1)
As a client (or future scorecard UI), I POST `{ transcript: string, sessionType: string }` to `/api/score-session` and receive a parsed JSON scorecard object when the active SPIN Sales Coach agent exists in Supabase. The system prompt used for scoring is the agent’s `prompt` from the database, not hardcoded, so admins can edit it in Prompt Control.
**Why this priority**: Core value is generating a scorecard from a transcript using the configured agent.
**Independent Test**: With an active SPIN Sales Coach agent in DB and valid body, POST and assert 200 and response shape (scores, strengths, growth_areas, next_step_quality, next_step_note, headline).
**Acceptance Scenarios**:
1. **Given** request body with `transcript` and `sessionType` (one of outreach_15, outreach_30, discovery_15, discovery_30), **When** I POST to `/api/score-session`, **Then** the endpoint fetches the active SPIN Sales Coach agent prompt from Supabase, builds the user message from the matching `SCORING_PROMPTS` entry with transcript substituted, calls Anthropic with that system prompt, and returns the parsed JSON scorecard (status 200).
2. **Given** the agent’s `prompt` in Supabase was edited in Prompt Control, **When** I POST to `/api/score-session`, **Then** the API uses the current prompt from the database (no hardcoded system prompt in code).
3. **Given** the model returns JSON wrapped in markdown fences, **When** the API processes the response, **Then** it strips markdown fences before parsing and returns the parsed object.

### User Story 3 - Validation and error responses (Priority: P2)
As a client, I receive clear 400/404/500 responses when the request is invalid, no active agent exists, or scoring/parsing fails.
**Why this priority**: Enables robust integration and debugging without touching UI.
**Independent Test**: Send missing body, missing transcript, missing sessionType, invalid sessionType; assert 400. With no active agent, assert 404 and message. With parsing failure, assert 500.
**Acceptance Scenarios**:
1. **Given** request body missing `transcript` or `sessionType`, **When** I POST to `/api/score-session`, **Then** the API returns 400.
2. **Given** no row in `agents` with `name = 'SPIN Sales Coach'` and `status = 'active'`, **When** I POST with valid body, **Then** the API returns 404 with message "No active SPIN Sales Coach agent found. Set status to active in Prompt Control."
3. **Given** Anthropic returns a response that is not valid JSON (or parsing fails), **When** the API processes it, **Then** it returns 500 with an error message.

### Edge Cases
- **sessionType not in SCORING_PROMPTS**: Return 400 or map to a default; spec requires validation that sessionType is one of the four keys.
- **Empty or very long transcript**: Accept; scoring prompt may instruct model how to handle. No hard length limit in spec unless added.
- **Anthropic API failure**: Return 500 with error message; do not expose internal details.
- **Agent prompt is null or empty**: Treat like "no active agent" or invalid config; 404 or 500 with clear message.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The file `lib/scoringPrompts.ts` MUST export an object `SCORING_PROMPTS` with exactly four keys: `outreach_15`, `outreach_30`, `discovery_15`, `discovery_30`. Each value MUST be a string prompt that describes the session type and duration expectations, includes the literal placeholder `{{TRANSCRIPT}}`, and instructs the model to return ONLY a valid JSON object with this structure: `scores` (situation, problem, implication, need_payoff each with `score` and `commentary`; `overall` number), `strengths` (array of strings), `growth_areas` (array of strings), `next_step_quality` ("Yes" | "Partial" | "No"), `next_step_note` (string), `headline` (string). No preamble, no markdown, valid JSON only.
- **FR-002**: Scoring rules for all four prompts: scores are integers 1–5; commentary is 2–3 sentences grounded in a specific moment from the transcript; strengths = 2 specific things done well; growth_areas = 2 specific things to work on with a concrete suggestion; headline = one sentence summary used as scorecard subheading.
- **FR-003**: Calibration per session type: outreach_15 — S+P priority, I lightly penalized if underdeveloped, N-P not expected; outreach_30 — all four elements expected, I and N-P developed; discovery_15 — tight S, deep on one core problem, reward depth over breadth; discovery_30 — full development of all four expected, N-P must explicitly connect to SEI capability.
- **FR-004**: The API route `app/api/score-session/route.ts` MUST implement POST only. It MUST accept JSON body `{ transcript: string, sessionType: string }`, validate both fields present, and return 400 if either is missing.
- **FR-005**: The API MUST fetch the active SPIN Sales Coach agent from Supabase: `SELECT prompt FROM agents WHERE name = 'SPIN Sales Coach' AND status = 'active' LIMIT 1`. If no row is returned, the API MUST return 404 with body message "No active SPIN Sales Coach agent found. Set status to active in Prompt Control."
- **FR-006**: The API MUST resolve the scoring prompt by key from `SCORING_PROMPTS` using `sessionType` (must be one of outreach_15, outreach_30, discovery_15, discovery_30); if invalid, return 400. It MUST replace `{{TRANSCRIPT}}` in that prompt with the request `transcript`.
- **FR-007**: The API MUST call the Anthropic API with `ANTHROPIC_API_KEY` from env, model `claude-sonnet-4-20250514`, max_tokens 1000, system message = the `prompt` field from Supabase, user message = the scoring prompt with transcript substituted. It MUST strip any markdown fences from the model response before parsing JSON, then return the parsed scorecard object (200). On JSON parse failure it MUST return 500 with an error message.
- **FR-008**: The system prompt used for scoring MUST NOT be hardcoded in the score-session route or in scoringPrompts; it MUST be read from the `agents` table so that edits in Admin Prompt Control take effect without code changes.

### Key Entities
- **agents** (existing): Used read-only; `prompt` column is the system prompt for the SPIN Sales Coach. Query: `name = 'SPIN Sales Coach'`, `status = 'active'`.
- **Scorecard (response shape)**: Not persisted in this feature; JSON structure returned by the API as defined in FR-001.

### Non-Functional Requirements
- **NFR-001**: Data access for agents MUST use the existing Supabase client pattern (e.g. `lib/agents.ts` or equivalent); no direct Supabase in the route without going through lib if the project’s module boundaries require it.
- **NFR-002**: Do not modify any existing files; do not wire scorecard UI; do not change anything under `app/coach/` or the admin panel.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 acceptance scenarios pass: `SCORING_PROMPTS` has four keys and correct structure/placeholders; POST with valid body and active agent returns 200 and valid scorecard JSON.
- **SC-002**: All P2 acceptance scenarios pass: 400 for missing/invalid input; 404 when no active agent; 500 when parsing fails.
- **SC-003**: No existing files modified; no new UI or changes under `/coach/` or admin.
- **SC-004**: `npm run lint` and `npm run build` pass (or project lint/build state unchanged). New code follows Directory Contract (`lib/` for scoring prompts, `app/api/score-session/route.ts` for the endpoint).

## Out of Scope
- Wiring the scorecard UI to this API (future prompt).
- Modifying coach flows under `app/coach/` or `app/coach/spin/`.
- Modifying the admin panel or Prompt Control tab.
- Persisting scorecards to the database.
- Any session type other than the four keys in `SCORING_PROMPTS`.

## Implementation Notes
- **sessionType validation**: Reject if `sessionType` is not one of `outreach_15`, `outreach_30`, `discovery_15`, `discovery_30` (e.g. return 400).
- **Stripping markdown**: Remove leading/trailing ```json and ``` (or similar) from the model response before `JSON.parse`.
- **Agent fetch**: Use existing Supabase access (e.g. extend `lib/agents.ts` with a function to get active SPIN Sales Coach prompt, or query in the route via a small lib helper) so the route stays thin and testable.
