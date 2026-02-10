import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase usando variables VITE_
// Eliminamos defensas innecesarias (?.); Vite garantiza que import.meta.env existe en el cliente.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db: any; 

try {
  // Validar que al menos la API Key tenga valor (no sea string vacío o undefined)
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Falta configuración de Firebase (VITE_FIREBASE_API_KEY). La auditoría estará deshabilitada.");
  } else {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase inicializado correctamente");
  }
} catch (error: any) {
  // Ignoramos el error "already exists" que ocurre a veces en hot-reload
  if (error.message && !/already exists/.test(error.message)) {
    console.error('❌ Error inicializando Firebase:', error.message);
  }
}

export { db };
