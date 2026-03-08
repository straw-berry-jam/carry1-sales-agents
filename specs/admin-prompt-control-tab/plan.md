# Implementation Plan: Admin Prompt Control Tab (SEI-26)

**Branch**: `SEI-26-admin-prompt-control-tab`  
**Spec**: [SEI-26-admin-prompt-control-tab.md](../features/SEI-26-admin-prompt-control-tab.md)  
**Exploration**: Not yet run  
**Design**: [admin-prompt-control-tab-design.md](../designs/admin-prompt-control-tab-design.md)  
**Estimated Timeline**: 1–2 days — One new API surface (list + update agents), one tab component rework, one seed. Tab shell already exists; no changes to other admin tabs or coach.

---

## What We're Building (Summary)

Admins get a **Prompt Control** tab on /admin that shows existing coach agents (from the database), lets them edit each agent’s name, status (draft or active), system prompt, and document tags, and save changes. If there are no agents, they see a single message: "No agents configured. Agents are added by a developer." No way to create agents in the UI. A one-time seed adds the default "SPIN Sales Coach" agent so the tab has something to use right after setup.

---

## Technical Approach

We'll deliver this in three pieces:

1. **API for agents (list + update)** — Backend that lists agents (status = active or draft) and updates one agent by id. The app will call these from the admin tab so all data goes through the API (no direct database access from the page). Uses the existing `agents` table in Supabase.

2. **Prompt Control tab UI** — Rework the existing Prompt Control tab so it: loads the agent list; shows the empty-state message when there are no agents; shows a dropdown to pick an agent and a form (name, status dropdown with draft/active only, large prompt textarea, comma-separated document tags); and a "Save Changes" button at the bottom that validates (name required) and sends updates to the API. Styling matches the rest of admin (plum, same tab bar). No "+ New Agent" or any create flow.

3. **Default agent seed** — A one-time, idempotent seed (or migration) that inserts the "SPIN Sales Coach" agent (draft, given prompt text, document tags) so the tab has at least one agent to display and edit. Running it twice does not create duplicates.

The tab and tab bar entry already exist; we are replacing the current placeholder content (which reads from agent config in code) with the database-driven flow above.

---

## Constitution Check

- **Follows Spec-Driven Development**: Implementation is scoped by the approved spec and design; no creation flow, two statuses only, Save at bottom, empty state message as specified.
- **Follows Directory Contract**: New API routes under `app/api/admin/agents/` (or equivalent); tab content in `components/admin/PromptControlTab.tsx`; seed in project’s chosen place (e.g. Supabase migration or Prisma/script).
- **Uses approved tech stack**: Next.js App Router, TypeScript, Supabase (agents table), Tailwind for admin styling. No new frameworks.
- **Module boundaries**: Page/component calls API; API handles validation and talks to the data layer (Supabase or lib) for agents. No direct DB access from the component for writes.
- **Exception needed**: None.

---

## Files That Will Be Created/Modified

**User-facing**

- **Prompt Control tab content** (`components/admin/PromptControlTab.tsx`): Replace current behavior with: fetch agents list; empty state "No agents configured. Agents are added by a developer." when list is empty; agent dropdown; form (name, status draft/active, prompt textarea, document tags comma-separated); "Save Changes" at bottom; success/error feedback. Same admin look and feel.

**Behind-the-scenes**

- **GET list of agents** (e.g. `app/api/admin/agents/route.ts`): Returns agents where status is 'active' or 'draft'. Used to populate the dropdown.
- **PATCH single agent** (e.g. `app/api/admin/agents/[id]/route.ts`): Accepts name, status, prompt, document_tags; validates name present; updates the agents table. Used when the user clicks Save Changes.
- **Agents table access**: Use Supabase client (or existing data layer) to read/update the `agents` table; the table already exists from the SEI-25 migration.
- **Seed or migration for default agent**: Inserts "SPIN Sales Coach" (draft, specified prompt, document_tags) in an idempotent way (e.g. by name or migration that runs once).

**Not modified**

- `app/admin/page.tsx`: Tab bar and Prompt Control tab entry already exist; no change unless we need to fix URL sync for `?tab=prompt`.
- Knowledge Base and Test Console tabs and their components: unchanged.
- Anything under `app/coach/`: unchanged.

**Tests**

- Tests (if added) for: API returns only active/draft agents; PATCH updates and validates name; empty state when no agents; form submit calls PATCH with correct payload. Per project TDD preference.

---

## Dependencies

**Must be done first**

- The `agents` table must exist in Supabase (already created in SEI-25 migration). No schema change required.

**Can build in parallel**

- API routes (GET list, PATCH update) can be built in parallel with the PromptControlTab UI; the UI will call the API once both exist.

**Blocks future work**

- Wiring the SPIN coach (or any coach) to use prompt and document_tags from the agents table will depend on this tab and API existing so that data is editable.

---

## Test Strategy

**What we'll test**

- **Happy path**: Open /admin → Prompt Control; see agent dropdown (or empty state); select agent → form fills; edit name/prompt/tags/status → Save Changes → success message and form shows updated data.
- **Validation**: Clear name and Save → "Name is required" and no save.
- **Empty state**: With no agents in DB (or only archived), Prompt Control shows only "No agents configured. Agents are added by a developer." with no dropdown or form.
- **API**: GET returns only active/draft; PATCH updates only allowed fields and rejects empty name.

**How we'll know it works**

- Manual: Open /admin, go to Prompt Control, select "SPIN Sales Coach" (after seed), change prompt or name, Save, see success and updated values; confirm in DB if needed. With no agents, see only the empty-state message.

---

## Risks & Mitigations

| Risk | Impact on business | How we'll handle it |
|------|--------------------|----------------------|
| Supabase client or env not set up for server | API can't read/write agents | Use existing project pattern for Supabase (or add minimal client) in API routes only; document env if needed. |
| Seed run in wrong order or twice | Duplicate default agent or missing agent | Make seed idempotent (e.g. insert only if no row with name "SPIN Sales Coach"); document run-once or migration order. |
| Existing PromptControlTab does something different | Confusion or broken tab | Replace its behavior fully with the spec: agents from API, empty state, form, Save at bottom; remove old agent-config fetch. |

---

## Implementation Phases

**Phase 1: API and data (Day 1)**

- Add GET route that returns agents where status in ('active','draft') from the agents table.
- Add PATCH route that accepts agent id and body (name, status, prompt, document_tags); validate name present; update the agents table; return updated agent or error.
- Add or run idempotent seed that inserts default "SPIN Sales Coach" agent (draft, prompt text, document_tags).
- **Deliverable**: List and update work from API; default agent exists so the tab can show one agent.

**Phase 2: Prompt Control tab UI (Day 1–2)**

- Rework `PromptControlTab`: on load, fetch agent list from GET API; if empty, render only "No agents configured. Agents are added by a developer."
- When agents exist: show dropdown (agent selector), then form with name, status (draft/active only), prompt textarea, document tags (comma-separated); Save Changes button at bottom.
- On Save: validate name; send PATCH with current form values; show success or error; leave form state unchanged on error.
- Match existing admin styling (plum, same card/input style as other admin tabs).
- **Deliverable**: Admin can open Prompt Control, select SPIN Sales Coach, edit and save; or see empty state when no agents.

**Phase 3: Verification and polish (Day 2)**

- Confirm URL `?tab=prompt` selects Prompt Control and survives refresh.
- Confirm no edits to Knowledge Base or Test Console or coach routes.
- Run lint and build; fix any issues.
- **Deliverable**: Ready for review and merge.

---

## Deployment Plan

**Feature flag**: No — New behavior is additive (one tab); existing tabs unchanged. Can deploy and use Prompt Control when the seed has been run.

**Database changes**: No new tables. We use the existing `agents` table. Seed adds one row (or migration adds it); run once per environment.

**Rollback**: Revert the branch; if seed was run, the default row remains in DB (harmless). No data loss.

---

## Success Metrics

- Admins can open /admin, click Prompt Control, and see either the empty-state message or an agent dropdown and form.
- Selecting an agent loads its name, status (draft/active), prompt, and document tags; editing and Save Changes updates the database and shows success.
- Name is required on save; status is only draft or active in the UI. No creation flow.
- Knowledge Base and Test Console tabs and all coach flows are unchanged.

---

## Timeline Breakdown

| Phase | Duration | Why |
|-------|----------|-----|
| Phase 1: API + seed | ~0.5 day | Two small API routes and one idempotent seed; agents table exists. |
| Phase 2: Tab UI | ~0.5–1 day | One component rework: fetch, empty state, form, dropdown, save at bottom, styling. |
| Phase 3: Verify & polish | ~0.25 day | URL sync, lint, build, no unintended changes. |

**Total**: 1–2 days  
**Confidence**: High — Scope is clear; tab shell exists; no new tables; design and spec are aligned.

---

## What Could Make This Take Longer

- Integrating with Supabase from the Next.js API (e.g. no existing client or env) could add a few hours to set up and wire.
- If the existing PromptControlTab is tightly coupled to other code, refactor might take longer; plan assumes a straightforward replace of its behavior.

---

## What's NOT Included

- Creating new agents in the UI (agents are added by a developer).
- Wiring the SPIN or general coach to use prompt/document_tags from the agents table.
- Changes to Knowledge Base or Test Console.
- Any change under app/coach/ or app/coach/spin/.
- "Archived" status in the UI or any status other than draft and active.

---

## Next Steps

1. Review this plan.
2. Ask any questions using /explain.
3. When ready: Run /implement to start building.
4. I'll create the branch (or use the existing one) and implement Phase 1, then Phase 2 and 3.
