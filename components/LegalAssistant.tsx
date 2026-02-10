import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, ChevronRight, FileText, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from 'lucide-react';
import { startLegalChat, generateLeadSummary, MockChatSession } from '../services/geminiService';
import { saveChatToDatabase } from '../services/auditService';
import { sendLeadSummaryEmail } from '../services/emailService';
import { ChatMessage, LegalAssistantStatus, ChatOption, ChatSession, LeadSummary } from '../types';
import toast from 'react-hot-toast';

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
        toast.error("Error de conexión al iniciar el asistente.");
      }
    }
  }, [isOpen]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, showOptions]);

  // Función interna para procesar el cierre final (guardar BD, enviar mail)
  const finalizeSession = async (finalFeedback: typeof feedbackData) => {
    setStatus(LegalAssistantStatus.SUMMARIZING);
    const loadingToast = toast.loading("Procesando solicitud y cerrando...");

    try {
      // 1. Generar resumen con IA
      const summary: LeadSummary = await generateLeadSummary(messages);
      
      // Si el usuario ingresó un teléfono en el feedback, lo priorizamos sobre el detectado por IA
      if (finalFeedback.contactPhone) {
        summary.contactInfo = `${finalFeedback.contactPhone} (Ingresado al finalizar)`;
      }

      // 2. Preparar objeto de sesión completo
      const sessionData: ChatSession = {
        id: sessionIdRef.current,
        startTime: messages[0].timestamp,
        messages: messages,
        areaOfInterest: summary.legalCategory,
        deviceInfo: navigator.userAgent,
        leadSummary: summary,
        clientSatisfaction: finalFeedback.satisfaction,
        requiresFollowUp: finalFeedback.contactRequested
      };

      // 3. Guardar en BD (Firestore)
      await saveChatToDatabase(sessionData);

      // 4. Notificar al abogado si corresponde
      // Enviamos el correo si el usuario lo pidió O si la IA detectó urgencia alta, 
      // pero marcando claramente si el usuario pidió contacto.
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
      // Limpiar refs para nueva sesión
      chatSessionRef.current = null;
      hasInteractedRef.current = false;
    }
  };

  // Botón X o "Finalizar"
  const handleInitiateClose = () => {
    // Si no hubo interacción real, cerrar directo
    if (messages.length <= 2 || !hasInteractedRef.current) {
      setIsOpen(false);
      chatSessionRef.current = null;
      return;
    }
    
    // Si ya estamos en feedback, no hacer nada o cerrar
    if (status === LegalAssistantStatus.AWAITING_FEEDBACK) {
      setIsOpen(false);
      return;
    }

    // Cambiar estado para mostrar UI de encuesta
    setStatus(LegalAssistantStatus.AWAITING_FEEDBACK);
  };

  const handleFeedbackSubmit = (satisfaction: 'positive' | 'neutral' | 'negative') => {
    setFeedbackData(prev => ({ ...prev, satisfaction }));
  };

  const handleContactDecision = (requested: boolean) => {
     if (!requested) {
       // Si no quiere contacto, finalizamos con lo que tenemos
       finalizeSession({ ...feedbackData, contactRequested: false });
     } else {
       // Si quiere contacto, guardamos el flag pero mostramos input de teléfono
       setFeedbackData(prev => ({ ...prev, contactRequested: true }));
     }
  };

  const handleContactSubmit = () => {
     finalizeSession(feedbackData);
  };

  const sendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    setStatus(LegalAssistantStatus.THINKING);
    hasInteractedRef.current = true;

    try {
      const result = await chatSessionRef.current.sendMessage({ message: text });
      const responseText = result.text || ""; // Fallback seguro para TypeScript
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
      setStatus(LegalAssistantStatus.SUCCESS);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error crítico al conectar con el asistente legal. Intente más tarde.', timestamp: Date.now() }]);
      setStatus(LegalAssistantStatus.ERROR);
    }
  };

  const handleOptionClick = (option: ChatOption) => {
    const userMsg: ChatMessage = { role: 'user', text: option.label, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setShowOptions(false);
    sendMessage(option.prompt);
  };

  const handleSend = () => {
    if (!inputValue.trim() || status === LegalAssistantStatus.THINKING) return;
    
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
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${isOpen ? 'rotate-90 bg-navy-800' : 'bg-gold-600 hover:bg-gold-500'} text-white border-2 border-white/20`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[90vw] sm:w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in-up h-[550px] sm:h-[650px]">
          
          {/* Header */}
          <div className="bg-navy-900 p-4 flex items-center justify-between border-b-4 border-gold-500">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full relative">
                <Bot className="text-gold-500 h-6 w-6" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-navy-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Admisión Astorga</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Evaluación Preliminar</p>
              </div>
            </div>
            <button onClick={handleInitiateClose} className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded transition-colors text-xs px-2">
              Finalizar
            </button>
          </div>

          {/* Main Content Area: Switch between Chat and Feedback Form */}
          <div className="flex-1 overflow-hidden relative bg-slate-50">
            
            {status !== LegalAssistantStatus.AWAITING_FEEDBACK && status !== LegalAssistantStatus.SUMMARIZING ? (
              // VISTA DE CHAT NORMAL
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      Conversación segura y confidencial
                    </span>
                  </div>

                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm leading-relaxed ${
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
                  
                  {showOptions && (
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
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-gold-400 transition-colors">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Escriba su mensaje..."
                      className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                      disabled={status === LegalAssistantStatus.THINKING}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className={`ml-2 p-1.5 rounded-full transition-colors ${inputValue.trim() ? 'bg-navy-900 text-gold-500' : 'bg-gray-200 text-gray-400'}`}
                    >
                      <Send size={16} />
                    </button>
                  </div>
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
                   Nuestra IA está redactando el informe para el equipo legal...
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
                        <span className="text-xs font-medium">Más o menos</span>
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
                         <p className="text-gray-600 text-xs">Un especialista revisará el resumen de esta conversación y lo contactará para una reunión.</p>
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
                        No, solo quería preguntar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Paso 3: Confirmar Teléfono (Solo si pidió contacto)
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
                       <p className="text-[10px] text-gray-400">Si ya lo mencionó en el chat, la IA lo detectará, pero esto asegura el contacto.</p>
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
                
                {/* Botón volver (opcional) */}
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