
import React from 'react';
import { Check, Shield } from 'lucide-react';
import { PLANS } from '../constants';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4"
        >
          ESCOLHA SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">ARSENAL.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400"
        >
          Pacotes desenhados para todos os níveis de experiência.
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 px-4">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            className={`relative p-10 rounded-[40px] transition-all duration-500 group flex flex-col ${plan.recommended
                ? 'bg-[#111] border-2 border-red-600 scale-105 z-10 shadow-2xl shadow-red-900/20'
                : 'bg-[#0a0a0a] border border-white/5 hover:border-white/20'
              }`}
          >
            {plan.recommended && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 flex items-center gap-2">
                <Shield className="w-3 h-3 fill-current" />
                Mais Escolhido
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                <span className="text-gray-500 uppercase text-xs font-bold">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-4 mb-12 flex-grow">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-gray-400'
                    }`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-300 leading-tight font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${plan.recommended
                ? 'bg-red-600 text-white hover:bg-red-700 glow-red transform hover:scale-105 active:scale-95'
                : 'bg-white/5 text-white hover:bg-white/10 hover:border-white/30 border border-transparent'
              }`}>
              Assinar Plano
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
