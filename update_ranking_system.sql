-- 1. Table for Ranking Seasons
CREATE TABLE IF NOT EXISTS ranking_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Archived Ranking Results
CREATE TABLE IF NOT EXISTS ranking_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES ranking_seasons(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  final_points INTEGER NOT NULL,
  final_level INTEGER NOT NULL,
  final_rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Function to Reset Ranking
CREATE OR REPLACE FUNCTION reset_ranking(new_season_name TEXT)
RETURNS VOID AS $$
DECLARE
    current_season_id UUID;
    p RECORD;
    r_count INTEGER := 1;
BEGIN
    -- Deactivate current season
    UPDATE ranking_seasons SET is_active = false, end_date = NOW() WHERE is_active = true RETURNING id INTO current_season_id;
    
    -- If no season active, just create one later
    
    -- Archive current points with ranks
    FOR p IN (SELECT id, ranking_points, level FROM profiles ORDER BY ranking_points DESC) LOOP
        INSERT INTO ranking_archives (season_id, profile_id, final_points, final_level, final_rank)
        VALUES (current_season_id, p.id, p.ranking_points, p.level, r_count);
        r_count := r_count + 1;
    END LOOP;
    
    -- Reset all profiles
    UPDATE profiles SET ranking_points = 0, level = 1;
    
    -- Create new active season
    INSERT INTO ranking_seasons (name, is_active) VALUES (new_season_name, true);
END;
$$ LANGUAGE plpgsql;

-- 4. Enable RLS
ALTER TABLE ranking_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_archives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Seasons" ON ranking_seasons FOR SELECT USING (true);
CREATE POLICY "Public Read Archives" ON ranking_archives FOR SELECT USING (true);
