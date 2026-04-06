# Design Exploration: SPIN Scorecard Real API Integration

**Related spec**: [SEI-29-spin-scorecard-real-api.md](../features/SEI-29-spin-scorecard-real-api.md)  
**Linear**: [SEI-29](https://linear.app/issue/SEI-29/spin-scorecard-real-api-integration)  
**Created**: 2026-03-08

---

## User Journey

**Marcus** has just finished a SPIN practice session. He clicked "View scorecard" (or the session ended and he sees the option to view his results). Here's the experience we're designing for:

1. **Marcus lands on the scorecard page.** The app checks whether it has his session data (conversation and session type) in the browser.  
   - **If something is missing** (e.g. he opened an old link or cleared his browser): He sees a single, clear message: "No session data found. Please complete a session first." and one primary button: "Start a session" that takes him back to the SPIN coach setup. No form, no confusion — he knows exactly what to do.  
   - **If his data is there**: He immediately sees a short "Analysing your session…" state (like a progress indicator). The same green "Analysis Complete" badge appears but with a spinner so it's clear work is in progress. The area where his scores will go is visible but dimmed so he knows results are coming.

2. **When analysis finishes successfully**, the loading state is replaced by his real scorecard: a headline (one sentence from the AI summarizing his session), the title "Your Sales Performance Scorecard," four score cards (Situation, Problem, Implication, Need-Payoff), each with a big percentage and the AI commentary always visible below it (no expand/collapse). The overall score appears below the four cards. Key Strengths and Growth Areas sections stay in the layout and are filled from the API when present. At the bottom he can "Practice Again" (back to SPIN setup) or "Return to Home."

3. **If the scoring service fails** (e.g. network issue or server error): He sees a clear message like "Scoring failed. Please try again." and an option to "Start a session" or retry, so he's never stuck on a blank or broken screen.

**If he never had a session:** He might open the scorecard URL directly. He gets the same "No session data found" experience and "Start a session" — no email step, no fake scores.

---

## Screen Breakdown

### Screen: No Session Data

**Purpose**: Tell the user they don't have anything to score and give them one clear next step.

**Key elements**
- **Message**: "No session data found. Please complete a session first." — Exact wording from the spec so it's consistent and support-friendly.
- **Primary action**: "Start a session" button that links to `/coach/spin` (SPIN setup). One button, one path — like a "Get started" empty state in Notion or Trello.
- **Back / navigation**: Optional "Back to Home" or "Back to Coach" link so they can leave without starting a session if they prefer.

**User actions**
- Click "Start a session" to go to SPIN setup.
- Optionally use Back/Home to leave.

**Success state**: User understands why they see this and knows how to get a scorecard (do a session first).  
**Error state**: N/A — this screen *is* the graceful handling for missing data.

---

### Screen: Analysing Your Session (Loading)

**Purpose**: Reassure the user that their session is being scored and results are on the way.

**Key elements**
- **Badge**: Keep the green "Analysis Complete" badge but show a spinner inside or next to it so it reads as "in progress" (like a loading state on a bank app or Duolingo result screen).
- **Subheading**: "Analysing your session…" — Short, present tense, no technical jargon.
- **Score card area**: The same four card slots (Situation, Problem, Implication, Need-Payoff) and overall score area are visible but dimmed or with a subtle placeholder (e.g. dashed border or grayed-out percentage). This sets expectation: "your scores will appear here" rather than a blank space.

**User actions**
- Wait; no actions required. If they navigate away, they can come back and reload (no special handling in MVP).

**Success state**: After a few seconds, this is replaced by the real scorecard.  
**Error state**: If the request fails, this is replaced by the "Scoring failed" screen (see below).

---

### Screen: Your Sales Performance Scorecard (Results)

**Purpose**: Show the user their SPIN scores and a one-sentence takeaway so they can see strengths and areas to improve.

**Key elements**
- **Title**: "Your Sales Performance Scorecard" — Kept as-is so the screen stays recognizable.
- **Headline**: One sentence from the scoring service (e.g. "You did a strong job uncovering the prospect's situation and problem; focus next on implication and need-payoff."). This replaces the current dummy line ("Excellent work! You demonstrated…"). It's the first thing they read after the title — like the summary line on a fitness or learning app result.
- **Four score cards**: Situation, Problem, Implication, Need-Payoff. Each card shows:
  - The dimension name (e.g. "Situation").
  - A large percentage (score out of 5 converted to %, e.g. 80%).
  - Commentary: 2–3 sentences from the AI, always visible below the percentage (no expand/collapse).
- **Overall score**: One prominent number (e.g. 75%) placed **below the four cards** so the SPIN breakdown is the focus.
- **Key Strengths** and **Growth Areas**: Keep the existing scorecard sections; populate from the API response when present (same layout as current dummy design).
- **Actions**: "Practice Again" (primary, to SPIN setup), "Return to Home," and optionally "Download PDF" (can stay as placeholder for later).

**User actions**
- Read headline, scores, and commentary (all visible).
- Click "Practice Again" or "Return to Home."

**Success state**: User sees their real scores and can read the commentary; they understand what they did well and what to work on.  
**Error state**: N/A on this screen; errors are handled by the "Scoring failed" screen.

---

### Screen: Scoring Failed (API Error)

**Purpose**: When the scoring request fails, explain what happened and offer a way forward.

**Key elements**
- **Message**: Short, friendly, non-technical — e.g. "Scoring failed. Please try again." So they know it's a temporary problem, not their fault.
- **Actions**: "Start a session" (so they can run another practice and try again) and/or a "Try again" button that reloads/retries the scorecard request. At least one path back to the coach or retry.

**User actions**
- Click "Start a session" or "Try again."

**Success state**: User doesn't feel stuck; they can retry or start a new session.  
**Error state**: If retry also fails, same message and actions — we don't need a different "still failed" screen for MVP.

---

## Information Hierarchy

1. **First**: Whether they have results or not — No data vs. Loading vs. Scorecard vs. Error. The screen title and one main message make this obvious.
2. **Second** (on success): The one-sentence headline — the takeaway before they dig into numbers.
3. **Third**: The four SPIN dimensions — each card shows percentage and commentary (always visible below the percentage).
4. **Fourth**: Overall score — below the four cards as the summary.
5. **Fifth**: Key Strengths and Growth Areas — existing sections, populated from the API.
6. **Last**: Actions — Practice Again, Return to Home (and optional PDF).

---

## Animation & transition

When the real scorecard results load, **preserve all existing entrance and transition animations** from the current scorecard implementation. Do not remove or simplify them.

- **Loading → results**: The transition from "Analysing your session…" to the results view must use the same animation patterns already in place (e.g. AnimatePresence, motion wrappers) so the handoff feels smooth.
- **"ANALYSIS COMPLETE" badge**: Keep the existing entrance animation (e.g. fade + scale in) when the results state appears.
- **Score cards**: Each of the four SPIN cards (and the overall score block) must animate in with the same fade/slide pattern used today (e.g. fade in and slide up), with staggered delay so they appear one after the other.
- **Percentage scores**: The percentage values (on each card and for the overall score) must **count up from 0 to their final value** when the results appear, rather than jumping to the number. This keeps the result feel satisfying and consistent with a polished results screen.

---

## Interaction Patterns

- **Single-purpose screens**: Each state (no data, loading, results, error) is a clear, full-screen state — like a receipt or result screen in an e-commerce or learning app. No tabs or steps on the scorecard page itself.
- **One primary action per state**: No data → "Start a session"; Error → "Start a session" or "Try again"; Results → "Practice Again." Reduces decision fatigue.
- **Commentary always visible**: The 2–3 sentence commentary appears directly below the percentage on each SPIN card (Option C). No expand/collapse; everyone sees the feedback without interaction.
- **No email gate**: User goes straight from "View scorecard" to loading then results (or error). No email collection step; keeps the flow fast and focused.

---

## Design Decisions (Approved)

### Commentary for each SPIN dimension

**Chosen: Option C — Always visible below the percentage.**  
The 2–3 sentence commentary is shown directly under the score on each card. No tooltip, no expand/collapse. Keeps the experience simple and ensures everyone sees the feedback without any interaction.

### Overall score placement

**Chosen: Below the four cards.**  
The overall score appears after the four SPIN dimension cards so the breakdown is the focus; the overall number is the summary.

### Strengths and Growth Areas

**Chosen: Keep them in.**  
The existing scorecard layout includes Key Strengths and Growth Areas sections. Do not remove them; populate them from the API response when the scoring service returns `strengths` and `growth_areas`.

---

## Accessibility Considerations

- **Keyboard navigation**: All buttons and links ("Start a session," "Practice Again," "Return to Home," "Try again," and any "See feedback" / expand controls) must be focusable and activatable with Enter/Space. Loading state should be announced (e.g. live region: "Analysing your session").
- **Screen readers**: Page title and main heading should reflect the state (e.g. "Your Sales Performance Scorecard" when results are shown; "No session data" when that's the case). Score cards should have clear labels (e.g. "Situation: 80%"); commentary is always in the page so it's naturally read in order.
- **Mobile**: Single column for score cards on small screens; "Start a session" and "Practice Again" full-width or large tap targets. Commentary is always visible so no extra tap needed.

---

## Brand Alignment

- **Visual**: Same dark plum backgrounds, red-to-purple gradients, and Lang Gothic typography as the rest of the app. Reuse the existing "glass card" style for score cards and the green "Analysis Complete" badge (with spinner during loading).
- **Voice**: Headline and commentary come from the scoring service; keep any fixed copy (e.g. "No session data found," "Analysing your session…") consistent with the brand — clear, direct, no fluff. "Start a session" and "Practice Again" match the action-oriented, accountable tone.
- **Patterns**: One primary action per screen and clear error recovery match the existing SPIN setup and session flows. No new global patterns required; this stays within the scorecard-and-results pattern.

---

## Things We're NOT Designing

- **Email collection or PDF download**: The current email step is removed for this feature; PDF is out of scope (button can remain as placeholder).
- **Session page UI**: The only change on the session page is that the conversation is saved in the background when the user goes to the scorecard. No new screens or visible controls.
- **General coach flow**: Anything under `/coach/` that isn't the SPIN scorecard or SPIN session is unchanged.

---

## Next Steps

1. Spec and plan updated to match: commentary always visible (Option C), overall score below the four cards, Strengths and Growth Areas kept and populated from the API.
2. Run /implement when ready to build.
