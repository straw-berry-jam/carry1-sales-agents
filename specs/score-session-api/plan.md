# Implementation Plan: SPIN Score-Session API and Scoring Prompts

**Branch**: `SEI-27-score-session-api`  
**Spec**: [SEI-27-score-session-api.md](../features/SEI-27-score-session-api.md)  
**Exploration**: Not yet run  
**Design**: Not applicable (backend-only; no user-facing screens)  
**Estimated Timeline**: 1 day — Two new files (prompts lib + API route), one small addition to existing agents lib. No UI, no changes to coach or admin.

---

## What We're Building (Summary)

We're adding the backend that turns a practice-session transcript into a structured SPIN scorecard. Callers (and later the scorecard screen) send the transcript and session type; the API uses the **live** SPIN Sales Coach prompt from the database (editable in Prompt Control), runs it through Claude with the right scoring instructions, and returns a JSON scorecard (scores, strengths, growth areas, headline, etc.). Admins can change how the coach behaves for scoring without any code deploy—they just edit the agent in Admin.

---

## Technical Approach

We'll deliver this in three small pieces:

1. **Scoring prompt templates (about half a day)** — Add `lib/scoringPrompts.ts` with one exported object, `SCORING_PROMPTS`, that has four keys: `outreach_15`, `outreach_30`, `discovery_15`, `discovery_30`. Each value is a string that describes the session type and length, includes a `{{TRANSCRIPT}}` placeholder, and tells the model to return only valid JSON in the exact shape the scorecard needs (scores 1–5, commentary, strengths, growth areas, next step, headline). Calibration wording differs by type (e.g. outreach_15 focuses on Situation and Problem; discovery_30 expects full SPIN with Need-payoff tied to CARRY1). This gives the API the right “instructions” per session type without hardcoding the coach’s personality—that stays in the database.

2. **Way to get the active coach prompt (short)** — Extend `lib/agents.ts` with a small function that fetches the prompt for the agent named “SPIN Sales Coach” with status “active”. If there is no such agent, it returns null. The score-session route will use this so it never hardcodes a system prompt; everything comes from the DB and Prompt Control.

3. **Score-session API (about half a day)** — Add `app/api/score-session/route.ts` (POST only). It accepts `{ transcript, sessionType }`, checks both are present and that `sessionType` is one of the four keys above (400 if not). It gets the active SPIN coach prompt from the new lib function; if none, returns 404 with the message “No active SPIN Sales Coach agent found. Set status to active in Prompt Control.” It then picks the right template from `SCORING_PROMPTS`, replaces `{{TRANSCRIPT}}` with the request transcript, calls Anthropic (Claude) with the DB prompt as system and the filled-in template as user message, strips any markdown fences from the reply, parses JSON, and returns the scorecard (200). Any parse or API failure returns 500 with a safe error message.

This keeps the system prompt fully configurable in Admin and makes the scorecard format consistent and testable.

---

## Constitution Check

- **Follows Spec-Driven Development**: Implementation is scoped to the approved SEI-27 spec; no UI, no coach or admin changes.
- **Follows Directory Contract**: New code in `lib/scoringPrompts.ts` and `app/api/score-session/route.ts`; agents access extended in `lib/agents.ts`.
- **Uses approved tech stack**: Next.js App Router, TypeScript, Supabase (agents table), Anthropic (Claude). No new frameworks.
- **Module boundaries**: API route validates input, calls lib for agent prompt and for scoring prompt; lib handles Supabase and prompt shape. No direct Supabase in the route for agent fetch.
- **Exception needed**: None.

---

## Files That Will Be Created/Modified

**Behind-the-Scenes**

- **lib/scoringPrompts.ts** (new): Exports `SCORING_PROMPTS` with four keys and the required structure, placeholders, and calibration wording per session type.
- **lib/agents.ts** (modify): Add a function (e.g. `getActiveSpinCoachPrompt()`) that returns the `prompt` string for the agent with `name = 'SPIN Sales Coach'` and `status = 'active'`, or null if none. Used only by the score-session API.
- **app/api/score-session/route.ts** (new): POST handler that validates body, uses lib to get agent prompt and scoring template, calls Anthropic, strips markdown, parses JSON, returns scorecard or 400/404/500.

**Tests**

- Tests (if/when the project adds a test runner): Scoring prompts have four keys and `{{TRANSCRIPT}}`; valid POST returns 200 with expected shape; missing/invalid input returns 400; no active agent returns 404; parse failure returns 500.

**Not modified**

- No files under `app/coach/` or admin; no scorecard UI; no existing routes or pages.

---

## Dependencies

**Must Be Done First**

- The `agents` table must exist and have at least the SPIN Sales Coach row (from SEI-26 seed). Scoring works once that agent is set to “active” in Prompt Control.

**Can Build in Parallel**

- `lib/scoringPrompts.ts` and the new `lib/agents.ts` helper can be written in either order; the API route depends on both.

**Blocks Future Work**

- The future “wire scorecard UI” work will call this API to display the scorecard after a session.

---

## Test Strategy

**What We'll Test**

- **Happy path**: POST with valid `transcript` and `sessionType` (one of the four keys), with an active SPIN Sales Coach in the DB → 200 and a JSON body with scores, strengths, growth_areas, next_step_quality, next_step_note, headline.
- **Validation**: Missing or invalid body or `sessionType` → 400.
- **No active agent**: No row with name “SPIN Sales Coach” and status “active” → 404 with the specified message.
- **Parse failure**: When the model returns something that isn’t valid JSON (or we strip incorrectly) → 500 with an error message.

**How We'll Know It Works**

- Manually: Set SPIN Sales Coach to active in Prompt Control, POST a short transcript and a valid `sessionType`, and confirm the response is the expected JSON shape. Repeat with invalid input and with agent set to draft to confirm 400 and 404.

---

## Risks & Mitigations

| Risk | Impact on Business | How We'll Handle It |
|------|--------------------|---------------------|
| Claude returns non-JSON or malformed JSON | Caller gets 500 instead of scorecard | Strip markdown fences robustly; catch parse errors and return 500 with a generic message so we don’t expose internals. |
| No active SPIN agent | Scoring fails for everyone | Return 404 with clear message telling admins to set status to active in Prompt Control. |
| Anthropic API down or key missing | Scoring fails | Return 500 with a safe error message; do not leak keys or stack traces. |

---

## Implementation Phases

**Phase 1: Scoring prompts and agent helper (Day 1 morning)**

- Add `lib/scoringPrompts.ts` with `SCORING_PROMPTS` and all four prompts (outreach_15, outreach_30, discovery_15, discovery_30), including `{{TRANSCRIPT}}` and calibration wording per spec.
- Extend `lib/agents.ts` with a function that returns the active SPIN Sales Coach prompt (or null).
- **Deliverable**: Importing `SCORING_PROMPTS` works; new agents helper returns the DB prompt when the agent is active, null otherwise.

**Phase 2: Score-session API (Day 1 afternoon)**

- Add `app/api/score-session/route.ts`: validate body and `sessionType`, get agent prompt via lib, get template from `SCORING_PROMPTS`, substitute transcript, call Anthropic (model, max_tokens, system/user messages per spec), strip markdown, parse JSON, return 200 with scorecard or 400/404/500 as specified.
- **Deliverable**: POST with valid input and active agent returns a scorecard; invalid input or no active agent returns the right status and message.

**Phase 3: Verification (Day 1 end)**

- Run lint and build; confirm no changes under coach or admin; optionally document how to test the endpoint (e.g. curl or a small script).
- **Deliverable**: Ready for integration and future scorecard UI.

---

## Deployment Plan

**Feature Flag**: No — API is additive; nothing in the current UI calls it until the scorecard screen is built.

**Database Changes**: No — We only read from the existing `agents` table.

**Rollback**: Revert the branch; no data or schema changes to undo.

---

## Success Metrics

- Callers can POST a transcript and session type and receive a consistent JSON scorecard when the SPIN Sales Coach is active.
- Changing the agent’s prompt in Prompt Control changes scoring behavior with no code deploy.
- Invalid or missing input yields 400; no active agent yields 404; parse or API errors yield 500 with safe messages.

---

## Timeline Breakdown

| Phase | Duration | Why This Long |
|-------|----------|---------------|
| Phase 1: Prompts + agent helper | ~0.5 day | Four prompt strings with calibration text; one small query in existing agents lib. |
| Phase 2: Score-session API | ~0.5 day | One route: validation, lib calls, Anthropic, strip/parse, error handling. |
| Phase 3: Verify | Short | Lint, build, sanity-check scope. |

**Total**: 1 day  
**Confidence**: High — Spec is clear; we’re adding two files and one helper; no UI or existing flow changes.

---

## What Could Make This Take Longer

- Needing to tune the four scoring prompts after seeing real Claude output could add time in a follow-up; the plan covers “implement to spec” only.
- If Anthropic SDK or env (e.g. `ANTHROPIC_API_KEY`) behave differently than assumed, we may need a short fix to match the spec.

---

## What's NOT Included

- Any scorecard UI or wiring from the coach flow to this API.
- Changes to `app/coach/` or `app/coach/spin/` or the admin panel.
- Persisting scorecards to the database.
- Support for session types other than the four keys in `SCORING_PROMPTS`.

---

## Next Steps

1. Review this plan.
2. Ask any questions using /explain.
3. When ready: Run /implement to start building.
4. I'll create the git branch and begin Phase 1.
