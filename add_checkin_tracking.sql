-- Add check-in tracking columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_checked_in BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_check_out TIMESTAMP WITH TIME ZONE;

-- Create a table for Visits Logs (General Club Access Log) separate from shooting sessions if needed, 
-- but for now we can rely on club_sessions for tracking shooting, and this flag for pure presence.
-- However, to have a "Report" of visits, we should log every check-in/out event.
-- Let's create a 'access_logs' table for security/reports.

CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    check_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_at TIMESTAMP WITH TIME ZONE,
    type TEXT DEFAULT 'MEMBER', -- MEMBER, VISITOR
    status TEXT DEFAULT 'open' -- open, closed
);

-- RLS for access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access Logs Read" ON access_logs;
CREATE POLICY "Public Access Logs Read" ON access_logs FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Access Logs Insert" ON access_logs;
CREATE POLICY "Public Access Logs Insert" ON access_logs FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Logs Update" ON access_logs;
CREATE POLICY "Public Access Logs Update" ON access_logs FOR UPDATE TO public USING (true);
