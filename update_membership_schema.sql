
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
