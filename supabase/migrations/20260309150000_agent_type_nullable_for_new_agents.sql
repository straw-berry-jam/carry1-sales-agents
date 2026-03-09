-- Allow agent_type to be null for new agents.
-- Existing rows keep their value (e.g. 'Guide'); new inserts can omit agent_type.
--
-- When adding a new agent (dev task): do you want to set agent_type in the insert
-- (e.g. 'Guide') or leave it null so the admin assigns it in Prompt Control before
-- activating? Null = admin sees "Select type..." and must assign before toggling Active.

ALTER TABLE agents
  ALTER COLUMN agent_type DROP NOT NULL,
  ALTER COLUMN agent_type SET DEFAULT NULL;
