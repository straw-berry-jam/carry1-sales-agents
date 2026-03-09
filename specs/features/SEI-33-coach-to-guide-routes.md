---
linear: https://linear.app/sei-interview-app/issue/SEI-33/coach-to-guide-routes-rename
ticket: SEI-33
---

# Feature Specification: Coach to Guide Routes Rename

**Feature Branch**: `SEI-33-coach-to-guide-routes`
**Created**: 2026-03-08
**Status**: Draft
**Linear Ticket**: [SEI-33](https://linear.app/sei-interview-app/issue/SEI-33/coach-to-guide-routes-rename)
**Input**: User description: "update 'coach' routes to 'guide' routes across the application"

## User Scenarios & Testing (mandatory)

### User Story 1 - All practice and scorecard URLs use /guide (Priority: P1)
A user (consultant) navigates and bookmarks the app using the new `/guide` path. The main practice flow (SPIN setup, session, scorecard) and the legacy coach/scorecard entry points all resolve under `/guide` and `/guide/spin/*` with no broken links or API calls.
**Why this priority**: This is the core rename; without it the feature is incomplete.
**Independent Test**: After implementation, open `/guide`, `/guide/spin`, `/guide/spin/session`, `/guide/spin/scorecard` and the legacy `/guide` (ex-coach) page; confirm pages load and all in-app links and fetch calls use `/guide` or `/api/guide` (no remaining `/coach` or `/api/coach` in network tab or link hrefs).
**Acceptance Scenarios**:
1. **Given** the app is deployed with the rename, **When** the user opens the landing page and clicks the primary CTA, **Then** they are taken to `/guide/spin` (not `/coach/spin`).
2. **Given** the user is on the SPIN setup page, **When** they complete onboarding and click Start Session, **Then** they are taken to `/guide/spin/session` and all API calls from that page go to `/api/guide` and `/api/guide/objectives`.
3. **Given** the user is on the session page, **When** they end the session or open the scorecard link, **Then** they are taken to `/guide/spin/scorecard` and all back/CTA links point to `/guide/spin`.
4. **Given** the user opens `/guide` (ex-`/coach`), **Then** the page loads and any fetch to the text coach uses `/api/guide`.

### User Story 2 - Setup and legacy scorecard entry points use /guide (Priority: P2)
Setup flow and the legacy scorecard page redirect or link to the new guide routes so users never hit broken coach URLs from in-app navigation.
**Why this priority**: Ensures the rename is consistent from every entry point (setup, scorecard, layout).
**Independent Test**: From `/setup`, complete flow and confirm navigation goes to `/guide` (or `/guide/spin` as applicable). Open legacy scorecard page (if still reachable) and confirm links point to `/guide`.
**Acceptance Scenarios**:
1. **Given** the user completes the setup page, **When** they submit and are redirected to the practice session, **Then** they land on `/guide` (or the intended guide route), not `/coach`.
2. **Given** the user is on the legacy scorecard page (`/scorecard`), **When** they click "Back" or "Practice again", **Then** the link goes to `/guide` (not `/coach`).

### User Story 3 - Optional redirect from old coach URLs (Priority: P3)
Existing bookmarks or shared links that use `/coach` or `/coach/spin/*` continue to work by redirecting to the corresponding `/guide` path.
**Why this priority**: Nice-to-have for backward compatibility; not required for a clean rename.
**Independent Test**: Open `/coach`, `/coach/spin`, `/coach/spin/session`, `/coach/spin/scorecard` and confirm each redirects (301/302) to the same path with `guide` in place of `coach`.
**Acceptance Scenarios**:
1. **Given** the user visits `/coach`, **When** the page is requested, **Then** the server responds with a redirect to `/guide` (same for `/coach/spin` → `/guide/spin`, etc.).
2. **Given** the user visits `/api/coach` (e.g. from an old client), **When** the request is made, **Then** either the API redirects to `/api/guide` or returns 410 Gone with a message — NEEDS CLARIFICATION: prefer redirect, 410, or leave old API routes in place as aliases?

### Edge Cases
- **Deep links and query params**: Redirects (if implemented) MUST preserve query strings (e.g. `/coach/spin/session?sessionType=outreach_15` → `/guide/spin/session?sessionType=outreach_15`).
- **API route 404**: After rename, any remaining client or integration that calls `/api/coach` or `/api/coach/objectives` must be updated or handled (redirect/alias) so demos and sessions do not fail silently.
- **Middleware or rewrites**: If the project uses Next.js middleware or rewrites that reference `/coach`, they MUST be updated to `/guide`.
- **Environment or external config**: Any env var or external reference (e.g. ElevenLabs, analytics) that points at `/coach` or `/api/coach` should be identified and updated or documented.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: All page routes under `app/coach/` MUST be moved to `app/guide/` so that the same pages are served at `/guide`, `/guide/spin`, `/guide/spin/session`, and `/guide/spin/scorecard` (Directory Contract: pages in `app/**/page.tsx`).
- **FR-002**: All API routes under `app/api/coach/` MUST be moved to `app/api/guide/` so that POST `/api/guide` and POST `/api/guide/objectives` behave identically to the current coach endpoints.
- **FR-003**: Every in-app reference to a coach route MUST be updated to the corresponding guide route: `fetch('/api/coach')` → `fetch('/api/guide')`, `fetch('/api/coach/objectives')` → `fetch('/api/guide/objectives')`, and all `href="/coach*"` and `router.push('/coach*')` → `/guide*`.
- **FR-004**: Internal identifiers (e.g. `coachId`, `coachPage` in `agentConfig`, `generateCoachResponse` in `lib/coaching.ts`) — NEEDS CLARIFICATION: Leave as-is (route rename only) or rename to guide for consistency (e.g. `guideId`, `guidePage`)? Recommendation: route-only rename unless product explicitly rebrands "coach" to "guide" in code.
- **FR-005**: Optional redirect from `/coach` and `/coach/*` to `/guide` and `/guide/*` — NEEDS CLARIFICATION: Implement in this feature (Next.js redirect in `next.config.mjs` or middleware) or defer to a follow-up?

### Key Entities (if feature involves data)
- No new or changed data models. This is a route and URL rename only; session, scorecard, and agent data are unchanged.

### Non-Functional Requirements
- **NFR-001**: Rename MUST NOT change behavior of the coach/guide logic (RAG, Claude, objectives, scorecard); only paths and references change.
- **NFR-002**: `npm run lint` and `npm run build` MUST pass after the rename.
- **NFR-003**: Existing specs and docs that reference `/coach` or `app/coach/` — NEEDS CLARIFICATION: Update in this feature (e.g. `specs/designs/spin-coach-design.md`, `specs/features/*.md`) or in a separate docs-only change.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: All P1 and P2 acceptance scenarios pass (manual or automated).
- **SC-002**: No remaining references to `/coach` or `/api/coach` in application code (pages, components, API routes, and in-app navigation); grep for `"/coach"` and `'/api/coach'` in `app/`, `components/`, and `lib/` returns no matches (excluding comments or docs if out of scope).
- **SC-003**: Next.js build succeeds and the four guide routes render correctly in production build.
- **SC-004**: If redirects are in scope, visiting any `/coach` or `/coach/*` URL returns a redirect to the corresponding `/guide` path with query string preserved.
