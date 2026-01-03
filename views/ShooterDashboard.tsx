
import React from 'react';
import { Calendar, Target, Award, CreditCard, ChevronRight, Play } from 'lucide-react';
import { useAuth } from '../store/authStore';

const ShooterDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Olá, <span className="text-red-600">{user?.name.split(' ')[0]}</span></h1>
          <p className="text-gray-500 text-sm mt-1">Status da sua filiação: <span className="text-green-500 font-bold uppercase text-[10px] tracking-widest">Verificado & Ativo</span></p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all">
          <Calendar className="w-4 h-4" />
          <span>Agendar Nova Sessão</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border-white/5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-600/10 rounded-xl text-red-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest">Plano Ativo</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter">Operador Premium</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Renovação em 15 Out 2024</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest">Total de Disparos</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter">1.450</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Acúmulo total na plataforma</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-yellow-600/10 rounded-xl text-yellow-500">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest">Certificações</h4>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tighter">04</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Válidas no sistema</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Next Session */}
        <div className="glass p-8 rounded-[40px] border-red-600/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
               <Play className="w-5 h-5 fill-current" />
             </div>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Próximo Agendamento</h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black">22</span>
                <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-bold">Outubro</span>
              </div>
              <div>
                <span className="block text-lg font-black uppercase text-white">Sessão de Treinamento</span>
                <span className="text-sm text-gray-400">Pista A-01 • 14:30h - 15:30h</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/150?u=instructor" className="w-8 h-8 rounded-full border-2 border-[#0a0a0a]" />
                <div className="pl-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest self-center">Inst: Cap. Nascimento</div>
              </div>
              <button className="text-xs font-bold uppercase tracking-widest text-red-500 underline">Gerenciar</button>
            </div>
          </div>
        </div>

        {/* History Preview */}
        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter">Últimas Atividades</h3>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {[
              { type: 'Treino Livre', date: '15 Out', result: '92% Precisão' },
              { type: 'Curso Tático I', date: '02 Out', result: 'Aprovado' },
              { type: 'Competição Interna', date: '22 Set', result: '3º Lugar' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold">{item.type}</span>
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
