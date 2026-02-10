import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const getLegalGuidance = async (userQuery: string, context?: string): Promise<string> => {
  if (!apiKey) {
    return "Sistema no configurado. Contáctenos al +56 2 2345 6789.";
  }

  try {
    // Prompt optimizado para economía de tokens y conversión.
    const systemPrompt = `
      Actúa como recepcionista virtual de 'Astorga y Asociados'.
      
      OBJETIVO:
      1. Detectar brevemente la urgencia del usuario (${context ? `Contexto seleccionado: ${context}` : 'General'}).
      2. Dar una orientación MUY BREVE (máximo 2 frases).
      3. REDIRIGIR INMEDIATAMENTE al formulario de contacto o teléfono.

      REGLAS DE ECONOMÍA:
      - Respuesta MÁXIMA: 40 palabras.
      - NO expliques leyes ni artículos específicos.
      - NO des consejos. Solo triaje.
      - Tono: Profesional, directo, urgente.

      EJEMPLO DE RESPUESTA:
      "Entiendo la gravedad. En casos penales el tiempo es clave. No exponga detalles aquí. Agende una reunión urgente usando el botón de abajo o llámenos."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4, // Baja creatividad, más directo
        maxOutputTokens: 150, // Límite estricto para reducir costos
      },
    });

    return response.text || "Por favor contáctenos directamente.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error de conexión. Por favor llámenos directamente.";
  }
};

export interface NewsResult {
  text: string;
  sources: { uri: string; title: string }[];
}

export const getLegalNews = async (): Promise<NewsResult> => {
  if (!apiKey) {
    return { 
      text: "Conexión con Poder Judicial no disponible (Falta API Key).", 
      sources: [] 
    };
  }

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