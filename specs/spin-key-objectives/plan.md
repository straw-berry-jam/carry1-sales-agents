# Implementation Plan: SPIN Session Key Objectives — SPIN Elements and Tips

**Branch**: `SEI-30-spin-session-key-objectives-spin-tips`  
**Spec**: [SEI-30-spin-session-key-objectives-spin-tips.md](../features/SEI-30-spin-session-key-objectives-spin-tips.md)  
**Exploration**: Not run (scope is a single panel content change; exploration not required)  
**Design**: [SEI-30-spin-key-objectives-design.md](../designs/SEI-30-spin-key-objectives-design.md)  
**Estimated Timeline**: Less than 1 day — One file change, static content and styling only.

---

## What We're Building (Summary)

Consultants on the SPIN coaching session page will see a **Key Objectives** sidebar panel that always shows the four SPIN dimensions (Situation, Problem, Implication, Need-Payoff) with one short coaching tip each. The panel will look consistent with the rest of the app (same card style as Live Feedback), with the SPIN letters in the existing accent color and tips in muted text so the panel works as an at-a-glance cheat sheet during practice. There is no loading state — the content is fixed and visible as soon as the page loads.

---

## Technical Approach

We'll make a single, focused change in the SPIN session page:

1. **Replace the Key Objectives panel content** (same day) — Swap the current behavior (loading skeleton, then API-driven or fallback list) for a static list of four items: S — Situation, P — Problem, I — Implication, N — Need-Payoff, each with the exact tip copy from the spec. The panel card (title "Key Objectives", icon, padding, background, borders) stays the same so it matches the Live Feedback card.

2. **Apply the approved styling** — For each row: SPIN letter in the app’s accent color only (using the existing gradient text style so it’s prominent but same size as body text); dimension name in bold; tip in smaller, muted text (e.g. existing muted utility) below the label. No new components or routes; all changes live in the one panel block.

3. **Remove loading behavior for this panel** — Stop showing a loading skeleton in the Key Objectives panel. Always render the four SPIN items so the consultant sees the reference immediately. Any existing fetch or state used elsewhere (e.g. for scorecard or session context) can stay as-is; we only change what this panel displays.

This is a small, low-risk change: one section of one page, no new APIs or data, no changes to Live Feedback, chat, timer, or navigation.

---

## Constitution Check

- ✅ **Follows Spec-Driven Development**: Implementation is scoped to the approved spec and design (accent only, always show, no loading).
- ✅ **Follows Directory Contract**: All edits in `app/coach/spin/session/page.tsx`; no new files required unless we extract a tiny presentational list (optional).
- ✅ **Uses approved tech stack**: Next.js App Router, TypeScript, Tailwind CSS, existing theme tokens (e.g. gradient, glass-card).
- ✅ **Brand & Design**: Uses existing accent (e.g. `text-gradient` / gradient-primary) and muted text; same card styling as today.
- ⚠️ **Exception needed**: None.

---

## Files That Will Be Created/Modified

**User-Facing Changes**

- **SPIN session page — Key Objectives panel** (`app/coach/spin/session/page.tsx`): Replace the panel’s list content with the four static SPIN items (letter, bold dimension name, muted tip). Remove the loading skeleton and API/fallback list from this panel only. Keep the same card wrapper (glass-card, padding, title, icon).

**Behind-the-Scenes**

- **Same file**: Optionally remove or simplify the objectives fetch/state used only for this panel so we don’t run unnecessary loading; if `keyObjectives` or the fetch is still used elsewhere (e.g. scorecard), leave that logic and only change what the panel renders.

**Tests**

- **SPIN session page (optional)** — If we add or extend tests: assert that the Key Objectives panel renders exactly four items (S, P, I, N) with the correct labels and that the panel does not show a loading skeleton. Per TDD, tests would come first if we introduce a dedicated test for this panel.

---

## Dependencies

**Must Be Done First**

- None. The SPIN session page and Key Objectives panel already exist.

**Can Build in Parallel**

- N/A — single-file change.

**Blocks Future Work**

- None. This unblocks clearer SPIN guidance during practice; future work (e.g. scorecard using SPIN dimensions) is independent.

---

## Test Strategy

**What We'll Test**

- **Happy path**: Open SPIN session page (before or after starting); Key Objectives panel shows four items in order S, P, I, N with correct copy and hierarchy (accent letter, bold name, muted tip).
- **Visual consistency**: Key Objectives card uses same padding, background, and borders as Live Feedback card.
- **No loading**: Panel never shows a loading skeleton; four SPIN items appear as soon as the page is visible.

**How We'll Know It Works**

- Manual check: Load `/coach/spin`, complete setup, open session; confirm the panel shows the four SPIN elements and tips and matches the design. Run `npm run lint` and `npm run build` to ensure no regressions.

---

## Risks & Mitigations

| Risk | Impact on Business | How We'll Handle It |
|------|--------------------|----------------------|
| Accidentally changing Live Feedback or chat | Confusion, broken layout | Change only the Key Objectives block; no edits outside that card. |
| Breaking scorecard or session start | Scorecard or start flow could fail | Leave any `keyObjectives` state/fetch used elsewhere unchanged; only replace what the panel renders. |
| Accent style not available | Letters don’t stand out | Use existing gradient text utility (e.g. `text-gradient` from globals.css) for the SPIN letters. |

---

## Implementation Phases

**Phase 1: Panel content and styling** (same day)

- Replace the Key Objectives panel body with a static list of four items: S — Situation, P — Problem, I — Implication, N — Need-Payoff, each with the specified tip.
- Style each item: SPIN letter with existing accent (e.g. gradient text), dimension name bold, tip smaller and muted.
- Remove loading skeleton and API/fallback list from this panel (always render the static list).
- **Deliverable**: Key Objectives panel shows the four SPIN items and tips with correct hierarchy; card styling unchanged.

**Phase 2: Verify and ship** (same day)

- Confirm card matches Live Feedback styling; confirm no changes to Live Feedback, chat, timer, or End Session.
- Run `npm run lint` and `npm run build`.
- **Deliverable**: Feature ready for review; build green.

---

## Deployment Plan

**Feature Flag**: No — Change is a content and display update only; no toggle needed.

**Database Changes**: No — All content is static in the UI.

**Rollback Strategy**: Revert the single file; no data or config to restore.

---

## Success Metrics

- **Acceptance scenarios pass**: All P1 scenarios from the spec (four items, correct copy, accent letter, bold name, muted tip, same card style) pass on manual check.
- **No regressions**: Live Feedback, chat, timer, and End Session behave as before; lint and build pass.
- **Consultant benefit**: Consultants can use the panel as an at-a-glance SPIN cheat sheet without waiting for loading.

---

## Timeline Breakdown

| Phase | Duration | Why This Long |
|-------|----------|----------------|
| Phase 1 — Panel content and styling | Part of one day | Single block edit; copy and classes are specified. |
| Phase 2 — Verify and ship | Same day | Lint, build, quick manual pass. |

**Total**: Less than 1 day  
**Confidence**: High — One file, static content, existing styles; design and spec are locked.

---

## What Could Make This Take Longer

- If the SPIN session page has grown and the Key Objectives block is hard to isolate: add ~30 minutes to locate and edit only that block.
- If we discover `keyObjectives` or the fetch is required elsewhere and must be refactored: add up to an hour to keep that behavior while changing only the panel UI.

---

## What's NOT Included

- Changes to the Live Feedback panel, chat area, timer, header, or End Session / scorecard link.
- Changes to any file outside `app/coach/spin/session/` (e.g. general coach session page).
- New API endpoints, feature flags, or database changes.
- Dynamic or personalized objectives; content is fixed per the spec.

---

## Next Steps

1. Review this plan.
2. Ask any questions using /explain.
3. When ready: run /implement (or equivalent) to start building; create branch `SEI-30-spin-session-key-objectives-spin-tips` and implement Phase 1.
4. After implementation, run acceptance checks and Phase 2 verification.
