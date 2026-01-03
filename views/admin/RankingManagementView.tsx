
import React, { useState, useEffect } from 'react';
import { Trophy, History, RefreshCw, Star, Save, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRanking } from '../../hooks/useRanking';
import { Button } from '../../components/ui/button';

const RankingManagementView: React.FC = () => {
    const { ranking, refresh, resetRankingSeason } = useRanking();
    const [seasons, setSeasons] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [newSeasonName, setNewSeasonName] = useState('');
    const [selectedHistory, setSelectedHistory] = useState<any | null>(null);

    const fetchSeasons = async () => {
        const { data } = await supabase
            .from('ranking_seasons')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setSeasons(data);
    };

    const fetchHistory = async (seasonId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('ranking_archives')
            .select('*, profiles(name)')
            .eq('season_id', seasonId)
            .order('final_rank', { ascending: true });

        if (data) {
            const season = seasons.find(s => s.id === seasonId);
            setSelectedHistory({ season, data });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSeasons();
    }, []);

    const handleReset = async () => {
        if (!newSeasonName) return;
        setLoading(true);
        const result = await resetRankingSeason(newSeasonName);
        if (result.success) {
            setShowResetModal(false);
            setNewSeasonName('');
            fetchSeasons();
            refresh();
            alert('Ranking resetado com sucesso! Ciclo arquivado.');
        } else {
            alert('Erro ao resetar ranking.');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">RANKING <span className="text-red-600">MANAGEMENT</span></h1>
                    <p className="text-gray-500 text-sm mt-2">Controle de ciclos competitivos e histórico de campeões.</p>
                </div>
                <button
                    onClick={() => setShowResetModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-red-600/20"
                >
                    <RefreshCw className="w-4 h-4" />
                    Resetar Ranking Atual
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Ciclo Atual */}
                <div className="lg:col-span-12 glass p-10 rounded-[40px] border-white/5 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-red-600/10 rounded-2xl text-red-500 border border-red-600/20">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Líderes do Ciclo</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Status: Ativo e em disputa</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-white/5">
                                <tr>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Rank</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Atirador</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Pontos</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Nível</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((member, i) => (
                                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 font-black text-gray-400 italic">#{i + 1}</td>
                                        <td className="py-4 font-bold text-white uppercase text-sm">{member.name}</td>
                                        <td className="py-4 font-black text-red-500">{member.ranking_points}</td>
                                        <td className="py-4"><span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black border border-white/10 uppercase">LVL {member.level}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Histórico de Ciclos */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass p-8 rounded-[40px] border-white/5">
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" />
                            Ciclos Anteriores
                        </h3>
                        <div className="space-y-4">
                            {seasons.filter(s => !s.is_active).map(season => (
                                <button
                                    key={season.id}
                                    onClick={() => fetchHistory(season.id)}
                                    className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center justify-between group ${selectedHistory?.season?.id === season.id ? 'bg-red-600/10 border-red-600/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div>
                                        <span className="block text-sm font-black uppercase text-white mb-1">{season.name}</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            {new Date(season.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-all">
                                        <Trophy className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                    </div>
                                </button>
                            ))}
                            {seasons.filter(s => !s.is_active).length === 0 && (
                                <p className="text-center py-10 text-[10px] text-gray-700 uppercase font-black tracking-widest italic">Nenhum ciclo arquivado ainda</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detalhes do Histórico */}
                <div className="lg:col-span-7">
                    {selectedHistory ? (
                        <div className="glass p-10 rounded-[40px] border-white/5 bg-[#0a0a0a]">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Resultados: <span className="text-red-600">{selectedHistory.season.name}</span></h3>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Ciclo finalizado em {new Date(selectedHistory.season.end_date).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500">
                                    <Trophy className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedHistory.data.slice(0, 10).map((record: any) => (
                                    <div key={record.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-gray-600 italic w-6">#{record.final_rank}</span>
                                            <div>
                                                <span className="block text-sm font-bold text-white uppercase">{record.profiles?.name}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">NV {record.final_level}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-black text-red-500">{record.final_points} PTS</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-10">
                            <History size={48} className="text-zinc-800 mb-6" />
                            <h3 className="text-gray-500 font-black uppercase tracking-widest text-sm italic">Selecione um ciclo para ver o hall da fama</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowResetModal(false)} />
                    <div className="relative glass p-10 rounded-[40px] border-white/10 w-full max-w-lg bg-[#0a0a0a]">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">Resetar Ranking <span className="text-red-600">Global</span></h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Esta ação irá zerar os pontos de todos os atiradores e arquivar o hall da fama atual.
                            <strong> Esta ação não pode ser desfeita.</strong>
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nome do Ciclo (ex: Temporada Verão 2024)</label>
                                <input
                                    type="text"
                                    placeholder="Nome do próximo ciclo..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-600"
                                    value={newSeasonName}
                                    onChange={(e) => setNewSeasonName(e.target.value)}
                                />
                            </div>

                            <button
                                disabled={loading || !newSeasonName}
                                onClick={handleReset}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Arquivando...' : 'Zerar e Arquivar Ranking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingManagementView;
