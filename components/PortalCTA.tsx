
import React from 'react';
import { Lock, Rocket, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortalCTA: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Premium Final CTA */}
      <div className="relative overflow-hidden rounded-[50px] p-12 md:p-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-900 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
            PRONTO PARA O SEU PRÓXIMO <span className="text-black/40">NÍVEL?</span>
          </h2>
          <p className="text-xl text-white/80 font-medium">
            Junte-se a centenas de atiradores que escolheram a Elite Shield para sua evolução tática e esportiva.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-white text-black px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-2xl">
              Falar com Consultor
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-transparent border-2 border-white/30 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:border-white transition-all">
              <Rocket className="w-5 h-5" />
              <span>Ver Planos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Access Portal Highlight */}
      <div className="grid md:grid-cols-2 gap-8">
        <Link to="/login" className="group flex items-center justify-between p-8 glass rounded-[32px] border-white/5 hover:border-red-600 transition-all duration-500">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight text-white">Área do Atirador</h4>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Gestão de CR, Raia e Cursos</p>
            </div>
          </div>
          <div className="hidden sm:block p-4 border border-white/10 rounded-full group-hover:bg-white group-hover:text-black transition-all">
            <ArrowIcon />
          </div>
        </Link>

        <a href="https://wa.me/550000000000" className="group flex items-center justify-between p-8 glass rounded-[32px] border-white/5 hover:border-blue-500 transition-all duration-500">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight text-white">Suporte Direto</h4>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Dúvidas via WhatsApp</p>
            </div>
          </div>
          <div className="hidden sm:block p-4 border border-white/10 rounded-full group-hover:bg-white group-hover:text-black transition-all">
            <ArrowIcon />
          </div>
        </a>
      </div>
    </div>
  );
};

const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default PortalCTA;
