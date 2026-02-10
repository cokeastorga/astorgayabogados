import { ChatMessage, LeadSummary, NewsResult } from "../types";

// Este servicio ahora actúa como un cliente para nuestro Backend (Vercel Functions)
// Ya no importa GoogleGenAI directamente, protegiendo la API Key.

export interface MockChatSession {
  sendMessage: (params: { message: string }) => Promise<{ text: string }>;
}

/**
 * Inicia una sesión de chat simulada que conecta con el backend.
 * Mantiene el historial en memoria para enviarlo al servidor en cada turno (stateless backend).
 */
export const startLegalChat = (context?: string): MockChatSession => {
  // Mantenemos el historial local de esta sesión para enviarlo al backend
  // El backend de Vercel es stateless, así que necesita el contexto completo.
  let internalHistory: { role: 'user' | 'model'; parts: [{ text: string }] }[] = [];

  return {
    sendMessage: async ({ message }: { message: string }) => {
      // 1. Optimización: Limitar historial para control de tokens (Sliding Window)
      // Limitamos a los últimos 20 mensajes para ahorrar tokens y mantener relevancia.
      if (internalHistory.length > 20) {
        internalHistory = internalHistory.slice(-20);
      }

      // 2. Timeout defensivo (15s) para evitar peticiones colgadas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history: internalHistory,
            context
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Error en el endpoint de chat');
        }

        const data = await response.json();
        
        // Actualizamos el historial interno con el turno completado
        internalHistory.push({ role: 'user', parts: [{ text: message }] });
        internalHistory.push({ role: 'model', parts: [{ text: data.text }] });

        return { text: data.text };
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error("Chat Service Error:", error);
        
        if (error.name === 'AbortError') {
          return { text: "La respuesta del asistente está tardando más de lo esperado. Por favor, verifique su conexión." };
        }

        return { text: "Error al conectar con el servidor de inteligencia artificial. Intente nuevamente." };
      }
    }
  };
};

/**
 * Llama al endpoint de resumen.
 */
export const generateLeadSummary = async (messages: ChatMessage[]): Promise<LeadSummary> => {
  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) throw new Error('Error generando resumen');
    
    return await response.json();
  } catch (error) {
    console.error("Summary Service Error:", error);
    return {
      clientName: "Error",
      contactInfo: "Manual",
      legalCategory: "Error",
      caseSummary: "No se pudo generar el resumen automático debido a un error en el servicio de IA.",
      urgencyLevel: "MEDIA",
      recommendedAction: "Revisión manual requerida"
    };
  }
};

/**
 * Llama al endpoint de noticias.
 */
export const getLegalNews = async (): Promise<NewsResult> => {
  try {
    const response = await fetch('/api/news');
    if (!response.ok) throw new Error('Error obteniendo noticias');
    return await response.json();
  } catch (error) {
    console.error("News Service Error:", error);
    return {
      text: "No se pudieron cargar las noticias jurídicas desde el servidor.",
      sources: []
    };
  }
};