-- Add AI Avatar URL column to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ai_avatar_url TEXT;
