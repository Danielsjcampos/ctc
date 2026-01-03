
import React, { useState, useEffect } from 'react';
import { Calendar, Target, Award, CreditCard, ChevronRight, Play, MapPin, CheckCircle, AlertCircle, Trophy, Medal, Crown } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useRanking } from '../../hooks/useRanking';

const ShooterDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserRank, ranking } = useRanking();
  const [checkedIn, setCheckedIn] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Fetch Debt
      const { data: sales } = await supabase
        .from('sales')
        .select('total')
        .eq('shooter_id', user.id)
        .eq('status', 'pending');

      if (sales) {
        setPendingAmount(sales.reduce((acc, curr) => acc + curr.total, 0));
      }

      // Fetch Rank
      const rank = await getUserRank(user.id);
      setUserRank(rank);
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Olá, <span className="text-red-600">{user?.name.split(' ')[0]}</span></h1>
          <p className="text-gray-500 text-sm mt-1">Status da sua filiação: <span className="text-green-500 font-bold uppercase text-[10px] tracking-widest">Verificado & Ativo</span></p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {!checkedIn ? (
            <button
              onClick={() => setCheckedIn(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <MapPin className="w-4 h-4" />
              <span>Fazer Check-in no Clube</span>
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-8 py-4 rounded-2xl flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Check-in Realizado</span>
            </div>
          )}
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-600/20">
            <Calendar className="w-4 h-4" />
            <span>Agendar Nova Sessão</span>
          </button>
        </div>
      </div>

      {checkedIn && (
        <div className="glass p-6 rounded-[32px] border-green-500/30 bg-green-500/5 animate-pulse-slow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white"><MapPin className="w-6 h-6" /></div>
              <div>
                <span className="block text-sm font-bold text-white">Sessão Ativa Iniciada</span>
                <span className="text-[10px] text-gray-500 uppercase font-black">Lembre-se de registrar seus disparos ao finalizar para garantir a habitualidade.</span>
              </div>
            </div>
            <button onClick={() => setCheckedIn(false)} className="text-[10px] font-black uppercase text-red-500 hover:text-white transition-colors">Finalizar Sessão</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {pendingAmount > 0 && (
          <div className="glass p-6 rounded-3xl border-red-600/30 bg-red-600/10 animate-pulse-slow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-red-600/20 rounded-xl text-red-500"><AlertCircle className="w-5 h-5" /></div>
              <h4 className="text-sm font-black uppercase tracking-widest text-red-500">Em Aberto</h4>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black uppercase tracking-tighter text-white">R$ {pendingAmount.toFixed(2)}</span>
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em]">Pagar no Balcão</p>
            </div>
          </div>
        )}

        <div className="glass p-6 rounded-3xl border-white/5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-600/10 rounded-xl text-red-500"><CreditCard className="w-5 h-5" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Plano Ativo</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter text-white">{user?.membership_type || 'Operador'}</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Renovação Automática</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-600/20 rounded-xl text-red-600 shadow-lg shadow-red-600/20"><Award className="w-5 h-5" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Sua Posição</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter text-white">
              {userRank ? `#${userRank}` : '--'}
            </span>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest italic">{user?.ranking_points || 0} PTS</p>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">• NV {user?.level || 1}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500"><Target className="w-5 h-5" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Disparos</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter text-white">1.450</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Acúmulo total</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-yellow-600/10 rounded-xl text-yellow-500"><CheckCircle className="w-5 h-5" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Certificações</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter text-white">04</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Válidas no sistema</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-[40px] border-red-600/30 relative overflow-hidden bg-red-600/[0.02]">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <Play className="w-5 h-5 fill-current text-white" />
            </div>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Próximo Agendamento</h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-white">22</span>
                <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-bold">Outubro</span>
              </div>
              <div>
                <span className="block text-lg font-black uppercase text-white">Sessão de Treinamento</span>
                <span className="text-sm text-gray-400">Pista A-01 • 14:30h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Líderes do Ranking
            </h3>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Top 5</span>
          </div>
          <div className="space-y-4">
            {ranking.slice(0, 5).map((member, idx) => (
              <div key={member.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${member.id === user?.id ? 'bg-red-600/10 border-red-600/30 ring-1 ring-red-600/20' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-yellow-500 text-black' :
                      idx === 1 ? 'bg-slate-300 text-black' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                          'bg-white/10 text-gray-400'
                    }`}>
                    {idx === 0 ? <Crown size={14} /> : idx === 1 ? <Medal size={14} /> : idx + 1}
                  </div>
                  <div>
                    <span className="block text-sm font-bold uppercase text-white">{member.name.split(' ')[0]} {member.id === user?.id && '(VOCÊ)'}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">NV {member.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-red-500 italic">{member.ranking_points} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Últimas Atividades</h3>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {[
              { type: 'Treino Livre', date: '15 Out', result: '92%' },
              { type: 'Curso Tático I', date: '02 Out', result: 'Aprovado' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-500"><Target className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-sm font-bold uppercase text-white">{item.type}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{item.date}</span>
                  </div>
                </div>
                <span className="text-xs font-black uppercase text-white">{item.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShooterDashboard;
