-- Add AI configuration columns to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'openai';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ai_api_key TEXT;
