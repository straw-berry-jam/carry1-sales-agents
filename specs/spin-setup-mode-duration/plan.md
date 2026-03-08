# Implementation Plan: SPIN Setup — Session Mode and Duration Selectors (SEI-28)

**Branch**: `SEI-28-spin-setup-mode-duration`  
**Spec**: [SEI-28-spin-setup-mode-duration.md](../features/SEI-28-spin-setup-mode-duration.md)  
**Exploration**: Not yet run  
**Design**: [spin-coach-design.md](../designs/spin-coach-design.md) exists for SPIN flow; new toggles match existing setup/session patterns per spec.  
**Estimated Timeline**: 0.5–1 day — Two small UI additions on setup, one URL/navigation change, one localStorage write on session load. Only two files touched.

---

## What We're Building (Summary)

Users choosing a SPIN practice session will first pick **Session Mode** (Outreach or Discovery) and **Session Duration** (15 min or 30 min) on the setup screen. Those choices are combined into a single session type (e.g. outreach_15, discovery_30) and passed into the session via the URL. The session page saves that value so the future scorecard can use it when calling the scoring API—without changing the scorecard or anything outside the SPIN flow.

---

## Technical Approach

We'll do this in two small pieces:

1. **Setup page (app/coach/spin/page.tsx)** — Add two button toggles at the top of step 1, before "What should we call you?": one for Session Mode (Outreach | Discovery), one for Session Duration (15 min | 30 min). Defaults: Outreach and 15 min. Derive sessionType from the two selections (outreach_15, outreach_30, discovery_15, discovery_30). When the user clicks Start Session, navigate to `/coach/spin/session?sessionType=<value>` instead of `/coach/spin/session`. Reuse the same button-toggle styling already used on the setup screen (e.g. step 2 context/duration buttons or step 3 voice/text).

2. **Session page (app/coach/spin/session/page.tsx)** — On load, read the `sessionType` query parameter. If it's one of the four allowed values, store it in localStorage under "spinSessionType". If it's missing or invalid, store "outreach_15" so the scorecard always has a valid value later.

No new components or routes; no changes to scoring, admin, or the scorecard page.

---

## Constitution Check

- **Follows Spec-Driven Development**: Implementation matches the approved SEI-28 spec; scope limited to app/coach/spin/.
- **Uses approved tech stack**: Next.js App Router, TypeScript, Tailwind; no new frameworks.
- **Directory contract**: Only `app/coach/spin/page.tsx` and `app/coach/spin/session/page.tsx` modified.
- **Exception needed**: None.

---

## Files That Will Be Created/Modified

**User-facing**

- **SPIN setup (app/coach/spin/page.tsx)**: Add Session Mode and Session Duration toggles before existing step-1 fields; extend form state; derive sessionType; change Start Session to navigate with `?sessionType=<value>`.

**Behind-the-scenes**

- **SPIN session (app/coach/spin/session/page.tsx)**: On load, read sessionType from URL (e.g. useSearchParams); persist to localStorage as "spinSessionType", defaulting to "outreach_15" when missing or invalid.

**Not modified**

- No files outside app/coach/spin/; no scorecard, scoring API, or admin.

---

## Dependencies

**Must be done first**

- None. SPIN setup and session pages already exist.

**Can build in parallel**

- Setup toggles and session localStorage can be implemented in either order; both are independent.

**Blocks future work**

- The future "wire scorecard" work will read spinSessionType from localStorage to call the score-session API with the correct session type.

---

## Test Strategy

**What we'll test**

- **Happy path**: Open /coach/spin → see both toggles with Outreach and 15 min selected; change to Discovery and 30 min; complete setup and Start Session → URL is /coach/spin/session?sessionType=discovery_30; session page loads and localStorage.spinSessionType is "discovery_30".
- **Defaults**: Start Session with Outreach + 15 min → URL has sessionType=outreach_15; open /coach/spin/session with no query → spinSessionType is "outreach_15".
- **Invalid URL**: Open /coach/spin/session?sessionType=invalid → spinSessionType is "outreach_15" (default).

**How we'll know it works**

- Manually: Run through setup with each of the four combinations and confirm URL and localStorage; open session without query and confirm default.

---

## Risks & Mitigations

| Risk | Impact on business | How we'll handle it |
|------|--------------------|----------------------|
| User bookmarks session URL without sessionType | Scorecard might not have type in an older build | Default to outreach_15 so scorecard always has a valid value. |
| Stale sessionType in localStorage from a previous run | Scorecard could use wrong type | Session page overwrites spinSessionType on every load from URL (or default), so it always reflects this session. |

---

## Implementation Phases

**Phase 1: Setup toggles and navigation (same day)**

- Add Session Mode and Session Duration state and toggles to the setup page (before step-1 fields); derive sessionType; update Start Session to navigate to `/coach/spin/session?sessionType=<value>`.
- **Deliverable**: User can select mode and duration and land on the session page with the correct query.

**Phase 2: Session page persistence (same day)**

- Read sessionType from URL on session page load; store in localStorage as "spinSessionType", defaulting to "outreach_15" when missing or invalid.
- **Deliverable**: spinSessionType is always set for the scorecard to use later.

**Phase 3: Verify (short)**

- Confirm no edits outside app/coach/spin/; quick manual pass for all four combinations and default case.
- **Deliverable**: Ready for merge.

---

## Deployment Plan

**Feature flag**: No — Additive UI and URL/localStorage behavior; no scoring or admin changes.

**Database changes**: No.

**Rollback**: Revert the branch; no data migration. Users may have spinSessionType in localStorage from one session; harmless.

---

## Success Metrics

- Session Mode and Session Duration toggles appear with correct defaults and all four sessionType values produce the correct URL when starting the session.
- spinSessionType is written to localStorage on session load (from URL or default outreach_15).
- No changes outside app/coach/spin/; toggle styling matches existing setup/session patterns.

---

## Timeline Breakdown

| Phase | Duration | Why |
|-------|----------|-----|
| Phase 1: Setup toggles + URL | ~0.25–0.5 day | Two toggles and one navigation change; reuse existing button styles. |
| Phase 2: Session localStorage | ~0.25 day | One read from URL, one write to localStorage with default. |
| Phase 3: Verify | Short | Scope check and smoke test. |

**Total**: 0.5–1 day  
**Confidence**: High — Spec is clear; only two files; patterns already exist in the same pages.

---

## What Could Make This Take Longer

- If the setup page structure or state is more complex than expected, wiring the new fields could take a bit longer; still expected to stay within the estimate.

---

## What's NOT Included

- Wiring the scorecard page to read spinSessionType or call the score-session API.
- Changes to scoring engine, admin, or any route outside app/coach/spin/.

---

## Next Steps

1. Review this plan.
2. Ask any questions using /explain.
3. When ready: Run /implement to start building.
4. I'll create the git branch and begin Phase 1.
