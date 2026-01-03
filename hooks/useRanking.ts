
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RankingMember {
    id: string;
    name: string;
    membership_type: string;
    ranking_points: number;
    level: number;
}

export const useRanking = () => {
    const [ranking, setRanking] = useState<RankingMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRanking = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, membership_type, ranking_points, level')
                .gt('ranking_points', 0)
                .order('ranking_points', { ascending: false })
                .limit(20);

            if (error) throw error;
            setRanking(data || []);
        } catch (err) {
            console.error('Error fetching ranking:', err);
        } finally {
            setLoading(false);
        }
    };

    const getUserRank = async (userId: string) => {
        try {
            // Conta quantos perfis têm mais pontos que o usuário atual
            const { data: userPoints } = await supabase
                .from('profiles')
                .select('ranking_points')
                .eq('id', userId)
                .single();

            if (!userPoints) return null;

            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('ranking_points', userPoints.ranking_points);

            if (error) throw error;
            return (count || 0) + 1;
        } catch (err) {
            console.error('Error getting user rank:', err);
            return null;
        }
    };

    const resetRankingSeason = async (seasonName: string) => {
        try {
            // Chama a função RPC reset_ranking que criamos no SQL
            const { error } = await supabase.rpc('reset_ranking', { new_season_name: seasonName });
            if (error) throw error;
            fetchRanking();
            return { success: true };
        } catch (err) {
            console.error('Error resetting ranking:', err);
            return { success: false, error: err };
        }
    };

    useEffect(() => {
        fetchRanking();

        // Subscribe to points updates
        const subscription = supabase
            .channel('ranking_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchRanking();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { ranking, loading, refresh: fetchRanking, getUserRank, resetRankingSeason };
};
