---
linear: https://linear.app/sei-interview-app/issue/SEI-26/admin-prompt-control-tab
ticket: SEI-26
---

# Feature Specification: Admin Prompt Control Tab

**Feature Branch**: `SEI-26-admin-prompt-control-tab`
**Created**: 2026-03-07
**Status**: Draft
**Linear Ticket**: [SEI-26](https://linear.app/sei-interview-app/issue/SEI-26/admin-prompt-control-tab)
**Input**: Add a third "Prompt Control" tab to /admin that displays and edits existing agents only (no creation). List/dropdown selector, editable fields, Save Changes. If no agents exist, show "No agents configured. Agents are added by a developer." One seeded default agent so the tab has something to display after setup.

## User Scenarios & Testing (mandatory)

### User Story 1 - Prompt Control tab appears and lists agents (Priority: P1)
As an admin, I open /admin and see a third tab "Prompt Control" next to Knowledge Base and Test Console. When I click it, the tab content shows a list or dropdown of agents (status = active or draft). If at least one agent exists (e.g. the seeded default), I can select one and see its details.
**Why this priority**: Core entry point; without the tab and agent list, nothing else works.
**Independent Test**: Open /admin, confirm three tabs; click Prompt Control, confirm agent selector and that selecting an agent loads name, status, prompt, document tags into the form.
**Acceptance Scenarios**:
1. **Given** I am on /admin, **When** I look at the tab bar, **Then** I see "Knowledge Base", "Test Console", and "Prompt Control" with the same styling as existing tabs.
2. **Given** I click "Prompt Control", **When** the tab content loads, **Then** I see an agent list or dropdown populated with agents where status is 'active' or 'draft' (and the seeded "SPIN Sales Coach" if present).
3. **Given** I select an agent from the list/dropdown, **When** the selection is made, **Then** the form shows that agent's name, status, prompt, and document tags (comma-separated in the text field).
4. **Given** no agents exist (status 'active' or 'draft'), **When** I open the Prompt Control tab, **Then** I see the message "No agents configured. Agents are added by a developer." and no agent selector or edit form. There is no button or link to create an agent.

### User Story 2 - Edit and save an agent (Priority: P1)
As an admin, I select an agent, edit the name, status, prompt, or document tags (comma-separated), and click "Save Changes". The record in the agents table is updated and I see a success indication; the form continues to show the updated values.
**Why this priority**: Primary value of the tab is editing prompts and metadata.
**Independent Test**: Select the seeded agent, change name or prompt, click Save Changes; confirm the record in Supabase is updated and the UI reflects it (and optionally shows a success message).
**Acceptance Scenarios**:
1. **Given** an agent is selected and I change the name (editable text field), **When** I click "Save Changes", **Then** the agents table row is updated and the UI shows the new name (and a success indicator if specified).
2. **Given** an agent is selected and I change the status dropdown to "active" or "draft", **When** I click "Save Changes", **Then** the agents table status column is updated.
3. **Given** an agent is selected and I edit the prompt (large textarea) or document tags (comma-separated text field), **When** I click "Save Changes", **Then** the agents table prompt and document_tags are updated (document_tags stored as text[]; empty or invalid tag input handled per validation rules).

### User Story 3 - Seeded default agent (Priority: P2)
As an admin or developer, after running the seed (or migration that inserts the default agent), the Prompt Control tab has at least one agent to display: "SPIN Sales Coach" with status "draft", the specified prompt text, and document_tags ["spin_framework", "client_persona", "sei_positioning"]. This allows the UI to be usable out of the box.
**Why this priority**: Ensures the tab is not empty on first load; supports demos and development.
**Independent Test**: Run seed or apply migration that inserts the default agent; open Prompt Control, confirm the agent appears and displays the correct name, status, prompt, and tags.
**Acceptance Scenarios**:
1. **Given** the default agent seed has been run, **When** I open Prompt Control and load agents, **Then** "SPIN Sales Coach" appears in the list/dropdown with status "draft".
2. **Given** I select "SPIN Sales Coach", **When** the form loads, **Then** the prompt textarea shows the specified system prompt and the document tags field shows "spin_framework, client_persona, sei_positioning" (or equivalent comma-separated display).
3. **Given** the seed is idempotent (e.g. insert only if no row with name "SPIN Sales Coach" exists), **When** the seed runs twice, **Then** no duplicate row is created.

### Edge Cases
- **No agents**: If no rows have status 'active' or 'draft', do not show the agent selector or edit form. Show a single message: "No agents configured. Agents are added by a developer." There is no creation flow in the UI.
- **Document tags parsing**: Comma-separated input must be trimmed and split into a text[]; empty strings after trim should not be stored. Validation: allow empty array or array of non-empty strings.
- **Concurrent edit**: Two tabs editing the same agent — last write wins; no optimistic locking in scope unless specified. Optional: show "Saved at [time]" to reduce confusion.
- **API errors**: If list or save fails (network, Supabase error), show a clear error message and leave the form state unchanged so the user can retry.
- **Long prompt**: Large textarea should be scrollable; no max length for prompt or document_tags.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The /admin page MUST have a third tab with label "Prompt Control" and the same tab styling as "Knowledge Base" and "Test Console". Tab state MUST be syncable via URL (e.g. `?tab=prompt` or `?tab=prompts`) so the Prompt Control tab is linkable and survives refresh.
- **FR-002**: The Prompt Control tab MUST load agents from the Supabase `agents` table where `status IN ('active', 'draft')`. Results MUST be displayed in a simple list or dropdown selector. Selecting an agent MUST populate the form with that agent's name, status, prompt, and document_tags (document_tags displayed as comma-separated text).
- **FR-003**: The form MUST display: (1) Agent name — editable text field; (2) Status — dropdown with two options only: **draft** and **active** (draft = off, active = on; no "archived" in the UI to keep things simple); (3) Prompt — large textarea for the full system prompt; (4) Document tags — editable comma-separated text field (stored as text[] in DB). All fields MUST be editable when an agent is selected. There is no "new agent" mode; the tab only displays and edits existing agents. Save Changes button MUST be placed at the bottom of the form.
- **FR-004**: One button MUST be present: "Save Changes" (updates the selected existing record in the agents table). There MUST be no "+ New Agent" button or any creation flow. Save MUST validate that name is present when saving (do not allow saving with a blank name). No max length applies to prompt or document_tags.
- **FR-005**: A seed (or migration) MUST insert one default agent row with: name = "SPIN Sales Coach", status = "draft", prompt = the specified system prompt text (skeptical VP of Supply Chain, SPIN techniques, push back on weak questions, reward implication and need-payoff), document_tags = ["spin_framework", "client_persona", "sei_positioning"]. Seed MUST be idempotent (no duplicate default agent if run twice).
- **FR-006**: Knowledge Base and Test Console tabs, their components, and existing /admin layout and styling MUST NOT be modified. Nothing under app/coach/ (existing or spin) MUST be changed. The new tab MUST match the existing tab bar styling exactly (e.g. same classes for active/inactive tabs).

### Key Entities
- **agents** (existing Supabase table): agent_id (uuid), name (text), prompt (text), document_tags (text[]), status (text; DB may allow active | draft | archived per migration; UI exposes only **draft** and **active**), created_at (timestamptz). This feature reads and updates agents; no schema change required. For now only one agent (SPIN Sales Coach) is expected; the UI still supports a selector for future agents.

### Non-Functional Requirements
- **NFR-001**: Data access MUST go through an API route or server action (no direct Supabase client in the admin page component for write operations; reads may be server-side or via API). Align with project's module boundaries (Pages → API or lib; API → lib).
- **NFR-002**: UI MUST use existing admin styling (Tailwind, plum tokens, same tab bar look and feel) so the new tab is visually consistent.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 acceptance scenarios pass: Prompt Control tab visible and selectable; agent list/dropdown loads active and draft agents; selecting an agent populates the form; Save Changes updates the record.
- **SC-002**: P2 scenario passes: seeded default agent appears with correct name, status, prompt, and document_tags; seed is idempotent. No creation flow exists in the UI.
- **SC-003**: No modifications to Knowledge Base tab, Test Console tab, or any file under app/coach/. Only additions: new tab entry, new tab content component, API route(s) for list and update agent (no create), and seed/migration for default agent.
- **SC-004**: `npm run lint` and `npm run build` pass (or existing project lint/build state unchanged). New code follows Directory Contract (e.g. API routes in app/api/, components in components/).

## Out of Scope
- Creating new agents in the UI (agents are added by a developer; Prompt Control is view/edit only).
- Wiring the SPIN coach (or any coach) to use the prompt and document_tags from the agents table; this feature is admin edit-only for existing agents.
- Modifying Knowledge Base or Test Console behavior or UI.
- Changing any coach flow under /coach/ or /coach/spin/.
- Optimistic locking or real-time sync of agents.
- Role-based access control for who can use Prompt Control (assume existing /admin access control applies).

## Implementation Notes
- **Tab id**: Use a new AdminTab value (e.g. `'prompt'`) and add one entry to the TABS array in app/admin/page.tsx; add conditional render for the new tab content (e.g. `activeTab === 'prompt' && <PromptControlTab />`). Use the same tab bar markup and class names as existing tabs.
- **Data flow**: API routes `GET /api/admin/agents` (list active/draft) and `PATCH /api/admin/agents/[id]` (update only; no POST for create). Alternatively use server actions. No create endpoint required.
- **Document tags**: On load, format `document_tags` array as comma-separated string (e.g. `tags.join(', ')`). On save, parse input: split on comma, trim, filter empty, store as text[].
- **Seed**: Add to existing Prisma seed script or a Supabase migration that runs `INSERT INTO agents (name, status, prompt, document_tags) VALUES (...)` with `ON CONFLICT` or `WHERE NOT EXISTS` for idempotency, or run seed once and document that it should be run after migration.
- **Default prompt text**: Use the exact prompt string from the user description in the spec (skeptical VP of Supply Chain, SPIN techniques, etc.) in the seed.
