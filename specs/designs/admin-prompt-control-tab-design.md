# Design Exploration: Admin Prompt Control Tab (SEI-26)

**Related spec**: [SEI-26-admin-prompt-control-tab.md](../features/SEI-26-admin-prompt-control-tab.md)  
**Linear**: [SEI-26](https://linear.app/issue/SEI-26/admin-prompt-control-tab)  
**Created**: 2026-03-07

---

## User Journey

**Jordan** is a CARRY1 admin who manages how the sales coach agents behave. They need to edit system prompts and metadata (like which document tags an agent uses) without touching code or the database directly.

1. **Jordan goes to the admin area** (e.g. from "Back to app" they already use for Knowledge Base or Test Console). They see the same tab bar with three options: Knowledge Base, Test Console, and **Prompt Control**.
2. **They click "Prompt Control"**. The URL updates (e.g. `?tab=prompt`) so they can bookmark or share the tab. The main content area shows the Prompt Control screen.
3. **They see a list or dropdown of agents** (only "active" or "draft" agents). If the default seed has been run, "SPIN Sales Coach" appears. They click or select it.
4. **The form fills with that agent’s details**: name, status (draft or active only — draft = off, active = on; no "archived"), a large prompt box with the full system prompt, and a single line for document tags (comma-separated, e.g. `spin_framework, client_persona, sei_positioning`).
5. **They edit what they need** — e.g. tweak the prompt text or add a tag — and click **"Save Changes"**. They get a clear success message (or the form just reflects the saved state). If they clear the name and try to save, they see "Name is required" and the save is blocked.

**If there are no agents:** The tab does not show the selector or form. They see a single message: **"No agents configured. Agents are added by a developer."** There is no way to create an agent in the UI; agents are added by a developer (e.g. via seed or database).

**If something goes wrong:** A save or load failure shows a clear error message (e.g. "Could not save. Please try again."). The form stays as-is so they can fix and retry.

---

## Screen Breakdown

### Screen: Prompt Control tab content (inside /admin)

**Purpose**: Choose an existing agent, then view and edit its name, status, system prompt, and document tags. Save updates the database; the UI stays in sync. No creation of agents in the UI — agents are added by a developer.

**Key elements**

- **Empty state (no agents)**: If there are no agents with status "active" or "draft", do not show the selector or form. Show a single message: **"No agents configured. Agents are added by a developer."** Same visual language as the rest of admin (e.g. plum borders, off-white background). No button or link to create an agent.
- **Agent selector**: When at least one agent exists, a list or dropdown at the top shows all agents with status "active" or "draft". Choosing an item loads that agent into the form.
- **Name field**: A single-line text box. Required when saving (user cannot save with a blank name). Label: e.g. "Agent name".
- **Status dropdown**: A dropdown with two options only: **draft** (off) and **active** (on). No "archived" — keep it simple; for now there is only one agent (SPIN Sales Coach).
- **Prompt (system prompt)**: A large, scrollable text area. No character limit. Label: e.g. "System prompt".
- **Document tags**: A single-line text field where tags are entered **comma-separated** (e.g. `spin_framework, client_persona, sei_positioning`). Label: e.g. "Document tags (comma-separated)". Stored as a list in the database; displayed and edited as one string.
- **Save Changes button**: Primary (and only) action. Placed at the **bottom of the form**. Saves the current form to the database (updates the selected existing agent only). After a successful save, show a short success message (e.g. "Saved" or "Saved at 3:45 PM"). If validation fails (e.g. name blank), show "Name is required" near the name field and do not save.

**User actions**

- Select an agent from the list/dropdown → form loads that agent.
- Edit name, status, prompt, or document tags.
- Click "Save Changes" → validate (name required), then update the agent and show success or error.

**Success state**

- List/dropdown shows the right agents; selection loads the form; Save updates the record and shows success.

**Error state**

- **Validation**: "Name is required" when saving with a blank name; focus or highlight the name field.
- **Network/API**: A clear message like "Could not save. Please try again." or "Could not load agents." Leave the form unchanged so the user can retry.

---

## Information Hierarchy

1. **Primary**: Which agent I’m editing (selector) and the Save Changes action.
2. **Secondary**: The four fields — name, status, prompt, document tags — in a logical order: identity (name, status) first, then the big prompt, then tags.
3. **Tertiary**: Success or error message after save; optional "Saved at [time]" for clarity.

---

## Interaction Patterns

- **Master–detail**: Choose an item from the list, then edit in the form — similar to Gmail (select a conversation, see content) or Notion (select a page, edit content). No separate "list view" and "edit view"; one screen with selector + form.
- **Inline editing**: All fields are editable in place. No "Edit" mode toggle; clicking Save persists. Like editing a Google Doc or a form in Airtable.
- **View/edit only**: No creation. If no agents exist, the user sees the empty-state message only. Name is required when saving (cannot save with blank name). No max length on prompt or tags; the prompt area scrolls if the text is long.
- **Comma-separated tags**: One text field, user types tags separated by commas (e.g. `tag1, tag2, tag3`). Same idea as "tags" or "categories" in many admin UIs (e.g. WordPress, blog editors).

---

## Design Decisions to Make

**Decision 1: Agent selector — list vs dropdown**

- **Option A: Dropdown (select menu)**  
  - Pro: Compact; works well when there are many agents.  
  - Con: You don’t see all names at once; one extra click to open.

- **Option B: Vertical list (e.g. clickable rows or cards)**  
  - Pro: All agents visible at once; quick to scan and switch.  
  - Con: Uses more vertical space; can feel long with many agents.

**Recommendation**: Start with a **dropdown**. With one or a few agents (e.g. SPIN Sales Coach plus maybe one or two more), a dropdown is simple and matches "pick one" mental model. If you later have many agents, you can add search or switch to a list without changing the rest of the screen.

---

**Decision 2: Where to put "Save Changes"**

- **Option A: Top right (above or next to the form)**  
  - Pro: Always visible without scrolling.  
  - Con: Can be easy to hit Save by mistake.

- **Option B: Bottom of the form**  
  - Pro: Natural "finish editing then save" flow; similar to many settings pages.  
  - Con: With a long prompt, user has to scroll to reach it.

**Recommendation**: **Option B — Save Changes at the bottom of the form.** Matches "edit then save" flow. Make the prompt area scrollable so the button is reachable. **Decided**: Bottom of form.

---

## Accessibility Considerations

- **Keyboard**: Tab through selector, name, status, prompt, tags, then Save. Enter on Save submits the form; focus management after save (e.g. stay on Save or move to a success message) so keyboard users get feedback.
- **Screen readers**: Label every field (agent selector, name, status, prompt, document tags). Announce success or error after save (e.g. live region: "Saved" or "Name is required").
- **Mobile**: Admin is often used on desktop; if used on small screens, stack the form vertically, keep the dropdown and buttons large enough to tap, and ensure the prompt area scrolls.

---

## Brand Alignment

- **Visual**: Use the same admin look as Knowledge Base and Test Console — light background (e.g. off-white/cream), plum accents for borders and buttons, same typography and spacing. Prompt Control is one more tab; it should feel like the same product.
- **Voice**: Labels and messages can be short and direct (e.g. "Agent name", "System prompt", "Saved"). No need for marketing copy here; clarity and consistency matter most.
- **Consistency**: Same tab bar styling (active = plum-dark background, white text; inactive = plum/60, hover states). Form fields and buttons use the same patterns as other admin tabs (e.g. rounded corners, plum border, primary button style for Save).

No new constitution update is suggested; this stays within existing admin and brand guidelines.

---

## Things We're NOT Designing

- **Creating new agents** — Agents are added by a developer (e.g. seed or database). Prompt Control is display and edit only.
- How the SPIN coach (or any coach) uses the prompt and document_tags from the database — that’s a later feature.
- Changes to the Knowledge Base or Test Console tabs.
- Any flow or UI under /coach/ or /coach/spin/.
- Role-based access or permissions for who can use Prompt Control (assume whoever can open /admin can use this tab).
- Optimistic locking or real-time sync; one save = one update, last write wins.

---

## Next Steps

1. Review this design exploration.
2. Remaining design choice: agent selector — dropdown (recommended) vs list. Save at bottom and two statuses (draft | active) are decided.
3. Run /plan for ticket 26 to create the implementation plan, then implement.
