
import React from 'react';
import { BENEFITS, renderIcon } from '../constants';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {BENEFITS.map((benefit, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="group relative p-8 glass rounded-3xl border border-white/10 hover:border-red-600/50 transition-all duration-500 hover:-translate-y-2 bg-[#111]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

          <div className="relative space-y-6">
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
              {renderIcon(benefit.icon)}
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-red-500 transition-colors">
              {benefit.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
              {benefit.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Features;
