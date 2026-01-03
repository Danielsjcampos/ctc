import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Course, useCourses } from '../../hooks/useCourses';
import { Header as Navbar } from '../../components/ui/header-2';
import Footer from '../../components/Footer';
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle, Share2, ChevronLeft, User, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

const CourseDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { registerLead } = useCourses();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [registerStep, setRegisterStep] = useState<'form' | 'success'>('form');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) fetchCourse(id);
    }, [id]);

    const fetchCourse = async (courseId: string) => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (error) throw error;
            setCourse(data);
        } catch (err) {
            console.error('Error loading course:', err);
            navigate('/eventos'); // Redirect if not found
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        setIsSubmitting(true);
        const result = await registerLead(course.id, { ...formData, source: 'frontend_detail_page' });
        setIsSubmitting(false);

        if (result.success) {
            setRegisterStep('success');
        } else {
            alert('Erro ao realizar inscrição. Tente novamente.');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando...</div>;
    }

    if (!course) return null;

    const spotsLeft = course.slots - course.enrolled;
    const progress = (course.enrolled / course.slots) * 100;

    return (
        <div className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-red-600/30">
            <Navbar />

            <main className="pt-24 pb-20">
                {/* Hero / Header Section */}
                <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </div>

                    <div className="absolute inset-0 flex items-center">
                        <div className="max-w-7xl mx-auto px-6 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="mb-8 text-white/60 hover:text-white hover:bg-white/10 -ml-4"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Voltar
                            </Button>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-4xl"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                                        {course.category}
                                    </span>
                                    {spotsLeft <= 5 && spotsLeft > 0 && (
                                        <span className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 animate-pulse">
                                            <AlertCircle className="w-3 h-3" />
                                            Últimas {spotsLeft} Vagas
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6 italic">
                                    {course.title}
                                </h1>

                                <div className="flex flex-wrap gap-6 md:gap-12 text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                            <Calendar className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-gray-500">Data</span>
                                            <span className="text-sm font-bold text-white">{course.date}</span>
                                        </div>
                                    </div>

                                    {(course.start_time || course.end_time) && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <Clock className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-black uppercase tracking-widest text-gray-500">Horário</span>
                                                <span className="text-sm font-bold text-white">
                                                    {course.start_time || '--'} às {course.end_time || '--'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                            <MapPin className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-gray-500">Local</span>
                                            <span className="text-sm font-bold text-white">CTC Cruzeiro - Estande Principal</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Description Card */}
                            <div className="bg-[#0d0d0d] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl backdrop-blur-md">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-red-600" />
                                    Sobre o Treinamento
                                </h3>
                                <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed whitespace-pre-line">
                                    {course.description}
                                </div>

                                <div className="mt-12 flex flex-col md:flex-row gap-6 pt-12 border-t border-white/5">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">O que está incluso</h4>
                                        <ul className="space-y-3">
                                            {['Certificado Oficial', 'Munição e Alvos', 'Equipamento de Proteção', 'Instrutores Certificados'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Pré-requisitos</h4>
                                        <ul className="space-y-3">
                                            {['Maior de 18 anos', 'Documento com foto', 'Sapatos fechados'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Registration */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32">
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent" />

                                    {registerStep === 'success' ? (
                                        <div className="text-center py-10 animate-in zoom-in-95">
                                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                            </div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Inscrição Recebida!</h3>
                                            <p className="text-gray-400 text-sm mb-8">
                                                Sua pré-reserva foi realizada com sucesso. Nossa equipe entrará em contato para confirmar o pagamento.
                                            </p>
                                            <Button
                                                onClick={() => navigate('/eventos')}
                                                variant="outline"
                                                className="w-full rounded-2xl border-white/10 text-white hover:bg-white/5"
                                            >
                                                Ver Outros Cursos
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-8">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Valor da Inscrição</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black text-white tracking-tighter">{course.price}</span>
                                                    <span className="text-sm text-gray-500 font-bold">/ pessoa</span>
                                                </div>
                                            </div>

                                            <div className="bg-black/30 rounded-2xl p-6 mb-8 border border-white/5">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vagas Preenchidas</span>
                                                    <span className="text-[10px] font-bold text-white">{course.enrolled} / {course.slots}</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                                </div>
                                                {spotsLeft === 0 && (
                                                    <p className="text-red-500 text-xs font-bold mt-3 uppercase tracking-wide text-center">Inscrições Encerradas</p>
                                                )}
                                            </div>

                                            <form onSubmit={handleRegister} className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Nome Completo</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="Seu nome"
                                                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-red-600 transition-all placeholder:text-gray-700"
                                                            value={formData.name}
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">E-mail</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            required
                                                            type="email"
                                                            placeholder="seu@email.com"
                                                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-red-600 transition-all placeholder:text-gray-700"
                                                            value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">WhatsApp</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            required
                                                            type="tel"
                                                            placeholder="(00) 00000-0000"
                                                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-red-600 transition-all placeholder:text-gray-700"
                                                            value={formData.phone}
                                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting || spotsLeft === 0}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-red-600/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? 'Processando...' : spotsLeft === 0 ? 'Lotado' : 'Garantir Minha Vaga'}
                                                </Button>

                                                <p className="text-[9px] text-center text-gray-600 font-medium">
                                                    Pagamento realizado posteriormente via PIX ou Cartão.
                                                </p>
                                            </form>
                                        </>
                                    )}
                                </div>
                                <div className="mt-6 text-center">
                                    <button className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
                                        <Share2 className="w-4 h-4" />
                                        Compartilhar Página
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CourseDetailView;
