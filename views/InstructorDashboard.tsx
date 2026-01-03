
import React from 'react';
import { Target, ShieldAlert, CheckCircle2, Clock, Users } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Operação de <span className="text-blue-500">Pista</span></h1>
          <p className="text-gray-500 text-sm mt-1">Sessões atribuídas e controle de segurança.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-[#070707] flex items-center justify-center text-xs font-black">4</div>
          </div>
          <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Sessões Restantes Hoje</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Session Control */}
        <div className="glass p-10 rounded-[40px] border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-transparent">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-xl font-black uppercase tracking-tighter">Sessão Ativa</h3>
            </div>
            <span className="text-xs font-black uppercase bg-white/5 px-4 py-2 rounded-xl border border-white/10 tracking-widest">Pista B-03</span>
          </div>

          <div className="flex items-center space-x-6 mb-10">
            <img src="https://i.pravatar.cc/150?u=shooter" className="w-20 h-20 rounded-3xl border-2 border-blue-500" />
            <div>
              <span className="block text-2xl font-black uppercase leading-tight">Pedro Atirador</span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Nível: Avançado • Associado Elite</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-red-500 transition-all group">
               <ShieldAlert className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Emergência</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-green-500 transition-all group">
               <CheckCircle2 className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Finalizar</span>
            </button>
          </div>

          <div className="space-y-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Checklist de Segurança</h4>
             <div className="grid grid-cols-1 gap-2">
                {['Proteção Auricular/Ocular', 'Verificação de Calibre', 'Status de Municiamento'].map(check => (
                  <label key={check} className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600 bg-transparent" />
                    <span className="text-sm font-bold text-gray-300">{check}</span>
                  </label>
                ))}
             </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="glass p-10 rounded-[40px] border-white/5 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black uppercase tracking-tighter">Meus Próximos Alunos</h3>
            <div className="flex items-center space-x-2 text-gray-500">
               <Clock className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Fuso: Horário de Brasília</span>
            </div>
          </div>

          <div className="space-y-4 flex-grow">
            {[
              { name: 'Ricardo Alencar', type: 'Exp. Visitante', time: '14:30', lane: 'Pista A-01' },
              { name: 'Sgt. Bruno', type: 'Treino Tático', time: '16:00', lane: 'Pista C-02' },
              { name: 'Dra. Fernanda', type: 'Avaliação CR', time: '17:30', lane: 'Pista A-04' },
            ].map((item, idx) => (
              <div key={idx} className="group flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all">
                     <Users className="w-6 h-6 text-gray-400 group-hover:text-white" />
                   </div>
                   <div>
                     <span className="block text-sm font-black text-white">{item.name}</span>
                     <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{item.type}</span>
                   </div>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-black text-white">{item.time}</span>
                  <span className="text-[8px] uppercase font-bold text-blue-500 tracking-[0.2em]">{item.lane}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-10 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
            Relatório de Turno
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
