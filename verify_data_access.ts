
import { createClient } from '@supabase/supabase-js';

// Using credentials from lib/supabase.ts
const supabaseUrl = 'https://jbefcjripqlmryhqubdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZWZjanJpcHFsbXJ5aHF1YmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODIyMjUsImV4cCI6MjA4Mjk1ODIyNX0.fm6buOZKPww3kf2dY2Wj95nLP-p4jkYgjs4CmHmFxII';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAccess() {
    console.log("--- Starting Verification ---");

    // 1. Fetch Profiles
    console.log("Attempting to fetch profiles...");
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

    if (profilesError) {
        console.error("❌ Error fetching profiles:", profilesError.message);
    } else {
        console.log(`✅ Profiles fetch successful. Count: ${profiles?.length}`);
        if (profiles && profiles.length > 0) {
            console.log("Sample profile:", profiles[0]);
        } else {
            console.warn("⚠️ Profiles table is empty!");
        }
    }

    // 2. Fetch Sales
    console.log("\nAttempting to fetch sales...");
    const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*');

    if (salesError) {
        console.error("❌ Error fetching sales:", salesError.message);
    } else {
        console.log(`✅ Sales fetch successful. Count: ${sales?.length}`);
    }
}

verifyAccess();
