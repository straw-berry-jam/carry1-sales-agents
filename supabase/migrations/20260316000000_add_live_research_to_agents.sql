-- SEI-39: Live Research per-agent toggle.
-- Adds live_research_enabled to agents; when true, voice sessions can fetch company brief at session start.
ALTER TABLE agents ADD COLUMN IF NOT EXISTS live_research_enabled boolean NOT NULL DEFAULT false;
