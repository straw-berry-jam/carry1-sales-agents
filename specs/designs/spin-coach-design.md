# Design Exploration: SPIN Selling Coach Experience

**Related spec**: [SEI-25-spin-coach-scaffold.md](../features/SEI-25-spin-coach-scaffold.md)  
**Linear**: [SEI-25](https://linear.app/sei-interview-app/issue/SEI-25/spin-selling-coach-scaffold)  
**Created**: 2026-03-07

---

## User Journey

**Marcus** is an SEI consultant who wants to practice a sales conversation using the SPIN (Situation, Problem, Implication, Need-payoff) methodology. Here’s the experience we’re designing for:

1. **Marcus goes to the SPIN coach** (e.g. via a link like “Try SPIN” or from the home page once the CTA is updated). He lands on the **session setup** screen.
2. **On the setup screen** he chooses his role, company, scenario type (e.g. Discovery Call), how long he wants to practice (Quick / Standard / Deep), and any deal context. The screen feels focused on “getting ready for a SPIN practice,” not generic sales. He taps **Start session** (or similar).
3. **During the session** he’s in a **coaching session** screen: he can chat by typing or use voice. The coach responds as a SPIN-oriented coach (once wired). A timer shows how much time is left. When time is up or he ends the demo, the session stops cleanly.
4. **After the session** he’s taken to a **scorecard** screen. He can optionally enter his email to receive the scorecard. The scorecard is framed around SPIN (e.g. how well he used Situation, Problem, Implication, Need-payoff questions) once that logic is built. For now, the screen is the same layout as the existing scorecard, just on the SPIN route.

**If he wants to leave mid-flow:**  
From setup or scorecard he can use a “Back” or “Home” link. From the session screen, ending the demo or letting the timer run out takes him to the scorecard. We don’t lock him in; the flow is linear but easy to exit.

---

## Screen Breakdown

### Screen 1: SPIN Session Setup  
**Route**: `/coach/spin`  
**Purpose**: Consultant configures one SPIN practice run (role, company, scenario, duration, deal context) and starts the session.

**Key elements**  
- **Title / header**: Makes it clear this is “SPIN” practice (e.g. “SPIN Sales Coach” or “Practice with SPIN”), not the general sales coach. Same visual style as the rest of the app (dark plum, gradients, Lang Gothic).  
- **Onboarding form**: Role, company, scenario type, duration, deal context — same *kinds* of fields as the existing setup so the flow is familiar. Labels and any helper text can later be tuned for SPIN (e.g. “Choose a scenario for your SPIN practice”).  
- **Start session** button: One clear primary action. Clicking it sends the user to the coaching session screen with their choices saved.  
- **Back / Home** link: Lets them leave without starting. Goes back to home or a clear “exit” destination.

**User actions**  
- Fill in (or select) role, company, scenario, duration, deal context.  
- Click “Start session” to go to the session screen.  
- Click “Back” or “Home” to leave.

**Success state**: Form accepted; user lands on the session screen with their choices applied.  
**Error state**: If something fails (e.g. network), show a short, friendly message and keep them on the setup screen so they can try again or go back.

---

### Screen 2: SPIN Coaching Session  
**Route**: `/coach/spin/session`  
**Purpose**: Consultant practices the conversation with the SPIN coach via text and/or voice; session has a clear end (timer or “End demo”).

**Key elements**  
- **Session header**: Shows it’s a SPIN session (e.g. “SPIN practice”) and optionally scenario/duration so they know the context.  
- **Chat area**: Messages from consultant and coach; same look and behavior as the existing coach (scroll, bubbles, etc.).  
- **Input**: Text box and send; optional voice controls (mic on/off, “Coach is speaking…”) when voice is wired — same patterns as existing coach.  
- **Timer**: Time remaining (e.g. 15 / 30 / 60 min based on duration).  
- **End demo** (or similar): Explicit way to end early. When time runs out or they end demo, they’re taken to the scorecard.

**User actions**  
- Type and send messages; optionally use voice.  
- Watch coach replies and timer.  
- End the demo early or wait for the timer.

**Success state**: Session runs smoothly; when it ends, user is sent to the scorecard with session data available for scorecard generation (when built).  
**Error state**: If the coach or voice fails, show a simple error and, if possible, an option to “End session” so they can still get to the scorecard.

---

### Screen 3: SPIN Scorecard  
**Route**: `/coach/spin/scorecard`  
**Purpose**: Show results and performance feedback for the SPIN session; optionally collect email to send the scorecard.

**Key elements**  
- **Title**: e.g. “Your SPIN Practice Scorecard” so it’s clearly tied to the SPIN run.  
- **Scorecard content area**: Where the generated feedback will go (SPIN-focused once logic exists). For the scaffold, same layout as the existing scorecard page.  
- **Email (optional)**: Field and “Send scorecard” (or “Generate scorecard”) so they can receive a copy — same pattern as existing.  
- **Back to practice / Home**: Link to start another SPIN session or go home. No need to link to the general coach unless we later add “Try general coach” as a second CTA.

**User actions**  
- Read the scorecard.  
- Optionally enter email and request delivery.  
- Navigate back to SPIN setup or home.

**Success state**: Scorecard is shown; if they enter email, they get a confirmation that it was sent.  
**Error state**: If generation or email fails, show a short message and keep them on the page so they can try again or leave.

---

## Information Hierarchy

**On every screen**  
1. **Primary identity**: “This is the SPIN coach” (header or title) so it’s never confused with the general sales coach.  
2. **Primary action**: One main button (Start session, Send message / use voice, Get scorecard / enter email).  
3. **Exit**: Back or Home so they’re never stuck.

**Setup**: Choices (role, company, scenario, duration, context) first; Start session is the single next step.  
**Session**: Conversation and timer are central; End demo is visible but secondary until they want to stop.  
**Scorecard**: The feedback is the focus; email and “practice again” are secondary.

---

## Interaction Patterns

- **Linear flow**: Setup → Session → Scorecard, like a short wizard (similar to “book a demo” flows). No branching; optional exit via Back/Home.  
- **Session screen**: Same interaction model as the existing coach — chat plus optional voice (like a messaging app with a call option).  
- **Timer**: Countdown in the session; when it hits zero, auto-transition to scorecard (like a timed quiz or exercise).  
- **Scorecard**: Read-only result plus one optional action (email); “Practice again” is a clear next step (like “Run again” after a fitness workout summary).

---

## Design Decisions to Make

**Decision 1: How do we label “SPIN” so it’s obvious this isn’t the general coach?**

- **Option A**: “SPIN Sales Coach” (or “SPIN Coach”) in the page title and header only.  
  - Pro: Simple, one line of copy.  
  - Con: Users who don’t know SPIN might not know what to expect.

- **Option B**: Short line under the title, e.g. “Practice discovery using Situation, Problem, Implication, Need-payoff.”  
  - Pro: Clarifies the methodology.  
  - Con: Slightly more copy; might feel heavy on mobile.

**Recommendation**: Start with Option A (clear “SPIN” in title/header). Add a one-line explanation (Option B) later if users are confused or if you want to teach SPIN in-product.

---

**Decision 2: After the scorecard, where does “Practice again” go?**

- **Option A**: Back to SPIN setup only (`/coach/spin`).  
  - Pro: Keeps the flow simple; one coach type per flow.  
  - Con: No direct path to the general coach from here.

- **Option B**: Two links — “Another SPIN practice” and “Try general sales coach.”  
  - Pro: Surfaces both products.  
  - Con: More choices; might be unnecessary until both are promoted equally.

**Recommendation**: Option A for now. Add “Try general coach” when you have two entry points (e.g. home page or a coach picker) and want to cross-promote.

---

**Decision 3: Should setup look identical to the existing coach or slightly different?**

- **Option A**: Same layout and field order as the existing setup; only copy/titles say “SPIN.”  
  - Pro: Fast to build from the scaffold; consistent with existing app.  
  - Con: No visual differentiation.

- **Option B**: Same fields but different layout or a small “SPIN” visual cue (e.g. badge or accent).  
  - Pro: Feels like a distinct product.  
  - Con: More design and implementation work.

**Recommendation**: Option A for the scaffold and first release. Reuse the same layout and styling; differentiate with title and copy. Consider Option B when you add SPIN-specific fields or a dedicated landing for SPIN.

---

## Accessibility Considerations

- **Keyboard navigation**: All buttons and links (Start session, End demo, Send, Back, email submit) reachable and activatable by keyboard; focus order follows the flow (setup fields → Start → session input → End → scorecard actions).  
- **Screen readers**: Headings and labels clearly identify each screen (“SPIN session setup,” “SPIN practice,” “SPIN scorecard”); live region for new messages in the session so chat updates are announced.  
- **Mobile**: Same layout as existing coach: stacked layout on small screens, tap-friendly buttons, timer and End demo visible without scrolling when possible.

---

## Brand Alignment

- **Visual**: Dark plum backgrounds, red-to-purple gradients, Lang Gothic — same as the rest of the app. No new palette for SPIN; “SPIN” is expressed through copy and context, not a different look.  
- **Voice**: Masterful, all-in, good-humored, vigilant — same as constitution. SPIN-specific copy (when added) should still feel like the same brand, e.g. “Nail your discovery with SPIN” rather than a different tone.  
- **Consistency**: The three screens follow the same patterns as the existing coach (setup form, chat session, scorecard + email). This keeps the product coherent and reduces learning curve.

**Suggested constitution update**: None for this phase. If we later add a “coach picker” or multiple entry points, consider adding a short “Multi-coach flows” note to the constitution (e.g. “SPIN and general coach are separate flows; shared layout and components; differentiate by title and copy”).

---

## Things We’re NOT Designing (This Phase)

- **Scaffold (SEI-25)**: The current ticket only adds the three pages (copied from existing coach) and the agents table migration. No new layout or SPIN-specific copy in this ticket.  
- **Home page CTA**: Not in scope; when added, the CTA will point to `/coach/spin` (hardcoded).  
- **SPIN logic**: No scoring, prompts, or methodology logic yet; the session and scorecard don’t “know” SPIN until later work.  
- **Voice / RAG / knowledge base**: No wiring to ElevenLabs or the knowledge base for SPIN in this design or scaffold.  
- **Choosing between coaches**: No “Pick SPIN vs general” screen; entry is via a direct link to SPIN (or home CTA later).

---

## Next Steps

1. Review this design exploration.  
2. Decide on the three design decisions (SPIN labeling, “Practice again” destination, setup look).  
3. I’ll update the spec with any approved design choices (e.g. in Implementation Notes or a “Design” subsection).  
4. Proceed with the scaffold (SEI-25) as specified; use this document to guide future SPIN-specific UI and copy when you add logic and scoring.
