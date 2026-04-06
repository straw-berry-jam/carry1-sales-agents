# Design Exploration: Admin Panel

**Related specs**: [SEI-26 Admin Prompt Control](../features/SEI-26-admin-prompt-control-tab.md), [SEI-35 System Health Logging](../features/SEI-35-system-health-logging-admin-alerts.md), and other admin-facing features  
**Created**: 2026-03-09

---

## User Journey

**Jordan** is a CARRY1 admin who manages the sales coach: they upload and edit Knowledge Base documents, tune agent prompts in Prompt Control, run test retrievals in the Test Console, and (once System Health is live) check for warnings and errors when something goes wrong.

1. **Jordan opens the admin area** from the main app (e.g. a link or "Back to app" in reverse). They land on the admin home with a single tab bar: **Knowledge Base**, **Prompt Control**, and **Test Console**. A "Back to app" link at the top left takes them back to the coach experience.
2. **They pick what to do by clicking a tab.** The URL updates (e.g. `?tab=kb` or `?tab=prompt`) so they can bookmark or share. The main content area below the tab bar shows that section — document list and filters (KB), agent form (Prompt Control), or retrieval tester (Test Console).
3. **When something might be wrong** (e.g. scoring fell back because no evaluation docs were found), Jordan may see an **amber banner** at the top of the Knowledge Base tab: "System warning: retrieval issues detected in the last 24 hours. View System Health →". They can dismiss it for this visit (it reappears on the next page load if issues are still there) or click through to System Health.
4. **They open System Health** by going to a dedicated page (e.g. `/admin/system-health`), either from the banner link or by typing the address. There they see a short summary (errors and warnings in the last 24 hours, last event time) and a full list of recent system events. If there are no recent errors or warnings, they see a green "All systems healthy" message.
5. **They return to other admin tasks** by using the tab bar or "Back to app." The tab bar stays consistent so they always know where they are and can switch between KB, prompts, and testing without getting lost.

---

## Screen Breakdown

### Screen: Admin home (tab bar + content)

**Purpose**: Single entry point for all admin tasks. User chooses a section via tabs and works in the content area below.

**Key elements**:
- **Back to app**: Link at top left so admins can return to the main coach flow without losing context.
- **Tab bar**: Sticky at the top. Two tabs in a pill (Knowledge Base, Prompt Control) and Test Console as a separate button. Active tab is clearly highlighted (e.g. filled plum); others are muted until hover. Same layout and style across admin so behavior is predictable.
- **Content area**: One section visible at a time — Knowledge Base (document list, filters, create/edit drawer), Prompt Control (agent selector and form), or Test Console (retrieval tester). Plenty of space; no nested tabs inside the content.
- **System Health**: A **separate page** (e.g. `/admin/system-health`) that is **always reachable** — by typing or bookmarking the URL, or (when issues exist) via the KB banner link. So: the **banner only appears when there’s an issue**; the **page is always available**. To make that obvious, the tab bar or header should include a permanent link to System Health (e.g. "System Health" link or icon) so admins can open it anytime, not only when the banner is showing.

**User actions**:
- Click a tab → content switches; URL updates so the view is shareable/bookmarkable.
- Click "Back to app" → leave admin and return to the main app.
- In KB: use document list, filters, create/edit; if the warning banner is present, dismiss it or click "View System Health →".

**Success state**: Tabs switch instantly; content matches the selected tab; URL reflects the current section.

**Error state**: If a tab’s content fails to load (e.g. network issue), show a clear message in that content area (e.g. "Couldn’t load documents. Try again.") and keep the tab bar and "Back to app" usable.

---

### Screen: Knowledge Base tab content

**Purpose**: View, filter, add, and edit Knowledge Base documents. Optionally see a system warning banner when recent issues exist.

**Key elements**:
- **Optional system warning banner** (when there are recent warnings or errors): Amber bar at the **very top** of the KB content, above the document list and filters. Message: "System warning: retrieval issues detected in the last 24 hours. View System Health →" (link goes to System Health page). A dismiss control (e.g. X) hides the banner for this visit; it shows again on the next page load if issues are still present. Same idea as a notification banner in Gmail or Slack — visible but dismissible so it doesn’t block work.
- **Filters and document list**: Category, agent, status filters; table or list of documents with create/edit actions. (Existing behavior; no change to layout.)
- **Create/Edit drawer**: Slide-out or inline form for document details. (Existing behavior.)

**User actions**:
- Dismiss the banner → banner disappears until next full page load (if issues remain, it comes back).
- Click "View System Health →" → navigate to System Health page.
- Use filters and document list as today.

**Success state**: Banner appears only when there are recent warn/error events; dismissal works; link opens System Health. Document list and filters behave as today.

**Error state**: If the "do we show the banner?" check fails, don’t show the banner (fail closed). Document list errors are handled as they are today.

---

### Screen: System Health page

**Purpose**: Give admins a single place to see operational health: how many errors and warnings in the last 24 hours, when the last event was, and a full event log.

**Key elements**:
- **Same global chrome as admin**: "Back to app" and a way back to the main admin tabs (e.g. "Admin" or "Knowledge Base" link) so the user doesn’t feel stuck on a separate island. Same background and typography as the rest of admin (plum accents, light background).
- **Summary row at the top**: Three pieces of info in one row or small card: **Errors in last 24h: N**, **Warnings in last 24h: N**, **Last event: [time]** (or "—" if none). At a glance the admin knows if something is wrong.
- **"All systems healthy"**: When both error and warning counts are zero, show a clear green state (e.g. a green badge or short message like "All systems healthy") so the admin can see that nothing needs attention.
- **Event table**: Below the summary, a table with columns: **Time**, **Severity**, **Route**, **Event Type**, **Agent**, **Message**. Newest first. Severity is color-coded: grey for info, amber for warn, red for error — like status badges in GitHub or Linear. No need to open rows for the MVP; the table is the main focus.

**User actions**:
- Scan summary and table to see what failed or warned.
- Click "Back to app" or the admin link to leave.
- (Future: filter by severity or time; not in scope for this design.)

**Success state**: Summary matches the data; table loads and sorts by time; severity colors are consistent and readable.

**Error state**: If the event list or summary can’t load (e.g. API down), show a short message like "Couldn’t load system events. Try again later." and leave the page structure (header, back link) in place.

---

## Information Hierarchy

1. **Primary**: Where I am in admin (tab bar or System Health page) and the main action for that screen (e.g. "edit documents" on KB, "see health" on System Health).
2. **Secondary**: For System Health — summary (errors/warnings/last event) and the event table. For KB — the warning banner when present, then filters and document list.
3. **Tertiary**: "Back to app," success/error messages, and any helper text.

---

## Interaction Patterns

- **Tab navigation (admin home)**: Like Gmail’s primary tabs (Mail, Chat, Spaces) or a settings area with sections — one click switches context; URL updates so the view is shareable.
- **Banner (KB tab)**: Like Slack or Gmail notification banners — at the top, dismissible, with one main action (View System Health). Reappears on next load if the condition is still true so important issues aren’t forgotten.
- **System Health as its own page**: Like a "Status" or "Logs" page in many admin tools (e.g. Stripe Dashboard, Vercel) — dedicated URL, summary plus detail table, no tabs on the page itself.
- **Back / Admin link**: Like "Back to workspace" in Notion or "Exit admin" — always visible so the user can leave without using the browser back button.

---

## Design Decisions to Make

**Decision 1: Where does System Health live — tab vs separate page?**

- **Option A: Fourth tab on the admin bar**  
  - Pro: Everything in one place; one URL pattern (`?tab=health`).  
  - Con: Tab bar gets crowded (four items); health is used less often than KB or Prompt Control.

- **Option B: Separate page (`/admin/system-health`)**  
  - Pro: Tab bar stays at three items (KB, Prompt Control, Test Console). Health is a "drill-down" when something is wrong (from the banner or bookmark). Matches the spec (SEI-35).  
  - Con: User must navigate to a different URL; need a clear way back to the main admin tabs.

**Recommendation**: **Option B — separate page.** Keep the main admin bar focused on the three core tasks. System Health is a supporting view that admins can open **anytime** (via a permanent link in the admin bar) or when the banner tells them to. Add a clear "Admin" or "Knowledge Base" link on the System Health page so they can return to the tab bar in one click. **Important**: The banner only appears when there’s an issue; the System Health page itself is always accessible — admins are not blocked from viewing health when there are no recent errors.

---

**Decision 2: How does the user get back from System Health to the tab bar?**

- **Option A: "Back to app" only**  
  - Pro: Simple.  
  - Con: To get back to admin they must use the main app’s entry to admin again; no direct "back to admin home."

- **Option B: "Admin" or "Knowledge Base" link next to "Back to app"**  
  - Pro: One click from System Health to the admin tab bar (e.g. open admin and land on KB).  
  - Con: One more link to maintain; need a clear label ("Admin" vs "Knowledge Base").

**Recommendation**: **Option B.** On the System Health page, show both "Back to app" and something like **"← Admin"** or **"← Knowledge Base"** that goes to `/admin` (or `/admin?tab=kb`). That way admins who landed on System Health from the banner can return to the KB tab in one click.

---

**Decision 3: Banner placement and width**

- **Option A: Full width of the content area, below the tab bar**  
  - Pro: Consistent with the rest of the content (same max width as document list).  
  - Con: None significant.

- **Option B: Full viewport width**  
  - Pro: Very visible.  
  - Con: Can feel disconnected from the KB content; other admin tools usually keep alerts inside the content strip.

**Recommendation**: **Option A.** Banner sits at the top of the KB content area, same width as the document list and filters, so it feels part of the KB screen and doesn’t compete with the global tab bar.

---

**Decision 4: How do admins open System Health when there’s no banner?**

- **Option A: URL only** — Admins must know or bookmark `/admin/system-health`. The banner is the only in-app link when there’s an issue.
- **Option B: Permanent link in admin** — Add a "System Health" link (or icon) in the admin header/tab area (e.g. next to "Back to app" or as a fourth, lighter-weight entry) so admins can open the page anytime, with or without an active issue.

**Recommendation**: **Option B.** The banner only appears when there’s an issue; the page is always available. A permanent link makes that clear and lets admins check "all clear" or review event history without waiting for a warning.

---

## Accessibility Considerations

- **Keyboard navigation**: Tab through "Back to app," tab bar, then into content (banner link and dismiss if present, then filters and list). System Health page: tab through back link, summary, then table (and optionally into table rows if we add that later).
- **Screen readers**: Banner announced as an alert or region; "View System Health" as a link. Summary on System Health (errors/warnings/last event) readable as a group; table has proper headers so cells are associated with columns.
- **Mobile**: Tab bar wraps or scrolls horizontally if needed; System Health summary and table scroll horizontally or stack so key info is still visible. Banner full width of content so it’s readable on small screens.

---

## Brand Alignment

- **Visual**: Same as current admin — light background (#FDFBF7), plum accents, Lang Gothic (or existing admin font). System Health summary and table use the same palette; green "All systems healthy" and severity colors (grey, amber, red) stay within the existing token set where possible.
- **Voice**: Copy is direct and actionable: "System warning: retrieval issues detected… View System Health →" and "All systems healthy" — consistent with "Fresh perspectives with absolute accountability" and the vigilant, masterful tone.
- **Existing patterns**: Tab bar and "Back to app" already exist; this design adds one new page (System Health) and one new in-content element (banner). No new global navigation pattern.

**Suggested constitution update**: None required. This design reuses the existing admin layout and brand; if you later add more admin pages (e.g. more "drill-down" pages like System Health), consider documenting in CLAUDE.md that "Admin has a main tab bar (KB, Prompt Control, Test Console) and optional drill-down pages (e.g. System Health) reachable by link or URL."

---

## Things We're NOT Designing

- Login or permissions for the admin panel (same as today — no new auth in this design).
- Pagination or filters on the System Health table (MVP shows a fixed window of recent events; can add later).
- Notifications or sound when new errors occur (banner is on-load only; no real-time alerts).
- Mobile-specific admin layout (responsive use of current layout is enough for MVP).
- Any change to the main coach app (only admin entry and admin screens are in scope).

---

## Next Steps

1. Review this design exploration.
2. Confirm the design decisions above (System Health as separate page; back link to admin; banner inside content width).
3. I'll update the spec with any approved design details if needed.
4. Then you can run /plan (if not already done) and /implement to build it.
