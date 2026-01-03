
import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  Calendar,
  Trophy,
  Medal,
  Crown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRanking } from '../../hooks/useRanking';

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState({ shooters: 0, blocked: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const { ranking } = useRanking();

  useEffect(() => {
    const fetchStats = async () => {
      // Busca real do banco
      const { data: profiles, error } = await supabase.from('profiles').select('status');

      if (error) {
        console.error('Error fetching stats:', error);
        // Fallback or alert
      }

      if (profiles) {
        setCounts({
          shooters: profiles.filter(p => p.status === 'active').length,
          blocked: profiles.filter(p => p.status === 'blocked').length,
          pending: profiles.filter(p => p.status === 'pending_review').length,
        });
      }
      setLoading(false);
    };

    fetchStats();

    // Safety timeout
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const stats = [
    { label: 'Atiradores Ativos', value: counts.shooters.toString(), icon: <Users />, color: 'blue', change: '+12%' },
    { label: 'Acessos (Hoje)', value: '24', icon: <Target />, color: 'red', change: '+8%' },
    { label: 'Faturamento Estimado', value: 'R$ 84k', icon: <TrendingUp />, color: 'green', change: '+24%' },
    { label: 'Contas Bloqueadas', value: counts.blocked.toString(), icon: <AlertCircle />, color: 'yellow', change: counts.blocked > 0 ? 'ALERTA' : 'OK' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>;

  return (
    <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">ELITE <span className="text-red-600">COMMAND</span></h1>
          <p className="text-gray-500 text-[10px] md:text-sm mt-2 uppercase font-black tracking-widest italic opacity-50">Operational Sincronizado</p>
        </div>
        <div className="bg-white/5 p-1 rounded-xl flex border border-white/5 w-fit">
          <button className="px-6 py-2 bg-red-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 transition-all">Tempo Real</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass p-5 md:p-8 rounded-[24px] md:rounded-[32px] border-white/5 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-600/10 blur-[80px] transition-opacity group-hover:opacity-100 opacity-50`} />
            <div className="relative z-10 space-y-4 md:space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-red-600/20 group-hover:text-red-500 transition-all select-none">{s.icon}</div>
                <div className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${s.color === 'yellow' && counts.blocked > 0 ? 'text-red-500' : 'text-green-500'} flex items-center`}>
                  {s.change}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-2xl md:text-4xl font-black tracking-tighter text-white block">{s.value}</span>
                <p className="text-[8px] md:text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20 md:pb-0">
        <div className="lg:col-span-2 glass p-10 rounded-[40px] border-white/5 h-[300px] md:h-[400px] flex flex-col justify-center items-center text-center space-y-6 border-dashed">
          <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-800" />
          <p className="text-gray-600 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Nenhum agendamento para hoje</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[40px] border-white/5 flex flex-col h-fit bg-white/[0.01]">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white italic">Top Ranking</h3>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {ranking.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${index === 0 ? 'bg-yellow-500/10 text-yellow-500' :
                    index === 1 ? 'bg-slate-300/10 text-slate-300' :
                      'bg-orange-600/10 text-orange-600'
                    }`}>
                    {index === 0 ? <Crown size={18} /> : index === 1 ? <Medal size={18} /> : <Trophy size={16} />}
                  </div>
                  <div>
                    <span className="block text-xs md:text-sm font-black text-white uppercase">{member.name.split(' ')[0]}</span>
                    <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">PTS: {member.ranking_points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 md:p-10 rounded-[40px] border-white/5 flex flex-col h-fit">
          <div className="flex items-center space-x-3 mb-8 md:mb-10">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Auditoria</h3>
          </div>
          <div className="space-y-6 relative flex-grow text-left">
            {[
              { action: 'Sessão Admin Aberta', time: 'Agora' },
              { action: 'Banco Sincronizado', time: '1m ago' },
            ].map((log, idx) => (
              <div key={idx} className="flex flex-col group border-l-2 border-white/5 pl-4 ml-2">
                <span className="text-xs font-black text-white uppercase tracking-tight">{log.action}</span>
                <span className="text-[9px] text-gray-700 font-medium uppercase mt-1 italic">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
