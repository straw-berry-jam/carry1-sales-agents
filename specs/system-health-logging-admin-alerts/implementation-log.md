# Implementation Log: System Health Logging Table + Admin Panel Alerts (SEI-35)

**Branch**: `SEI-35-system-health-logging-admin-alerts`  
**Plan**: [plan.md](./plan.md)  
**Spec**: [SEI-35-system-health-logging-admin-alerts.md](../features/SEI-35-system-health-logging-admin-alerts.md)

## Summary

- **Phase 1**: Migration, `lib/logSystemEvent.ts`, score-session wiring, GET `/api/admin/system-events`, `/admin/system-health` page with summary, table, severity badges, and "← Admin" link.
- **Phase 2**: Permanent "System Health" link in admin bar, KB tab dismissible amber banner (when recent warn/error events exist), localStorage on dismiss (banner still reappears on next page load via in-memory state).
- **Phase 3**: Build verified; no test runner in project (Jest not configured), so no automated tests added.

## Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20260309120000_system_events.sql` | Creates `system_events` table (id, created_at, route, event_type, severity, agent_id, message, metadata). |
| `lib/logSystemEvent.ts` | Best-effort logging to `system_events`; never throws, console.warn on failure. |
| `app/api/admin/system-events/route.ts` | GET returns events (limit 500) and summary (errorsLast24h, warningsLast24h, lastEventAt). |
| `app/admin/system-health/page.tsx` | System Health page: summary row, "All systems healthy" when zero, event table with severity badges (info=grey, warn=amber, error=red), "← Admin" and "Back to app" links. |
| `specs/system-health-logging-admin-alerts/implementation-log.md` | This log. |

## Files Modified

| File | Change |
|------|--------|
| `app/api/score-session/route.ts` | Import `logSystemEvent`; on eval-docs fallback call `logSystemEvent` (eval_docs_fallback, warn); in Prisma catch call `logSystemEvent` (eval_docs_retrieval_error, error). |
| `app/admin/page.tsx` | Added permanent "System Health" link (Activity icon) next to Test Console. |
| `components/admin/KnowledgeBaseTab.tsx` | Fetch `/api/admin/system-events` on mount; if `errorsLast24h` or `warningsLast24h` > 0, show dismissible amber banner with "View System Health →"; dismiss sets state and localStorage. |

## Decisions

- **logSystemEvent never throws**: Missing Supabase env or insert failure only triggers `console.warn` and return.
- **system_events in Supabase only**: No Prisma model; API route uses `createClient` from `@supabase/supabase-js` to read.
- **Banner dismissal**: In-memory state hides banner for current view; localStorage written on dismiss for spec compliance. Banner reappears on next full page load when conditions still hold (state is reset).
- **Tests**: Project has no Jest/Vitest; build and manual verification used. Unit test for `logSystemEvent` (no throw) can be added when a test runner is configured.

## Verification

- `npm run build` passes; `/admin/system-health` and `/api/admin/system-events` appear in Next.js route list.
- Manual: Run migration, trigger score-session fallback (no eval_criteria docs), then open System Health to see warn event; open KB tab to see banner when recent warn/error exist.
