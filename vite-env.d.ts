
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // Note: Backend keys (GEMINI_API_KEY, SENDGRID_API_KEY) are not typed here 
  // because they are not accessible in the frontend.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
