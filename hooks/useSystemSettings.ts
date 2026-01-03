import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SystemSettings {
    id: string;
    club_name: string;
    address: string;
    phone: string;
    whatsapp: string;
    logo_url: string | null;
    hero_video_id: string;
    primary_color: string;
    instagram_url: string | null;
    facebook_url: string | null;
    email_contact: string | null;
    membership_card_template: string | null;
}

export function useSystemSettings() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();

        // Optional: Real-time subscription (Bonus)
        const subscription = supabase
            .channel('system_settings_changes')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'system_settings' },
                payload => {
                    setSettings(payload.new as SystemSettings);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .single();

            if (error) {
                console.error('Error fetching settings:', error);
                // Fallback or init could happen here if we had auto-init logic in frontend
            } else {
                setSettings(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading, refetch: fetchSettings };
}
