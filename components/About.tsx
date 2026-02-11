import React from 'react';
import { Award, BookOpen } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-navy-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 200 200">
            <path fill="currentColor" d="M45,-76.2C58.9,-69.6,71.2,-59.1,79.8,-46.8C88.4,-34.5,93.3,-20.4,91.6,-6.9C89.9,6.6,81.6,19.5,73.1,31.7C64.6,43.9,55.9,55.4,44.9,63.9C33.9,72.4,20.6,77.9,6.7,79.1C-7.2,80.3,-21.7,77.2,-34.5,70.1C-47.3,63,-58.4,51.9,-67.1,39.3C-75.8,26.7,-82.1,12.6,-81.4,-1.2C-80.7,-15,-73,-28.5,-63.3,-39.9C-53.6,-51.3,-41.9,-60.6,-29.4,-67.9C-16.9,-75.2,-3.6,-80.5,9.2,-78.9L22,-77.3Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2">Sobre La Firma</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Excelencia Académica y Litigación
            </h3>
            
            {/* Destacado Magister */}
            <div className="mb-8 bg-navy-800/50 border border-gold-500/30 p-6 rounded-sm flex items-start space-x-4">
              <div className="bg-gold-500 p-2 rounded-full mt-1">
                <Award className="h-6 w-6 text-navy-900" />
              </div>
              <div>
                <h4 className="text-xl font-serif font-bold text-white">Magíster en Derecho Penal</h4>
                <p className="text-gold-400 font-medium text-lg">Universidad de Chile</p>
                <p className="text-gray-400 text-sm mt-2">
                  Especialización de alto nivel en dogmática penal, criminología y litigación estratégica en la universidad más prestigiosa del país.
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              En <span className="text-white font-semibold">Astorga y Asociados</span>, combinamos la profundidad teórica con la agresividad práctica. Entendemos que la litigación no es solo un proceso legal, es una batalla técnica por los intereses de nuestros clientes.
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Nuestro equipo multidisciplinario combina experiencia en litigios penales complejos, disputas civiles de alta cuantía y protección de derechos fundamentales.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="border-l-2 border-gold-500 pl-6">
                <span className="block text-4xl font-serif font-bold text-white mb-2">15+</span>
                <span className="text-sm text-gray-400 uppercase tracking-wider">Años de Experiencia</span>
              </div>
              <div className="border-l-2 border-gold-500 pl-6">
                <span className="block text-4xl font-serif font-bold text-white mb-2">98%</span>
                <span className="text-sm text-gray-400 uppercase tracking-wider">Compromiso Total</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-gold-500"></div>
             {/* Imagen local desde la carpeta public */}
             <img 
               src="/hero.jpg" 
               alt="Reunión estratégica" 
               className="rounded-sm shadow-2xl filter grayscale hover:grayscale-0 transition-all duration-500"
             />
             <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-gold-500"></div>
             
             {/* Sello U de Chile Abstracto */}
             <div className="absolute bottom-8 left-8 bg-white p-4 shadow-lg rounded-sm max-w-xs hidden md:block">
                <div className="flex items-center space-x-3">
                  <BookOpen className="text-navy-900 h-8 w-8" />
                  <div>
                    <p className="text-navy-900 font-bold text-xs uppercase tracking-wider">Formación de Elite</p>
                    <p className="text-gray-600 text-xs">Facultad de Derecho U. de Chile</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;