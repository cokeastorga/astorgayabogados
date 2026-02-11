import React from 'react';
import { FIRM_TAGLINE } from '../constants';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-navy-950">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero.jpg" // Imagen de carga/respaldo mientras carga el video o si falla
          className="w-full h-full object-cover"
        >
          {/* Se busca 'hero-background.mp4' en la carpeta public */}
          <source src="/hero-background.mp4" type="video/mp4" />
          {/* Fallback visual si el navegador no soporta video */}
          <img 
            src="/hero.jpg"
            alt="Astorga y Asociados Brand" 
            className="w-full h-full object-cover opacity-90"
          />
        </video>

        {/* Dark gradient overlay to ensure text readability while letting the video shine */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/90 via-navy-900/70 to-navy-900/90 mix-blend-multiply"></div>
        {/* Additional radial gradient to highlight the center */}
        <div className="absolute inset-0 bg-navy-950/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-block mb-6 px-4 py-1 border border-gold-500/30 rounded-full bg-navy-900/50 backdrop-blur-sm">
            <h2 className="text-gold-500 font-bold tracking-[0.2em] uppercase text-xs sm:text-sm">
              Defensa Jurídica de Alto Nivel
            </h2>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-lg">
            {FIRM_TAGLINE}
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Especialistas en litigación compleja. Peleamos sus batallas en tribunales con rigor, estrategia y excelencia.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-sm uppercase tracking-widest transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-gold-500/20"
            >
              Agendar Consulta
            </button>
            <button 
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 border border-white/30 hover:border-white text-white hover:bg-white hover:text-navy-900 font-bold rounded-sm uppercase tracking-widest transition-all backdrop-blur-sm"
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