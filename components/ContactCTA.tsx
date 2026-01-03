
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { useCRM } from '../hooks/useCRM';

export const ContactCTA: React.FC = () => {
    const { submitLead } = useCRM();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await submitLead({ ...formData, source: 'Home Contact Section' });
        setIsSubmitting(false);

        if (result.success) {
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setIsSuccess(false), 5000);
        } else {
            alert('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
        }
    };

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block italic">Junte-se ao Elite</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-8 italic">
                            Pronto para <br />
                            <span className="text-red-600">Mudar o Jogo?</span>
                        </h2>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg mb-12">
                            Se você busca excelência, segurança e uma comunidade de alto nível, o CTC Cruzeiro é o seu lugar. Deixe seus dados e receba nossa consultoria exclusiva.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: 'Dúvidas Técnicas', desc: 'Fale com nossos especialistas em armamento.' },
                                { title: 'Planos Corporativos', desc: 'Soluções exclusivas para empresas e grupos.' },
                                { title: 'Visita Agendada', desc: 'Conheça nossa estrutura internacional de perto.' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-red-600/20 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 font-black italic">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-tight text-sm mb-1">{item.title}</h4>
                                        <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-red-600/10 rounded-[48px] blur-3xl -z-10" />

                        <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                            {isSuccess ? (
                                <div className="py-20 text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Dados Recebidos!</h3>
                                    <p className="text-gray-400 font-medium">Um de nossos consultores entrará em contato com você em menos de 24 horas.</p>
                                    <Button
                                        onClick={() => setIsSuccess(false)}
                                        variant="outline"
                                        className="mt-10 rounded-2xl border-white/10 text-white"
                                    >
                                        Enviar Nova Mensagem
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Nome Completo</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Como podemos te chamar?"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-red-600/50 transition-all placeholder:text-gray-700"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">E-mail Profissional</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-red-600/50 transition-all placeholder:text-gray-700"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">WhatsApp</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-red-600/50 transition-all placeholder:text-gray-700"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Como podemos te ajudar?</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-5 top-6 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                            <textarea
                                                rows={4}
                                                placeholder="Descreva seu interesse ou envie sua dúvida..."
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-white text-sm font-medium focus:outline-none focus:border-red-600/50 transition-all placeholder:text-gray-700 resize-none"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-red-600 hover:bg-red-700 h-20 rounded-[24px] text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-red-600/30 group disabled:opacity-50 transition-all"
                                    >
                                        <span>Solicitar Consultoria</span>
                                        <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>

                                    <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest max-w-[80%] mx-auto leading-relaxed">
                                        Ao enviar, você autoriza o CTC a entrar em contato via WhatsApp ou e-mail conforme as leis de privacidade.
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
