-- Add document weight (adherence) to knowledge_base_documents.
-- Weight 1-10: used when injecting RAG context to prepend adherence note (1-4 background, 5 supporting, 6-10 core).

ALTER TABLE knowledge_base_documents
  ADD COLUMN IF NOT EXISTS weight integer NOT NULL DEFAULT 5;

COMMENT ON COLUMN knowledge_base_documents.weight IS 'Adherence 1-10: 1-4 background context, 5 supporting, 6-10 follow strictly';
