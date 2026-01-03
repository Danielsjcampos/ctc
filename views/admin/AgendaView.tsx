
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
      .on('postgres_changes', { event: '*', table: 'lanes' }, () => fetchLanes())
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
    if (!error) {
      setShowLaneModal(false);
      setNewLane({ name: '', description: '', type: 'indoor', max_distance: 25, max_caliber: '.9mm', status: 'available' });
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
                className={`glass p-8 rounded-[40px] border transition-all duration-500 group relative overflow-hidden ${
                  lane.status === 'occupied' ? 'border-blue-600/40 bg-blue-600/[0.03]' : 
                  lane.status === 'maintenance' ? 'border-red-600/40 bg-red-600/[0.03] opacity-80' : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* Glow Background Decorativo */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 ${
                  lane.status === 'occupied' ? 'bg-blue-600' : lane.status === 'maintenance' ? 'bg-red-600' : 'bg-green-600'
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
                        <span className={`font-black ${
                          lane.status === 'available' ? 'text-green-500' : 
                          lane.status === 'occupied' ? 'text-blue-500' : 'text-red-500'
                        }`}>{lane.status.toUpperCase()}</span>
                     </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                     {lane.status !== 'maintenance' ? (
                       <button 
                        onClick={() => updateLaneStatus(lane.id, 'maintenance')}
                        className="flex-grow bg-white/5 hover:bg-red-600/10 text-gray-500 hover:text-red-500 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 hover:border-red-600/30 transition-all"
                       >
                         Manutenção
                       </button>
                     ) : (
                       <button 
                        onClick={() => updateLaneStatus(lane.id, 'available')}
                        className="flex-grow bg-green-600 text-white py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-600/20"
                       >
                         Reativar Pista
                       </button>
                     )}
                     <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white border border-white/5 hover:border-white/20 transition-all">
                       <Settings2 className="w-4 h-4" />
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
                    onChange={(e) => setNewLane({...newLane, name: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Tipo</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-600 outline-none transition-all"
                        value={newLane.type}
                        onChange={(e) => setNewLane({...newLane, type: e.target.value})}
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
                        onChange={(e) => setNewLane({...newLane, max_distance: parseInt(e.target.value)})}
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
                    onChange={(e) => setNewLane({...newLane, max_caliber: e.target.value})}
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
    </div>
  );
};

export default AgendaView;
