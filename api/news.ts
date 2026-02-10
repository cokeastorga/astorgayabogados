import { GoogleGenAI } from "@google/genai";

export default async function handler(request: Request) {
  try {
    // Initialize GoogleGenAI with the process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Busca 3 titulares breves del Poder Judicial de Chile (pjud.cl) de esta semana.",
      config: {
        tools: [{ googleSearch: {} }],
        // maxOutputTokens removed as it requires thinkingBudget for Gemini 3 models
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    const uniqueSources = Array.from(new Map(sources.map((item:any) => [item.uri, item])).values());

    return new Response(JSON.stringify({
      text: response.text || "No hay noticias recientes.",
      sources: uniqueSources.slice(0, 3)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ text: "Servicio no disponible", sources: [] }), { status: 500 });
  }
}