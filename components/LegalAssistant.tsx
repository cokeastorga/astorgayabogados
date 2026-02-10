import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, ChevronRight } from 'lucide-react';
import { getLegalGuidance } from '../services/geminiService';
import { saveChatToDatabase } from '../services/auditService';
import { ChatMessage, LegalAssistantStatus, ChatOption, ChatSession } from '../types';

const CHAT_OPTIONS: ChatOption[] = [
  { id: 'penal', label: '🛑 Urgencia Penal / Delitos', prompt: 'Tengo un problema penal urgente (delito, querella o formalización).' },
  { id: 'civil', label: '⚖️ Demanda Civil / Deudas', prompt: 'Tengo una demanda civil o problema de deudas/contratos.' },
  { id: 'laboral', label: '💼 Despido / Laboral', prompt: 'Tengo un problema laboral o despido injustificado.' },
  { id: 'familia', label: '👨‍👩‍👧 Familia / Divorcio', prompt: 'Necesito ayuda con un tema de familia, pensión o divorcio.' },
  { id: 'otro', label: '❓ Otra consulta', prompt: 'Tengo una consulta general.' },
];

const LegalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<LegalAssistantStatus>(LegalAssistantStatus.IDLE);
  const [showOptions, setShowOptions] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar sesión al abrir
  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      setMessages([{ 
        role: 'model', 
        text: 'Bienvenido a Astorga y Asociados. Para una atención rápida, seleccione su área de interés:',
        timestamp: Date.now()
      }]);
      setShowOptions(true);
    }
  }, [isOpen]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, showOptions]);

  // Guardar chat al cerrar si hubo interacción
  const handleClose = () => {
    if (messages.length > 1) {
      const sessionData: ChatSession = {
        id: sessionId,
        startTime: messages[0].timestamp,
        messages: messages,
        areaOfInterest: selectedArea,
        deviceInfo: navigator.userAgent
      };
      saveChatToDatabase(sessionData); // Auditoría
    }
    setIsOpen(false);
  };

  const processResponse = async (text: string, area?: string) => {
    setStatus(LegalAssistantStatus.THINKING);
    try {
      const responseText = await getLegalGuidance(text, area);
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
      setStatus(LegalAssistantStatus.SUCCESS);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error de conexión. Por favor llámenos.', timestamp: Date.now() }]);
      setStatus(LegalAssistantStatus.ERROR);
    }
  };

  const handleOptionClick = (option: ChatOption) => {
    const userMsg: ChatMessage = { role: 'user', text: option.label, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setShowOptions(false);
    setSelectedArea(option.id);
    processResponse(option.prompt, option.id);
  };

  const handleSend = () => {
    if (!inputValue.trim() || status === LegalAssistantStatus.THINKING) return;
    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setShowOptions(false);
    processResponse(inputValue, selectedArea);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${isOpen ? 'rotate-90 bg-navy-800' : 'bg-gold-600 hover:bg-gold-500'} text-white border-2 border-white/20`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[90vw] sm:w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in-up h-[500px] sm:h-[600px]">
          {/* Header */}
          <div className="bg-navy-900 p-4 flex items-center justify-between border-b-4 border-gold-500">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full">
                <Bot className="text-gold-500 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Asistente Virtual</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Astorga & Asociados</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
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
                  <span className="text-xs text-gray-500">Analizando...</span>
                </div>
              </div>
            )}

            {/* Interactive Options (Flow) */}
            {showOptions && status !== LegalAssistantStatus.THINKING && (
              <div className="flex flex-col space-y-2 mt-4 animate-fade-in-up">
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

          {/* Call to Action Sticky Footer (Always Visible inside chat) */}
          {messages.length > 2 && (
             <div className="bg-gold-50 p-2 border-t border-gold-100 flex justify-center">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-navy-900 flex items-center hover:underline"
                >
                  📅 Agendar Reunión con Abogado Humano
                </button>
             </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-gold-400 transition-colors">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escriba aquí..."
                className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800"
                disabled={status === LegalAssistantStatus.THINKING}
              />
              <button 
                onClick={handleSend}
                disabled={status === LegalAssistantStatus.THINKING || !inputValue.trim()}
                className={`ml-2 p-1.5 rounded-full transition-colors ${inputValue.trim() ? 'bg-navy-900 text-gold-500' : 'bg-gray-200 text-gray-400'}`}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[9px] text-center text-gray-400 mt-2">
              Asistente IA. Chat guardado con fines de calidad.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalAssistant;