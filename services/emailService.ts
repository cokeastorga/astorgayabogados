import { ContactFormState, LeadSummary } from '../types';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

// Acceso directo a variables de entorno inyectadas por Vite
const SENDGRID_API_KEY = import.meta.env.REACT_APP_SENDGRID_API_KEY;

export const sendContactEmail = async (data: ContactFormState): Promise<boolean> => {
  // Si no hay API Key configurada, retornamos false para activar el fallback inmediato
  if (!SENDGRID_API_KEY) {
    console.log("Modo Demo: SendGrid API Key no detectada. Usando fallback local.");
    return false;
  }

  try {
    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'contacto@astorgayasociados.cl' }]
        }],
        from: { email: 'noreply@astorgayasociados.cl' }, 
        subject: `Nuevo contacto web: ${data.name}`,
        content: [{
          type: 'text/plain',
          value: `Nombre: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\n\nMensaje:\n${data.message}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Error SendGrid: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error al enviar correo vía API:", error);
    return false;
  }
};

export const sendLeadSummaryEmail = async (
  summary: LeadSummary, 
  requestedContact?: boolean, 
  satisfaction?: string
): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.warn("SendGrid API Key no configurada. No se envió reporte de lead.");
    return false;
  }

  try {
    const requestLabel = requestedContact ? "✅ SOLICITA CONTACTO" : "ℹ️ SOLO CONSULTA";
    const satisfactionLabel = satisfaction === 'positive' ? "⭐⭐⭐ Positiva" 
                            : satisfaction === 'negative' ? "⭐ Negativa" 
                            : "⭐⭐ Neutral";

    const emailBody = `
REPORTE DE ASISTENTE VIRTUAL (IA)
========================================
ESTADO: ${requestLabel}
URGENCIA IA: ${summary.urgencyLevel}
ÁREA: ${summary.legalCategory}
SATISFACCIÓN: ${satisfactionLabel}
========================================

DATOS DEL POTENCIAL CLIENTE:
----------------------------
Nombre Detectado: ${summary.clientName}
Contacto: ${summary.contactInfo}

RESUMEN DEL CASO (Generado por IA):
-----------------------------------
${summary.caseSummary}

RECOMENDACIÓN DE ACCIÓN:
------------------------
${summary.recommendedAction}

----------------------------------------
Este reporte fue generado automáticamente y validado por el usuario al finalizar el chat.
    `.trim();

    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'contacto@astorgayasociados.cl' }]
        }],
        from: { email: 'noreply@astorgayasociados.cl' },
        subject: `[LEAD IA] ${requestedContact ? 'CONTACTAR' : 'INFO'} - ${summary.legalCategory}`,
        content: [{
          type: 'text/plain',
          value: emailBody
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Error SendGrid Lead: ${response.statusText}`);
    }
    
    console.log("✅ Reporte de lead enviado al abogado.");
    return true;
  } catch (error) {
    console.error("❌ Error enviando reporte de lead:", error);
    return false;
  }
};