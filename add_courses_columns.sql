-- Add start_time and end_time columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_time TEXT;
