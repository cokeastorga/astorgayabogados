import React, { useState, useEffect, useRef } from 'react';
import { CONTACT_INFO } from '../constants';
import { Mail, Phone, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { ContactFormState } from '../types';
import { sendContactEmail } from '../services/emailService';
import toast from 'react-hot-toast';
import L from 'leaflet';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize Map
    // Coordinates for Av. Apoquindo 4500 approx: -33.4124, -70.5826
    const lat = -33.41245;
    const lng = -70.58266;

    if (!mapRef.current) {
      const map = L.map('map-container').setView([lat, lng], 15);
      
      // Use CartoDB Positron for a cleaner, more elegant look that fits the gold/navy theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Custom icon setup to ensure it works without build step asset imports
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      L.marker([lat, lng], { icon: icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: serif; text-align: center;">
            <strong style="color: #0f172a; font-size: 14px;">Astorga y Asociados</strong><br/>
            <span style="font-family: sans-serif; font-size: 12px; color: #666;">Av. Apoquindo 4500</span>
          </div>
        `)
        .openPopup();

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mostramos un toast de carga
    const loadingToast = toast.loading("Procesando solicitud...");

    try {
      // 1. Intentar enviar vía Servicio (SendGrid / Backend)
      const sentViaApi = await sendContactEmail(formData);

      if (sentViaApi) {
        toast.success("Mensaje enviado correctamente. Le contactaremos a la brevedad.", { id: loadingToast });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        // 2. FALLBACK
        // Actualizamos el toast para informar al usuario
        toast.dismiss(loadingToast);
        toast("Abriendo su cliente de correo para completar el envío...", {
          icon: '📧',
          duration: 4000
        });

        const subject = encodeURIComponent(`Consulta Legal Web: ${formData.name}`);
        const body = encodeURIComponent(
          `Estimados Astorga y Asociados,\n\nSoy ${formData.name}.\nTeléfono: ${formData.phone}\nEmail: ${formData.email}\n\nDetalle del caso:\n${formData.message}`
        );
        
        // Delay ligero para que el usuario lea el mensaje
        setTimeout(() => {
          window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 1500);
      }
    } catch (error) {
      toast.error("Hubo un error inesperado. Por favor contáctenos por teléfono.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="flex flex-col h-full">
            <h2 className="text-gold-600 font-bold tracking-widest uppercase text-sm mb-2">Hablemos</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-8">
              Contacto Directo
            </h3>
            <p className="text-gray-600 mb-10 text-lg">
              Su caso requiere atención inmediata y profesional. Contáctenos hoy para agendar una reunión preliminar y trazar la estrategia de defensa.
            </p>

            <div className="space-y-8 mb-10">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-navy-900 text-gold-500">
                    <MapPin size={24} />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-navy-900">Ubicación</h4>
                  <p className="text-gray-600">{CONTACT_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-navy-900 text-gold-500">
                    <Phone size={24} />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-navy-900">Teléfono</h4>
                  <p className="text-gray-600">{CONTACT_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-navy-900 text-gold-500">
                    <Mail size={24} />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-navy-900">Email</h4>
                  <p className="text-gray-600">{CONTACT_INFO.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-navy-900 text-gold-500">
                    <Clock size={24} />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-navy-900">Horario</h4>
                  <p className="text-gray-600">{CONTACT_INFO.schedule}</p>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-grow min-h-[300px] w-full bg-slate-200 rounded-sm shadow-md border border-slate-300 relative z-0">
               <div id="map-container" className="absolute inset-0 rounded-sm"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-sm shadow-xl border-t-4 border-gold-500 h-fit">
            <h3 className="text-2xl font-serif font-bold text-navy-900 mb-6">Envíenos su Consulta</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="+56 9 ..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Detalle del Caso</label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="Describa brevemente su situación legal..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-navy-900 text-white font-bold py-4 px-8 rounded-sm transition-all flex items-center justify-center uppercase tracking-wider ${
                  isSubmitting ? 'opacity-80 cursor-not-allowed' : 'hover:bg-navy-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Enviar Consulta <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;