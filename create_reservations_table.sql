CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id UUID REFERENCES lanes(id) ON DELETE CASCADE,
  shooter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  lane_name TEXT, -- cache for easier display
  shooter_name TEXT, -- cache
  category TEXT DEFAULT 'Treino',
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed, no_show
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow public read of reservations (for availability check)
CREATE POLICY "Public Read Reservations" ON reservations FOR SELECT TO public USING (true);

-- Allow public insert (for booking)
CREATE POLICY "Public Insert Reservations" ON reservations FOR INSERT TO public WITH CHECK (true);

-- Allow public update (for cancelling/admin)
CREATE POLICY "Public Update Reservations" ON reservations FOR UPDATE TO public USING (true);

-- Allow public delete
CREATE POLICY "Public Delete Reservations" ON reservations FOR DELETE TO public USING (true);
