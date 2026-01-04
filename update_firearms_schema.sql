-- Ensure owner_id is nullable for Club weapons
ALTER TABLE firearms ALTER COLUMN owner_id DROP NOT NULL;

-- Add a type column for easier categorization (optional but good for future)
ALTER TABLE firearms ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'handgun'; -- handgun, rifle, shotgun
