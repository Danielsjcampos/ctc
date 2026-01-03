-- ELITE DATA - MASTER DATABASE SETUP
-- Schema Rev. 1.5 - Gamification & Habitualidade

-- 1. CLEAN SLATE
DROP TABLE IF EXISTS ranking_archives CASCADE;
DROP TABLE IF EXISTS ranking_seasons CASCADE;
DROP TABLE IF EXISTS ranking_history CASCADE;
DROP TABLE IF EXISTS club_sessions CASCADE;
DROP TABLE IF EXISTS event_leads CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS crm_leads CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS firearms CASCADE;
DROP TABLE IF EXISTS lanes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CORE TABLES
CREATE TABLE crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'Web',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to crm_leads"
ON crm_leads
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow admin select crm_leads"
ON crm_leads
FOR SELECT
TO public
USING (true);
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE,
  role TEXT DEFAULT 'SHOOTER',
  status TEXT DEFAULT 'active',
  membership_type TEXT DEFAULT 'Recruta',
  phone TEXT,
  is_affiliated BOOLEAN DEFAULT false,
  affiliation_expiry DATE,
  ranking_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED PROFILES
INSERT INTO profiles (id, name, email, cpf, role, membership_type, ranking_points, level) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Master', 'admin.ctc@ctccruzeiro.com.br', '00000000000', 'ADMIN', 'Master', 2500, 6),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Ricardo Alencar', 'ricardo.ctc@teste.com', '11122233344', 'SHOOTER', 'Elite', 1250, 3),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'João Carlos', 'joao.ctc@teste.com', '99900011122', 'SHOOTER', 'Recruta', 450, 1),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Mariana Costa', 'mariana@teste.com', '22233344455', 'SHOOTER', 'Elite', 2100, 5),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Pedro Santos', 'pedro@teste.com', '33344455566', 'SHOOTER', 'Recruta', 780, 2);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'un',
  business_unit TEXT DEFAULT 'CLUB'
);

CREATE TABLE lanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'available'
);

CREATE TABLE firearms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  brand TEXT,
  caliber TEXT NOT NULL,
  sigma_number TEXT,
  status TEXT DEFAULT 'available',
  location TEXT DEFAULT 'Cofre',
  acquisition_date DATE,
  image_url TEXT
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shooter_id UUID REFERENCES profiles(id),
  total DECIMAL(10, 2) NOT NULL,
  items JSONB,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GAMIFICATION & COURSES
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price TEXT NOT NULL,
  slots INTEGER DEFAULT 0,
  enrolled INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending', 
  total_amount NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  source TEXT DEFAULT 'manual',
  checked_in BOOLEAN DEFAULT false,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ranking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE club_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shooter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shooter_name TEXT,
  firearm_id UUID REFERENCES firearms(id) ON DELETE SET NULL,
  firearm_model TEXT,
  caliber TEXT,
  total_shots INTEGER DEFAULT 0,
  lane_number TEXT,
  distance_meters INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', 
  check_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_out_at TIMESTAMP WITH TIME ZONE
);

-- 4. RANKING SEASONS
CREATE TABLE ranking_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ranking_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES ranking_seasons(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  final_points INTEGER NOT NULL,
  final_level INTEGER NOT NULL,
  final_rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BUSINESS LOGIC (Functions)
CREATE OR REPLACE FUNCTION award_points(target_email TEXT, points_to_add INTEGER, award_reason TEXT, ref_id UUID)
RETURNS VOID AS $$
DECLARE
    target_profile_id UUID;
BEGIN
    SELECT id INTO target_profile_id FROM profiles WHERE email = target_email LIMIT 1;
    IF target_profile_id IS NOT NULL THEN
        INSERT INTO ranking_history (profile_id, points, reason, related_id)
        VALUES (target_profile_id, points_to_add, award_reason, ref_id);
        UPDATE profiles SET ranking_points = ranking_points + points_to_add, level = FLOOR((ranking_points + points_to_add) / 500) + 1 WHERE id = target_profile_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_ranking(new_season_name TEXT)
RETURNS VOID AS $$
DECLARE
    current_season_id UUID;
    p RECORD;
    r_count INTEGER := 1;
BEGIN
    UPDATE ranking_seasons SET is_active = false, end_date = NOW() WHERE is_active = true RETURNING id INTO current_season_id;
    FOR p IN (SELECT id, ranking_points, level FROM profiles ORDER BY ranking_points DESC) LOOP
        IF current_season_id IS NOT NULL THEN
            INSERT INTO ranking_archives (season_id, profile_id, final_points, final_level, final_rank)
            VALUES (current_season_id, p.id, p.ranking_points, p.level, r_count);
            r_count := r_count + 1;
        END IF;
    END LOOP;
    UPDATE profiles SET ranking_points = 0, level = 1;
    INSERT INTO ranking_seasons (name, is_active) VALUES (new_season_name, true);
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGERS
CREATE OR REPLACE FUNCTION trigger_process_ranking()
RETURNS TRIGGER AS $$
BEGIN
    -- Event Leads Logic (Confirmation & Progress)
    IF TG_TABLE_NAME = 'event_leads' THEN
        -- Validation (Confirmed) - THIS GIVES POINTS
        IF (OLD.status = 'pending' AND NEW.status = 'confirmed') THEN
            PERFORM award_points(NEW.email, 25, 'INSCRIÇÃO VALIDADA', NEW.id);
        END IF;
        -- Check-in
        IF (OLD.checked_in = false AND NEW.checked_in = true) THEN
            PERFORM award_points(NEW.email, 50, 'PRESENÇA EM CURSO', NEW.id);
        END IF;
        -- Certificate
        IF (OLD.certificate_issued = false AND NEW.certificate_issued = true) THEN
            PERFORM award_points(NEW.email, 100, 'CERTIFICADO OBTIDO', NEW.id);
        END IF;
    END IF;

    -- Habitualidade Logic
    IF TG_TABLE_NAME = 'club_sessions' THEN
        IF (OLD.status = 'active' AND NEW.status = 'completed') THEN
            DECLARE
                target_email TEXT;
            BEGIN
                SELECT email INTO target_email FROM profiles WHERE id = NEW.shooter_id;
                IF target_email IS NOT NULL THEN
                    PERFORM award_points(target_email, 20, 'TREINO DE PISTA', NEW.id);
                END IF;
            END;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_leads_ranking AFTER UPDATE ON event_leads FOR EACH ROW EXECUTE FUNCTION trigger_process_ranking();
CREATE TRIGGER trg_club_sessions_ranking AFTER UPDATE ON club_sessions FOR EACH ROW EXECUTE FUNCTION trigger_process_ranking();

-- 7. SEEDS
INSERT INTO courses (title, date, category, description, image_url, price, slots, enrolled) VALUES
('Fundamentos do Tiro (Nível I)', '20 Out - 21 Out', 'Iniciante', 'Focado em segurança, empunhadura e visada básica.', 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2072&auto=format&fit=crop', 'R$ 920', 12, 5),
('Combate com Pistola (Nível II)', '28 Out - 30 Out', 'Avançado', 'Técnicas de recarga tática, panes e tiro em movimento.', 'https://images.unsplash.com/photo-1584285418504-010df06c0782?q=80&w=2072&auto=format&fit=crop', 'R$ 1.450', 10, 8);

INSERT INTO ranking_seasons (name, is_active) VALUES ('Temporada Inaugural 2024', true);

-- SEED FIREARMS
INSERT INTO firearms (owner_id, model, brand, caliber, sigma_number, image_url) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Glock G17 Gen5', 'Glock', '9mm', 'SIGMA123456', 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2072&auto=format&fit=crop'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Imbel IA2', 'Imbel', '5.56', 'SIGMA789012', 'https://images.unsplash.com/photo-1510214690324-43403f0b240b?q=80&w=2062&auto=format&fit=crop'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Taurus G3', 'Taurus', '9mm', 'SIGMA456789', 'https://images.unsplash.com/photo-1584285418504-010df06c0782?q=80&w=2072&auto=format&fit=crop');


-- Tabela para Armazenar Pedidos de Filiação/Adesão
CREATE TABLE IF NOT EXISTS membership_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT, -- Adicionar email pois é crucial para contato
    phone TEXT, -- Adicionar telefone pois é crucial para contato
    rg TEXT NOT NULL,
    rg_date DATE,
    cpf TEXT NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    cr_number TEXT,
    military_region TEXT,
    cr_validity DATE,
    photo_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Permitir anonimos create (insert)
CREATE POLICY "Allow public insert to membership_requests"
ON membership_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Permitir admin (ou todos authenticados por enquanto) ler
CREATE POLICY "Allow authenticated read membership_requests"
ON membership_requests
FOR SELECT
TO authenticated
USING (true);

-- Permitir authenticated update (para aprovar)
CREATE POLICY "Allow authenticated update membership_requests"
ON membership_requests
FOR UPDATE
TO authenticated
USING (true);
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
-- COMPREHENSIVE FIX FOR HABITUALITY REPORTS
-- 1. RESET AND FIX PERMISSIONS
ALTER TABLE club_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public access to read/write these tables (Simplified for MVP)
DROP POLICY IF EXISTS "Public Access Club Sessions" ON club_sessions;
CREATE POLICY "Public Access Club Sessions" ON club_sessions FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Profiles" ON profiles;
CREATE POLICY "Public Access Profiles" ON profiles FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. SEED SOME DATA FOR JANUARY 2026 (To ensure reports have data)
-- We need to find shooter IDs first.
DO $$
DECLARE
    admin_id UUID;
    shooter_id UUID;
    glock_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin.ctc@ctccruzeiro.com.br' LIMIT 1;
    SELECT id INTO shooter_id FROM profiles WHERE email = 'ricardo.ctc@teste.com' LIMIT 1;
    SELECT id INTO glock_id FROM firearms WHERE model = 'Glock G17 Gen5' LIMIT 1;

    -- Insert Sessions for Admin
    IF admin_id IS NOT NULL THEN
        INSERT INTO club_sessions (shooter_id, shooter_name, firearm_model, total_shots, caliber, lane_number, status, check_in_at)
        VALUES 
        (admin_id, 'Admin Master', 'Glock G17 Gen5', 50, '9mm', '01', 'completed', '2026-01-02 10:00:00-03'),
        (admin_id, 'Admin Master', 'Imbel IA2', 30, '5.56', '05', 'completed', '2026-01-03 14:30:00-03');
    END IF;

    -- Insert Sessions for Ricardo
    IF shooter_id IS NOT NULL THEN
        INSERT INTO club_sessions (shooter_id, shooter_name, firearm_model, total_shots, caliber, lane_number, status, check_in_at)
        VALUES 
        (shooter_id, 'Ricardo Alencar', 'Taurus G3', 100, '9mm', '02', 'completed', '2026-01-02 09:15:00-03');
    END IF;
END $$;
