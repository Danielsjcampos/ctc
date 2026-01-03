
import React from 'react';
import { useRanking } from '../hooks/useRanking';
import { Trophy, Medal, Star, Target, Crown, ArrowUpRight } from 'lucide-react';

export const RankingSection: React.FC = () => {
    const { ranking, loading } = useRanking();

    if (loading && ranking.length === 0) return null;

    return (
        <section id="ranking" className="py-24 bg-[#050505] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block animate-pulse">Competitive Arena</span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                        RANKING DE <br />
                        <span className="text-red-600 italic">ELITE</span>
                    </h2>
                    <p className="text-gray-500 mt-6 max-w-xl mx-auto font-medium text-sm border-t border-white/5 pt-6 uppercase tracking-widest">
                        A disputa pela glória. Ganhe pontos treinando, participando de cursos e competições.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Top 3 Spotlight */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {ranking.slice(0, 3).map((member, index) => (
                            <div
                                key={member.id}
                                className={`relative glass p-10 rounded-[40px] border-white/5 flex flex-col items-center text-center transition-all duration-500 hover:scale-[1.02] ${index === 0 ? 'border-yellow-500/30 bg-yellow-500/5 order-1 md:order-2 scale-110' :
                                        index === 1 ? 'border-slate-300/30 order-2 md:order-1' : 'border-orange-600/30 order-3'
                                    }`}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center bg-black border border-white/10 shadow-2xl">
                                    {index === 0 ? <Crown size={24} className="text-yellow-500" /> :
                                        index === 1 ? <Medal size={24} className="text-slate-300" /> :
                                            <Trophy size={20} className="text-orange-600" />}
                                </div>

                                <div className="mt-4">
                                    <div className="text-4xl font-black text-white uppercase tracking-tighter mb-1 select-none">{member.name.split(' ')[0]}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6">{member.membership_type}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 w-full border-t border-white/5 pt-8">
                                    <div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Pontos</div>
                                        <div className="text-2xl font-black text-white tracking-widest">{member.ranking_points}</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Nível</div>
                                        <div className="text-2xl font-black text-red-600 tracking-widest">{member.level}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Leaderboard List */}
                    <div className="lg:col-span-12">
                        <div className="glass border-white/5 rounded-[40px] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02]">
                                    <tr>
                                        <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-500">Posição</th>
                                        <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-500">Atirador</th>
                                        <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-500">Categoria</th>
                                        <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Nível</th>
                                        <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Score Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranking.slice(3).map((member, index) => (
                                        <tr key={member.id} className="border-t border-white/5 hover:bg-white/[0.01] transition-all group">
                                            <td className="py-6 px-10">
                                                <span className="text-xl font-black text-gray-700 group-hover:text-white transition-colors">#{index + 4}</span>
                                            </td>
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-600 font-black text-sm uppercase">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="text-lg font-black text-white uppercase tracking-tight">{member.name}</div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{member.membership_type}</span>
                                            </td>
                                            <td className="py-6 px-10 text-center">
                                                <span className="bg-white/5 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">LVL {member.level}</span>
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className="text-2xl font-black text-white tracking-widest">{member.ranking_points}</span>
                                                    <div className="w-2 h-8 bg-red-600 rounded-full" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!loading && ranking.length === 0 && (
                                <div className="py-20 text-center text-gray-600 font-black uppercase tracking-widest text-[10px]">
                                    Nenhuma pontuação registrada neste ciclo.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Score Rules */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Check-in Curso', points: '50pts', icon: <Target className="text-red-600" /> },
                        { label: 'Concluir Curso', points: '100pts', icon: <Star className="text-yellow-600" /> },
                        { label: 'Treino de Pista', points: '20pts', icon: <ArrowUpRight className="text-blue-600" /> },
                        { label: 'Visita ao Clube', points: '10pts', icon: <Plus className="text-green-600" size={16} /> },
                    ].map((rule, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/[0.03] p-6 rounded-3xl border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                                {rule.icon}
                            </div>
                            <div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{rule.label}</div>
                                <div className="text-sm font-black text-white">{rule.points}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Plus = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
