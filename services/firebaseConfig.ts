import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// Usamos import.meta.env directamente con tipado seguro gracias a vite-env.d.ts
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID
};

let app;
let db: any; 

try {
  // Validar que al menos la API Key exista antes de intentar inicializar
  if (!firebaseConfig.apiKey) {
    throw new Error("Falta configuración de Firebase (API Key). Verifique su archivo .env");
  }

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🔥 Firebase inicializado correctamente");
} catch (error: any) {
  // Ignoramos el error "already exists" que ocurre a veces en hot-reload
  if (error.message && !/already exists/.test(error.message)) {
    console.error('❌ Error inicializando Firebase:', error.message);
    console.warn('La auditoría de chats funcionará en modo local (fallback).');
  }
}

export { db };