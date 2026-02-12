import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, ChevronRight, FileText, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle, Phone, Lock } from 'lucide-react';
import { startLegalChat, generateLeadSummary, MockChatSession } from '../services/geminiService';
import { saveChatToDatabase } from '../services/auditService';
import { sendLeadSummaryEmail } from '../services/emailService';
import { ChatMessage, LegalAssistantStatus, ChatOption, ChatSession, LeadSummary } from '../types';
import { CONTACT_INFO } from '../constants';
import toast from 'react-hot-toast';

// --- CONFIGURACIÓN DE RESPUESTAS PREDISEÑADAS (FALLBACK) ---
// Estas se usan cuando la IA no responde o se agotan las cuotas.

interface FallbackStep {
  message: string;
  options: ChatOption[];
}

const FALLBACK_FLOW: Record<string, FallbackStep> = {
  'ROOT': {
    message: "⚠️ **Sistemas IA Saturados**\n\nNuestros asistentes inteligentes están experimentando una alta demanda. Para asegurar su atención inmediata, por favor seleccione manualmente su área de interés:",
    options: [
      { id: 'opt_penal', label: '🛑 Urgencia Penal / Detención', prompt: '', value: 'PENAL', action: 'flow' },
      { id: 'opt_civil', label: '⚖️ Civil / Deudas / Contratos', prompt: '', value: 'CIVIL', action: 'flow' },
      { id: 'opt_fam', label: '👨‍👩‍👧 Familia y Divorcio', prompt: '', value: 'FAMILIA', action: 'flow' },
      { id: 'opt_humano', label: '📞 Hablar con una persona', prompt: '', value: 'CONTACT', action: 'flow' },
    ]
  },
  'PENAL': {
    message: "En materias penales, **el tiempo es crítico**. \n\nSi usted o un familiar ha sido detenido o formalizado, le recomendamos NO prestar declaración sin un abogado presente. \n\n¿Cuál es su situación?",
    options: [
      { id: 'p_urgente', label: '🚨 ES UNA EMERGENCIA (Detención)', prompt: '', value: 'URGENCIA_REAL', action: 'flow' },
      { id: 'p_invest', label: '🔎 Investigación / Citación', prompt: '', value: 'CONTACT_FORM', action: 'flow' },
      { id: 'back', label: '⬅️ Volver', prompt: '', value: 'ROOT', action: 'flow' }
    ]
  },
  'CIVIL': {
    message: "En derecho civil (deudas, embargos, incumplimientos), necesitamos revisar los antecedentes escritos (demandas, contratos).\n\nNuestra recomendación es agendar una revisión de documentos.",
    options: [
      { id: 'c_reunion', label: '📅 Solicitar Reunión', prompt: '', value: 'CONTACT_FORM', action: 'flow' },
      { id: 'back', label: '⬅️ Volver', prompt: '', value: 'ROOT', action: 'flow' }
    ]
  },
  'FAMILIA': {
    message: "Entendemos que los temas de familia requieren sensibilidad y firmeza. \n\n¿Su consulta es sobre divorcio, pensión de alimentos o cuidado personal?",
    options: [
      { id: 'f_contacto', label: '✉️ Dejar mensaje al abogado', prompt: '', value: 'CONTACT_FORM', action: 'flow' },
      { id: 'back', label: '⬅️ Volver', prompt: '', value: 'ROOT', action: 'flow' }
    ]
  },
  'URGENCIA_REAL': {
    message: `Para urgencias penales inmediatas, por favor llame directamente a nuestro teléfono de emergencias:\n\n📞 **${CONTACT_INFO.phone}**\n\nSi no contestan, deje un mensaje en el buzón y envíe el formulario.`,
    options: [
      { id: 'call_now', label: 'Llamar Ahora', prompt: '', value: `tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`, action: 'link' },
      { id: 'finish', label: 'Finalizar', prompt: '', value: 'FINISH', action: 'flow' }
    ]
  },
  'CONTACT_FORM': {
    message: "Por favor, utilice el formulario final para dejar sus datos. Un abogado senior revisará su caso y le contactará a la brevedad.",
    options: [
      { id: 'go_form', label: '📝 Ir al Formulario de Cierre', prompt: '', value: 'FINISH', action: 'flow' }
    ]
  },
  'CONTACT': {
    message: `Puede contactarnos directamente en nuestro horario de oficina (${CONTACT_INFO.schedule}) al:\n\n📞 ${CONTACT_INFO.phone}\n📧 ${CONTACT_INFO.email}`,
    options: [
      { id: 'call', label: 'Llamar', prompt: '', value: `tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`, action: 'link' },
      { id: 'back', label: '⬅️ Volver', prompt: '', value: 'ROOT', action: 'flow' }
    ]
  }
};

const CHAT_OPTIONS: ChatOption[] = [
  { id: 'penal', label: '🛑 Urgencia Penal / Detención', prompt: 'Necesito ayuda urgente con un tema penal.' },
  { id: 'civil', label: '⚖️ Demanda Civil / Deudas', prompt: 'Me demandaron o necesito demandar por un tema civil/contrato.' },
  { id: 'laboral', label: '💼 Despido / Laboral', prompt: 'Tengo un conflicto laboral o despido.' },
  { id: 'familia', label: '👨‍👩‍👧 Familia / Divorcio', prompt: 'Consulta sobre pensión, visitas o divorcio.' },
  { id: 'quiebras', label: '📉 Quiebra / Insolvencia', prompt: 'Necesito asesoría sobre la Ley de Quiebras.' },
];

const LegalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<LegalAssistantStatus>(LegalAssistantStatus.IDLE);
  const [showOptions, setShowOptions] = useState(true);
  
  // Estado para el flujo de respaldo (Fallback)
  const [fallbackStep, setFallbackStep] = useState<string>('ROOT');
  
  // Estados para el flujo de feedback
  const [feedbackData, setFeedbackData] = useState<{
    satisfaction?: 'positive' | 'neutral' | 'negative';
    contactRequested?: boolean;
    contactPhone?: string;
  }>({});
  
  // Refs
  const chatSessionRef = useRef<MockChatSession | null>(null);
  const sessionIdRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInteractedRef = useRef(false);

  // Inicializar sesión
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        sessionIdRef.current = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        chatSessionRef.current = startLegalChat();
        
        setMessages([{ 
          role: 'model', 
          text: 'Bienvenido a Astorga y Asociados. Soy parte del equipo de admisión. ¿En qué materia legal podemos asistirle hoy?',
          timestamp: Date.now()
        }]);
        setShowOptions(true);
        setFeedbackData({});
      } catch (e) {
        console.error("Error iniciando chat:", e);
        activateFallbackMode();
      }
    }
  }, [isOpen]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, showOptions, fallbackStep]);

  const activateFallbackMode = () => {
    setStatus(LegalAssistantStatus.FALLBACK_MODE);
    setFallbackStep('ROOT');
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: FALLBACK_FLOW['ROOT'].message, 
      timestamp: Date.now() 
    }]);
    setShowOptions(false);
  };

  // Función interna para procesar el cierre final (guardar BD, enviar mail)
  const finalizeSession = async (finalFeedback: typeof feedbackData) => {
    setStatus(LegalAssistantStatus.SUMMARIZING);
    const loadingToast = toast.loading("Procesando solicitud y cerrando...");

    try {
      // 1. Generar resumen con IA (intentar)
      const summary: LeadSummary = await generateLeadSummary(messages);
      
      // Si el usuario ingresó un teléfono en el feedback, lo priorizamos
      if (finalFeedback.contactPhone) {
        summary.contactInfo = `${finalFeedback.contactPhone} (Ingresado al finalizar)`;
      }

      // Si venimos de fallback y no hay categoría clara
      if (status === LegalAssistantStatus.FALLBACK_MODE) {
          summary.legalCategory = "CONSULTA MODO MANUAL (API FAIL)";
      }

      // 2. Preparar objeto de sesión completo
      const sessionData: ChatSession = {
        id: sessionIdRef.current,
        startTime: messages[0]?.timestamp || Date.now(),
        messages: messages,
        areaOfInterest: summary.legalCategory,
        deviceInfo: navigator.userAgent,
        leadSummary: summary,
        clientSatisfaction: finalFeedback.satisfaction,
        requiresFollowUp: finalFeedback.contactRequested
      };

      // 3. Guardar en BD (Firestore)
      await saveChatToDatabase(sessionData);

      // 4. Notificar al abogado
      if (finalFeedback.contactRequested || summary.urgencyLevel === 'ALTA' || summary.urgencyLevel === 'CRÍTICA') {
         sendLeadSummaryEmail(summary, finalFeedback.contactRequested, finalFeedback.satisfaction).catch(console.error);
      }

      toast.success(finalFeedback.contactRequested ? "Solicitud enviada al equipo legal." : "Conversación guardada.", { id: loadingToast });
    } catch (error) {
      console.error("Error al cerrar chat:", error);
      toast.error("Error al procesar los datos de la sesión.", { id: loadingToast });
    } finally {
      setIsOpen(false);
      setStatus(LegalAssistantStatus.IDLE);
      chatSessionRef.current = null;
      hasInteractedRef.current = false;
    }
  };

  // Botón X o "Finalizar"
  const handleInitiateClose = () => {
    // Si apenas abrió y cierra sin interactuar, cerrar directo
    if (messages.length <= 2 && !hasInteractedRef.current) {
      setIsOpen(false);
      chatSessionRef.current = null;
      return;
    }
    // Si ya está en flujo de feedback, cerrar directo
    if (status === LegalAssistantStatus.AWAITING_FEEDBACK) {
      setIsOpen(false);
      return;
    }
    setStatus(LegalAssistantStatus.AWAITING_FEEDBACK);
  };

  const handleFeedbackSubmit = (satisfaction: 'positive' | 'neutral' | 'negative') => {
    setFeedbackData(prev => ({ ...prev, satisfaction }));
  };

  const handleContactDecision = (requested: boolean) => {
     if (!requested) {
       finalizeSession({ ...feedbackData, contactRequested: false });
     } else {
       setFeedbackData(prev => ({ ...prev, contactRequested: true }));
     }
  };

  const handleContactSubmit = () => {
     finalizeSession(feedbackData);
  };

  const sendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;
    
    if (status === LegalAssistantStatus.FALLBACK_MODE) return;

    setStatus(LegalAssistantStatus.THINKING);
    hasInteractedRef.current = true;

    try {
      const result = await chatSessionRef.current.sendMessage({ message: text });
      
      if (result.isError) {
        console.warn("⚠️ API Error detected, switching to Fallback Mode");
        activateFallbackMode();
        return;
      }

      const responseText = result.text || ""; 
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
      setStatus(LegalAssistantStatus.SUCCESS);
    } catch (error) {
      console.error("Chat Critical Error:", error);
      activateFallbackMode();
    }
  };

  const handleOptionClick = (option: ChatOption) => {
    const userMsg: ChatMessage = { role: 'user', text: option.label, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setShowOptions(false);
    sendMessage(option.prompt);
  };

  const handleFallbackOption = (option: ChatOption) => {
    const userMsg: ChatMessage = { role: 'user', text: option.label, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    if (option.action === 'link' && option.value) {
      window.location.href = option.value;
      setMessages(prev => [...prev, { role: 'model', text: 'Abriendo enlace...', timestamp: Date.now() }]);
    } 
    else if (option.action === 'flow' && option.value) {
      if (option.value === 'FINISH') {
        handleInitiateClose();
      } else {
        const nextStep = FALLBACK_FLOW[option.value];
        if (nextStep) {
          setFallbackStep(option.value);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: nextStep.message, 
              timestamp: Date.now() 
            }]);
          }, 500);
        }
      }
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || status === LegalAssistantStatus.THINKING) return;
    
    if (status === LegalAssistantStatus.FALLBACK_MODE) {
      toast.error("Por favor utilice los botones para continuar.");
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setShowOptions(false);
    sendMessage(inputValue);
  };

  return (
    <>
      <button
        onClick={() => isOpen ? handleInitiateClose() : setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${isOpen ? 'rotate-90 bg-navy-800' : 'bg-gold-600 hover:bg-gold-500'} text-white border-2 border-white/20`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] w-[90vw] sm:w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in-up h-[550px] sm:h-[650px]">
          
          {/* Header */}
          <div className="bg-navy-900 p-4 flex items-center justify-between border-b-4 border-gold-500">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full relative">
                <Bot className="text-gold-500 h-6 w-6" />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-navy-900 rounded-full ${status === LegalAssistantStatus.FALLBACK_MODE ? 'bg-orange-500' : 'bg-green-500'}`}></span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Admisión Astorga</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">
                  {status === LegalAssistantStatus.FALLBACK_MODE ? 'Modo Manual' : 'Evaluación Preliminar'}
                </p>
              </div>
            </div>
            <button onClick={handleInitiateClose} className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded transition-colors text-xs px-2">
              Finalizar
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative bg-slate-50">
            
            {status !== LegalAssistantStatus.AWAITING_FEEDBACK && status !== LegalAssistantStatus.SUMMARIZING ? (
              // VISTA DE CHAT (Normal y Fallback)
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      Conversación segura y confidencial
                    </span>
                  </div>

                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user' 
                          ? 'bg-navy-800 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {status === LegalAssistantStatus.THINKING && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm flex items-center space-x-2">
                        <Loader2 className="animate-spin h-4 w-4 text-gold-500" />
                        <span className="text-xs text-gray-500">Escribiendo...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Opciones Normales */}
                  {showOptions && status !== LegalAssistantStatus.FALLBACK_MODE && (
                    <div className="flex flex-col space-y-2 mt-4 animate-fade-in-up">
                      <p className="text-xs text-gray-500 font-medium ml-1 mb-1">Seleccione tema principal:</p>
                      {CHAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionClick(opt)}
                          className="flex items-center justify-between w-full p-3 bg-white border border-gold-200 hover:border-gold-500 hover:bg-gold-50 text-navy-900 rounded-lg text-xs font-medium transition-all text-left shadow-sm group"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight size={14} className="text-gold-400 group-hover:text-gold-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Opciones Fallback Mode */}
                  {status === LegalAssistantStatus.FALLBACK_MODE && (
                     <div className="flex flex-col space-y-2 mt-4 animate-fade-in-up border-t border-orange-200 pt-2">
                       <p className="text-xs text-orange-600 font-bold ml-1 mb-1 flex items-center">
                         <Lock size={10} className="mr-1" />
                         Seleccione una opción (Chat bloqueado):
                       </p>
                       {FALLBACK_FLOW[fallbackStep]?.options.map((opt) => (
                         <button
                           key={opt.id}
                           onClick={() => handleFallbackOption(opt)}
                           className="flex items-center justify-between w-full p-3 bg-orange-50 border border-orange-200 hover:border-orange-400 hover:bg-orange-100 text-navy-900 rounded-lg text-xs font-medium transition-all text-left shadow-sm group"
                         >
                           <span>{opt.label}</span>
                           {opt.action === 'link' ? (
                             <Phone size={14} className="text-orange-400 group-hover:text-orange-600" />
                           ) : (
                             <ChevronRight size={14} className="text-orange-400 group-hover:text-orange-600" />
                           )}
                         </button>
                       ))}
                     </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className={`flex items-center rounded-full px-4 py-2 border transition-colors ${
                      status === LegalAssistantStatus.FALLBACK_MODE 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                        : 'bg-gray-100 border-transparent focus-within:border-gold-400'
                    }`}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={status === LegalAssistantStatus.FALLBACK_MODE ? "Chat deshabilitado. Use los botones." : "Escriba su mensaje..."}
                      className={`flex-1 bg-transparent focus:outline-none text-sm ${
                        status === LegalAssistantStatus.FALLBACK_MODE ? 'text-gray-400' : 'text-gray-800 placeholder-gray-400'
                      }`}
                      disabled={status === LegalAssistantStatus.THINKING || status === LegalAssistantStatus.FALLBACK_MODE}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!inputValue.trim() || status === LegalAssistantStatus.FALLBACK_MODE}
                      className={`ml-2 p-1.5 rounded-full transition-colors ${
                        inputValue.trim() && status !== LegalAssistantStatus.FALLBACK_MODE 
                          ? 'bg-navy-900 text-gold-500' 
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {status === LegalAssistantStatus.FALLBACK_MODE ? <Lock size={16} /> : <Send size={16} />}
                    </button>
                  </div>
                  {status === LegalAssistantStatus.FALLBACK_MODE && (
                    <p className="text-[10px] text-orange-500 text-center mt-1">
                      Modo Manual activado por alta demanda.
                    </p>
                  )}
                </div>
              </div>
            ) : status === LegalAssistantStatus.SUMMARIZING ? (
              // VISTA DE CARGA/RESUMEN
              <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
                 <div className="bg-gold-50 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-gold-600 animate-pulse" />
                 </div>
                 <h3 className="text-lg font-bold text-navy-900 mb-2">Procesando Antecedentes</h3>
                 <p className="text-sm text-gray-500">
                   {fallbackStep !== 'ROOT' ? 'Guardando selección manual...' : 'Nuestra IA está redactando el informe...'}
                 </p>
                 <Loader2 className="h-6 w-6 text-navy-900 animate-spin mt-6" />
              </div>
            ) : (
              // VISTA DE ENCUESTA (FEEDBACK)
              <div className="h-full flex flex-col p-6 overflow-y-auto animate-fade-in-up bg-slate-50">
                <h3 className="text-xl font-serif font-bold text-navy-900 mb-6 text-center">Cierre de Atención</h3>
                
                {/* Paso 1: Satisfacción */}
                {!feedbackData.satisfaction ? (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600 text-center">¿La orientación preliminar fue útil?</p>
                    <div className="flex justify-center space-x-4">
                      <button 
                        onClick={() => handleFeedbackSubmit('positive')}
                        className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all w-24"
                      >
                        <ThumbsUp className="h-6 w-6 text-green-600 mb-2" />
                        <span className="text-xs font-medium">Sí, útil</span>
                      </button>
                      <button 
                         onClick={() => handleFeedbackSubmit('neutral')}
                         className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all w-24"
                      >
                        <span className="h-6 w-6 flex items-center justify-center text-lg">🤔</span>
                        <span className="text-xs font-medium">Regular</span>
                      </button>
                      <button 
                         onClick={() => handleFeedbackSubmit('negative')}
                         className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all w-24"
                      >
                        <ThumbsDown className="h-6 w-6 text-red-600 mb-2" />
                        <span className="text-xs font-medium">No</span>
                      </button>
                    </div>
                  </div>
                ) : feedbackData.contactRequested === undefined ? (
                  // Paso 2: Solicitud de Contacto
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start space-x-3">
                       <AlertCircle className="h-5 w-5 text-navy-900 mt-0.5 flex-shrink-0" />
                       <div className="text-sm text-navy-900">
                         <p className="font-bold mb-1">¿Desea enviar este caso a un abogado?</p>
                         <p className="text-gray-600 text-xs">Un especialista revisará su caso y lo contactará.</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => handleContactDecision(true)}
                        className="w-full py-3 bg-navy-900 text-white rounded-lg font-bold hover:bg-navy-800 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Sí, enviar al abogado
                      </button>
                      <button 
                        onClick={() => handleContactDecision(false)}
                        className="w-full py-3 bg-white text-gray-500 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        No, gracias
                      </button>
                    </div>
                  </div>
                ) : (
                  // Paso 3: Confirmar Teléfono
                  <div className="space-y-6 animate-fade-in-up">
                     <p className="text-sm text-gray-600 text-center">Para contactarlo rápidamente, por favor confirme su número o correo:</p>
                     
                     <div className="space-y-2">
                       <label className="text-xs font-bold text-navy-900 uppercase">Teléfono / Email</label>
                       <input 
                         type="text" 
                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-sm"
                         placeholder="+56 9..."
                         value={feedbackData.contactPhone || ''}
                         onChange={(e) => setFeedbackData(prev => ({ ...prev, contactPhone: e.target.value }))}
                       />
                     </div>

                     <button 
                        onClick={handleContactSubmit}
                        disabled={!feedbackData.contactPhone}
                        className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center ${
                          !feedbackData.contactPhone ? 'bg-gray-200 text-gray-400' : 'bg-gold-600 hover:bg-gold-500 text-white'
                        }`}
                      >
                        Confirmar y Finalizar
                      </button>
                  </div>
                )}
                
                <button 
                   onClick={() => setStatus(LegalAssistantStatus.IDLE)}
                   className="mt-auto text-center text-xs text-gray-400 hover:text-navy-900 py-2"
                >
                  Volver al chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LegalAssistant;