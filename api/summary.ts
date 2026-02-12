import { GoogleGenAI, Type } from "@google/genai";

// Helper para limpiar bloques de código Markdown (```json ... ```)
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  const transcript = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  const promptText = `
    Analiza la siguiente conversación legal y extrae los datos en JSON estrictamente con esta estructura:
    {
      "clientName": "string",
      "contactInfo": "string",
      "legalCategory": "string",
      "caseSummary": "string",
      "urgencyLevel": "BAJA" | "MEDIA" | "ALTA" | "CRÍTICA",
      "recommendedAction": "string"
    }
    
    CONVERSACIÓN:
    ${transcript}
  `;

  // 1. INTENTO CON GEMINI
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
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

    const jsonText = cleanJson(response.text || "{}");
    return res.status(200).json(JSON.parse(jsonText));

  } catch (geminiError: any) {
    console.error("⚠️ Gemini Summary Error:", geminiError.message || geminiError);

    // 2. INTENTO CON OPENAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("🔄 Switching to OpenAI Fallback for Summary...");

        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }, // Forzar JSON
            messages: [
              { role: "system", content: "Eres un asistente legal experto en extraer datos. Responde solo en JSON." },
              { role: "user", content: promptText }
            ]
          })
        });

        if (!openAiResponse.ok) throw new Error("OpenAI request failed");

        const data = await openAiResponse.json();
        const content = data.choices[0]?.message?.content || "{}";
        
        return res.status(200).json(JSON.parse(content));

      } catch (openAiError) {
        console.error("❌ OpenAI Summary Fallback Failed:", openAiError);
      }
    }

    // 3. FALLBACK MANUAL SI TODO FALLA
    return res.status(500).json({ 
      error: "No se pudo generar el resumen.",
      clientName: "No detectado (Error Sistema)",
      urgencyLevel: "ALTA",
      contactInfo: "Revisar chat manual",
      legalCategory: "Indeterminado",
      caseSummary: "Error en el procesamiento del resumen.",
      recommendedAction: "Revisión manual requerida"
    });
  }
}