
import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { COURSES } from '../constants';

const Courses: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            PRÓXIMOS <span className="text-blue-500">TREINAMENTOS.</span>
          </h2>
          <p className="text-gray-400">Domine a arte do tiro esportivo com os melhores instrutores do país.</p>
        </div>
        <button className="flex items-center space-x-2 text-white font-bold uppercase tracking-widest hover:text-blue-500 transition-colors group">
          <span>Ver Calendário Completo</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {COURSES.map((course) => (
          <div key={course.id} className="group glass rounded-[32px] overflow-hidden border-white/5 hover:border-blue-500/30 transition-all duration-500">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {course.category}
              </div>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{course.date}</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                {course.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {course.description}
              </p>
              <button className="w-full pt-4 border-t border-white/5 flex items-center justify-between group-hover:text-blue-500 transition-colors">
                <span className="text-xs font-black uppercase tracking-widest">Garantir Vaga</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
