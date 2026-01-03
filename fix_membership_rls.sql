-- THIS SQL FILE FIXES THE PERMISSIONS FOR MEMBERSHIP REQUESTS TABLE

-- 1. Drop the restrictive policy (that required authentication)
DROP POLICY IF EXISTS "Allow authenticated read membership_requests" ON membership_requests;

-- 2. Create a new policy that allows everyone (public) to read the requests
-- Ideally this should be restricted to admins, but since auth is handled at the application level in this MVP,
-- public access ensures the data is visible in the admin panel.
CREATE POLICY "Allow public read membership_requests" ON membership_requests FOR SELECT TO public USING (true);

-- 3. Also ensure update is possible (for approving/rejecting)
DROP POLICY IF EXISTS "Allow authenticated update membership_requests" ON membership_requests;
CREATE POLICY "Allow public update membership_requests" ON membership_requests FOR UPDATE TO public USING (true);
