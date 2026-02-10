import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { messages } = req.body;
    
    // Initialize GoogleGenAI with the process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const transcript = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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

    const jsonText = response.text || "{}";
    const jsonData = JSON.parse(jsonText);

    return res.status(200).json(jsonData);

  } catch (error) {
    return res.status(500).json({ error: "Failed to generate summary" });
  }
}