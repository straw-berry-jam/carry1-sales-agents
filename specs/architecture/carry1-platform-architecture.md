# CARRY1 Platform Architecture

**Status**: Approved  
**Updated**: 2026-03-19  
**Author**: Charlie Miner

---

## Overview

CARRY1 is a two-surface AI coaching platform built on a single shared backend.
All products — client-facing and internal — draw from the same knowledge base,
agent configs, and RAG pipeline.

---

## Two Surfaces, One Backend

### Surface 1 — Client-Facing (Public)
Products your sister's clients discover, test, and use.

| Route | Product | Status |
|-------|---------|--------|
| `/sales-coach` | CARRY1 Sales Coach | Live |
| `/compass` | CARRY1 Compass | Planned |
| `/training` | Training tools | Future |

For now: standalone pages per product.
Eventually: aggregated on a marketing homepage at `/`.

### Surface 2 — Internal (Operator-Facing)
Tools your sister uses to run her business. Aggregated under `/admin`.

| Route | Tool | Status |
|-------|------|--------|
| `/admin` | Dashboard (aggregates all internal tools) | Planned |
| `/admin/compass` | Compass — run interviews, input transcripts, get readouts | Planned |
| `/admin/knowledge-base` | KB management | Live (migrate from current `/admin`) |
| `/admin/prompt-control` | Agent config | Live (migrate from current `/admin`) |
| `/admin/health` | System health | Live (migrate from current `/admin`) |

### Authentication
- **Client-facing**: No auth required (public)
- **Internal `/admin`**: Security by obscurity for now (non-public URL)
- **Future**: Add password protection or SSO to `/admin/*` as a single upgrade

---

## Shared Backend

All surfaces share:
- **Supabase** — PostgreSQL + pgvector knowledge base
- **RAG pipeline** — OpenAI embeddings, similarity search
- **Agent configs** — `lib/agentConfig.ts`
- **KB categories** — `methodology`, `buyer_persona`, `account_intelligence`,
  `carry1_products`, `carry1_capabilities`, `case_studies`, `evaluation_criteria`

KB documents use `agents[]` scoping to control which docs feed which tool.
`agents = ['all']` means universal. Per-agent scoping uses the agent UUID.

---

## CARRY1 Compass — Product Definition

Compass interviews sales team members and anonymously sends structured
feedback to the CRO based on a shared heuristic framework.

### Client-Facing (`/compass`)
- Sales rep completes a voice or text interview with the Compass agent
- Responses are anonymous
- Feedback is scored against the CARRY1 heuristic and sent to the CRO

### Internal (`/admin/compass`)
- Your sister can run interviews herself
- Can input transcripts manually (paste or upload)
- Gets the same scored readout as the client-facing tool
- Can review all submitted feedback in aggregate

### Shared
- Same underlying agent and KB as client-facing
- Same scoring heuristic
- Same RAG pipeline

---

## Product Naming Conventions

| Product | Client route | Internal route | Agent name |
|---------|-------------|----------------|------------|
| Sales Coach | `/sales-coach` | — | Liz |
| Compass | `/compass` | `/admin/compass` | TBD |
| Training (future) | `/training` | `/admin/training` | TBD |

---

## Route Migration Notes

Current `/coach/*` routes serve the Sales Coach. These should be aliased or
redirected to `/sales-coach` when convenient — but do NOT break them before
confirming no live links point to `/coach`.

Current `/guide/*` routes can be retired or repurposed for future internal tools.

---

## Build Order (Recommended)

1. ✅ Sales Coach reskin (done)
2. Update `CLAUDE.md` with this architecture (done)
3. Migrate current `/admin` tabs into `/admin` dashboard layout
4. Build Compass client-facing (`/compass`)
5. Build Compass internal (`/admin/compass`)
6. Build marketing homepage (`/`) aggregating client products
