# Design Exploration: SPIN Session Key Objectives — SPIN Elements and Tips

**Related spec**: [SEI-30-spin-session-key-objectives-spin-tips.md](../features/SEI-30-spin-session-key-objectives-spin-tips.md)  
**Linear**: [SEI-30](https://linear.app/sei-interview-app/issue/SEI-30/spin-session-key-objectives-spin-elements-and-tips)  
**Created**: 2026-03-08

---

## User Journey

**Marcus** is on the SPIN coaching session page, either before he’s started the conversation or mid-session. He wants a quick reminder of what to focus on during the call.

1. **Marcus looks at the sidebar** and sees the **Key Objectives** card (same position and card style as today — same padding, background, and borders as the Live Feedback card).
2. **He reads the four SPIN elements** in order: **S — Situation**, **P — Problem**, **I — Implication**, **N — Need-Payoff**. Each row catches his eye in this order: the **letter** (S, P, I, or N) stands out first, then the **dimension name** in bold, then the **tip** in quieter text underneath.
3. **He uses the tips as a cheat sheet** while he types or speaks — e.g. “Find the real pain” under Problem, or “Let them say the value” under Need-Payoff — without scrolling or opening anything else.

There’s no clicking or typing in this panel; it’s a **read-only reference** that’s always visible so he can glance at it anytime during the session.

---

## Screen Breakdown

### Panel: Key Objectives (on SPIN Session page)

**Where it lives**: Sidebar of the SPIN coaching session screen (`/coach/spin/session`), in the same card slot as today. The rest of the page (chat, timer, Live Feedback, End Session) is unchanged.

**Purpose**: Give the consultant a constant, at-a-glance reminder of the four SPIN dimensions and one short coaching tip per dimension so they can stay oriented during practice.

**Key elements**

- **Panel title**: “Key Objectives” (unchanged) with the same icon/treatment as today.
- **Four rows**, in order **S → P → I → N**:
  - **S — Situation**  
    Tip: Confirm context quickly. Do your homework first — don’t ask what you should already know.
  - **P — Problem**  
    Tip: Find the real pain. Dig past the stated issue to what’s actually not working.
  - **I — Implication**  
    Tip: Explore the consequences. What happens if this doesn’t get solved?
  - **N — Need-Payoff**  
    Tip: Let them say the value. Ask what solving this would mean — don’t tell them.

**Visual hierarchy (what the user sees first)**

1. **SPIN letter (S, P, I, N)** — Most prominent. Use the app’s accent color (red-to-purple gradient) only; same size as body text so the acronym is easy to scan without clutter.
2. **Dimension name** — Bold (Situation, Problem, Implication, Need-Payoff) so each row is clearly labeled.
3. **Tip** — Smaller and muted (slightly faded compared to the rest of the text) so it supports the label without competing for attention.

**User actions**

- None. The panel is reference-only. The user reads it while conducting the session.

**Success state**: Marcus sees all four items in order, with clear hierarchy (letter → name → tip), in a card that matches the existing Key Objectives / Live Feedback card style.  
**Error state**: Not applicable (content is fixed; no loading or failure state for the tips themselves). If we ever show a loading state for this card, the spec recommends always showing these four SPIN items instead so the user always has the reference.

---

## Information Hierarchy

**Priority 1**: The four letters **S, P, I, N** — so the user can instantly see “these are my four SPIN goals.”  
**Priority 2**: The dimension names (Situation, Problem, Implication, Need-Payoff) — so they know what each letter stands for.  
**Priority 3**: The coaching tips — supporting detail they can read when they want a nudge on *how* to approach that dimension.

---

## Interaction Patterns

- **Static reference panel** — Like a sticky note or a sidebar cheat sheet (e.g. keyboard shortcuts in an app, or “Tips” in a doc). No expand/collapse or tabs; everything is visible at once.
- **Scan top-to-bottom** — Same order as SPIN: S then P then I then N. No reordering or filtering.

---

## Approved Design Decisions

**Decision 1: How should the SPIN letter stand out?**  
**Approved: Option A — Accent color only.** Use the app’s existing accent (red-to-purple) for the letters S, P, I, N. Same size as body text. Keeps the panel clean and on-brand.

**Decision 2: Should the panel ever show a loading state?**  
**Approved: Option A — Always show the four SPIN items.** No loading skeleton. As soon as the session page loads, the user sees S, P, I, N and tips. Static content only; no loading state needed.

---

## Accessibility Considerations

- **Keyboard navigation**: No interactive elements in the panel; keyboard users move focus to other parts of the page (chat, End Session, etc.). No change from current behavior.
- **Screen readers**: The four items should be in a logical order (S, P, I, N) and the relationship between letter, dimension name, and tip should be clear (e.g. “S — Situation” then the tip as a single block per item) so list and heading structure make sense when read aloud.
- **Mobile / small screens**: The panel stays where it is on the session page; any existing responsive behavior (stacking, collapsing, or scrolling of the sidebar) is unchanged. Text should remain readable (e.g. tip text not too small) on small screens.

---

## Brand Alignment

- **Visual**: Use the existing Key Objectives card styling (same padding, background, borders as the Live Feedback card). No new card style.
- **Color**: Use existing accent (red-to-purple gradient / theme tokens) for the SPIN letters to align with CLAUDE.md (plum, gradients, Lang Gothic).
- **Copy**: All tip text is specified in the spec; tone is consistent with “masterful, all-in, good-humored, vigilant” and practical coaching.

No new design system patterns are introduced; this is a content and hierarchy update within the current SPIN session layout.

---

## Things We’re NOT Designing

- The Live Feedback panel (unchanged).
- The chat area, timer, header, or End Session / scorecard link.
- Any other page or route (e.g. general coach session, setup, scorecard).
- How objectives are used elsewhere (e.g. scorecard logic); this is only the visible Key Objectives panel on the SPIN session page.

---

## Next Steps

1. ~~Review this design exploration.~~ ✓
2. ~~Decision 1: Option A (accent color only).~~ ✓
3. ~~Decision 2: Option A (always show, no loading).~~ ✓
4. Spec updated with approved design (see [SEI-30-spin-session-key-objectives-spin-tips.md](../features/SEI-30-spin-session-key-objectives-spin-tips.md)).
5. Run `/plan` to create the implementation plan, then implement per the spec.
