# Implementation Plan: SPIN Scorecard Real API Integration

**Branch**: `SEI-29-spin-scorecard-real-api`
**Spec**: [specs/features/SEI-29-spin-scorecard-real-api.md](../features/SEI-29-spin-scorecard-real-api.md)
**Exploration**: Not yet run
**Design**: [specs/designs/spin-scorecard-real-api-design.md](../designs/spin-scorecard-real-api-design.md) (commentary always visible; overall score below four cards; Strengths/Growth Areas kept)
**Estimated Timeline**: 1–2 days — Two pages to update (session + scorecard), one existing API to call, straightforward data flow.

---

## What We're Building (Summary)

Consultants who finish a SPIN practice session will see a **real scorecard** instead of fake numbers. The app will send their conversation to the scoring service, show a short “Analysing your session…” state, then display their SPIN scores (Situation, Problem, Implication, Need-Payoff) plus an overall score and AI-generated headline. If they land on the scorecard without session data (e.g. old link or cleared browser), they’ll see a clear message and a button to start a new session. To make this work, the session page will save the conversation into the browser so the scorecard page can read it and send it to the API.

---

## Technical Approach

We'll build this in three pieces:

1. **Session page: save the conversation** (half day) — When the user has a conversation on the SPIN session page, we’ll keep the transcript in the browser (same place we already store session type). When they click “View scorecard,” that transcript will already be there so the scorecard can use it. We’ll format it as simple turn-by-turn text (e.g. “Coach: …”, “Rep: …”) so the scoring API gets a clear script.

2. **Scorecard page: read data, call API, show states** (three-quarters day) — On load, the scorecard will read session type and transcript from the browser. If either is missing or the transcript is empty, we’ll show “No session data found” and a “Start a session” button. If we have valid data, we’ll POST to the existing scoring API, show “Analysing your session…” with a spinner and dimmed cards, then replace that with the real headline and four SPIN score cards (percentage + commentary always visible below each), overall score below the four cards, and Key Strengths / Growth Areas sections populated from the API when present. We’ll handle API errors with a clear message and a way to go back or retry.

3. **Tests and polish** (quarter day) — We’ll add tests for: missing/empty data showing the error screen, invalid session type defaulting so the scorecard still works, loading state, successful scorecard render, and session page writing the transcript. Then we’ll run lint and build and do a quick manual pass.

Invalid session type in the browser will default to `outreach_15` so the scorecard never breaks; empty transcript will be treated like “no data” and show the same error message.

---

## Constitution Check

- **Follows Spec-Driven Development**: Implementation is scoped to the SEI-29 spec; only scorecard and SPIN session pages are touched.
- **Follows Directory Contract**: Changes only in `app/coach/spin/scorecard/page.tsx` and `app/coach/spin/session/page.tsx`; no new routes or lib modules required.
- **Uses approved tech stack**: Next.js App Router, TypeScript, existing POST `/api/score-session`, Tailwind for UI, client-side localStorage.
- **TDD**: Tests will be written first (or alongside) for the new behavior; test location per project (e.g. `__tests__/` or colocated).
- **Exception needed**: None.

---

## Files That Will Be Created/Modified

**User-Facing Changes**

- **SPIN session page** (`app/coach/spin/session/page.tsx`): Persist conversation to `spinTranscript` in localStorage (e.g. when messages change or before navigating to scorecard) so the scorecard can read it.
- **SPIN scorecard page** (`app/coach/spin/scorecard/page.tsx`): Replace email/dummy flow with: read `spinSessionType` and `spinTranscript`; if missing or empty show error + “Start a session” link; else POST to `/api/score-session`, show loading (spinner + “Analysing your session…” + dimmed cards), then render real header (title + API headline), four SPIN score cards (percentage + commentary always visible below each), overall score below the four cards, and Key Strengths / Growth Areas from the API. Handle API errors with a retry/back option. Preserve all existing entrance animations: score cards fade/slide in with staggered delay; "ANALYSIS COMPLETE" badge animation; percentage scores count up from 0 to final value; loading-to-results transition uses same animation patterns (AnimatePresence, motion).

**Behind-the-Scenes**

- **Scorecard page**: Normalize `sessionType` (default `outreach_15` if invalid); treat empty/whitespace transcript as “no data”; type the API response shape for headline and scores.

**Tests**

- **Scorecard**: Missing/empty transcript or missing session type shows error and link; invalid session type still loads and calls API with default; loading state appears when data is present; successful response renders headline and four SPIN scores + overall; API error shows message and recovery.
- **Session**: After conversation exists, navigating to scorecard (or the moment we persist) leaves `spinTranscript` in localStorage in a format the scorecard can send to the API.

---

## Dependencies

**Must Be Done First**

- None. POST `/api/score-session` and `spinSessionType` persistence already exist.

**Can Build in Parallel**

- Session transcript persistence and scorecard page changes can be developed in either order; scorecard will need transcript in localStorage to test the full flow, so session persistence is usually done first.

**Blocks Future Work**

- A future “download scorecard PDF” or “strengths/growth areas” section could build on this scorecard response; this plan only uses headline and scores.

---

## Test Strategy

**What We'll Test**

- **Happy path**: User completes a session, goes to scorecard → sees “Analysing your session…” then real headline, four SPIN cards (percentage + commentary visible), overall score below cards, and Strengths/Growth Areas when API returns them.
- **Error cases**: No transcript or no session type or empty transcript → “No session data found” and “Start a session” link; API 4xx/5xx or bad JSON → clear error and option to retry or go to coach.
- **Edge cases**: Invalid `spinSessionType` in localStorage → scorecard still works (defaults to `outreach_15`); session page writes `spinTranscript` so that after a conversation, the scorecard can load and score.

**How We'll Know It Works**

- Manual: Do a short SPIN session, click through to scorecard, confirm loading then real scores and headline; then clear localStorage and reload scorecard to confirm error state.
- Automated: Tests for scorecard states (no data, loading, success, API error) and for session page writing `spinTranscript`.

---

## Risks & Mitigations

| Risk | Impact on Business | How We'll Handle It |
|------|--------------------|----------------------|
| Scoring API slow or down | Users see loading longer or error message | Loading state and error message with “Start a session” / retry; no silent hang. |
| Transcript format doesn’t match API expectations | Scores feel wrong or API errors | Use a simple, consistent turn-by-turn format (e.g. “Coach: …”, “Rep: …”) aligned with how the API prompt expects transcript. |
| User clears storage then hits scorecard | Confusing or blank screen | Show “No session data found” and “Start a session” so they know what to do. |

---

## Implementation Phases

**Phase 1: Session page persists transcript** (Day 1 — morning)

- Add logic so the SPIN session page writes the conversation to `localStorage` under `spinTranscript` (e.g. whenever `messages` changes, or when the user clicks the scorecard link). Format as turn-by-turn text (e.g. “Coach: …”, “Rep: …”) so the scoring API receives a single string.
- **Deliverable**: After a conversation on the session page, `spinTranscript` is present in localStorage and contains the dialogue; tests (if any) for this behavior pass.

**Phase 2: Scorecard page — data check and API call** (Day 1 — afternoon)

- On load, read `spinSessionType` and `spinTranscript` from localStorage. If either is missing or transcript is empty/whitespace, show error state: “No session data found. Please complete a session first.” and “Start a session” button linking to `/coach/spin`. If `spinSessionType` is not one of the four allowed values, use `outreach_15`. When data is valid, POST `{ transcript, sessionType }` to `/api/score-session`.
- Show loading state: keep “ANALYSIS COMPLETE” badge with spinner, subheading “Analysing your session…”, and dimmed placeholder score cards until the API responds.
- **Deliverable**: Visiting scorecard with no/empty data shows error; with valid data shows loading then receives scorecard JSON (or error).

**Phase 3: Scorecard page — render results and errors** (Day 2 — morning)

- On successful API response: render header “Your Sales Performance Scorecard” and subheading from API `headline`; four cards (Situation, Problem, Implication, Need-Payoff) with percentage (score/5 × 100) and commentary always visible below each; overall score below the four cards; Key Strengths and Growth Areas from API when present. Remove dummy email flow and dummy score content. Preserve existing entrance animations (score cards fade/slide with stagger, "ANALYSIS COMPLETE" badge); add count-up from 0 to final value for all percentage scores; keep smooth loading-to-results transition.
- On API error (4xx/5xx or unparseable body): show a clear message (e.g. “Scoring failed. Please try again.”) and a way to go to `/coach/spin` or retry.
- **Deliverable**: Full scorecard experience: loading → real scores and headline, or error with recovery.

**Phase 4: Tests and polish** (Day 2 — afternoon)

- Add tests for scorecard (no data, loading, success, API error, invalid sessionType default) and for session page writing `spinTranscript`. Run lint and build; fix any issues; quick manual test of full flow.
- **Deliverable**: Tests passing, lint and build green, ready for review.

---

## Deployment Plan

**Feature Flag**: No — Scorecard is SPIN-only and replaces the current dummy flow; no separate flag.

**Database Changes**: No — Uses existing API and localStorage only.

**Rollback Strategy**: Revert the two page files; no persisted server state. Users who already have `spinTranscript`/`spinSessionType` in localStorage will see the new flow until reverted.

---

## Success Metrics

- **User can see real SPIN scores** after a session: headline and four dimensions plus overall, with commentary.
- **No dead ends**: Missing or empty data shows “No session data found” and “Start a session”; API errors show a message and retry/back.
- **Session → scorecard works in one go**: Completing a session and clicking to scorecard results in transcript being available and scorecard loading then showing results (or a clear error).

---

## Timeline Breakdown

| Phase | Duration | Why This Long |
|-------|----------|---------------|
| Phase 1 — Session persist transcript | ~0.5 day | Single place to update (session page), simple format from `messages`. |
| Phase 2 — Scorecard data + API + loading | ~0.5 day | Straightforward fetch and state; reuse existing API. |
| Phase 3 — Scorecard render + errors | ~0.5 day | Replace dummy UI with API-driven blocks; one error state. |
| Phase 4 — Tests + polish | ~0.5 day | Cover main states and session persistence; lint/build. |

**Total**: 1–2 days  
**Confidence**: High — No new backend; two pages and one existing endpoint; spec is clear.

---

## What Could Make This Take Longer

- **Scoring API response shape differs from spec**: If the real API returns different keys or nesting, we’ll need a short adapter or validation (add ~0.25 day).
- **Commentary layout**: Commentary is always visible (no expand/collapse); no extra UX for reveal.

---

## What's NOT Included

- Changes to the general coach flow under `/coach/` (non-SPIN).
- Changes to POST `/api/score-session` or scoring prompts.
- Email collection or PDF download on the scorecard (current dummy email step is removed; PDF can be a later feature).
- Displaying “strengths” or “growth_areas” from the API (Strengths and Growth Areas are in scope: existing sections populated from the API.)

---

## Next Steps

1. Review this plan.
2. Ask any questions using /explain.
3. When ready: Run **/implement** to start building (e.g. `/implement SEI-29` or `/implement specs/features/SEI-29-spin-scorecard-real-api.md`).
4. Implementation will create branch `SEI-29-spin-scorecard-real-api` and begin with Phase 1.
