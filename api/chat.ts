import { GoogleGenAI, Chat } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { message, history } = req.body;
  const systemPrompt = `
    Eres un abogado senior del equipo de admisión de "Astorga y Asociados".
    OBJETIVO: Triaje inicial para captar clientes.
    PERSONALIDAD: Profesional, empático, directo.
    RESTRICCIONES: Respuestas breves (máx 60 palabras). No inventes leyes. Prioriza captar urgencias penales.
    Al final, intenta conseguir una reunión.
  `;

  // 1. INTENTO CON GEMINI (PRIMARIA)
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemPrompt,
      },
      history: history || []
    });

    const result = await chat.sendMessage({ message: message });
    return res.status(200).json({ text: result.text });

  } catch (geminiError: any) {
    console.error("⚠️ Gemini API Error:", geminiError.message || geminiError);

    // 2. INTENTO CON OPENAI (SECUNDARIA / FALLBACK)
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("🔄 Switching to OpenAI Fallback...");
        
        // Convertir historial de Gemini (role: user/model) a OpenAI (role: user/assistant)
        const openAIHistory = (history || []).map((msg: any) => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts[0].text
        }));

        // Agregar System Prompt y mensaje actual
        const messages = [
          { role: "system", content: systemPrompt },
          ...openAIHistory,
          { role: "user", content: message }
        ];

        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Modelo rápido y económico similar a Flash
            messages: messages,
            max_tokens: 150,
            temperature: 0.7
          })
        });

        if (!openAiResponse.ok) {
           const errText = await openAiResponse.text();
           throw new Error(`OpenAI Error: ${errText}`);
        }

        const data = await openAiResponse.json();
        const text = data.choices[0]?.message?.content || "";
        
        return res.status(200).json({ text });

      } catch (openAiError) {
        console.error("❌ OpenAI Fallback Failed:", openAiError);
      }
    }

    // 3. RESPUESTA FINAL DE ERROR SI AMBOS FALLAN
    return res.status(200).json({ 
      text: "Lo siento, en este momento nuestros sistemas están experimentando una alta demanda. Por favor, contáctanos directamente al teléfono +56 9 500 89 295." 
    });
  }
}