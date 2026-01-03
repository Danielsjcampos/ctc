
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface CRMLead {
    id: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
    source: string;
    status: string;
    created_at: string;
}

export function useCRM() {
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();

        const subscription = supabase
            .channel('crm_leads_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, () => {
                fetchLeads();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchLeads() {
        try {
            const { data, error } = await supabase
                .from('crm_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching CRM leads:', err);
        } finally {
            setLoading(false);
        }
    }

    const submitLead = async (leadData: { name: string; email: string; phone: string; message?: string, source?: string }) => {
        try {
            const { error } = await supabase
                .from('crm_leads')
                .insert([leadData]);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error submitting CRM lead:', err);
            return { success: false, error: err };
        }
    };

    const updateLeadStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('crm_leads')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error updating lead status:', err);
            return { success: false, error: err };
        }
    };

    const deleteLead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('crm_leads')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error deleting lead:', err);
            return { success: false, error: err };
        }
    };

    return { leads, loading, submitLead, updateLeadStatus, deleteLead, refresh: fetchLeads };
}
