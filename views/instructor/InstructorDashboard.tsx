
import React, { useState } from 'react';
import { Target, ShieldAlert, CheckCircle2, Clock, Users, Camera } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [checklist, setChecklist] = useState({ aur: false, ocu: false, mun: false });

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Operação de <span className="text-blue-500">Pista</span></h1>
          <p className="text-gray-500 text-sm mt-1">Controle imediato e segurança operacional.</p>
        </div>
        <div className="flex items-center space-x-3 bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-600/20">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Em Serviço: Nascimento</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[40px] border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-transparent relative min-h-[500px]">
          {!sessionActive ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500"><Target className="w-10 h-10" /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Nenhuma Sessão Ativa</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Aguardando check-in do próximo atirador.</p>
              </div>
              <button 
                onClick={() => setSessionActive(true)}
                className="bg-blue-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Chamar Próximo (Pista B-03)
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex items-center space-x-6">
                <img src="https://i.pravatar.cc/150?u=shooter" className="w-24 h-24 rounded-3xl border-2 border-blue-500 p-1" />
                <div>
                  <span className="block text-2xl font-black uppercase leading-tight">Pedro Atirador</span>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500 px-2 py-1 rounded text-white">Elite</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">ID #4059</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSessionActive(false)} className="group flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-red-600 transition-all">
                  <ShieldAlert className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Abortar</span>
                </button>
                <button onClick={() => setSessionActive(false)} className="group flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-green-500 transition-all">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Finalizar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-10 text-white">
            <h3 className="text-xl font-black uppercase tracking-tighter">Fila do Dia</h3>
            <Clock className="w-5 h-5 opacity-50" />
          </div>
          <div className="space-y-4 flex-grow">
            {[
              { name: 'Ricardo Alencar', type: 'Visitante', time: '14:30', lane: 'Pista A-01' },
              { name: 'Sgt. Bruno', type: 'Treino Tático', time: '16:00', lane: 'Pista C-02' },
            ].map((item, idx) => (
              <div key={idx} className="group flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all text-gray-400 group-hover:text-white"><Users className="w-6 h-6" /></div>
                   <div>
                     <span className="block text-sm font-black text-white">{item.name}</span>
                     <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{item.type}</span>
                   </div>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-black text-white">{item.time}</span>
                  <span className="text-[8px] uppercase font-bold text-gray-500 tracking-[0.2em]">{item.lane}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
