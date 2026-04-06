---
linear: https://linear.app/issue/SEI-28/spin-setup-session-mode-and-duration-selectors
ticket: SEI-28
---

# Feature Specification: SPIN Setup — Session Mode and Duration Selectors

**Feature Branch**: `SEI-28-spin-setup-mode-duration`
**Created**: 2026-03-08
**Status**: Draft
**Linear Ticket**: [SEI-28](https://linear.app/issue/SEI-28/spin-setup-session-mode-and-duration-selectors)
**Input**: Add Session Mode (Outreach / Discovery) and Session Duration (15 min / 30 min) as button toggles on the SPIN setup screen; combine into sessionType and pass to the session via URL; store sessionType in localStorage on the session page for later scorecard use. No scorecard wiring; no changes outside app/coach/spin/.

## User Scenarios & Testing (mandatory)

### User Story 1 - Session Mode and Duration selectors on setup (Priority: P1)
As a user on the SPIN session setup screen, I see two new controls at the top of the form (before name, company, and deal context): (1) "Session Mode" with two options, Outreach and Discovery, as a button toggle with Outreach selected by default; (2) "Session Duration" with two options, 15 min and 30 min, as a button toggle with 15 min selected by default. I can change either selection; the choices are clearly visible and match the existing toggle style on the setup or session screen.
**Why this priority**: Core input for session type; without it we cannot pass the correct sessionType to the session or scorecard.
**Independent Test**: Open /coach/spin, confirm both toggles appear before other fields, defaults are Outreach and 15 min, and toggling updates selection.
**Acceptance Scenarios**:
1. **Given** I am on /coach/spin (setup), **When** I view the form, **Then** I see "Session Mode" with options Outreach and Discovery, and "Session Duration" with options 15 min and 30 min, placed before "What should we call you?" and other existing fields.
2. **Given** I have not changed the toggles, **When** I view the form, **Then** Outreach is selected for Session Mode and 15 min is selected for Session Duration.
3. **Given** I select Discovery and 30 min, **When** I view the toggles, **Then** Discovery and 30 min appear selected; I can switch back to Outreach and 15 min.

### User Story 2 - sessionType derived and passed to session (Priority: P1)
As a user, when I complete setup and click Start Session, the app navigates to the session page with the sessionType value in the URL query (e.g. /coach/spin/session?sessionType=outreach_15). The sessionType is derived from my selections: Outreach + 15 min = outreach_15, Outreach + 30 min = outreach_30, Discovery + 15 min = discovery_15, Discovery + 30 min = discovery_30.
**Why this priority**: Session and later scorecard need to know which type of session was run.
**Independent Test**: Set Mode = Outreach, Duration = 15 min, complete steps, click Start Session; confirm URL is /coach/spin/session?sessionType=outreach_15. Repeat for all four combinations.
**Acceptance Scenarios**:
1. **Given** Session Mode = Outreach and Session Duration = 15 min, **When** I click Start Session, **Then** I am navigated to /coach/spin/session?sessionType=outreach_15.
2. **Given** Session Mode = Outreach and Session Duration = 30 min, **When** I click Start Session, **Then** I am navigated to /coach/spin/session?sessionType=outreach_30.
3. **Given** Session Mode = Discovery and Session Duration = 15 min, **When** I click Start Session, **Then** I am navigated to /coach/spin/session?sessionType=discovery_15.
4. **Given** Session Mode = Discovery and Session Duration = 30 min, **When** I click Start Session, **Then** I am navigated to /coach/spin/session?sessionType=discovery_30.

### User Story 3 - sessionType stored for scorecard (Priority: P2)
As the system, when the user lands on the SPIN session page, the app reads the sessionType from the URL query parameter and stores it in localStorage under the key "spinSessionType" so the scorecard page can read it after the session ends. If sessionType is missing from the URL, default to "outreach_15".
**Why this priority**: Scorecard (future prompt) will need sessionType to call the score-session API with the correct key.
**Independent Test**: Open /coach/spin/session?sessionType=discovery_30, confirm localStorage.spinSessionType === "discovery_30". Open /coach/spin/session without query, confirm localStorage.spinSessionType === "outreach_15".
**Acceptance Scenarios**:
1. **Given** I navigate to /coach/spin/session?sessionType=outreach_15, **When** the session page loads, **Then** localStorage has key "spinSessionType" with value "outreach_15".
2. **Given** I navigate to /coach/spin/session with no query, **When** the session page loads, **Then** localStorage has key "spinSessionType" with value "outreach_15" (default).

### Edge Cases
- **User opens session page without going through setup** (e.g. bookmark or back): URL may have no sessionType. Session page still loads and sets spinSessionType to "outreach_15" by default so the scorecard always has a valid value.
- **Invalid sessionType in URL**: If someone manually sets ?sessionType=invalid, store as-is or ignore; scorecard API will reject invalid values. Prefer storing only valid values (outreach_15, outreach_30, discovery_15, discovery_30) and ignoring invalid.
- **Order of fields**: Session Mode and Session Duration must appear before existing form fields (step 1) so the user sets session type first.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: On `app/coach/spin/page.tsx`, the setup form MUST display two new controls before the existing step-1 fields: (1) "Session Mode" with two options, **Outreach** and **Discovery**, implemented as a button toggle (not a dropdown). Default: Outreach selected. (2) "Session Duration" with two options, **15 min** and **30 min**, implemented as a button toggle. Default: 15 min selected.
- **FR-002**: The combination of Session Mode and Session Duration MUST be mapped to a single `sessionType` string: Outreach + 15 min = "outreach_15", Outreach + 30 min = "outreach_30", Discovery + 15 min = "discovery_15", Discovery + 30 min = "discovery_30".
- **FR-003**: When the user clicks the action that starts the session (e.g. "Start Session"), the app MUST navigate to `/coach/spin/session?sessionType=<value>` where `<value>` is the derived sessionType (one of outreach_15, outreach_30, discovery_15, discovery_30).
- **FR-004**: In `app/coach/spin/session/page.tsx`, on load the page MUST read the `sessionType` query parameter from the URL and MUST store it in localStorage under the key "spinSessionType" so the scorecard page can read it after the session. If sessionType is missing from the URL, the page MUST set spinSessionType to "outreach_15" (default).
- **FR-005**: Styling for the new toggles MUST match the existing button toggle style on the SPIN setup screen. If no toggle exists there, use the same selected/unselected styling as the text/voice mode toggle on the SPIN session screen (`app/coach/spin/session/page.tsx`).
- **FR-006**: No modifications outside `app/coach/spin/`. No changes to the scoring engine, admin panel, or scorecard page wiring.

### Key Entities
- **sessionType**: String value derived from user choices on setup; one of "outreach_15", "outreach_30", "discovery_15", "discovery_30". Passed via URL to session; stored in localStorage as "spinSessionType" for scorecard.

### Non-Functional Requirements
- **NFR-001**: Implementation MUST be confined to `app/coach/spin/page.tsx` and `app/coach/spin/session/page.tsx`. No other files modified.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 acceptance scenarios pass: Session Mode and Session Duration toggles visible with correct defaults; all four sessionType values result in correct URL when starting the session.
- **SC-002**: P2 scenario passes: sessionType from URL is stored in localStorage under "spinSessionType" when present.
- **SC-003**: No files outside app/coach/spin/ are modified; no scorecard wiring; scoring engine and admin unchanged.
- **SC-004**: Toggle styling is consistent with existing SPIN setup or session screen toggles (plum/brand tokens).

## Out of Scope
- Wiring the scorecard page to use spinSessionType or call the score-session API (future prompt).
- Modifying the scoring engine, lib/scoringPrompts, or /api/score-session.
- Modifying the admin panel or any route outside app/coach/spin/.

## Implementation Notes
- **Navigation**: Update the Start Session handler to build the session URL with a query parameter, e.g. `router.push(\`/coach/spin/session?sessionType=${sessionType}\`)`.
- **Session page**: Use Next.js `useSearchParams()` (or equivalent) to read `sessionType`. If present and one of outreach_15, outreach_30, discovery_15, discovery_30, store it in localStorage as "spinSessionType". If missing or invalid, store "outreach_15" as the default.
- **Toggle UI**: Reuse the same pattern as the text/voice toggle on the session page (e.g. two buttons with selected state styling) so the experience is consistent.
