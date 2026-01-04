
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Target,
  Plus,
  Settings2,
  Activity,
  Wrench,
  ShieldAlert,
  ChevronRight,
  X,
  CheckCircle2,
  LayoutGrid,
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AgendaView: React.FC = () => {
  const [lanes, setLanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLaneModal, setShowLaneModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'timeline'>('grid');

  // Reservation States
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [foundShooters, setFoundShooters] = useState<any[]>([]);
  const [newReservation, setNewReservation] = useState<{
    lane_id: string;
    shooter_id: string;
    start_time: string;
    end_time: string;
  }>({
    lane_id: '',
    shooter_id: '',
    start_time: '',
    end_time: ''
  });

  // Occupation State
  const [showOccupyModal, setShowOccupyModal] = useState(false);
  const [occupyData, setOccupyData] = useState<{
    lane_id: string;
    shooter_id: string;
    shooter_name: string;
  }>({
    lane_id: '',
    shooter_id: '',
    shooter_name: ''
  });

  // Check for active reservations
  const checkAvailability = async (laneId: string, startTime: string, endTime: string) => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('lane_id', laneId)
      .eq('status', 'confirmed')
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    return data && data.length > 0;
  };

  const handleCreateReservation = async () => {
    if (!newReservation.lane_id || !newReservation.shooter_id || !newReservation.start_time) {
      alert('Preencha todos os campos!');
      return;
    }

    // Check conflict
    const isBusy = await checkAvailability(newReservation.lane_id, newReservation.start_time, newReservation.end_time);
    if (isBusy) {
      alert('Já existe uma reserva para este horário nesta pista!');
      return;
    }

    const { error } = await supabase.from('reservations').insert([{
      ...newReservation,
      status: 'confirmed'
    }]);

    if (error) {
      console.error(error);
      alert('Erro ao criar reserva.');
    } else {
      alert('Reserva criada com sucesso!');
      setShowReservationModal(false);
      setNewReservation({ lane_id: '', shooter_id: '', start_time: '', end_time: '' });
      fetchLanes(); // Refresh to ensure UI stays consistent
    }
  };



  // Active Shooters State
  const [activeShooters, setActiveShooters] = useState<any[]>([]);

  const fetchActiveShooters = async () => {
    // Now fetching from profiles directly based on checking flag
    const { data } = await supabase
      .from('profiles')
      .select('id, name, cpf')
      .eq('is_checked_in', true);

    if (data) {
      setActiveShooters(data);
    }
  };

  const handleOccupyLane = async () => {
    if (!occupyData.lane_id || !occupyData.shooter_id) return alert('Selecione o atirador.');

    // Check conflict for NOW
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const isBusy = await checkAvailability(occupyData.lane_id, now.toISOString(), oneHourLater.toISOString());
    if (isBusy) {
      if (!confirm('ATENÇÃO: Já existe uma reserva ativa ou futura próxima para esta pista. Deseja forçar a ocupação mesmo assim?')) {
        return;
      }
    }

    const { error: resError } = await supabase.from('reservations').insert([{
      lane_id: occupyData.lane_id,
      shooter_id: occupyData.shooter_id,
      start_time: now.toISOString(),
      end_time: oneHourLater.toISOString(), // Default 1 hour
      status: 'active',
      shooter_name: occupyData.shooter_name
    }]);

    if (resError) {
      alert('Erro ao registrar ocupação.');
      return;
    }

    await updateLaneStatus(occupyData.lane_id, 'occupied');
    setShowOccupyModal(false);
    setOccupyData({ lane_id: '', shooter_id: '', shooter_name: '' });
    alert('Pista ocupada e atirador registrado!');
    fetchLanes();
  };

  // Form State para Nova Pista
  const [newLane, setNewLane] = useState({
    name: '',
    description: '',
    type: 'indoor',
    max_distance: 25,
    max_caliber: '.9mm',
    status: 'available'
  });

  useEffect(() => {
    fetchLanes();
    const subscription = supabase
      .channel('public:lanes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lanes' }, () => fetchLanes())
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchLanes = async () => {
    setLoading(true);
    const { data } = await supabase.from('lanes').select('*').order('name');
    if (data) setLanes(data);
    setLoading(false);
  };

  const handleCreateLane = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('lanes').insert([newLane]);
    if (error) {
      console.error('Error creating lane:', error);
      alert('Erro ao criar pista. Verifique se o banco de dados foi atualizado.');
    } else {
      setShowLaneModal(false);
      setNewLane({ name: '', description: '', type: 'indoor', max_distance: 25, max_caliber: '.9mm', status: 'available' });
      alert('Pista cadastrada com sucesso!');
      fetchLanes();
    }
  };

  const updateLaneStatus = async (id: string, status: string) => {
    await supabase.from('lanes').update({ status }).eq('id', id);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header com Ações */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">AGENDA & <span className="text-blue-500">PISTAS</span></h1>
          <p className="text-gray-500 text-sm mt-2">Controle de ocupação, reservas e infraestrutura técnica.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <button
            onClick={() => setShowReservationModal(true)}
            className="hidden lg:flex px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Nova Reserva</span>
          </button>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setSelectedView('grid')}
              className={`p-3 rounded-xl transition-all ${selectedView === 'grid' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedView('timeline')}
              className={`p-3 rounded-xl transition-all ${selectedView === 'timeline' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowLaneModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Pista</span>
          </button>
        </div>
      </div>

      {/* Seção de Status Real-time */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Lista de Pistas (Grid) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {lanes.map((lane) => (
              <div
                key={lane.id}
                className={`glass p-8 rounded-[40px] border transition-all duration-500 group relative overflow-hidden ${lane.status === 'occupied' ? 'border-blue-600/40 bg-blue-600/[0.03]' :
                  lane.status === 'maintenance' ? 'border-red-600/40 bg-red-600/[0.03] opacity-80' : 'border-white/5 hover:border-white/20'
                  }`}
              >
                {/* Glow Background Decorativo */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 ${lane.status === 'occupied' ? 'bg-blue-600' : lane.status === 'maintenance' ? 'bg-red-600' : 'bg-green-600'
                  }`} />

                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-xl font-black uppercase tracking-tighter text-white block">{lane.name}</span>
                      <span className="text-[10px] uppercase font-black text-blue-500 tracking-widest">{lane.type} • {lane.max_distance}m</span>
                    </div>
                    <div className="flex space-x-2">
                      {lane.status === 'available' && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
                      {lane.status === 'occupied' && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                      {lane.status === 'maintenance' && <Wrench className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500">
                      <span>Calibre Máx.</span>
                      <span className="text-white">{lane.max_caliber}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500">
                      <span>Status Atual</span>
                      <span className={`font-black ${lane.status === 'available' ? 'text-green-500' :
                        lane.status === 'occupied' ? 'text-blue-500' : 'text-red-500'
                        }`}>{lane.status.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {/* Control Status Buttons */}
                    {lane.status === 'available' && (
                      <button
                        onClick={() => {
                          setOccupyData(prev => ({ ...prev, lane_id: lane.id }));
                          fetchActiveShooters();
                          setShowOccupyModal(true);
                        }}
                        className="flex-grow bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Target className="w-3 h-3" /> Ocupar
                      </button>
                    )}

                    {lane.status === 'occupied' && (
                      <button
                        onClick={() => updateLaneStatus(lane.id, 'available')}
                        className="flex-grow bg-green-500/10 hover:bg-green-600 text-green-500 hover:text-white py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-green-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Liberar
                      </button>
                    )}

                    {lane.status !== 'maintenance' ? (
                      <button
                        onClick={() => updateLaneStatus(lane.id, 'maintenance')}
                        className="px-4 bg-white/5 hover:bg-red-600/10 text-gray-500 hover:text-red-500 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 hover:border-red-600/30 transition-all"
                        title="Colocar em Manutenção"
                      >
                        <Wrench className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateLaneStatus(lane.id, 'available')}
                        className="flex-grow bg-green-600 text-white py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 font-bold"
                      >
                        Reativar Pista
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={async () => {
                        if (confirm('Tem certeza que deseja excluir esta pista?')) {
                          await supabase.from('lanes').delete().eq('id', lane.id);
                          fetchLanes();
                        }
                      }}
                      className="px-3 bg-red-900/20 hover:bg-red-600 text-red-700 hover:text-white rounded-xl border border-red-900/20 transition-all"
                      title="Excluir Pista"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Próximos Agendamentos */}
        <div className="space-y-8">
          <div className="glass p-10 rounded-[40px] border-white/5 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter">Agenda <span className="text-red-600">Hoje</span></h3>
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>

            <div className="space-y-4">
              {[
                { time: '14:30', shooter: 'João Silva', lane: 'Alpha 01', type: 'Treino' },
                { time: '15:15', shooter: 'Mariana Mendes', lane: 'Alpha 02', type: 'Exame CR' },
                { time: '16:00', shooter: 'Ricardo P.', lane: 'Fuzil 100m', type: 'Alinhamento' },
              ].map((agenda, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-blue-600/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-center w-12 border-r border-white/5 pr-4 shrink-0">
                      <span className="block text-sm font-black text-white">{agenda.time}</span>
                      <span className="text-[8px] uppercase text-gray-600 font-bold">Horas</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white">{agenda.shooter}</span>
                      <span className="text-[9px] uppercase font-bold text-gray-500">{agenda.lane} • {agenda.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-all" />
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white border border-white/5 transition-all">
              Ver Calendário Completo
            </button>
          </div>

          <div className="glass p-10 rounded-[40px] border-white/5 space-y-6">
            <div className="flex items-center space-x-3 text-blue-500">
              <Activity className="w-5 h-5" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Indicadores de Uso</h4>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                  <span>Capacidade Ocupada</span>
                  <span>72%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[72%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] font-black text-white">12</span>
                  <span className="text-[8px] uppercase text-gray-500 font-bold">Total Pistas</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] font-black text-green-500">05</span>
                  <span className="text-[8px] uppercase text-gray-500 font-bold">Disponíveis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showReservationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-xl rounded-[40px] p-12 border-green-500/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px]" />

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Nova <span className="text-green-500">Reserva</span></h2>
              <button onClick={() => setShowReservationModal(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Selecione a Pista</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-green-500 outline-none transition-all"
                  value={newReservation.lane_id}
                  onChange={(e) => setNewReservation({ ...newReservation, lane_id: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {lanes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Atirador (Busca por Nome/CPF)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-green-500 outline-none transition-all"
                  placeholder="Digite o nome..."
                  onChange={async (e) => {
                    const term = e.target.value;
                    if (term.length > 2) {
                      const { data } = await supabase.from('profiles').select('id, name').ilike('name', `%${term}%`).limit(5);
                      if (data) setFoundShooters(data);
                    }
                  }}
                />
                {foundShooters.length > 0 && (
                  <div className="bg-zinc-800 rounded-xl border border-white/10 overflow-hidden mt-2">
                    {foundShooters.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setNewReservation({ ...newReservation, shooter_id: s.id });
                          setFoundShooters([]);
                          alert(`Selecionado: ${s.name}`);
                        }}
                        className="w-full text-left p-3 hover:bg-white/10 text-xs text-gray-300 border-b border-white/5 last:border-0"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Data</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-green-500 outline-none transition-all"
                    onChange={(e) => {
                      const date = e.target.value;
                      // Set start/end to this date with default times, logic can be improved
                      setNewReservation(prev => ({
                        ...prev,
                        start_time: `${date}T10:00:00`,
                        end_time: `${date}T11:00:00`
                      }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Horário Início</label>
                  <input
                    type="time"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-green-500 outline-none transition-all"
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = newReservation.start_time.split('T')[0];
                      setNewReservation(prev => ({ ...prev, start_time: `${date}T${time}:00` }))
                    }}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={handleCreateReservation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-green-600/20 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Agendamento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Pista */}
      {showLaneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-xl rounded-[40px] p-12 border-blue-600/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px]" />

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Cadastrar <span className="text-blue-500">Nova Pista</span></h2>
              <button onClick={() => setShowLaneModal(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateLane} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nome da Pista</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-600 outline-none transition-all"
                  placeholder="Ex: Pista Alpha 04"
                  value={newLane.name}
                  onChange={(e) => setNewLane({ ...newLane, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Tipo</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-600 outline-none transition-all"
                    value={newLane.type}
                    onChange={(e) => setNewLane({ ...newLane, type: e.target.value })}
                  >
                    <option value="indoor">Indoor (Fechada)</option>
                    <option value="outdoor">Outdoor (Aberta)</option>
                    <option value="tactical">Tática (Móvel)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Distância Máx. (m)</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-600 outline-none transition-all"
                    value={newLane.max_distance}
                    onChange={(e) => setNewLane({ ...newLane, max_distance: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Calibre Limite</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-600 outline-none transition-all"
                  placeholder="Ex: .45 ACP, 7.62 NATO"
                  value={newLane.max_caliber}
                  onChange={(e) => setNewLane({ ...newLane, max_caliber: e.target.value })}
                />
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/20 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Registrar Infraestrutura</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ocupação Imediata */}
      {showOccupyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-lg rounded-[40px] p-12 border-blue-600/20 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px]" />

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Ocupar <span className="text-blue-500">Pista</span></h2>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Início Imediato</p>
              </div>
              <button onClick={() => setShowOccupyModal(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Atirador (Apenas com Check-in Ativo)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-600 outline-none transition-all"
                  placeholder="Filtrar atirador presente..."
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase();
                    // Filter local list instead of DB query
                    const filtered = activeShooters.filter(s => s.name.toLowerCase().includes(val));
                    setFoundShooters(filtered);
                  }}
                  onFocus={() => {
                    // Show all active shooters on focus
                    setFoundShooters(activeShooters);
                  }}
                />
                {foundShooters.length > 0 ? (
                  <div className="bg-zinc-800 rounded-xl border border-white/10 mt-2 max-h-[200px] overflow-y-auto">
                    {foundShooters.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setOccupyData(prev => ({ ...prev, shooter_id: s.id, shooter_name: s.name }));
                          setFoundShooters([]);
                        }}
                        className="w-full text-left p-3 hover:bg-white/10 text-xs text-gray-300 border-b border-white/5 last:border-0 flex justify-between items-center"
                      >
                        <span>{s.name}</span>
                        <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">Check-in OK</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500 italic">
                    {activeShooters.length === 0 ? "Nenhum atirador com check-in ativo no momento." : "Nenhum atirador encontrado."}
                  </div>
                )}
              </div>

              {occupyData.shooter_name && (
                <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                    {occupyData.shooter_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-white font-bold text-sm">{occupyData.shooter_name}</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Selecionado</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleOccupyLane}
                disabled={!occupyData.shooter_id}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/20 transition-all mt-4"
              >
                <Target className="w-5 h-5" />
                <span>Iniciar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaView;
