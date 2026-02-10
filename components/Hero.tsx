import React from 'react';
import { FIRM_TAGLINE } from '../constants';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
          alt="Law Firm Library" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-900/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h2 className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-4">
            Defensa Jurídica de Alto Nivel
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            {FIRM_TAGLINE}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-light">
            Especialistas en litigación compleja. Peleamos sus batallas en tribunales con rigor, estrategia y excelencia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-sm uppercase tracking-wider transition-all transform hover:-translate-y-1 shadow-lg"
            >
              Agendar Consulta
            </button>
            <button 
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-white text-white hover:bg-white hover:text-navy-900 font-bold rounded-sm uppercase tracking-wider transition-all"
            >
              Nuestras Áreas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;