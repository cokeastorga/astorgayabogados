import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    // Initialize GoogleGenAI with the process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Busca 3 titulares breves del Poder Judicial de Chile (pjud.cl) de esta semana.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    const uniqueSources = Array.from(new Map(sources.map((item:any) => [item.uri, item])).values());

    return res.status(200).json({
      text: response.text || "No hay noticias recientes.",
      sources: uniqueSources.slice(0, 3)
    });

  } catch (error) {
    return res.status(500).json({ text: "Servicio no disponible", sources: [] });
  }
}