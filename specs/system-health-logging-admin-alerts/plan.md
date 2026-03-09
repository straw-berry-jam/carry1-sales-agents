## 📋 Implementation Plan: System Health Logging Table + Admin Panel Alerts

**Branch**: `SEI-35-system-health-logging-admin-alerts`
**Spec**: [specs/features/SEI-35-system-health-logging-admin-alerts.md](../features/SEI-35-system-health-logging-admin-alerts.md)
**Exploration**: Not yet run
**Design**: [specs/designs/admin-panel-design.md](../designs/admin-panel-design.md) — permanent System Health link and back-to-admin navigation.
**Estimated Timeline**: 1–2 days — Small, well-scoped feature: one new table, one utility, two wiring points, one new admin page and one API, plus a banner on an existing tab and a permanent link to System Health in the admin bar.

### What We're Building (Summary)

Admins get visibility into system health: when the scoring flow falls back to a hardcoded rubric (no evaluation docs in the Knowledge Base) or when fetching those docs fails, those events are recorded. A new System Health page shows a summary (errors/warnings in the last 24 hours, last event) and a full event log. Admins can open it anytime via a **permanent "System Health" link** in the admin bar (and from the System Health page, a link back to the admin tabs). On the Knowledge Base tab, a dismissible amber banner appears only when recent warnings or errors exist, with a link to System Health. Dismissal is stored in localStorage and the banner reappears on next page load if issues are still present.

### Technical Approach

We'll build this in four pieces:

1. **Database and logging (half day)** — Add a `system_events` table in Supabase via migration, and a small utility in `lib/logSystemEvent.ts` that writes one row per event and never throws (failures only log to the console). This gives a single place to record operational events.

2. **Wire scoring into logging (quarter day)** — In the score-session API: when the fallback rubric is used (no eval docs found), log a warning event with route, agent, and session type; when the Prisma query for eval docs throws, log an error event with the error message and agent. Both calls are fire-and-forget so scoring stays fast and reliable.

3. **System Health page and API (half day)** — New admin page at `/admin/system-health` that fetches events from a new GET `/api/admin/system-events` endpoint. The page shows a summary row (errors in last 24h, warnings in last 24h, last event time) and a table (time, severity, route, event type, agent, message) with color-coded severity badges. When both counts are zero, show a green "All systems healthy" state. The API reads from the same Supabase `system_events` table (or Prisma if we add a model); we use a reasonable limit (e.g. last 500 events) for the table.

4. **KB tab banner (quarter day)** — On the Knowledge Base tab, call an endpoint or reuse the system-events API to check whether any warn/error events exist in the last 24 hours. If yes, show an amber dismissible banner with the spec copy and a link to `/admin/system-health`. Store dismissal in localStorage (e.g. key like `system-health-banner-dismissed`); on each load, if there are recent warn/error events and the user hasn't dismissed in this "session" (localStorage), show the banner. System Health page is unaffected by dismissal and always shows the full log.

5. **Admin bar and System Health navigation (small)** — Per design: add a **permanent "System Health" link** in the admin bar (e.g. next to Test Console or in the same row) so admins can open the page anytime, not only when the banner appears. On the System Health page, add a link back to the admin home (e.g. "← Admin" or "← Knowledge Base") so admins can return to the tab bar in one click.

### Constitution Check

- ✅ **Follows Spec-Driven Development**: Implementation is driven by SEI-35 spec; no code without fulfilling the spec's FRs and success criteria.
- ✅ **Follows Directory Contract**: New table via `supabase/migrations/`, utility in `lib/`, API in `app/api/admin/system-events/route.ts`, page in `app/admin/system-health/page.tsx`, banner logic in existing `components/admin/KnowledgeBaseTab.tsx`.
- ✅ **Uses approved tech stack**: Next.js App Router, TypeScript, Supabase (PostgreSQL), Tailwind for UI; no new dependencies.
- ✅ **Logging never throws**: NFR-001 and edge case are satisfied by design in `logSystemEvent`.
- ⚠️ **Exception needed**: None.

### Files That Will Be Created/Modified

**User-Facing Changes**:
- **System Health page** (`app/admin/system-health/page.tsx`): New admin page with summary (errors/warnings in last 24h, last event), "All systems healthy" when zero, and event table with severity badges (info=grey, warn=amber, error=red). Include "← Admin" (or "← Knowledge Base") link back to `/admin` so admins can return to the tab bar.
- **Admin bar** (`app/admin/page.tsx`): Add a permanent "System Health" link (e.g. next to Test Console) so the page is reachable anytime, not only via the banner or URL.
- **Knowledge Base tab** (`components/admin/KnowledgeBaseTab.tsx`): Dismissible amber banner at top when recent warn/error events exist; link to `/admin/system-health`; dismissal in localStorage.

**Behind-the-Scenes**:
- **Migration** (`supabase/migrations/YYYYMMDDHHMMSS_system_events.sql`): Creates `system_events` with id, created_at, route, event_type, severity, agent_id, message, metadata.
- **Logging utility** (`lib/logSystemEvent.ts`): Single async function that inserts into `system_events` via Supabase client; catch all errors and `console.warn` only, never throw.
- **Score-session API** (`app/api/score-session/route.ts`): Call `logSystemEvent` when fallback rubric is used (warn) and when Prisma eval-docs query throws (error).
- **System events API** (`app/api/admin/system-events/route.ts`): GET handler that returns events (ordered by created_at desc, with limit), plus optional summary counts for last 24h and last event timestamp for the System Health page and banner.

**Tests**:
- **lib/logSystemEvent**: Unit test that insert failure does not throw and logs to console (or that successful call inserts; mock Supabase).
- **Score-session**: Integration or unit tests that when fallback is used / when Prisma throws, `logSystemEvent` is invoked with expected args (mock `logSystemEvent`).
- **System Health page / API**: Smoke test that page loads and shows summary and table; API returns events and summary.

### Dependencies

**Must Be Done First**:
- Migration must run before any code that writes to or reads from `system_events` (local or deployed Supabase).

**Can Build in Parallel**:
- System Health page and API can be built in parallel with the KB banner once the API contract (GET response shape) is agreed; both consume the same API.

**Blocks Future Work**:
- Other routes (e.g. retrieval, voice) can later call `logSystemEvent` for their own events; this feature unblocks that.

### Test Strategy

**What We'll Test**:
- **Happy path**: Score a session with no eval docs → fallback runs → warning event appears in DB and on System Health page; summary shows 1 warning in last 24h; KB tab shows banner until dismissed; after dismiss, banner hidden until next page load if events still exist.
- **Error path**: Simulate Prisma failure in score-session → error event logged; System Health shows error count and row.
- **Edge cases**: `logSystemEvent` when Supabase/table unavailable → no throw, console.warn only; System Health page when API fails → empty state or graceful message; KB tab when system-events API fails → no banner or safe fallback.

**How We'll Know It Works**:
- Trigger fallback (e.g. no evaluation_criteria docs), complete a score; open System Health and see one warn row and updated summary; open KB tab and see banner; dismiss banner, reload KB tab and see banner again if events still in last 24h.

### Risks & Mitigations

| Risk | Impact on Business | How We'll Handle It |
|------|--------------------|----------------------|
| Supabase down or table missing | Events not recorded; scoring still works | Logging is best-effort, never throws; we log to console on failure |
| High event volume slows System Health page | Admins wait longer to see health | Limit query to last N events (e.g. 500); add pagination later if needed |
| Banner check adds latency to KB tab | Slightly slower KB load | Single light API call (count in last 24h); optional: cache for a short TTL on client |

### Implementation Phases

**Phase 1: Core Functionality** (Day 1)
- Add Supabase migration for `system_events`.
- Implement `lib/logSystemEvent.ts` (Supabase client; catch, console.warn, no throw).
- Wire score-session: log on fallback and on Prisma catch.
- Add GET `/api/admin/system-events` (list events + summary for last 24h).
- Add `/admin/system-health` page (summary + table, severity badges, "All systems healthy" when zero).
- **Deliverable**: Scoring logs events; admins can open System Health and see them.

**Phase 2: KB Banner, Admin Link & Polish** (Day 1–2)
- KB tab: fetch "has recent warn/error" (from same API or a light summary endpoint); show dismissible amber banner; localStorage for dismissal; link to System Health.
- Admin bar: add permanent "System Health" link so admins can open the page anytime. System Health page: add "← Admin" (or "← Knowledge Base") link back to `/admin`.
- Ensure System Health page and KB tab degrade gracefully if API or DB fails (empty state, no banner or hide banner).
- **Deliverable**: Full spec + design (permanent link, back navigation); manual run-through of acceptance scenarios.

**Phase 3: Testing & Review** (Day 2)
- Unit test for `logSystemEvent` (no throw on failure).
- Tests for score-session logging (mocked logSystemEvent).
- Smoke test System Health page and API; optionally test banner show/dismiss/reload.
- Lint and build pass.
- **Deliverable**: Ready for production; success criteria verified.

### Deployment Plan

**Feature Flag**: No — Feature is admin-only and low risk; no user-facing scoring behavior change beyond adding logs.

**Database Changes**: Yes — New table `system_events` via Supabase migration. Run migration in target environment before or with deploy; no downtime if applied before app code that writes.

**Rollback Strategy**: Revert deploy; logging calls become no-ops if table is missing (logSystemEvent catches and only console.warns). Optionally leave table in place for future use.

### Success Metrics

- **SC-001–SC-005**: All spec success criteria pass (fallback and Prisma error logged and visible; summary and "All systems healthy"; banner when recent warn/error, no banner when none; logSystemEvent never throws).
- **Stability**: Score-session response time and success rate unchanged; no new errors from logging.
- **Adoption**: Admins can use System Health to confirm when fallback or retrieval errors occur and act (e.g. add eval docs or fix data).

### Timeline Breakdown

| Phase | Duration | Why This Long |
|-------|----------|----------------|
| Phase 1 (DB, logging, wiring, API, page) | ~1 day | Straightforward migration, one utility, two call sites, one read API and one page; follows existing admin patterns. |
| Phase 2 (Banner, graceful degradation) | ~0.5 day | One conditional banner, one localStorage key, reuse of system-events API. |
| Phase 3 (Tests, lint, build) | ~0.5 day | Focused tests; existing tooling. |

**Total**: 1–2 days  
**Confidence**: High — Spec is detailed; no new infrastructure; logging and read path are simple.

### What Could Make This Take Longer

- Supabase client usage in serverless (e.g. server-side `logSystemEvent`) needing a different client or env setup: add ~0.5 day to align with existing `lib/agents` or server Supabase usage.
- Requirement to add Prisma model for `system_events` for consistency: add ~0.25 day for schema + API switch to Prisma read.

### What's NOT Included

- Pagination or filtering on System Health table (MVP uses a fixed limit; can add later).
- Auth for `/admin` or `/admin/system-health` (same as current admin; spec does not add auth).
- Logging from other routes (e.g. retrieval, voice); only score-session is wired in this feature.
- Retention or cleanup of old `system_events` rows (can be a follow-up).

### Next Steps

1. Review this plan.
2. Ask any questions using /explain.
3. When ready: Run /implement to start building.
4. I'll create the git branch and begin Phase 1.
