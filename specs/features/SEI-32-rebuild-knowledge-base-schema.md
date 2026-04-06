---
linear: https://linear.app/issue/SEI-32/rebuild-knowledge-base-schema
ticket: SEI-32
---

# Feature Specification: Rebuild Knowledge Base Schema

**Feature Branch**: `SEI-32-rebuild-knowledge-base-schema`
**Created**: 2026-03-08
**Status**: Draft
**Linear Ticket**: [SEI-32](https://linear.app/issue/SEI-32/rebuild-knowledge-base-schema)

**Input**: Replace the existing Q&A-based Knowledge Base (interview coach schema) with a new category-based schema. New tables `knowledge_base_documents` and `knowledge_base_chunks`; new Admin Knowledge Base tab UI; RAG retrieval filtered by agent assignment. Do not touch /coach, /coach/spin, scoring engine, or Prompt Control / Test Console tabs.

---

## Summary

The existing Knowledge Base in `/admin` was built for an interview coach and uses a Q&A document schema (Question, Company Insight, Best Practice, Problem Solving Framework) that does not fit the sales-coach platform. This spec replaces it entirely with:

1. **Supabase schema**: New `knowledge_base_documents` and `knowledge_base_chunks` tables; drop old `coach_documents`, `coach_chunks`, `document_taxonomies`.
2. **Admin UI**: New Knowledge Base tab — category-based Add/Edit document form and library with filters (category, agent, status). Assign documents to agents via `agents` array (or `['all']`).
3. **RAG retrieval**: Filter chunks by `agents @> ARRAY['all']` OR `agents @> ARRAY[agent_id]`; agent_id comes from the `agents` table at query time.

Out of scope: /coach, /coach/spin, session/scorecard pages, Prompt Control tab, Test Console tab UI, scoring engine.

---

## User Scenarios & Testing (mandatory)

### User Story 1 - New document schema and migration (Priority: P1)
As a developer, I can run a single migration that drops the old KB tables and creates `knowledge_base_documents` and `knowledge_base_chunks` with the specified columns and constraints, so the app can store and retrieve documents by category and agent.
**Why this priority**: Foundation for all KB and RAG behavior.
**Independent Test**: Apply `supabase/migrations/[timestamp]_rebuild_kb_schema.sql`; confirm old tables gone, new tables exist with correct columns and pgvector index on `knowledge_base_chunks.embedding`.
**Acceptance Scenarios**:
1. **Given** the migration file exists, **When** the migration is applied, **Then** `coach_chunks`, `document_taxonomies`, and `coach_documents` are dropped.
2. **Given** the migration has run, **When** I inspect the DB, **Then** `knowledge_base_documents` exists with `id`, `title`, `description`, `category`, `persona_type`, `content`, `agents` (text[]), `status` (draft | published), `created_at`, `updated_at` and category CHECK as specified.
3. **Given** the migration has run, **Then** `knowledge_base_chunks` exists with `document_id` (FK CASCADE), `content`, `embedding` vector(1536), `chunk_index`, `agents`, `category`, and an index on `embedding` for similarity search.

### User Story 2 - Add/Edit document in Admin (Priority: P1)
As an admin, I can add or edit a document in the Knowledge Base tab with required category (card selection), title (context-aware placeholder), optional description, required content (markdown), and required "Assign to Agents" (checkboxes plus "All Agents" option), and save as Draft or Publish; Publish chunks content and generates embeddings into `knowledge_base_chunks`.
**Why this priority**: Core flow for populating the new KB.
**Independent Test**: Open `/admin` → Knowledge Base → Add New Document; select category (e.g. Methodology), fill title and content, assign to one agent or All Agents; Save Draft then Edit and Publish; confirm document and chunks exist in DB.
**Acceptance Scenarios**:
1. **Given** I am on the Knowledge Base tab, **When** I click Add New Document, **Then** I see category cards (Methodology, Buyer Persona, Account Intelligence, CARRY1 Products, CARRY1 Capabilities, Case Studies, Evaluation Criteria) with descriptions; selecting Buyer Persona shows Archetype / Real Account sub-toggle.
2. **Given** I have selected a category and entered title and content and at least one agent, **When** I click Publish, **Then** the document is saved with status `published` and chunks are created with embeddings; **When** I click Save Draft, **Then** the document is saved with status `draft` and no chunks are created.
3. **Given** I have selected "All Agents", **Then** the document's `agents` is stored as `['all']` and individual agent checkboxes are dimmed.

### User Story 3 - Library and filters (Priority: P2)
As an admin, I can view the Knowledge Base library as a table (category badge, title, assigned agents, status, Edit, Delete) and filter by category, agent, and status (All / Published / Draft).
**Why this priority**: Required to manage and find documents.
**Independent Test**: Add several documents with different categories and agents; use filter dropdowns and confirm list updates; Edit opens the form pre-filled; Delete confirms and removes document (chunks cascade).
**Acceptance Scenarios**:
1. **Given** there are documents in the KB, **When** I view the Knowledge Base tab, **Then** I see a table with category badge (colored by category), title, assigned agents text ("All agents" or agent names), status pill, Edit and Delete buttons.
2. **Given** I change the Category (or Agent or Status) filter, **Then** the list refreshes to show only documents matching the filter.
3. **Given** I click Delete and confirm, **Then** the document and its chunks are removed.

### User Story 4 - RAG retrieval by agent (Priority: P1)
As the system, when an agent (e.g. coach) makes a RAG query, retrieval returns only chunks whose document is published and whose `agents` array contains `'all'` or the requesting agent's id.
**Why this priority**: Ensures each agent only sees KB content assigned to it.
**Independent Test**: Publish a document assigned to a specific agent; call retrieve with that agent_id and a query matching the content; confirm chunks returned; call with a different agent_id and confirm those chunks are not returned; assign a document to "All agents" and confirm both agents get its chunks.
**Acceptance Scenarios**:
1. **Given** a published document with `agents = ['all']`, **When** retrieval runs with any agent_id, **Then** its chunks can be returned (subject to similarity).
2. **Given** a published document with `agents = [specific_agent_id]`, **When** retrieval runs with that agent_id, **Then** its chunks can be returned; **When** retrieval runs with a different agent_id, **Then** its chunks are not returned.
3. **Given** coaching or the Test Console calls the retrieve API, **Then** the agent_id used is from the request body or defaults to the first active agent in the `agents` table.

### Edge Cases
- **No active agent**: If no agent has status `active`, retrieve API returns 404; coaching uses empty agentId and only chunks with `agents @> ['all']` can match.
- **Draft documents**: Never appear in RAG; only `status = 'published'` documents are queried.
- **Import CSV**: The previous CSV import endpoint is retired (410); admins use Add New Document only.
- **Strictness / metadata**: New schema has no strictness_override or taxonomy metadata; retrieval returns documentType = category and null strictness; coaching strictness grouping still runs with defaults for unknown types.

---

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: System MUST provide a migration that drops `coach_chunks`, `document_taxonomies`, and `coach_documents` and creates `knowledge_base_documents` and `knowledge_base_chunks` with the specified columns, types, and indexes.
- **FR-002**: System MUST support document categories: methodology, buyer_persona, account_intelligence, sei_products, sei_capabilities, case_studies, evaluation_criteria; and for buyer_persona, persona_type archetype | real_account.
- **FR-003**: System MUST store per-document `agents` as text[] (e.g. `['all']` or specific agent IDs); chunks MUST copy `agents` and `category` from the parent document for efficient filtering.
- **FR-004**: Admin Knowledge Base tab MUST list agents from the `agents` table (all statuses) for "Assign to Agents" and for the agent filter; "All Agents" MUST set `agents = ['all']`.
- **FR-005**: On Publish, system MUST chunk content, generate embeddings, and insert into `knowledge_base_chunks`; on Save Draft, system MUST NOT create or update chunks.
- **FR-006**: RAG retrieval MUST filter chunks by `(agents @> ARRAY['all'] OR agents @> ARRAY[agent_id])` and only published documents; agent_id at query time MUST come from the agents table (e.g. first active agent or request body).

### Key Entities
- **knowledge_base_documents**: id, title, description, category, persona_type (optional), content, agents (text[]), status (draft | published), created_at, updated_at.
- **knowledge_base_chunks**: id, document_id (FK CASCADE), content, embedding vector(1536), chunk_index, agents, category, created_at.
- **Agent** (existing): id (agent_id), name, status, etc.; used for assignment list and retrieval filter.

### Non-Functional Requirements
- **NFR-001**: Admin UI MUST match existing admin panel dark styling (plum, borders, rounded-xl, etc.).
- **NFR-002**: Do not modify /coach, /coach/spin, session/scorecard pages, Prompt Control tab, Test Console tab UI, or scoring engine files.

---

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: Migration runs successfully against Supabase; old KB tables removed, new tables and index present.
- **SC-002**: Admin can create and publish a document with a chosen category and agent assignment; document and chunks appear in DB; Edit and Delete work; filters narrow the list correctly.
- **SC-003**: Retrieve API and coaching use agent-scoped retrieval; only chunks assigned to the requesting agent (or to "all") are returned.
- **SC-004**: TypeScript build and lint pass; no changes to coach, spin, scorecard, Prompt Control, Test Console, or scoring code paths beyond wiring retrieval to agentId.
