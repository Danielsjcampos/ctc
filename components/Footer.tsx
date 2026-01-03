
import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Clock 
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none text-white">CTC-CRUZEIRO</span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-red-600">Shooting Club</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Excelência, segurança e comunidade. O maior clube de tiro e caça da região, agora totalmente digital.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-8">
            <h5 className="text-white font-black uppercase tracking-widest text-sm">Institucional</h5>
            <ul className="space-y-4">
              {['Sobre o CTC', 'Infraestrutura', 'Planos de Adesão', 'Cursos & Academy', 'Portal do Sócio'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h5 className="text-white font-black uppercase tracking-widest text-sm">Base Operacional</h5>
            <ul className="space-y-6">
              <li className="flex items-start space-x-3 text-gray-500">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm">Rodovia do Tiro, KM 12 - Cruzeiro do Sul - PR</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm">(44) 3333-3333</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm">contato@ctccruzeiro.com.br</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-8">
            <h5 className="text-white font-black uppercase tracking-widest text-sm">Horários</h5>
            <div className="space-y-4 glass p-6 rounded-2xl border-white/5">
              <div className="flex justify-between text-xs uppercase tracking-widest font-bold">
                <span className="text-gray-500">Ter - Sáb</span>
                <span className="text-white">09h - 21h</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest font-bold">
                <span className="text-gray-500">Domingo</span>
                <span className="text-white">09h - 15h</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest font-bold">
                <span className="text-gray-500">Segunda</span>
                <span className="text-red-500">Manutenção</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-white/5 pt-12 text-center space-y-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold max-w-4xl mx-auto leading-loose">
            Atividade regulamentada pelo Exército Brasileiro e Polícia Federal. CTC-Cruzeiro atua em conformidade com o Decreto 11.615/23. O acesso à área de tiro é restrito a maiores de 18 anos ou menores acompanhados por responsáveis legais.
          </p>
          <p className="text-xs text-gray-700">
            © 2024 CTC-Cruzeiro - Clube de Tiro e Caça Cruzeiro.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
