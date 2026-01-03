
import React, { useState } from 'react';
import { Header } from '../components/ui/header-2';
import Footer from '../components/Footer';
import { useCourses, Course } from '../hooks/useCourses';
import { Calendar, Clock, ChevronRight, X, Phone, Mail, User, CheckCircle2, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';

const EventsView: React.FC = () => {
    const { courses, loading, registerLead } = useCourses();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;

        setIsSubmitting(true);
        const result = await registerLead(selectedCourse.id, formData);
        setIsSubmitting(false);

        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setIsSuccess(false);
                setFormData({ name: '', email: '', phone: '' });
                setSelectedCourse(null);
            }, 3000);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-red-600 selection:text-white">
            <Header />

            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                        <span className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px] bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">Calendário Oficial</span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">
                            Eventos <br />
                            <span className="text-red-600 text-stroke-white">& Academy</span>
                        </h1>
                        <p className="text-gray-400 font-medium text-lg leading-relaxed">
                            Acompanhe nossa agenda completa de campeonatos, clínicas de tiro e cursos de formação tática. Reserve sua vaga antecipadamente.
                        </p>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-12">
                        <div className="relative flex-grow">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por treinamento, instrutor ou categoria..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-white focus:outline-none focus:border-red-600/50 transition-all font-bold uppercase tracking-widest text-[10px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="rounded-3xl border-white/10 h-auto py-6 px-10 bg-white/[0.03] text-white hover:bg-white/5 uppercase font-black tracking-widest text-[10px]">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtrar Categoria
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 grayscale opacity-20 animate-pulse">
                            <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group relative bg-[#0d0d0d] border border-white/5 rounded-[40px] overflow-hidden flex flex-col md:flex-row items-stretch hover:border-red-600/30 transition-all duration-500 min-h-[320px]"
                                >
                                    <div className="w-full md:w-[400px] relative overflow-hidden shrink-0">
                                        <img
                                            src={course.image_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent hidden md:block" />
                                        <div className="absolute top-8 left-8">
                                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                                                {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-10 md:p-12 flex flex-col justify-between flex-grow">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-red-600" />
                                                    <span className="text-white">{course.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-red-600" />
                                                    <span className="text-white">16H AULA</span>
                                                </div>
                                                <div className="h-4 w-px bg-white/10 hidden md:block" />
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    <span className="text-white">CERTIFICADO OFICIAL</span>
                                                </div>
                                            </div>

                                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white group-hover:text-red-500 transition-colors leading-none">
                                                {course.title}
                                            </h2>

                                            <p className="text-gray-400 text-base max-w-2xl leading-relaxed font-medium">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-12 pt-8 border-t border-white/5">
                                            <div className="flex gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Investimento</span>
                                                    <span className="text-3xl font-black text-white italic">{course.price}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Disponibilidade</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[11px] font-black px-3 py-1 rounded-lg ${course.enrolled >= course.slots ? 'bg-red-600/10 text-red-500' : 'bg-green-500/10 text-green-500 uppercase'}`}>
                                                            {course.enrolled >= course.slots ? 'ESGOTADO' : `${course.slots - course.enrolled} VAGAS`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setShowModal(true);
                                                }}
                                                disabled={course.enrolled >= course.slots}
                                                className="bg-red-600 hover:bg-red-700 h-16 px-10 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 disabled:opacity-30 self-stretch md:self-auto group/btn"
                                            >
                                                <span>Reservar Treinamento</span>
                                                <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-all" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Reservation Modal - Reused from CoursesSection */}
            {showModal && selectedCourse && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setShowModal(false)} />

                    <div className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-xl rounded-[40px] overflow-hidden shadow-3xl">
                        {isSuccess ? (
                            <div className="p-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Sucesso!</h3>
                                <p className="text-gray-400 font-medium text-lg">Recebemos sua reserva. Um de nossos especialistas entrará em contato em breve.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 block italic">Formulário de Inscrição</span>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{selectedCourse.title}</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleRegister} className="p-10 space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Nome Completo</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-red-600/50 transition-all font-bold"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">E-mail</label>
                                                <input
                                                    required
                                                    type="email"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-red-600/50 transition-all font-bold"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">WhatsApp</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-red-600/50 transition-all font-bold"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-red-600 hover:bg-red-700 h-20 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-red-600/30 disabled:opacity-50 transition-all group/btn"
                                    >
                                        <span>Solicitar Reserva de Vaga</span>
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-all" />
                                    </Button>

                                    <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest max-w-[80%] mx-auto leading-relaxed">
                                        Ao clicar, você será contatado para validar seus documentos técnicos e confirmar o pagamento.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default EventsView;
