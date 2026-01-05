-- Migration to add ai_enabled column to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;
