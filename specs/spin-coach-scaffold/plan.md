# Implementation Plan: SPIN Selling Coach Scaffold

**Branch**: `feature/spin-scoring`  
**Spec**: [SEI-25-spin-coach-scaffold.md](../features/SEI-25-spin-coach-scaffold.md)  
**Exploration**: Not yet run (scaffold is low-ambiguity; exploration optional)  
**Design**: [spin-coach-design.md](../designs/spin-coach-design.md)  
**Estimated Timeline**: Less than 1 day — Copy three existing pages, add one migration file, create branch; no new logic or wiring.

---

## What We're Building (Summary)

We're creating the **structure** for a separate SPIN selling coach experience so consultants can later practice using the SPIN methodology without touching the existing general sales coach. This deliverable: a new branch, three new pages (session setup, coaching session, scorecard) that look and behave like the current coach, and a database table ready for future multi-coach support. Users can open the new routes and see the same layout and styling; no behavior or copy changes in this step.

---

## Technical Approach

We'll do four small pieces in order:

1. **Create the branch** — Create and switch to `feature/spin-scoring` so all new work is isolated and the existing coach stays untouched.
2. **Copy the three pages** — Add new files under `app/coach/spin/`: setup page (from existing setup), session page (from existing coach), scorecard page (from existing scorecard). Each file is a copy of the closest equivalent; we only fix imports or paths if something breaks. No edits to the original files.
3. **Add the agents table migration** — Add one SQL file under `supabase/migrations/` that creates the `agents` table with the required columns. This gives the database a place to store different coach configs (e.g. SPIN vs general) when we're ready to wire that up.
4. **Verify build and lint** — Run the project's standard checks so we know nothing is broken and the new pages render.

Everything is additive: no existing coach code or components are modified. The design doc (agreed Option A everywhere) will guide future work when we add SPIN-specific titles and copy; this plan only covers the scaffold.

---

## Constitution Check

- **Follows Spec-Driven Development**: Work is scoped by the approved spec; implementation matches FR-001 through FR-004.
- **Follows Directory Contract**: New pages live under `app/coach/spin/` and `app/coach/spin/session/`, `app/coach/spin/scorecard/`; migration under `supabase/migrations/` per project layout.
- **Ues approved tech stack**: Next.js App Router, TypeScript, existing Tailwind/theme; Supabase for the new table. No new frameworks or libraries.
- **Preserves existing coach**: No changes to `app/coach/page.tsx`, `app/setup/page.tsx`, `app/scorecard/page.tsx` or shared components; NFR-001 satisfied.
- **Exception needed**: None.

---

## Files That Will Be Created/Modified

**User-facing (new routes only)**  
- **SPIN session setup** (`app/coach/spin/page.tsx`): Copy of existing setup page. Users see the same onboarding form and layout at `/coach/spin`.
- **SPIN coaching session** (`app/coach/spin/session/page.tsx`): Copy of existing coach page. Users see the same chat/session UI at `/coach/spin/session`.
- **SPIN scorecard** (`app/coach/spin/scorecard/page.tsx`): Copy of existing scorecard page. Users see the same scorecard layout at `/coach/spin/scorecard`.

**Behind-the-scenes**  
- **Agents table migration** (`supabase/migrations/[timestamp]_create_agents_table.sql`): Defines the `agents` table so future work can store coach configs (name, prompt, document tags, status, etc.). No application code reads or writes it in this phase.

**Modified**  
- None. All changes are new files and one new migration.

**Tests**  
- No new test files in this scaffold. Verification is manual: build passes, lint passes, and the three URLs load with the expected layout. When SPIN logic is added later, tests will be added per TDD.

---

## Dependencies

**Must be done first**  
- None. Branch can be created from current main (or your default branch). No other feature has to ship before this.

**Can build in parallel**  
- Branch creation, page copies, and migration file can be done in any order once the branch exists; typically branch first, then pages, then migration.

**Blocks future work**  
- The SPIN coach experience (logic, copy, scoring) and any “home CTA to SPIN” change depend on this scaffold being in place. The `agents` table unblocks multi-coach configuration later.

---

## Test Strategy

**What we'll check**  
- **Happy path**: Branch exists → build and lint pass → opening `/coach/spin`, `/coach/spin/session`, and `/coach/spin/scorecard` shows the same layout and styling as the existing setup, coach, and scorecard pages. No 404s, no console errors from the new pages.
- **Edge case**: Applying the migration in Supabase creates the `agents` table with the right columns and defaults; inserting a row with only `name` fills in `agent_id`, `status`, and `created_at`.

**How we'll know it works**  
- `npm run lint` and `npm run build` both pass.  
- A quick manual check in the browser: hit the three new URLs and confirm they render like the existing coach flow.  
- Run (or apply) the migration and confirm the table exists in the database.

---

## Risks & Mitigations

| Risk | Impact on business | How we'll handle it |
|------|--------------------|----------------------|
| Copy-paste introduces a wrong path or broken import | New pages 404 or build fails | Run build after each new page; fix only imports/paths, no logic changes. |
| Migration conflicts with existing Supabase state | Table already exists or schema clash | Use a timestamped migration; if needed, use `CREATE TABLE IF NOT EXISTS` or document manual run-once. |
| Someone edits an original file by mistake | Existing coach broken | Spec and plan both say “do not modify originals”; review diff before merge to ensure only new files and the migration are changed. |

---

## Implementation Phases

**Phase 1: Branch and page scaffold** (same day)  
- Create branch `feature/spin-scoring`.  
- Create `app/coach/spin/page.tsx` (copy of `app/setup/page.tsx`).  
- Create `app/coach/spin/session/page.tsx` (copy of `app/coach/page.tsx`).  
- Create `app/coach/spin/scorecard/page.tsx` (copy of `app/scorecard/page.tsx`).  
- Fix any import or path issues so the app builds.  
- **Deliverable**: All three routes load and look like the existing screens; build and lint pass.

**Phase 2: Database migration** (same day)  
- Add `supabase/migrations/[timestamp]_create_agents_table.sql` with the specified `agents` schema.  
- **Deliverable**: Migration file present; applying it in Supabase creates the `agents` table correctly.

**Phase 3: Verification** (same day)  
- Run `npm run lint` and `npm run build`.  
- Manually open the three SPIN URLs and confirm layout.  
- Optionally apply migration and confirm table.  
- **Deliverable**: Ready to commit and open PR; no changes to existing coach files.

---

## Deployment Plan

**Feature flag**: No — New routes are additive; they don’t change existing behavior. You can deploy and only share the new URLs when you’re ready.

**Database changes**: Yes — One new migration adds the `agents` table. Run it in Supabase when you deploy or before; no downtime if the app doesn’t use the table yet.

**Rollback**: Revert the branch or don’t link to the new routes; existing coach is unchanged. If the migration was applied, you can leave the table in place (empty) or drop it if you want a clean rollback.

---

## Success Metrics

- **Build and lint**: Both pass after scaffold; no regressions.  
- **Routes**: `/coach/spin`, `/coach/spin/session`, `/coach/spin/scorecard` render with the same layout and styling as the existing setup, coach, and scorecard.  
- **Diff**: Only new files under `app/coach/spin/` and one new migration file; no edits to existing coach or shared components.  
- **Migration**: `agents` table exists in Supabase with the specified schema and defaults.

---

## Timeline Breakdown

| Phase | Duration | Why |
|-------|----------|-----|
| Phase 1: Branch + pages | ~2–3 hours | Create branch, copy three files, fix imports; straightforward. |
| Phase 2: Migration | ~30 min | One SQL file; schema is defined in the spec. |
| Phase 3: Verify | ~30 min | Lint, build, quick manual check of three URLs and migration. |

**Total**: Less than 1 day (same-day completion expected).  
**Confidence**: High — No new logic; copy-and-adjust and one migration only.

---

## What Could Make This Take Longer

- **Unexpected import or layout dependencies**: If the copied pages rely on route-specific assumptions that break under `/coach/spin`, we may need small path or prop fixes; usually still within the same day.  
- **Supabase migration process**: If your team runs migrations in a specific way (e.g. CI or manual only), following that process could add a short coordination step.

---

## What's NOT Included

- Home page CTA update (deferred; will hardcode `/coach/spin` when added).  
- Any SPIN-specific copy or titles (e.g. “SPIN Sales Coach” in the header) — design is agreed; we add that when we add SPIN logic.  
- Wiring to APIs, RAG, ElevenLabs, or knowledge base for the SPIN routes.  
- Prisma schema updates or any app code that reads/writes the `agents` table.  
- New tests (scaffold is verified by build, lint, and manual check; tests come with feature work).  
- Changes to existing coach or shared components.

---

## Next Steps

1. Review this plan.  
2. Ask any questions using /explain.  
3. When ready: Run /implement to start building.  
4. I’ll create the branch and implement Phase 1, then Phase 2 and 3.
