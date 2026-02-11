import { GoogleGenAI, Chat } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { message, history } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `Eres un abogado senior... (Tu prompt original)...`;

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: systemPrompt },
      history: history || []
    });

    const result = await chat.sendMessage({ message: message });
    return res.status(200).json({ text: result.text });

  } catch (error) {
    console.error("⚠️ Chat API Saturada:", error);
    
    // RESPUESTA DE RESPALDO:
    return res.status(200).json({ 
      text: "Lo siento, en este momento nuestros sistemas están experimentando una alta demanda. Por favor, contáctanos directamente a través del formulario o intenta nuevamente mañana." 
    });
  }
}