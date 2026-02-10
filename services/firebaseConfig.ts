import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ REEMPLAZA ESTOS VALORES CON LOS DE TU CONSOLA DE FIREBASE
// Ve a: https://console.firebase.google.com/ > Configuración del Proyecto > General > Tus apps
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "TU_API_KEY_AQUI",
  authDomain: "astorga-y-asociados-app.firebaseapp.com",
  projectId: "astorga-y-asociados-app",
  storageBucket: "astorga-y-asociados-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase solo si no existe ya una instancia (prevención de errores en hot-reload)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  // Si la app ya está inicializada, ignoramos el error.
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error', error.stack);
  }
}

export const db = getFirestore(app);