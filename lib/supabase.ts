import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbefcjripqlmryhqubdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZWZjanJpcHFsbXJ5aHF1YmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODIyMjUsImV4cCI6MjA4Mjk1ODIyNX0.fm6buOZKPww3kf2dY2Wj95nLP-p4jkYgjs4CmHmFxII';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: { 'x-application-name': 'ctc-shield' },
    },
    db: {
        schema: 'public'
    }
});

// Helper para verificar saúde da conexão
export const checkConnection = async () => {
    try {
        const { error } = await supabase.from('system_settings').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
};
