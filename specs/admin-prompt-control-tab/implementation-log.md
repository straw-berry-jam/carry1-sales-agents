# Implementation Log: Admin Prompt Control Tab (SEI-26)

**Plan**: [plan.md](plan.md)  
**Branch**: `SEI-26-admin-prompt-control-tab`  
**Completed**: 2026-03-08

---

## Progress

### Phase 1: API and data ✅
- **lib/agents.ts**: Supabase client for `agents` table; `listAgents()` (status in active/draft) and `updateAgent(id, payload)` with name-required validation.
- **GET /api/admin/agents**: Returns list of agents for dropdown.
- **PATCH /api/admin/agents/[id]**: Updates agent; validates name present and status in (active, draft).
- **Seed**: `supabase/migrations/20260308000000_seed_default_spin_agent.sql` — inserts "SPIN Sales Coach" (draft, prompt, document_tags) only when no row with that name exists.
- Commit: `SEI-26 Add agents API (GET list, PATCH update) and default agent seed`

### Phase 2: Prompt Control tab UI ✅
- **components/admin/PromptControlTab.tsx**: Replaced previous agent-config read-only view with:
  - Fetch `/api/admin/agents` on load.
  - Empty state: "No agents configured. Agents are added by a developer." when list is empty; no selector or form.
  - Agent dropdown; form: name (required), status (draft/active), system prompt textarea, document tags (comma-separated).
  - "Save Changes" at bottom; name validation; PATCH on save; success ("Saved at …") and error messages.
- Styling aligned with existing admin (plum, rounded-2xl, border-plum/10).
- Commit: `SEI-26 Rework Prompt Control tab: agents dropdown, form, save at bottom, empty state`

### Phase 3: Verification ✅
- **URL sync**: Admin page already uses `?tab=prompt` and `validTab === 'prompt'`; no change needed.
- **Scope**: No edits to Knowledge Base, Test Console, or any file under `app/coach/`.
- **Lint**: No ESLint config in repo; `next lint` prompts for setup. New files pass TypeScript checks.
- **Build**: `npm run build` fails at "Collecting page data" due to **pre-existing** issue: `/api/elevenlabs-signed-url` requires `NEXT_PUBLIC_SUPABASE_URL` (and likely Supabase keys) at build time. This is unrelated to SEI-26. New code (agents API, PromptControlTab) compiles and type-checks.

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `lib/agents.ts` | List/update agents via Supabase |
| `app/api/admin/agents/route.ts` | GET list of agents |
| `app/api/admin/agents/[id]/route.ts` | PATCH update one agent |
| `supabase/migrations/20260308000000_seed_default_spin_agent.sql` | Idempotent default agent seed |
| `components/admin/PromptControlTab.tsx` | Full rework: fetch agents, empty state, dropdown, form, save |

---

## Decisions

- **Supabase in lib**: Agents table is in Supabase; existing `voiceSessionStore.ts` uses `createClient` with env vars. Added `lib/agents.ts` with same pattern so API routes stay thin and data access is in one place.
- **Seed as migration**: Default agent inserted via Supabase migration with `WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name = 'SPIN Sales Coach')` so it’s idempotent and runs with existing migration workflow.
- **No automated tests**: Repo has no Jest/Vitest config or test script. TDD noted in constitution but not set up; manual testing and API contract used. Tests can be added when the test framework is introduced.

---

## How to Test Manually

1. Apply migrations (and seed): run Supabase migrations so `agents` table and seed exist.
2. Set env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and any needed for dev server).
3. Start dev: `npm run dev`, open `http://localhost:3000/admin`.
4. Open "Prompt Control" tab (or `?tab=prompt`). If seed ran: dropdown shows "SPIN Sales Coach"; edit name/prompt/tags/status and click "Save Changes"; confirm success message and updated values.
5. Empty state: delete or archive all agents so none have status active/draft; reload tab — only "No agents configured. Agents are added by a developer." should show.

---

## Build Note

Full `npm run build` currently fails in "Collecting page data" because `/api/elevenlabs-signed-url` requires Supabase URL at module load. Fix is outside SEI-26 (e.g. lazy init or env stub in build). SEI-26 code compiles and type-checks.
