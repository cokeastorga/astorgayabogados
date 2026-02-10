import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(request: Request) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { messages } = await request.json();
    
    // Initialize GoogleGenAI with the process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const transcript = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analiza la siguiente conversación legal y extrae los datos en JSON:
        ${transcript}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            contactInfo: { type: Type.STRING },
            legalCategory: { type: Type.STRING },
            caseSummary: { type: Type.STRING },
            urgencyLevel: { type: Type.STRING, enum: ["BAJA", "MEDIA", "ALTA", "CRÍTICA"] },
            recommendedAction: { type: Type.STRING }
          },
          required: ["clientName", "contactInfo", "legalCategory", "caseSummary", "urgencyLevel", "recommendedAction"]
        }
      }
    });

    return new Response(JSON.stringify(JSON.parse(response.text || "{}")), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate summary" }), { status: 500 });
  }
}
