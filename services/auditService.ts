import { ChatSession } from '../types';
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Servicio de Auditoría de Chats usando Firebase Firestore.
 * Guarda cada sesión de chat como un documento en la colección 'chat_audits'.
 */

export const saveChatToDatabase = async (session: ChatSession): Promise<boolean> => {
  try {
    // Referencia a la colección 'chat_audits' en Firestore
    const auditsRef = collection(db, "chat_audits");

    // Guardar el documento
    await addDoc(auditsRef, {
      ...session,
      savedAt: serverTimestamp(), // Marca de tiempo del servidor para precisión
      metadata: {
        platform: 'web',
        environment: process.env.NODE_ENV || 'development'
      }
    });

    console.log(`✅ Chat guardado en Firebase: ${session.id}`);
    return true;
  } catch (error) {
    console.error("❌ Error guardando chat en Firebase:", error);
    
    // FALLBACK: Si Firebase falla (ej. sin internet o mala config), 
    // intentamos guardar en localStorage para no perder el dato.
    try {
        const history = JSON.parse(localStorage.getItem('chat_audit_log_fallback') || '[]');
        history.push({ ...session, _syncStatus: 'pending' });
        localStorage.setItem('chat_audit_log_fallback', JSON.stringify(history));
        console.warn("⚠️ Chat guardado localmente (Fallback)");
    } catch (localError) {
        console.error("Fallo crítico en auditoría");
    }
    
    return false;
  }
};