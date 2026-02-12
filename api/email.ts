export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    console.error("SendGrid API Key missing");
    return res.status(500).json({ success: false, error: "La configuración de correo no está disponible." });
  }

  const { type, data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: "Faltan datos para el envío." });
  }
  
  let subject = "";
  let contentValue = "";

  // Validación y construcción del contenido
  if (type === 'contact') {
    if (!data.name || !data.email || !data.message) {
      return res.status(400).json({ success: false, error: "Campos obligatorios faltantes." });
    }
    subject = `Nuevo contacto web: ${data.name}`;
    contentValue = `Nombre: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone || 'No indicado'}\n\nMensaje:\n${data.message}`;
  
  } else if (type === 'lead') {
    const { summary, requestedContact, satisfaction } = data;
    if (!summary) {
      return res.status(400).json({ success: false, error: "Datos de resumen faltantes." });
    }
    subject = `[LEAD IA] ${requestedContact ? 'CONTACTAR' : 'INFO'} - ${summary.legalCategory}`;
    contentValue = `
REPORTE DE ASISTENTE VIRTUAL
============================
ESTADO: ${requestedContact ? "SOLICITA CONTACTO" : "SOLO CONSULTA"}
URGENCIA: ${summary.urgencyLevel}
CLIENTE: ${summary.clientName} (${summary.contactInfo})
RESUMEN: ${summary.caseSummary}
RECOMENDACIÓN: ${summary.recommendedAction}
SATISFACCIÓN: ${satisfaction || 'No indicada'}
    `;
  } else {
    return res.status(400).json({ success: false, error: "Tipo de correo no válido." });
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'contacto@astorgayasociados.cl' }] }],
        from: { email: 'noreply@astorgayasociados.cl', name: 'Astorga Bot' }, 
        subject: subject,
        content: [{ type: 'text/plain', value: contentValue }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API Error:", errorText);
      throw new Error("SendGrid returned error");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email Handler Error:", error);
    return res.status(500).json({ success: false, error: "Error al enviar el correo." });
  }
}