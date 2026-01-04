-- Drop existing function to recreate with better logic
DROP FUNCTION IF EXISTS reset_ranking;

-- Recreate the function with SECURITY DEFINER and robust logic
CREATE OR REPLACE FUNCTION reset_ranking(new_season_name TEXT)
RETURNS VOID AS $$
DECLARE
    current_season_id UUID;
    p RECORD;
    r_count INTEGER := 1;
BEGIN
    -- 1. Try to close the currently active season
    UPDATE ranking_seasons 
    SET is_active = false, end_date = NOW() 
    WHERE is_active = true 
    RETURNING id INTO current_season_id;

    -- 2. If no active season existed, crate a "Legacy/Previous" holder season for the archives
    IF current_season_id IS NULL THEN
        INSERT INTO ranking_seasons (name, start_date, end_date, is_active)
        VALUES ('Temporada Anterior (Autogerada)', NOW() - INTERVAL '1 year', NOW(), false)
        RETURNING id INTO current_season_id;
    END IF;
    
    -- 3. Archive current points with ranks
    FOR p IN (SELECT id, ranking_points, level FROM profiles WHERE ranking_points > 0 ORDER BY ranking_points DESC) LOOP
        INSERT INTO ranking_archives (season_id, profile_id, final_points, final_level, final_rank)
        VALUES (current_season_id, p.id, p.ranking_points, p.level, r_count);
        r_count := r_count + 1;
    END LOOP;
    
    -- 4. Reset all profiles
    UPDATE profiles SET ranking_points = 0, level = 1;
    
    -- 5. Create new active season
    INSERT INTO ranking_seasons (name, is_active) VALUES (new_season_name, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS allows Admin interaction (or rely on SECURITY DEFINER for the function actions)
-- We need to add policies for insert/update if the frontend tries to manipulate directly, 
-- but since we use RPC, this is mostly covered. 
-- However, let's enable full access to these tables for authenticated users for now or keep public if simple.
ALTER TABLE ranking_seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Full Access Seasons" ON ranking_seasons;
CREATE POLICY "Full Access Seasons" ON ranking_seasons FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE ranking_archives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Full Access Archives" ON ranking_archives;
CREATE POLICY "Full Access Archives" ON ranking_archives FOR ALL TO public USING (true) WITH CHECK (true);
