import { GoogleGenAI, Chat } from "@google/genai";

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message, history } = await request.json();
    
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
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemPrompt,
      },
      history: history || []
    });

    // Use chat.sendMessage with named parameter 'message'.
    const result = await chat.sendMessage({ message: message });
    // Access the text property directly.
    const text = result.text;

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("API Chat Error:", error);
    return new Response(JSON.stringify({ text: "Error procesando la solicitud." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
