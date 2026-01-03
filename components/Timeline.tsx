
import React from 'react';
import { STEPS } from '../constants';
import { motion } from 'framer-motion';

const Timeline: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="relative grid md:grid-cols-4 gap-8">
        {/* Connection Line (Desktop) */}
        <div className="hidden md:block absolute top-[3rem] left-0 right-0 h-0.5 bg-gradient-to-r from-red-900/0 via-red-600 to-red-900/0" />

        {STEPS.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            className="relative group"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative z-10 w-24 h-24 bg-[#0a0a0a] border-4 border-[#222] group-hover:border-red-600 rounded-3xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-red-600/20">
                  0{idx + 1}
                </span>
                <div className="text-white group-hover:text-red-500 transition-colors">
                  {step.icon}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-red-500 transition-colors">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-500 px-4 leading-relaxed group-hover:text-gray-400 transition-colors">
                  {step.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
