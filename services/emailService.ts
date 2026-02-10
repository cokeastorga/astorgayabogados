import { ContactFormState, LeadSummary } from '../types';

export const sendContactEmail = async (data: ContactFormState): Promise<boolean> => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'contact',
        data
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Error enviando correo de contacto:", error);
    return false;
  }
};

export const sendLeadSummaryEmail = async (
  summary: LeadSummary, 
  requestedContact?: boolean, 
  satisfaction?: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'lead',
        data: {
          summary,
          requestedContact,
          satisfaction
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Error enviando reporte de lead:", error);
    return false;
  }
};