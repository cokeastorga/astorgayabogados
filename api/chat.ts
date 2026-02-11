import { GoogleGenAI, Chat } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { message, history } = req.body;
    
    // Initialize GoogleGenAI with the process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `
      Eres un abogado senior del equipo de admisión de "Astorga y Asociados".
      OBJETIVO: Triaje inicial para captar clientes.
      PERSONALIDAD: Profesional, empático, directo.
      RESTRICCIONES: Respuestas breves (máx 60 palabras). No inventes leyes. Prioriza captar urgencias penales.
      Al final, intenta conseguir una reunión.
    `;

    // Use ai.chats.create to start a chat session.
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history: history || []
    });

    // Use chat.sendMessage with named parameter 'message'.
    const result = await chat.sendMessage({ message: message });
    // Access the text property directly.
    const text = result.text;

    return res.status(200).json({ text });

  } catch (error) {
    console.error("API Chat Error:", error);
    return res.status(500).json({ text: "Error al procesar la respuesta con el servicio de Inteligencia Artificial." });
  }
}