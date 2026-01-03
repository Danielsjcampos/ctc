
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Course {
    id: string;
    title: string;
    date: string;
    start_time?: string;
    end_time?: string;
    category: string;
    description: string;
    image_url: string;
    price: string;
    slots: number;
    enrolled: number;
}

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();

        const subscription = supabase
            .channel('courses_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
                fetchCourses();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_leads' }, () => {
                // Also refresh if leads change (might affect enrolled count)
                fetchCourses();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchCourses() {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    }

    const saveCourse = async (courseData: Partial<Course>) => {
        try {
            // 1. Separate id and cleanup calculated/meta fields
            const { id, enrolled, is_active, created_at, ...payload } = courseData as any;

            if (id && id !== '') {
                // Update
                const { error } = await supabase
                    .from('courses')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                // Insert - do NOT include the id key at all if it's new
                const { error } = await supabase
                    .from('courses')
                    .insert([payload]);
                if (error) throw error;
            }
            return { success: true };
        } catch (err) {
            console.error('Error saving course:', err);
            return { success: false, error: err };
        }
    };

    const deleteCourse = async (id: string) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ is_active: false })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error deleting course:', err);
            return { success: false, error: err };
        }
    };

    const registerLead = async (courseId: string, leadData: {
        name: string;
        email: string;
        phone: string;
        total_amount?: number;
        amount_paid?: number;
        payment_method?: string;
        source?: string;
    }) => {
        try {
            // First increment enrolled count
            const course = courses.find(c => c.id === courseId);
            if (course) {
                await supabase
                    .from('courses')
                    .update({ enrolled: (course.enrolled || 0) + 1 })
                    .eq('id', courseId);
            }

            const payment_status = !leadData.amount_paid || leadData.amount_paid === 0
                ? 'pending'
                : (leadData.amount_paid >= (leadData.total_amount || 0) ? 'paid' : 'partial');

            const { data: lead, error } = await supabase
                .from('event_leads')
                .insert([{
                    course_id: courseId,
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone,
                    total_amount: leadData.total_amount || 0,
                    amount_paid: leadData.amount_paid || 0,
                    payment_status,
                    payment_method: leadData.payment_method,
                    source: leadData.source || 'manual',
                    status: leadData.source === 'frontend' ? 'pending' : 'confirmed'
                }])
                .select()
                .single();

            if (error) throw error;

            // Create financial transaction if there was a payment
            if (leadData.amount_paid && leadData.amount_paid > 0) {
                await supabase
                    .from('financial_transactions')
                    .insert([{
                        type: 'income',
                        amount: leadData.amount_paid,
                        description: `Matrícula: ${leadData.name} - ${course?.title}`,
                        category: 'Cursos',
                        status: 'paid',
                        payment_date: new Date().toISOString(),
                        payment_method: leadData.payment_method,
                        related_id: lead.id
                    }]);
            }

            return { success: true };
        } catch (err) {
            console.error('Error registering lead:', err);
            return { success: false, error: err };
        }
    };

    const fetchLeads = async (courseId: string) => {
        try {
            const { data, error } = await supabase
                .from('event_leads')
                .select('*')
                .eq('course_id', courseId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error fetching leads:', err);
            return [];
        }
    };

    const addPayment = async (leadId: string, amount: number, method: string) => {
        try {
            // Get current lead data
            const { data: lead, error: fetchError } = await supabase
                .from('event_leads')
                .select('*')
                .eq('id', leadId)
                .single();

            if (fetchError) throw fetchError;

            const newAmountPaid = (lead.amount_paid || 0) + amount;
            const newStatus = newAmountPaid >= lead.total_amount ? 'paid' : 'partial';

            // Update lead
            const { error: updateError } = await supabase
                .from('event_leads')
                .update({
                    amount_paid: newAmountPaid,
                    payment_status: newStatus,
                    payment_method: method
                })
                .eq('id', leadId);

            if (updateError) throw updateError;

            // Get course title for description
            const course = courses.find(c => c.id === lead.course_id);

            // Record transaction
            await supabase
                .from('financial_transactions')
                .insert([{
                    type: 'income',
                    amount: amount,
                    description: `Pagamento Restante: ${lead.name} - ${course?.title || 'Curso'}`,
                    category: 'Cursos',
                    status: 'paid',
                    payment_date: new Date().toISOString(),
                    payment_method: method,
                    related_id: leadId
                }]);

            return { success: true };
        } catch (err) {
            console.error('Error adding payment:', err);
            return { success: false, error: err };
        }
    };

    const toggleCheckIn = async (leadId: string, status: boolean) => {
        try {
            const { error } = await supabase
                .from('event_leads')
                .update({ checked_in: status })
                .eq('id', leadId);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error toggling check-in:', err);
            return { success: false, error: err };
        }
    };

    const issueCertificate = async (leadId: string, status: boolean) => {
        try {
            const certCode = status ? `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null;
            const { error } = await supabase
                .from('event_leads')
                .update({
                    certificate_issued: status,
                    certificate_code: certCode
                })
                .eq('id', leadId);

            if (error) throw error;
            return { success: true, code: certCode };
        } catch (err) {
            console.error('Error issuing certificate:', err);
            return { success: false, error: err };
        }
    };

    const updateLead = async (leadId: string, data: any) => {
        try {
            const { error } = await supabase
                .from('event_leads')
                .update(data)
                .eq('id', leadId);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error updating lead:', err);
            return { success: false, error: err };
        }
    };

    const confirmLead = async (leadId: string) => {
        try {
            const { error } = await supabase
                .from('event_leads')
                .update({ status: 'confirmed' })
                .eq('id', leadId);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error confirming lead:', err);
            return { success: false, error: err };
        }
    };

    const deleteLead = async (leadId: string, courseId: string) => {
        try {
            const { error } = await supabase
                .from('event_leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;

            // Decrement enrolled count
            const course = courses.find(c => c.id === courseId);
            if (course) {
                await supabase
                    .from('courses')
                    .update({ enrolled: Math.max(0, (course.enrolled || 1) - 1) })
                    .eq('id', courseId);
            }

            return { success: true };
        } catch (err) {
            console.error('Error deleting lead:', err);
            return { success: false, error: err };
        }
    };

    return {
        courses,
        loading,
        saveCourse,
        deleteCourse,
        registerLead,
        fetchLeads,
        toggleCheckIn,
        issueCertificate,
        addPayment,
        updateLead,
        confirmLead,
        deleteLead,
        refresh: fetchCourses
    };
}
