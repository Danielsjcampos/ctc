
import React from 'react';
import { motion } from "framer-motion";

// --- Types ---
interface Testimonial {
    text: string;
    image: string;
    name: string;
    role: string;
}

// --- Data (Adapted for Shooting Club) ---
const testimonials: Testimonial[] = [
    {
        text: "A estrutura do CTC é sensacional. O atendimento e a segurança nas pistas são prioridades que sinto toda vez que venho treinar.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Mariana Silva",
        role: "Socia Operadora",
    },
    {
        text: "Me tornei sócio e a evolução no meu tiro foi nítida. O ambiente é extremamente profissional e focado na técnica.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Ricardo Alencar",
        role: "Atirador Esportivo",
    },
    {
        text: "O melhor clube da região para lazer em família. Enquanto treino, minha família aproveita o espaço social com total conforto.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Ana Carla",
        role: "Socia Recruta",
    },
    {
        text: "A assessoria documental deles é impecável. Regularizei todo meu acervo sem burocracia e com rapidez.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Coronel Mendes",
        role: "CAC - Atirador",
    },
    {
        text: "Os cursos de aperfeiçoamento tático são de outro nível. O instrutor tem um domínio absurdo do conteúdo.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Juliana Santos",
        role: "Policial Federal",
    },
    {
        text: "Espaço impecável, arsenal variado para locação e raias muito bem ventiladas. Referência absoluta em Minas.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Fabiano Costa",
        role: "Empresário",
    },
    {
        text: "Incrível como o clube integra esporte e networking. Fiz ótimas parcerias comerciais aqui no lounge.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Roberto Dias",
        role: "CEO",
    },
    {
        text: "Para quem busca segurança e instrução do zero, o CTC é o lugar. O curso básico me deu confiança total.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Sandra Oliveira",
        role: "Iniciante",
    },
    {
        text: "O sistema de agendamento pelo App facilita demais. Chego no clube e minha raia já está pronta. Eficiência pura.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
        name: "Lucas Pereira",
        role: "Sócio Elite",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
const TestimonialsColumn = (props: {
    className?: string;
    testimonials: Testimonial[];
    duration?: number;
}) => {
    return (
        <div className={props.className}>
            <motion.ul
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
            >
                {[
                    ...new Array(2).fill(0).map((_, index) => (
                        <React.Fragment key={index}>
                            {props.testimonials.map(({ text, image, name, role }, i) => (
                                <motion.li
                                    key={`${index}-${i}`}
                                    aria-hidden={index === 1 ? "true" : "false"}
                                    tabIndex={index === 1 ? -1 : 0}
                                    whileHover={{
                                        scale: 1.03,
                                        y: -8,
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                                        transition: { type: "spring", stiffness: 400, damping: 17 }
                                    }}
                                    className="p-10 rounded-3xl border border-white/5 shadow-2xl max-w-xs w-full bg-[#0d0d0d] transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-red-600/30"
                                >
                                    <blockquote className="m-0 p-0">
                                        <p className="text-gray-400 leading-relaxed font-medium m-0 transition-colors duration-300 text-sm italic">
                                            "{text}"
                                        </p>
                                        <footer className="flex items-center gap-3 mt-6">
                                            <img
                                                width={40}
                                                height={40}
                                                src={image}
                                                alt={`Avatar of ${name}`}
                                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-red-600/30 transition-all duration-300 ease-in-out"
                                            />
                                            <div className="flex flex-col">
                                                <cite className="font-black not-italic tracking-tighter leading-5 text-white uppercase text-xs">
                                                    {name}
                                                </cite>
                                                <span className="text-[10px] leading-5 tracking-widest text-red-600 font-bold uppercase mt-0.5 transition-colors duration-300">
                                                    {role}
                                                </span>
                                            </div>
                                        </footer>
                                    </blockquote>
                                </motion.li>
                            ))}
                        </React.Fragment>
                    )),
                ]}
            </motion.ul>
        </div>
    );
};

export const TestimonialsSection = () => {
    return (
        <section
            aria-labelledby="testimonials-heading"
            className="bg-black py-24 relative overflow-hidden"
        >
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="container px-4 z-10 mx-auto relative"
            >
                <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
                    <div className="flex justify-center">
                        <div className="border border-white/10 py-1 px-4 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-red-600 bg-red-600/5 transition-colors">
                            Nossa Comunidade
                        </div>
                    </div>

                    <h2 id="testimonials-heading" className="text-4xl md:text-6xl font-black tracking-tighter mt-6 text-center text-white uppercase leading-none italic">
                        Quem <span className="text-red-600">Confia</span> no CTC
                    </h2>
                    <p className="text-center mt-5 text-gray-400 text-lg font-medium leading-relaxed max-w-sm transition-colors">
                        Depoimentos reais de quem vive a experiência de tiro mais completa do Brasil.
                    </p>
                </div>

                <div
                    className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
                    role="region"
                    aria-label="Scrolling Testimonials"
                >
                    <TestimonialsColumn testimonials={firstColumn} duration={25} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={30} />
                </div>
            </motion.div>
        </section>
    );
};

export default TestimonialsSection;
