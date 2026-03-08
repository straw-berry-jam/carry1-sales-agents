---
linear: https://linear.app/sei-interview-app/issue/SEI-29/spin-scorecard-real-api-integration
ticket: SEI-29
---

# Feature Specification: SPIN Scorecard Real API Integration

**Feature Branch**: `SEI-29-spin-scorecard-real-api`
**Created**: 2026-03-07
**Status**: Draft
**Linear Ticket**: [SEI-29](https://linear.app/sei-interview-app/issue/SEI-29/spin-scorecard-real-api-integration)
**Input**: Update app/coach/spin/scorecard/page.tsx to replace the existing dummy scorecard with a real SPIN-scored scorecard that calls the scoring API. Read spinSessionType and spinTranscript from localStorage; call POST /api/score-session; show loading then render API-driven header, four SPIN score cards, and overall score.

## User Scenarios & Testing (mandatory)

### User Story 1 - Scorecard loads session data and shows error when missing (Priority: P1)
A consultant completes a SPIN session and navigates to the scorecard (or opens the scorecard URL directly). The page reads `spinSessionType` and `spinTranscript` from localStorage. If either is missing, or if `spinTranscript` is empty, the user sees a clear error state with the message "No session data found. Please complete a session first." and a "Start a session" button that links to `/coach/spin`.
**Why this priority**: Prevents broken experience when arriving without session data; defines the contract for required localStorage keys.
**Independent Test**: Clear localStorage (or omit spinTranscript / spinSessionType, or set spinTranscript to ""), open `/coach/spin/scorecard`, then verify error message and button link.
**Acceptance Scenarios**:
1. **Given** localStorage has no `spinTranscript`, **When** the user loads `/coach/spin/scorecard`, **Then** the page shows "No session data found. Please complete a session first." and a "Start a session" button linking to `/coach/spin`.
2. **Given** localStorage has no `spinSessionType`, **When** the user loads the scorecard page, **Then** the same error state is shown.
3. **Given** `spinTranscript` is present but empty string (or only whitespace), **When** the user loads the scorecard page, **Then** the same error state is shown (do not attempt to score an empty transcript).
4. **Given** both `spinTranscript` and `spinSessionType` are present and transcript is non-empty, **When** the user loads the scorecard page, **Then** the page does not show the error state and proceeds to call the scoring API.

### User Story 2 - Loading state while scoring (Priority: P1)
When session data is present, the scorecard page POSTs the transcript and session type to `/api/score-session` and shows a loading state until the API responds.
**Why this priority**: Core path; users must see clear feedback during the scoring request.
**Independent Test**: Set spinTranscript and spinSessionType in localStorage, load scorecard; mock or slow the API to verify loading UI.
**Acceptance Scenarios**:
1. **Given** valid `spinTranscript` and `spinSessionType` in localStorage, **When** the user loads the scorecard page, **Then** the page shows the "ANALYSIS COMPLETE" badge with a spinner, "Analysing your session..." as the subheading, and dimmed score cards with placeholder states.
2. **Given** the loading state is visible, **When** the API returns a successful scorecard, **Then** the loading state is replaced by the rendered scorecard (Story 3).

### User Story 3 - Render real scorecard from API (Priority: P1)
When the scoring API returns successfully, the scorecard page renders the title, API headline, four SPIN dimension scores as percentages with commentary, and overall score.
**Why this priority**: Delivers the real value of the feature.
**Independent Test**: Return a known JSON scorecard from a mock or real API and assert header, four cards, and overall score match.
**Acceptance Scenarios**:
1. **Given** the API returns `{ headline, scores: { situation, problem, implication, need_payoff, overall }, ... }`, **When** the scorecard renders, **Then** the header shows "Your Sales Performance Scorecard" (existing title) and the API `headline` as the subheading (replacing the dummy "Excellent work!..." text).
2. **Given** the API returns scores with `score` 1–5 and `commentary` for each dimension, **When** the scorecard renders, **Then** four cards show: Situation, Problem, Implication, Need-Payoff; each displays the percentage (score/5 * 100) prominently and the commentary always visible below the percentage (no tooltip or expand/collapse).
3. **Given** the API returns `scores.overall` (1–5), **When** the scorecard renders, **Then** the overall score is displayed as a percentage (overall/5 * 100) below the four SPIN cards.
4. **Given** the API returns `strengths` and/or `growth_areas` arrays, **When** the scorecard renders, **Then** the existing Key Strengths and Growth Areas sections are populated from that data (same layout as current scorecard); if absent, sections may be hidden or show empty state per implementation.

### User Story 4 - API error handling (Priority: P2)
If the scoring API returns an error (4xx/5xx) or the response is invalid, the user sees a graceful error state and can retry or go back to the coach.
**Why this priority**: Important for reliability; avoids blank or confusing screens.
**Independent Test**: Force API to return 500 or invalid JSON; verify error message and recovery actions.
**Acceptance Scenarios**:
1. **Given** the API returns 500 or 404, **When** the scorecard page handles the response, **Then** the user sees an error message (e.g. "Scoring failed. Please try again.") and an option to "Start a session" or retry.
2. **Given** the API returns 200 but the body is not valid scorecard JSON, **When** the page parses the response, **Then** the user sees a safe error state and can navigate back to `/coach/spin`.

### User Story 5 - Session page persists transcript for scorecard (Priority: P1)
When the user is on the SPIN session page and navigates to the scorecard (e.g. by clicking "View scorecard" or the scorecard link when the demo has ended), the conversation transcript is available in localStorage under `spinTranscript` so the scorecard page can score it. This feature includes the session page writing that transcript.
**Why this priority**: The scorecard is useless without transcript data; persisting it is part of the same feature, not a separate task.
**Independent Test**: Complete a session (send at least one exchange), navigate to scorecard, then verify localStorage contains `spinTranscript` with conversation content before the scorecard page loads (or verify the scorecard successfully fetches and scores).
**Acceptance Scenarios**:
1. **Given** the user has had a conversation on the SPIN session page (messages exist), **When** the user navigates to the scorecard (e.g. clicks the link to `/coach/spin/scorecard`), **Then** `spinTranscript` in localStorage contains the conversation in a format suitable for the scoring API (e.g. turn-by-turn text).
2. **Given** the user navigates to the scorecard after a session, **When** the scorecard page loads, **Then** it reads `spinTranscript` and successfully calls the scoring API with it.

### Edge Cases
- **Missing transcript key**: Same as Story 1; show "No session data found" and link to `/coach/spin`.
- **Empty transcript string**: Treat as error — show "No session data found" (same as missing). Do not attempt to score an empty transcript.
- **Invalid sessionType in localStorage**: Default to `outreach_15` before calling the API. A wrong default is better than a broken scorecard; the API requires one of the four valid values.
- **Network failure / timeout**: Show same generic error as 5xx and offer "Start a session" or retry.
- **User navigates away during loading**: No need to cancel the request; if they return later, they would need to reload; no special handling required for MVP.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The scorecard page (`app/coach/spin/scorecard/page.tsx`) MUST on load read `spinSessionType` and `spinTranscript` from `localStorage` (client-side only).
- **FR-002**: If `spinSessionType` or `spinTranscript` is missing, null/undefined, or (for `spinTranscript`) empty or whitespace-only, the page MUST show an error state with the exact message "No session data found. Please complete a session first." and a "Start a session" button that links to `/coach/spin`. Do not attempt to score an empty transcript.
- **FR-003**: If `spinSessionType` is present but not one of `outreach_15`, `outreach_30`, `discovery_15`, `discovery_30`, the scorecard page MUST use `outreach_15` as the value when calling the API (default; a wrong default is better than a broken scorecard).
- **FR-004**: When both values are present and transcript is non-empty, the page MUST POST to `/api/score-session` with body `{ "transcript": <spinTranscript>, "sessionType": <validated or default sessionType> }`.
- **FR-005**: While the request is in flight, the page MUST show a loading state: keep the "ANALYSIS COMPLETE" badge with a spinner, show "Analysing your session..." as the subheading, and dim the score cards with placeholder states.
- **FR-006**: On successful response, the page MUST render: (1) Header title "Your Sales Performance Scorecard"; (2) Subheading from the API response field `headline`; (3) Four score cards for Situation, Problem, Implication, Need-Payoff, each with percentage (score/5 * 100) and commentary from the API always visible below the percentage (no tooltip or expand/collapse); (4) Overall score as a percentage, placed below the four cards; (5) Key Strengths and Growth Areas sections kept from the existing scorecard design, populated from API `strengths` and `growth_areas` when present.
- **FR-007**: The API response shape MUST be assumed as per `lib/scoringPrompts.ts`: `scores.situation | problem | implication | need_payoff` each `{ score: 1-5, commentary: string }`, and `scores.overall` 1–5; plus `headline` string; plus optional `strengths` and `growth_areas` arrays for the existing scorecard sections.
- **FR-008**: On API error (4xx/5xx) or unparseable response, the page MUST show a graceful error state and provide a way to go to `/coach/spin` or retry.
- **FR-009**: The SPIN session page (`app/coach/spin/session/page.tsx`) MUST persist the conversation transcript to `localStorage` under the key `spinTranscript` so the scorecard page can read it. Persistence MUST happen such that when the user navigates to the scorecard (e.g. via the "View scorecard" link), `spinTranscript` is set to a string representation of the conversation (e.g. turn-by-turn format suitable for the scoring API). This is in scope for this feature; the scorecard is useless without it.
- **FR-010**: Do not modify the general coach flow under `/coach/` (non-SPIN). Only update `app/coach/spin/scorecard/page.tsx` and `app/coach/spin/session/page.tsx` as specified (and add types/tests as needed).

### Key Entities (if feature involves data)
- **Scorecard API response**: Consumed from POST `/api/score-session`; structure as in `lib/scoringPrompts.ts`: `scores` (situation, problem, implication, need_payoff, overall), `headline`, `strengths`, `growth_areas`. Headline and scores are required for the UI; Key Strengths and Growth Areas sections are kept and populated from `strengths` and `growth_areas` when present.
- **localStorage keys**: `spinSessionType` (string; written by session page from URL/default), `spinTranscript` (string; written by session page when conversation exists, read by scorecard). Session page writes both; scorecard reads both.

### Non-Functional Requirements
- **NFR-001**: Loading and error states must be clearly visible (no silent failures). Use existing brand and Tailwind tokens per CLAUDE.md.
- **NFR-002**: Scorecard page must work with the existing POST `/api/score-session` contract; no API changes required for this feature.
- **NFR-003**: When rendering real scorecard results, preserve all existing entrance and transition animations from the current scorecard implementation. Specifically: (1) Score cards MUST animate in (fade/slide) when results load, with the same staggered delay pattern as today. (2) Percentage scores (per-card and overall) MUST count up from 0 to their final value. (3) The "ANALYSIS COMPLETE" badge entrance animation (e.g. opacity and scale) MUST be preserved. (4) The transition from loading/analysing state to results state MUST use the same animation patterns already in place (e.g. AnimatePresence, motion wrappers); do not remove or simplify existing entrance animations.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 acceptance scenarios (Stories 1–3 and 5) pass when tested manually or via tests.
- **SC-002**: Missing or empty `spinTranscript`, or missing `spinSessionType`, always shows the specified error message and "Start a session" link to `/coach/spin`. Invalid `sessionType` defaults to `outreach_15` and does not break the scorecard.
- **SC-003**: After a successful API response, the header shows the API `headline`; all four SPIN dimensions show percentage and commentary (always visible below each card); overall score is below the four cards; Key Strengths and Growth Areas sections are populated from the API when present.
- **SC-004**: Session page writes `spinTranscript` so that navigating to the scorecard after a session results in a successful scorecard load and API call.
- **SC-005**: `npm run lint` and `npm run build` pass; changes limited to `app/coach/spin/scorecard/page.tsx` and `app/coach/spin/session/page.tsx` per Directory Contract.
- **SC-006**: Scorecard results view uses the same entrance animations as the current implementation (score cards fade/slide in with stagger; "ANALYSIS COMPLETE" badge animation preserved); percentage values count up from 0 to final; loading-to-results transition is smooth and uses existing animation patterns.
