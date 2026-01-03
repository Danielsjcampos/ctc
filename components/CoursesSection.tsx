
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export const CoursesSection: React.FC = () => {
    const { courses, loading } = useCourses();
    const navigate = useNavigate();

    if (loading) return null;

    return (
        <section id="courses" className="py-24 bg-black relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="max-w-2xl">
                        <span className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Elite Academy</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                            Treinamentos de <br />
                            <span className="text-red-600">Alta Performance</span>
                        </h2>
                    </div>
                    <Button variant="outline" className="rounded-full border-white/10 text-white hover:bg-white/5 uppercase font-bold tracking-widest text-[10px] px-8 py-6 h-auto">
                        Ver Agenda Completa
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {courses.slice(0, 3).map((course) => (
                        <div
                            key={course.id}
                            className="group bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden hover:border-red-600/50 transition-all duration-500 flex flex-col h-full"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={course.image_url}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                        {course.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-red-500 transition-colors">
                                        {course.title}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase text-gray-500 font-bold tracking-widest mb-1">Data do Evento</span>
                                        <div className="flex items-center text-white space-x-2">
                                            <Calendar className="w-3.5 h-3.5 text-red-600" />
                                            <span className="text-sm font-bold">{course.date}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] uppercase text-gray-500 font-bold tracking-widest mb-1">Investimento</span>
                                        <span className="block text-lg font-black text-red-600">{course.price}</span>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-8 line-clamp-2 leading-relaxed">
                                    {course.description}
                                </p>

                                <div className="mt-auto pt-6 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase text-gray-500 font-bold tracking-widest mb-2 font-sans">Vagas Restantes</span>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 w-4 rounded-full ${i < (5 - (course.enrolled / course.slots * 5)) ? 'bg-red-600' : 'bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => navigate(`/courses/${course.id}`)}
                                        className="bg-white/5 hover:bg-red-600 text-white hover:text-white rounded-2xl w-12 h-12 p-0 flex items-center justify-center border border-white/10 hover:border-red-600 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
