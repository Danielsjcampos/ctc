
import React, { useState } from 'react';
import { ShoppingBag, Star, Clock, CheckCircle2, Loader2, X } from 'lucide-react';
import { useCourses, Course } from '../../hooks/useCourses';
import { useAuth } from '../../store/authStore';

const CoursesStoreView: React.FC = () => {
  const { courses, loading, registerLead } = useCourses();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!user || !selectedCourse) return;
    setRegistering(true);

    // Register as 'frontend' source because it's the public/member portal
    const result = await registerLead(selectedCourse.id, {
      name: user.name,
      email: user.email,
      phone: user.phone || 'Sem Telefone',
      total_amount: selectedCourse.price ? parseFloat(selectedCourse.price.replace(/[^\d.,]/g, '').replace(',', '.')) : 0,
      amount_paid: 0,
      payment_method: 'PIX',
      source: 'frontend'
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedCourse(null);
      }, 3000);
    } else {
      alert('Erro ao realizar reserva. Tente novamente.');
    }
    setRegistering(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">ELITE <span className="text-red-600">ACADEMY</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Treinamentos exclusivos para elevar sua performance técnica.</p>
        </div>
        <div className="bg-red-600/10 border border-red-600/20 px-6 py-3 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-red-500 tracking-widest italic flex items-center gap-2">
            <Star className="w-3 h-3 fill-current" />
            Sua Categoria: {user?.membership_type || 'RECRUTA'} (25% OFF EXCLUSIVO)
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.filter(c => c.is_active).map((course) => (
          <div key={course.id} className="group glass rounded-[48px] overflow-hidden border-white/5 hover:border-red-600/30 transition-all duration-500 flex flex-col h-full bg-[#0a0a0a]">
            <div className="relative h-60 overflow-hidden">
              <img src={course.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
              <div className="absolute top-6 left-6 bg-red-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20">
                {course.category}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
            </div>

            <div className="p-10 space-y-6 flex flex-grow flex-col relative -mt-4 bg-[#0a0a0a] rounded-t-[40px]">
              <div className="flex items-center space-x-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center space-x-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                  <Star className="w-3.5 h-3.5 fill-current" /> <span>4.9</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Clock className="w-3.5 h-3.5" /> <span>16h Aula</span>
                </div>
              </div>

              <div className="space-y-3 flex-grow">
                <h3 className="text-2xl font-black uppercase text-white leading-tight italic">{course.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 font-medium">{course.description}</p>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-600 font-bold line-through uppercase tracking-widest mb-1">Valor Normal</span>
                  <span className="text-3xl font-black text-white tracking-tighter italic">{course.price}</span>
                </div>
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="bg-red-600 hover:bg-red-700 text-white p-5 rounded-3xl transition-all shadow-2xl shadow-red-600/20 group-hover:-translate-y-1"
                >
                  <ShoppingBag className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg rounded-[48px] p-12 border-red-600/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-10" />

            <button onClick={() => setSelectedCourse(null)} className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white bg-white/5 rounded-2xl transition-all">
              <X className="w-6 h-6" />
            </button>

            {success ? (
              <div className="py-20 text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mx-auto border border-green-600/30">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic">RESERVA CONCLUÍDA!</h3>
                  <p className="text-gray-500 text-sm mt-3 font-medium uppercase tracking-[0.2em]">O clube já recebeu sua solicitação.</p>
                </div>
                <div className="pt-8">
                  <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest animate-pulse">
                    +100 PONTOS DE RANKING ESTIMADOS APÓS CONCLUSÃO
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2 block italic">CONFIRMAÇÃO DE INSCRIÇÃO</span>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none italic">
                    {selectedCourse.title}
                  </h2>
                </div>

                <div className="space-y-6 bg-white/[0.02] p-8 rounded-[40px] border border-white/5 font-medium">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase tracking-widest font-black text-[10px]">Atirador</span>
                    <span className="text-white font-black uppercase">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-white/5 pt-6">
                    <span className="text-gray-500 uppercase tracking-widest font-black text-[10px]">Valor da Matrícula</span>
                    <span className="text-white font-black">{selectedCourse.price}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-6">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pagamento</span>
                    <div className="bg-red-600/10 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                      ACERTO NO LOCAL / PIX
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-red-600/30 flex items-center justify-center gap-3 transition-all"
                >
                  {registering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>GARANTIR MINHA VAGA AGORA</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest italic">
                  AO RESERVAR, VOCÊ CONCORDA EM RESPEITAR O REGULAMENTO DE SEGURANÇA DO CLUBE.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default CoursesStoreView;
