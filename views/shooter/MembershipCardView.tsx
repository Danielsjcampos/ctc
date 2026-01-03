
import React from 'react';
import { ShieldCheck, QrCode, Award, Calendar, Loader2, Download, UserCircle } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MembershipCardView: React.FC = () => {
  const { user } = useAuth();
  const { settings, loading } = useSystemSettings();
  const cardRef = React.useRef<HTMLDivElement>(null);

  const renderedTemplate = React.useMemo(() => {
    if (!settings?.membership_card_template || !user) return null;

    return settings.membership_card_template
      .replace(/{{LOGO_URL}}/g, settings.logo_url || '')
      .replace(/{{CLIENT_NAME}}/g, user.name || '')
      .replace(/{{CLIENT_PHOTO}}/g, user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
      .replace(/{{MEMBERSHIP_TYPE}}/g, user.membership_type || 'RECRUTA')
      .replace(/{{EXPIRY_DATE}}/g, user.affiliation_expiry ? new Date(user.affiliation_expiry).toLocaleDateString() : 'N/D')
      .replace(/{{ID_NUMBER}}/g, user.id.slice(0, 8).toUpperCase());
  }, [settings, user]);

  const exportPDF = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: null
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', [canvas.width / 4, canvas.height / 4]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 4, canvas.height / 4);
      pdf.save(`carteirinha_${user?.name?.toLowerCase().replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Erro ao gerar PDF da carteirinha.');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>;

  return (
    <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in py-10 pb-32">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Minha <span className="text-red-600">ID Digital</span></h1>
        <p className="text-gray-500 text-sm max-w-sm">Apresente sua carteira para acesso e retiradas no clube.</p>
      </div>

      <div className="relative w-full flex justify-center group" ref={cardRef}>
        {renderedTemplate ? (
          <div
            dangerouslySetInnerHTML={{ __html: renderedTemplate }}
            className="shadow-2xl rounded-3xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
          />
        ) : (
          <div className="relative w-full max-w-md">
            {/* Fallback Card Design if no template is set */}
            <div className="aspect-[1.58/1] bg-gradient-to-br from-[#1a1a1a] via-[#111111] to-[#0a0a0a] rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] -z-0" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-red-600" />
                    <span className="font-black text-sm tracking-tighter">ELITE SHIELD</span>
                  </div>
                  <div className="px-3 py-1 bg-red-600 rounded-lg text-[8px] font-black uppercase tracking-widest text-white">
                    Associado {user?.membership_type || 'Standard'}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest">Atirador</span>
                      <span className="block text-xl font-black uppercase">{user?.name}</span>
                    </div>
                    <div className="flex space-x-8">
                      <div className="space-y-1">
                        <span className="block text-[8px] uppercase font-bold text-gray-500 tracking-widest">ID Membro</span>
                        <span className="block text-xs font-bold text-white">#{user?.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[8px] uppercase font-bold text-gray-500 tracking-widest">Validade</span>
                        <span className="block text-xs font-bold text-white">{user?.affiliation_expiry ? new Date(user?.affiliation_expiry).toLocaleDateString() : 'N/D'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-xl">
                    <QrCode className="w-16 h-16 text-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shadow effect */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-red-600/20 blur-3xl rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <button
          onClick={() => window.location.hash = '#/portal/profile'}
          className="flex items-center justify-center space-x-3 bg-white/5 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          <UserCircle className="w-4 h-4 text-blue-500" />
          <span className="hidden md:inline">Meu Perfil</span>
        </button>
        <button className="flex items-center justify-center space-x-3 bg-white/5 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="hidden md:inline">Vantagens</span>
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center justify-center space-x-3 bg-red-600 border border-red-600/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all text-white shadow-lg shadow-red-600/20"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Exportar PDF</span>
        </button>
      </div>
    </div>
  );
};

export default MembershipCardView;
