import { ChatMessage, LeadSummary, NewsResult } from "../types";

// Este servicio ahora actúa como un cliente para nuestro Backend (Vercel Functions)
// Ya no importa GoogleGenAI directamente, protegiendo la API Key.

export interface MockChatSession {
  sendMessage: (params: { message: string }) => Promise<{ text: string; isError?: boolean }>;
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
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Detectar si el backend devolvió el mensaje de fallback de error (cuando fallan ambas APIs)
        const isApiExhausted = data.text && data.text.includes("nuestros sistemas están experimentando una alta demanda");

        // Actualizamos el historial interno con el turno completado
        internalHistory.push({ role: 'user', parts: [{ text: message }] });
        internalHistory.push({ role: 'model', parts: [{ text: data.text }] });

        return { text: data.text, isError: isApiExhausted };

      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error("Chat Service Error:", error);
        
        if (error.name === 'AbortError') {
          return { text: "La respuesta del asistente está tardando más de lo esperado.", isError: true };
        }

        // Si falla la conexión, devolvemos isError true para activar el modo fallback manual
        return { 
          text: "Error de conexión con el servidor inteligente.", 
          isError: true 
        };
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
      clientName: "Cliente Web (Fallback)",
      contactInfo: "No detectado",
      legalCategory: "Consulta General",
      caseSummary: "No se pudo generar el resumen automático debido a un error de conexión.",
      urgencyLevel: "MEDIA",
      recommendedAction: "Contactar manualmente"
    };
  }
};

/**
 * Llama al endpoint de noticias con Fallback robusto.
 */
export const getLegalNews = async (): Promise<NewsResult> => {
  try {
    const response = await fetch('/api/news');
    
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn("News Service unavailable (likely running locally without backend). Using fallback data.");
    
    // Retornamos datos estáticos (fallback) para que la UI no se rompa
    return {
      text: "⚠️ **Modo Sin Conexión**\n\nNo se pudieron cargar las noticias en tiempo real. \n\nSin embargo, destacamos que el **Poder Judicial** mantiene sus canales de atención remota operativos y la **Corte Suprema** ha actualizado sus criterios respecto a la litigación digital.",
      sources: [
        { title: "Poder Judicial de Chile", uri: "https://www.pjud.cl" },
        { title: "Diario Oficial", uri: "https://www.diariooficial.cl" },
        { title: "Biblioteca del Congreso Nacional", uri: "https://www.bcn.cl" }
      ]
    };
  }
};