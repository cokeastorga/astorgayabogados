export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ success: false, error: "La configuración de SendGrid no está disponible." });
  }

  const { type, data } = req.body;
  
  let subject = "";
  let contentValue = "";

  if (type === 'contact') {
    subject = `Nuevo contacto web: ${data.name}`;
    contentValue = `Nombre: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\n\nMensaje:\n${data.message}`;
  } else if (type === 'lead') {
    const { summary, requestedContact, satisfaction } = data;
    subject = `[LEAD IA] ${requestedContact ? 'CONTACTAR' : 'INFO'} - ${summary.legalCategory}`;
    contentValue = `
REPORTE DE ASISTENTE VIRTUAL
============================
ESTADO: ${requestedContact ? "SOLICITA CONTACTO" : "SOLO CONSULTA"}
URGENCIA: ${summary.urgencyLevel}
CLIENTE: ${summary.clientName} (${summary.contactInfo})
RESUMEN: ${summary.caseSummary}
RECOMENDACIÓN: ${summary.recommendedAction}
SATISFACCIÓN: ${satisfaction}
    `;
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
        from: { email: 'noreply@astorgayasociados.cl' }, 
        subject: subject,
        content: [{ type: 'text/plain', value: contentValue }]
      })
    });

    if (!response.ok) throw new Error("SendGrid Error");

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Error al enviar el correo a través del proveedor de mensajería." });
  }
}