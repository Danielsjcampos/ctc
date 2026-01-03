-- FIX PERMISSIONS FOR CLUB SESSIONS (HABITUALITY)

-- 1. Enable RLS (if not already)
ALTER TABLE club_sessions ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Read (for Admin Reporting) and Insert (for Creating Sessions)
DROP POLICY IF EXISTS "Allow public read club_sessions" ON club_sessions;
CREATE POLICY "Allow public read club_sessions" ON club_sessions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert club_sessions" ON club_sessions;
CREATE POLICY "Allow public insert club_sessions" ON club_sessions FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update club_sessions" ON club_sessions;
CREATE POLICY "Allow public update club_sessions" ON club_sessions FOR UPDATE TO public USING (true);

-- 3. Also ensure Profiles are readable by public (needed for the join queries in reports)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT TO public USING (true);
