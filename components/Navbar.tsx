import React, { useState, useEffect } from 'react';
import { Menu, X, Scale, ArrowRight } from 'lucide-react';
import { FIRM_NAME } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuItems = [
    { label: 'Expertise', id: 'services' },
    { label: 'La Firma', id: 'about' },
    { label: 'Noticias', id: 'news' },
    { label: 'Contacto', id: 'contact' }
  ];

  return (
    // CAMBIO: z-[100] para estar por encima del LegalAssistant (z-50) y otros elementos.
    // LÓGICA: Si isOpen es true, forzamos bg-transparent para que el overlay maneje el fondo completo y no haya "doble fondo" o cortes.
    <nav className={`fixed w-full z-[100] transition-all duration-300 ${isScrolled && !isOpen ? 'bg-navy-900/95 backdrop-blur-md shadow-xl py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer z-[101] relative" onClick={() => scrollToSection('hero')}>
            <Scale className={`h-8 w-8 mr-2 transition-colors ${isOpen ? 'text-gold-500' : 'text-gold-500'}`} />
            <span className={`font-serif text-xl font-bold tracking-wider transition-colors ${isOpen ? 'text-white' : 'text-white'}`}>
              {FIRM_NAME.toUpperCase()}
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-300 hover:text-gold-500 transition-colors font-medium text-sm uppercase tracking-wide relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden z-[101] relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-white hover:text-gold-500 transition-colors p-2 focus:outline-none"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {/* CAMBIO: z-[99] para estar justo debajo de los botones de la navbar (z-[101]) pero encima del contenido de la página */}
      <div 
        className={`fixed inset-0 bg-navy-900 z-[99] md:hidden transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-center px-8 space-y-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col space-y-6">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center justify-between text-left text-3xl font-serif font-bold text-white hover:text-gold-500 transition-all duration-500 border-b border-gray-800 pb-4 group transform ${
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${150 + index * 100}ms` }}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all text-gold-500" />
                </button>
              ))}
            </div>

            <div 
              className={`mt-12 p-6 bg-navy-800/50 rounded-lg border border-navy-700 backdrop-blur-sm transition-all duration-700 delay-500 transform ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
               <p className="text-gold-500 text-sm font-bold uppercase tracking-widest mb-3">Contacto Rápido</p>
               <div className="space-y-2">
                 <a href="tel:+56223456789" className="block text-gray-300 hover:text-white text-lg font-light">+56 2 2345 6789</a>
                 <a href="mailto:contacto@astorgayasociados.cl" className="block text-gray-300 hover:text-white text-lg font-light">contacto@astorgayasociados.cl</a>
               </div>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;