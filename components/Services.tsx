import React, { useState, useEffect } from 'react';
import { SERVICES } from '../constants';
import { ArrowRight, X, Scale } from 'lucide-react';
import { ServiceItem } from '../types';

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedService]);

  const openModal = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-gold-600 font-bold tracking-widest uppercase text-sm mb-2">Expertise Legal</h2>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">Áreas de Práctica</h3>
          <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Abordamos cada caso con una estrategia personalizada, enfocada en la representación judicial efectiva y la obtención de resultados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <div 
              key={service.id}
              onClick={() => openModal(service)}
              className="group relative p-8 bg-slate-50 border border-slate-100 hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl rounded-sm overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-gold-500 transition-all duration-300"></div>
              
              <service.icon className="h-10 w-10 text-navy-800 mb-6 group-hover:text-gold-600 transition-colors" />
              
              <h4 className="text-xl font-bold text-navy-900 mb-3 group-hover:text-gold-600 transition-colors">
                {service.title}
              </h4>
              
              <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                {service.description}
              </p>

              <div className="flex items-center text-gold-600 font-medium text-sm group-hover:underline">
                <span>Más detalles</span>
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm transition-opacity" 
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            {/* Header */}
            <div className="bg-navy-900 p-6 flex justify-between items-start sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-navy-800 rounded-md">
                   <selectedService.icon className="h-8 w-8 text-gold-500" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white pr-8 leading-tight">
                  {selectedService.title}
                </h3>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={28} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-8">
                  {selectedService.longDescription.split('**')[0]}
                </p>
                
                {/* Call to Action Box */}
                <div className="bg-slate-50 border-l-4 border-gold-500 p-6 mt-8 rounded-r-sm">
                  <div className="flex items-center mb-3">
                    <Scale className="h-5 w-5 text-gold-600 mr-2" />
                    <span className="text-navy-900 font-bold uppercase text-sm tracking-wider">La Diferencia Astorga</span>
                  </div>
                  <p className="text-navy-800 font-serif text-xl italic font-medium">
                     "{selectedService.longDescription.split('**')[1] || "Confíe en Astorga y Asociados."}"
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    closeModal();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 bg-gold-600 hover:bg-gold-500 text-white font-bold py-4 px-6 rounded-sm uppercase tracking-wider transition-colors text-center"
                >
                  Solicitar Evaluación
                </button>
                <button 
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 font-bold py-4 px-6 rounded-sm uppercase tracking-wider transition-colors text-center"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;