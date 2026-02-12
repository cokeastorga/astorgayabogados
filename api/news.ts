import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Permitir solo GET
  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ text: "Method Not Allowed", sources: [] });
  }

  try {
    // Verificar API Key
    if (!process.env.API_KEY) {
      console.error("Missing API_KEY in environment variables");
      throw new Error("API Key configuration error");
    }

    // Initialize GoogleGenAI with the process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Use the correct model for basic text/search tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Busca 3 titulares breves y relevantes del Poder Judicial de Chile (pjud.cl) o noticias legales de Chile de esta semana. Prioriza fuentes oficiales.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    // Eliminar duplicados basados en URI
    const uniqueSources = Array.from(new Map(sources.map((item:any) => [item.uri, item])).values());

    return res.status(200).json({
      text: response.text || "No se encontraron noticias recientes.",
      sources: uniqueSources.slice(0, 3)
    });

  } catch (error: any) {
    console.error("API News Error:", error.message || error);
    // Retornamos 200 pero con una estructura válida JSON para que el cliente pueda manejarlo si quiere (Fallback Mode)
    return res.status(200).json({
      text: "⚠️ **Modo Sin Conexión**\n\nNo se pudieron cargar las noticias en tiempo real. \n\nSin embargo, destacamos que el **Poder Judicial** mantiene sus canales de atención remota operativos y la **Corte Suprema** ha actualizado sus criterios respecto a la litigación digital.",
      sources: [
        { title: "Poder Judicial de Chile", uri: "https://www.pjud.cl" },
        { title: "Diario Oficial", uri: "https://www.diariooficial.cl" },
        { title: "Biblioteca del Congreso Nacional", uri: "https://www.bcn.cl" }
      ]
    });
  }
}