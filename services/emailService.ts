import { ContactFormState } from '../types';

// NOTA TÉCNICA:
// Para usar SendGrid directamente, normalmente se requiere un servidor backend para proteger la API KEY.
// Llamar a la API de SendGrid directamente desde el navegador suele ser bloqueado por políticas CORS de seguridad.
// 
// Este servicio está estructurado para intentar el envío si se configura, pero devuelve 'false'
// si falla, permitiendo que el componente Contact.tsx use el método 'mailto' como respaldo infalible.

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
// En un entorno real, esta variable vendría de process.env y se usaría en un backend
const SENDGRID_API_KEY = process.env.REACT_APP_SENDGRID_API_KEY || ''; 

export const sendContactEmail = async (data: ContactFormState): Promise<boolean> => {
  // Si no hay API Key configurada, retornamos false para activar el fallback inmediato
  if (!SENDGRID_API_KEY) {
    console.log("Modo Demo: API Key no detectada. Usando fallback local.");
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
        from: { email: 'noreply@astorgayasociados.cl' }, // El remitente debe estar verificado en SendGrid
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