
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Target, CheckCircle } from 'lucide-react';

const BookingView: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Reservar <span className="text-red-600">Minha Raia</span></h1>
        <div className="flex justify-center items-center space-x-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex items-center space-x-2 ${step === s ? 'text-red-500' : 'text-gray-500'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 ${
                 step === s ? 'border-red-600 bg-red-600 text-white' : 'border-white/10'
               }`}>{s}</div>
               <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:block">Passo {s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-10 rounded-[40px] border-white/5 min-h-[400px]">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-black uppercase tracking-tighter">Escolha a Categoria</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Treino Livre', desc: 'Uso de pista para prática individual.', icon: <Target /> },
                { title: 'Experiência Visitante', desc: 'Para quem ainda não possui equipamento.', icon: <CalendarIcon /> }
              ].map(opt => (
                <button 
                  key={opt.title}
                  onClick={() => setStep(2)}
                  className="p-8 bg-white/5 border border-white/5 rounded-3xl text-left hover:border-red-600 transition-all group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-all text-gray-500 group-hover:text-white">
                    {opt.icon}
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white mb-2">{opt.title}</h4>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-black uppercase tracking-tighter">Escolha o Horário</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                <button 
                  key={t}
                  onClick={() => setStep(3)}
                  className="py-6 bg-white/5 border border-white/5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-gray-500">Voltar</button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-12 animate-fade-in">
             <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
               <CheckCircle className="w-12 h-12 text-green-500" />
             </div>
             <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter">Agendamento Solicitado!</h3>
               <p className="text-gray-500 mt-2">Você receberá uma confirmação em breve no seu email.</p>
             </div>
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 w-full max-w-sm">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-3 mb-3">
                   <span className="text-gray-500">Pista</span>
                   <span className="text-white">B-03 (Tático)</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                   <span className="text-gray-500">Horário</span>
                   <span className="text-white">Hoje, às 16:00h</span>
                </div>
             </div>
             <button onClick={() => setStep(1)} className="text-xs font-black uppercase tracking-widest text-red-500 underline">Fazer Outra Reserva</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingView;
