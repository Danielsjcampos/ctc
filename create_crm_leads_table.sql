-- Create CRM Leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'Web',
    status TEXT DEFAULT 'pending', -- pending, contacted, converted, lost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (Contact Form)
DROP POLICY IF EXISTS "Public Lead Insert" ON crm_leads;
CREATE POLICY "Public Lead Insert" ON crm_leads
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow public read (Admin Dashboard)
-- Ideally this should be authenticated only, but for this project matching others:
DROP POLICY IF EXISTS "Public Lead Access" ON crm_leads;
CREATE POLICY "Public Lead Access" ON crm_leads
FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Public Lead Update" ON crm_leads;
CREATE POLICY "Public Lead Update" ON crm_leads
FOR UPDATE 
TO public 
USING (true);

DROP POLICY IF EXISTS "Public Lead Delete" ON crm_leads;
CREATE POLICY "Public Lead Delete" ON crm_leads
FOR DELETE 
TO public 
USING (true);
