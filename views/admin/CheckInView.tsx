
import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Crosshair,
  CheckCircle,
  UserPlus,
  X,
  Clock,
  Target,
  Zap,
  ShieldAlert,
  Loader2,
  ChevronRight,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CheckInView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [selectedShooter, setSelectedShooter] = useState<any | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [sessionFilter, setSessionFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'sessions' | 'visitors'>('sessions');

  // Form de Check-out
  const [checkoutModal, setCheckoutModal] = useState<any | null>(null);
  const [shots, setShots] = useState(50);

  useEffect(() => {
    fetchActiveSessions();

    // Real-time subscription
    const channel = supabase
      .channel('public:club_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_sessions' }, () => {
        fetchActiveSessions();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  const fetchActiveSessions = async () => {
    const { data } = await supabase
      .from('club_sessions')
      .select('*')
      .eq('status', 'active')
      .order('check_in_at', { ascending: false });
    if (data) setActiveSessions(data);
  };

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.length < 3) {
      setSearchResult([]);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, name, cpf, cr_number, role, membership_type')
      .or(`name.ilike.%${val}%,cpf.ilike.%${val}%,cr_number.ilike.%${val}%`)
      .limit(5);

    if (data) setSearchResult(data);
  };

  const startSession = async (firearm: any, lane: string) => {
    setLoading(true);
    const { error } = await supabase.from('club_sessions').insert([{
      shooter_id: selectedShooter.id,
      shooter_name: selectedShooter.name,
      firearm_id: firearm.id,
      firearm_model: firearm.model,
      lane_number: lane,
      status: 'active',
      caliber: firearm.caliber
    }]);

    if (!error) {
      // UPDATE PROFILE PRESENCE
      await supabase.from('profiles').update({
        is_checked_in: true,
        last_check_in: new Date().toISOString()
      }).eq('id', selectedShooter.id);

      setSelectedShooter(null);
      setSearchTerm('');
      fetchActiveSessions();
    }
    setLoading(false);
  };

  const finalizeSession = async () => {
    if (!checkoutModal) return;

    const { error } = await supabase
      .from('club_sessions')
      .update({
        status: 'completed',
        check_out_at: new Date().toISOString(),
        total_shots: shots
      })
      .eq('id', checkoutModal.id);

    if (!error) {
      // UPDATE PROFILE PRESENCE
      // Note: In a real scenario, we might want to keep check-in valid if they have multiple simultaneous sessions? 
      // But assuming 1 person = 1 session for simplicity in CheckInView:
      await supabase.from('profiles').update({
        is_checked_in: false,
        last_check_out: new Date().toISOString()
      }).eq('id', checkoutModal.shooter_id);

      setCheckoutModal(null);
      fetchActiveSessions();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header com Status do Clube */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">PORTARIA & <span className="text-red-600">ACESSOS</span></h1>
          <p className="text-gray-500 text-sm mt-2">Gestão de fluxo de segurança e habitualidade de pista.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="glass px-6 py-3 rounded-2xl flex items-center space-x-3 border-white/5">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{activeSessions.length} Atiradores em Pista</span>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
            Relatório do Turno
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Busca e Identificação */}
        <div className="lg:col-span-8 space-y-8">

          <div className="glass p-10 rounded-[40px] border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter">Identificar <span className="text-red-600">Membro</span></h3>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-red-600/10 text-red-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-red-600/20">Membro</button>
                <button className="px-4 py-2 text-gray-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">Visitante</button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-6 h-6" />
              <input
                type="text"
                placeholder="Busca Rápida: Nome, CPF ou CR..."
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-lg text-white focus:border-red-600 focus:bg-white/[0.08] outline-none transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {searchResult.length > 0 && (
              <div className="grid gap-3 animate-fade-in-up">
                {searchResult.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShooter(s)}
                    className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-red-600/10 hover:border-red-600/30 transition-all group"
                  >
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-xl border border-white/10">
                        {s.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <span className="block text-lg font-black text-white group-hover:text-red-500 transition-colors">{s.name}</span>
                        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span>CR: {s.cr_number || 'S/CR'}</span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full" />
                          <span className="text-blue-500">{s.membership_type}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lista de Sessões Ativas */}
          <div className="glass p-10 rounded-[40px] border-white/5 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Atiradores <span className="text-blue-500">No Clube</span></h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gerenciamento de Presença e Saída</p>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filtrar presentes..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs text-white focus:border-blue-600 outline-none transition-all"
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Atualizado agora</span>
              </div>
            </div>

            {/* We need a Search State for this. I will assume 'sessionFilter' exists or add it. */}

            <div className="grid md:grid-cols-2 gap-4">
              {activeSessions
                .filter(s => s.shooter_name.toLowerCase().includes(sessionFilter.toLowerCase()))
                .map(session => (
                  <div key={session.id} className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between group hover:border-blue-600/30 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 font-black border border-blue-600/30">
                        {session.lane_number || 'S/N'}
                      </div>
                      <div>
                        <span className="block text-sm font-black text-white">{session.shooter_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-500 uppercase font-black">{session.firearm_model || 'Armamento Próprio'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                          <span className="text-[9px] text-blue-400 uppercase font-bold">{new Date(session.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCheckoutModal(session)}
                      className="bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-red-500"
                    >
                      Dar Baixa
                    </button>
                  </div>
                ))}
              {activeSessions.length === 0 && (
                <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                  <Target className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Nenhum atirador presente no clube</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Direita: Contexto do Check-in */}
        <div className="lg:col-span-4 space-y-8">
          {selectedShooter ? (
            <div className="glass p-10 rounded-[40px] border-red-600/40 bg-red-600/[0.03] animate-fade-in-right sticky top-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-red-600" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Registrar <span className="text-red-600">Presença</span></h3>
                </div>
                <button onClick={() => setSelectedShooter(null)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-5 bg-white/5 rounded-[24px] border border-white/5">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl font-black">{selectedShooter.name.charAt(0)}</div>
                  <div>
                    <span className="block font-black text-white text-lg leading-none">{selectedShooter.name}</span>
                    <span className="text-[10px] uppercase font-black text-blue-500 tracking-widest mt-1 inline-block">{selectedShooter.membership_type}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Selecione o Armamento</span>
                    <span className="text-[10px] font-black uppercase text-red-600">CR OK</span>
                  </div>
                  <div className="space-y-2">
                    {/* Mock de armas para exemplo, mas viria do banco de firearms */}
                    {[
                      { id: '1', model: 'Glock G17 Gen5', caliber: '.9mm' },
                      { id: '2', model: 'Taurus TS9', caliber: '.9mm' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => startSession(f, 'R-' + Math.floor(Math.random() * 20 + 1))}
                        className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-red-600 hover:bg-red-600/10 transition-all text-left group"
                      >
                        <div className="flex items-center space-x-4">
                          <Crosshair className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                          <div>
                            <span className="block text-sm font-black text-white group-hover:text-white">{f.model}</span>
                            <span className="text-[9px] text-gray-500 uppercase font-black">{f.caliber}</span>
                          </div>
                        </div>
                        <UserPlus className="w-5 h-5 text-transparent group-hover:text-red-600 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-blue-600/10 border border-blue-600/20 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-blue-500">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Compliance Alerta</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Verifique se o Certificado de Registro está em mãos e se o calibre confere com a guia de tráfego apresentada.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-12 rounded-[40px] border-white/5 flex flex-col items-center justify-center text-center space-y-6 h-[400px] border-dashed bg-white/[0.01]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-800">
                <MapPin className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-black tracking-[0.2em]">Ponto de Controle Ativo</p>
                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Aguardando identificação de atirador...</p>
              </div>
            </div>
          )}

          <div className="glass p-10 rounded-[40px] border-white/5 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-4">Indicadores Diários</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Check-ins</span>
                <span className="text-xl font-black text-white">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visitantes</span>
                <span className="text-xl font-black text-blue-500">08</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Méd. Permanência</span>
                <span className="text-xl font-black text-red-600">54m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Check-out (Habitualidade) */}
      {checkoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-lg rounded-[40px] p-12 border-red-600/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px]" />

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Finalizar <span className="text-red-600">Sessão</span></h2>
              <p className="text-gray-500 text-sm uppercase font-black tracking-widest">Atirador: {checkoutModal.shooter_name}</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Quantidade de Disparos Realizados</label>
                <div className="flex items-center justify-center space-x-6">
                  <button onClick={() => setShots(Math.max(0, shots - 10))} className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 text-xl font-black hover:bg-red-600/20 transition-all">-</button>
                  <span className="text-5xl font-black tracking-tighter text-white w-32 text-center">{shots}</span>
                  <button onClick={() => setShots(shots + 10)} className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 text-xl font-black hover:bg-red-600/20 transition-all">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-[8px] uppercase font-black text-gray-500 mb-1">Calibre</span>
                  <span className="text-sm font-black text-blue-500 uppercase">{checkoutModal.caliber}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="block text-[8px] uppercase font-black text-gray-500 mb-1">Permanência</span>
                  <span className="text-sm font-black text-white">45 min</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={finalizeSession}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-red-600/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Registrar Habitualidade</span>
                </button>
                <button
                  onClick={() => setCheckoutModal(null)}
                  className="w-full bg-white/5 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInView;
