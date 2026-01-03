
import React from 'react';
import { ShieldAlert, Verified, LockKeyhole } from 'lucide-react';

const Safety: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
          Certificações de Segurança
        </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
          SEGURANÇA <br />
          É NOSSA <span className="text-blue-500">PRIORIDADE.</span>
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          Operamos sob os mais rígidos padrões internacionais. Nossa equipe conta com especialistas em gerenciamento de risco e instrução de tiro militar e civil, garantindo um ambiente controlado e seguro para toda sua família.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Verified className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase text-sm tracking-tight">Protocolos PF</h5>
              <p className="text-xs text-gray-500 mt-1">Totalmente homologado pela Polícia Federal.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase text-sm tracking-tight">Monitoramento 24h</h5>
              <p className="text-xs text-gray-500 mt-1">Cerca de 120 câmeras integradas com IA.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Stylized Visual Representation */}
        <div className="absolute -inset-10 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="relative aspect-square glass rounded-[40px] border-white/5 overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2072&auto=format&fit=crop" 
            alt="Segurança" 
            className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-12">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <span className="block text-3xl font-black text-white">100%</span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Taxa de Acidente Zero</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;
