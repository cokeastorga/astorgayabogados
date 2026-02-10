
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, LeadSummary } from "../types";

// Initialize Gemini API client
// process.env.API_KEY is mapped specifically in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Inicia una sesión de chat con la personalidad de un abogado de admisión.
 */
export const startLegalChat = (context?: string): Chat => {
  const systemPrompt = `
    Eres un abogado senior del equipo de admisión de "Astorga y Asociados".
    
    OBJETIVO:
    Tu trabajo es realizar una entrevista inicial (triaje) para recopilar antecedentes clave antes de agendar una reunión con el socio especialista.
    
    INSTRUCCIONES DE COMPORTAMIENTO:
    1.  **Personalidad**: Profesional, empático, seguro, pero directo. No suenes robótico.
    2.  **Flujo**:
        -   Saluda cordialmente.
        -   Escucha el problema del usuario.
        -   **IMPORTANTE**: Haz preguntas UNA A UNA para profundizar (ej: "¿Hace cuánto ocurrió esto?", "¿Ha recibido alguna notificación judicial?", "¿Cuál es su nombre para dirigirme a usted?").
        -   Si el usuario menciona temas graves (penal/detención), prioriza la captación inmediata.
        -   Ofrece orientación general (procedimiento) pero NUNCA garantices resultados ni des estrategias de defensa específicas (eso es para la reunión).
        -   **Cierre**: Trata de coordinar una reunión presencial o videollamada. Pide nombre y teléfono si no lo han dado.

    RESTRICCIONES:
    -   No inventes leyes.
    -   Mantén respuestas breves (máx 60 palabras) para mantener la conversación fluida.
    -   Si preguntan precios, di que dependen de la complejidad y se evalúan en la primera reunión.

    CONTEXTO INICIAL DEL USUARIO: ${context || 'General'}
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.5, 
    },
  });
};

/**
 * Genera un resumen estructurado (JSON) basado en el historial del chat.
 * Esto se ejecuta al cerrar el chat para guardar el lead en la base de datos.
 */
export const generateLeadSummary = async (messages: ChatMessage[]): Promise<LeadSummary> => {
  if (messages.length === 0) {
    return {
      clientName: "Desconocido",
      contactInfo: "No provisto",
      legalCategory: "General",
      caseSummary: "No hay suficiente información.",
      urgencyLevel: "BAJA",
      recommendedAction: "Revisar logs"
    };
  }

  try {
    // Convertimos el historial a un string simple para el prompt
    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analiza la siguiente conversación entre un abogado de admisión (MODEL) y un cliente potencial (USER).
        Extrae la información en formato JSON.
        
        CONVERSACIÓN:
        ${transcript}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING, description: "Nombre del cliente si se mencionó, o 'Anónimo'" },
            contactInfo: { type: Type.STRING, description: "Teléfono, email o 'No provisto'" },
            legalCategory: { type: Type.STRING, description: "Área del derecho (Penal, Civil, Familia, etc.)" },
            caseSummary: { type: Type.STRING, description: "Resumen breve de los hechos y la problemática (máx 50 palabras)" },
            urgencyLevel: { type: Type.STRING, enum: ["BAJA", "MEDIA", "ALTA", "CRÍTICA"] },
            recommendedAction: { type: Type.STRING, description: "Sugerencia para el abogado que tomará el caso" }
          },
          required: ["clientName", "contactInfo", "legalCategory", "caseSummary", "urgencyLevel", "recommendedAction"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as LeadSummary;

  } catch (error) {
    console.error("Error generando resumen de lead:", error);
    return {
      clientName: "Error al procesar",
      contactInfo: "Manual",
      legalCategory: "Error",
      caseSummary: "Ocurrió un error al generar el resumen con IA.",
      urgencyLevel: "MEDIA",
      recommendedAction: "Revisar chat manualmente"
    };
  }
};

// Exportamos tipos y funciones auxiliares para noticias
export interface NewsResult {
  text: string;
  sources: { uri: string; title: string }[];
}

export const getLegalNews = async (): Promise<NewsResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Busca 3 titulares breves del Poder Judicial de Chile (pjud.cl) de esta semana.",
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 300,
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    const uniqueSources = Array.from(new Map(sources.map((item:any) => [item.uri, item])).values()) as { uri: string; title: string }[];

    return {
      text: response.text || "No hay noticias recientes.",
      sources: uniqueSources.slice(0, 3)
    };
  } catch (error) {
    console.error("News Fetch Error:", error);
    return {
      text: "Noticias no disponibles.",
      sources: []
    };
  }
};
