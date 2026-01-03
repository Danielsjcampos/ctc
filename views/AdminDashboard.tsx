
import React from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  ArrowUpRight,
  // Added ShieldCheck to fix the "Cannot find name 'ShieldCheck'" error
  ShieldCheck
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Atiradores Ativos', value: '1.284', icon: <Users />, color: 'blue', change: '+12%' },
    { label: 'Sessões (Mês)', value: '3.412', icon: <Target />, color: 'red', change: '+8%' },
    { label: 'Faturamento', value: 'R$ 142k', icon: <TrendingUp />, color: 'green', change: '+24%' },
    { label: 'Pendências Doc', value: '12', icon: <AlertCircle />, color: 'yellow', change: '-4' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Visão <span className="text-red-600">Geral</span></h1>
          <p className="text-gray-500 text-sm mt-1">Status operacional em tempo real.</p>
        </div>
        <div className="bg-white/5 p-1 rounded-xl flex">
          <button className="px-4 py-2 bg-red-600 rounded-lg text-xs font-bold uppercase tracking-widest">Hoje</button>
          <button className="px-4 py-2 text-gray-500 text-xs font-bold uppercase tracking-widest">Semana</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-600/10 blur-3xl`} />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 bg-white/5 rounded-2xl text-white`}>{s.icon}</div>
                <div className="text-[10px] font-black uppercase text-green-500 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> {s.change}
                </div>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tighter">{s.value}</span>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Agenda Card */}
        <div className="lg:col-span-2 glass p-8 rounded-[32px] border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter">Agenda do Dia</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors">Ver Completa</button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 1, time: '09:00', shooter: 'Carlos Eduardo', instructor: 'Nascimento', status: 'confirmado', lane: 'Pista A-01' },
              { id: 2, time: '10:30', shooter: 'Mariana Silva', instructor: 'Mendes', status: 'em progresso', lane: 'Pista C-05' },
              { id: 3, time: '11:00', shooter: 'João Pedro', instructor: 'Nascimento', status: 'atrasado', lane: 'Pista A-02' },
              { id: 4, time: '14:00', shooter: 'Fábio Gouveia', instructor: 'Silva', status: 'agendado', lane: 'Pista B-03' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="text-center w-12 border-r border-white/10 pr-4">
                    <span className="block text-xs font-black text-white">{item.time}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">{item.shooter}</span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Inst: {item.instructor} • {item.lane}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    item.status === 'confirmado' ? 'bg-blue-600/20 text-blue-500' : 
                    item.status === 'em progresso' ? 'bg-green-600/20 text-green-500' :
                    item.status === 'atrasado' ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Card */}
        <div className="glass p-8 rounded-[32px] border-white/5">
          <div className="flex items-center space-x-2 mb-8">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Auditoria</h3>
          </div>
          
          <div className="space-y-6 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
            {[
              { user: 'Admin', action: 'Planos Alterados', time: '10 min ago' },
              { user: 'Staff', action: 'Novo Atirador: João', time: '2h ago' },
              { user: 'Admin', action: 'Exportação Financeira', time: '4h ago' },
              { user: 'System', action: 'Backup Concluído', time: '8h ago' },
            ].map((log, idx) => (
              <div key={idx} className="relative pl-10 flex flex-col">
                <div className="absolute left-[13px] top-1.5 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                <span className="text-xs font-bold text-white">{log.action}</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{log.user}</span>
                  <span className="text-[10px] text-gray-600">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Ver Logs Completos</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
