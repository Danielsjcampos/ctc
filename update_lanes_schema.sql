-- Add missing columns to lanes table to support full management
ALTER TABLE lanes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lanes ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 25;
ALTER TABLE lanes ADD COLUMN IF NOT EXISTS max_caliber TEXT DEFAULT '.45 ACP';

-- Enable RLS
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;

-- Create policies for lanes
DROP POLICY IF EXISTS "Public Select Lanes" ON lanes;
CREATE POLICY "Public Select Lanes" ON lanes FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Insert Lanes" ON lanes;
CREATE POLICY "Public Insert Lanes" ON lanes FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Lanes" ON lanes;
CREATE POLICY "Public Update Lanes" ON lanes FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Public Delete Lanes" ON lanes;
CREATE POLICY "Public Delete Lanes" ON lanes FOR DELETE TO public USING (true);
