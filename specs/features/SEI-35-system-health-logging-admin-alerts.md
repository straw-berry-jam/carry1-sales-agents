---
linear: https://linear.app/sei-interview-app/issue/SEI-35/system-health-logging-table-admin-panel-alerts
ticket: SEI-35
---
# Feature Specification: System Health Logging Table + Admin Panel Alerts

**Feature Branch**: `SEI-35-system-health-logging-admin-alerts`
**Created**: 2026-03-09
**Status**: Draft
**Linear Ticket**: [SEI-35](https://linear.app/sei-interview-app/issue/SEI-35/system-health-logging-table-admin-panel-alerts)
**Input**: Add a Supabase-backed system events table, a logging utility, wire it into the score-session fallback and retrieval error paths, and expose a System Health admin view plus a dismissible banner on the KB tab when recent warnings/errors exist.

## User Scenarios & Testing (mandatory)

### User Story 1 - System events are persisted and visible in admin (Priority: P1)
When the score-session API triggers the eval-docs fallback (no KB evaluation criteria docs) or when the Prisma query for eval docs fails, the system records a structured event in Supabase (system_events). An admin can open the System Health page and see those events in a table with time, severity, route, event type, agent, and message.
**Why this priority**: Core value of the feature — visibility into operational health.
**Independent Test**: Trigger the fallback (ensure no eval_criteria docs in KB), complete a scorecard; then open /admin/system-health and confirm a row with event_type eval_docs_fallback, severity warn. Simulate or trigger a Prisma error and confirm an error event is logged and visible.
**Acceptance Scenarios**:
1. **Given** the score-session route uses the fallback rubric (no eval docs found), **When** the fallback runs, **Then** `logSystemEvent` is called with route `/api/score-session`, event_type `eval_docs_fallback`, severity `warn`, agent_id set, message and metadata (agentUuid, sessionType); the row appears in system_events and on the System Health table.
2. **Given** the Prisma query for evaluation criteria docs throws, **When** the catch block runs, **Then** `logSystemEvent` is called with event_type `eval_docs_retrieval_error`, severity `error`, and metadata including the error message; the row appears in system_events and on the System Health table.
3. **Given** an admin opens /admin/system-health, **When** the page loads, **Then** events are shown in a table ordered by created_at desc with columns: Time, Severity, Route, Event Type, Agent, Message; severity badges are color-coded (info → grey, warn → amber, error → red).

### User Story 2 - Summary and healthy state on System Health page (Priority: P2)
The System Health page shows a summary row at the top: errors in last 24h, warnings in last 24h, and last event timestamp. When both counts are zero, the page shows a green "All systems healthy" state.
**Why this priority**: At-a-glance health without scanning the table.
**Independent Test**: With no events in last 24h, open /admin/system-health and confirm "All systems healthy" and 0/0 counts. Add events (e.g. trigger fallback) and confirm counts and last event update.
**Acceptance Scenarios**:
1. **Given** there are no error or warn events in the last 24 hours, **When** the admin opens /admin/system-health, **Then** the summary shows "Errors in last 24h: 0", "Warnings in last 24h: 0", "Last event: [timestamp or —]" and a green "All systems healthy" state.
2. **Given** there are N errors and M warnings in the last 24 hours, **When** the admin opens the page, **Then** the summary shows those counts and the timestamp of the most recent event; no green healthy state.

### User Story 3 - KB tab banner when recent warnings or errors exist (Priority: P2)
When the admin is on the Knowledge Base tab and any warn or error events exist in system_events within the last 24 hours, a dismissible amber banner appears at the top: "System warning: retrieval issues detected in the last 24 hours. View System Health →" with a link to /admin/system-health.
**Why this priority**: Surfaces health issues in context (KB) and drives admins to the dedicated health view.
**Independent Test**: With no recent warn/error events, open /admin with KB tab — no banner. Trigger a fallback or error event, open /admin KB tab — banner appears; dismiss it and confirm it stays dismissed for the session; link goes to /admin/system-health.
**Acceptance Scenarios**:
1. **Given** at least one warn or error event in system_events in the last 24 hours, **When** the admin views the Knowledge Base tab (e.g. /admin with tab=kb), **Then** an amber, dismissible banner is shown at the top with the specified copy and a link to /admin/system-health.
2. **Given** no warn or error events in the last 24 hours, **When** the admin views the KB tab, **Then** no banner is shown.
3. **Given** the banner is visible, **When** the admin dismisses it, **Then** the banner is hidden; dismissal state is stored in localStorage (session-only). On the next page load, the banner reappears if warn/error events still exist within the last 24 hours.

### Edge Cases
- **Logging must not throw**: If `logSystemEvent` fails (e.g. Supabase down, table missing), it MUST catch, log to console.warn, and never throw so that the score-session flow and other callers are not broken.
- **agent_id optional**: system_events.agent_id is nullable; when logging, pass agent_id only when available (e.g. agentUuid in score-session).
- **Banner dismissal**: Dismissal is session-only via localStorage. The banner reappears on next page load if warn/error events still exist in the last 24 hours. The System Health page at /admin/system-health always shows the full event log and is unaffected by banner dismissal state.
- **System Health page auth**: Admin panel may or may not have auth; spec does not require new auth — assume same access as existing /admin. If project later adds auth, System Health is behind the same gate.
- **Large event volume**: Table ordered by created_at desc; consider pagination or limit (e.g. last 500) in a follow-up if needed; MVP can load last N with a reasonable limit.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: A new Supabase table `system_events` MUST exist with columns: id (uuid, default gen_random_uuid(), primary key), created_at (timestamptz, default now()), route (text, not null), event_type (text, not null), severity (text, not null, check in ('info','warn','error')), agent_id (uuid, nullable), message (text, not null), metadata (jsonb). Implement via a Supabase migration in `supabase/migrations/`.
- **FR-002**: A logging utility MUST exist in `lib/logSystemEvent.ts`. It MUST accept route, event_type, severity ('info'|'warn'|'error'), optional agent_id, message, and optional metadata (Record<string, unknown>). It MUST insert one row into `system_events` via Supabase client. On insert failure it MUST catch, log with console.warn('[logSystemEvent] failed to write system event:', err), and MUST NOT throw.
- **FR-003**: In `app/api/score-session/route.ts`, when the eval-docs fallback triggers (no eval docs found), the route MUST call `logSystemEvent` with route `/api/score-session`, event_type `eval_docs_fallback`, severity `warn`, agent_id set to the active agent UUID, message `'No evaluation criteria docs found in KB. Fell back to hardcoded rubric.'`, and metadata `{ agentUuid, sessionType }`.
- **FR-004**: In `app/api/score-session/route.ts`, when the Prisma query for evaluation criteria docs throws, the catch block MUST call `logSystemEvent` with route `/api/score-session`, event_type `eval_docs_retrieval_error`, severity `error`, agent_id set to agentUuid, message `'Prisma error retrieving eval docs from KB.'`, and metadata `{ error: <error message>, agentUuid }`.
- **FR-005**: A new admin page at `app/admin/system-health/page.tsx` (route `/admin/system-health`) MUST display a table of system_events ordered by created_at desc with columns: Time, Severity, Route, Event Type, Agent, Message. Severity badges MUST be color-coded: info → grey, warn → amber, error → red. Data MUST be loaded from an API (e.g. GET /api/admin/system-events) that reads from Supabase or Prisma (if system_events is mirrored in Prisma); Directory Contract: pages in app/, API in app/api/.
- **FR-006**: The System Health page MUST show at the top a summary row: "Errors in last 24h: N", "Warnings in last 24h: N", "Last event: [timestamp]". When both N (errors and warnings in last 24h) are zero, the page MUST show a green "All systems healthy" state.
- **FR-007**: On the admin panel's Knowledge Base tab (the view that lists documents), when any warn or error event exists in system_events within the last 24 hours, a dismissible amber banner MUST be shown at the top with the text "System warning: retrieval issues detected in the last 24 hours. View System Health →" and a link to `/admin/system-health`. If no such events exist, the banner MUST NOT be shown. Dismissal state is stored in localStorage (session-only); on next page load the banner reappears if such events still exist. The System Health page always shows the full event log regardless of banner dismissal state.

### Key Entities (if feature involves data)
- **system_events** (new): id, created_at, route, event_type, severity, agent_id (nullable), message, metadata (jsonb). Stored in Supabase; optionally exposed via GET /api/admin/system-events for the admin UI.

### Non-Functional Requirements
- **NFR-001**: Logging MUST be best-effort and never throw; callers must not depend on logSystemEvent succeeding.
- **NFR-002**: System Health page and banner MUST not block admin workflows if the system_events API or table is unavailable; show empty state or hide banner gracefully.
- **NFR-003**: `npm run lint` and `npm run build` MUST pass after implementation.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: Triggering the score-session fallback results in a row in system_events and that row is visible on /admin/system-health with severity warn and event_type eval_docs_fallback.
- **SC-002**: When Prisma eval-docs query fails, an error event is logged and visible on System Health with event_type eval_docs_retrieval_error.
- **SC-003**: System Health page shows summary (errors/warnings in last 24h, last event) and "All systems healthy" when counts are zero.
- **SC-004**: With at least one warn or error in the last 24h, the KB tab shows the amber banner with link to /admin/system-health; with none, no banner.
- **SC-005**: logSystemEvent never throws; failed insert only logs to console.warn.
