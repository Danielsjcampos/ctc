
import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'O Clube', href: '#features' },
    { name: 'Planos', href: '#pricing' },
    { name: 'Cursos', href: '#courses' },
    { name: 'Calendário', href: '#timeline' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
          ? 'bg-black/80 backdrop-blur-xl py-4 border-white/10'
          : 'bg-transparent py-6 border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <Shield className="w-10 h-10 text-red-600 relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter leading-none text-white font-sans">
              CTC<span className="text-red-600">CRUZEIRO</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 group-hover:text-red-500 transition-colors">
              Elite Shooting Club
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors group py-2"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          <Link
            to="/login"
            className="group relative px-6 py-2.5 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 skewed-button overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Área do Membro <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white hover:text-red-500 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xl font-black uppercase tracking-tight text-white/80 hover:text-red-500 hover:pl-4 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/login"
                className="bg-red-600 text-white text-center py-4 rounded-none font-black uppercase tracking-widest hover:bg-red-700 transition-colors w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Acessar Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
