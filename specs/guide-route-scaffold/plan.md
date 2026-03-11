## 📋 Implementation Plan: Guide Route Structure Scaffold

**Branch**: `SEI-37-guide-route-scaffold`
**Spec**: [specs/features/SEI-37-guide-route-scaffold.md](../features/SEI-37-guide-route-scaffold.md)
**Estimated Timeline**: 30 minutes

### What We're Building

Creating `/guide` route structure for internal SEI tools, parallel to `/coach` (client-facing).

### Files to Create

1. `app/guide/page.tsx` — Landing page for internal tools
2. `app/guide/assessment/page.tsx` — Placeholder for AI Assessment Coach

### Success Criteria

- `npm run build` exits with code 0
- `/guide` and `/guide/assessment` render without 404
- Zero changes to `app/coach/`
