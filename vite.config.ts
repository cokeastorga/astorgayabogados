import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo (development/production)
  // El tercer argumento '' permite cargar todas las variables, no solo las que empiezan con VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Exponemos las variables de entorno de forma segura para que 'process.env.VARIABLE' funcione
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(env.REACT_APP_FIREBASE_API_KEY),
      'process.env.REACT_APP_SENDGRID_API_KEY': JSON.stringify(env.REACT_APP_SENDGRID_API_KEY),
      // Definimos process.env vacío como fallback para otras librerías
      'process.env': {}
    },
    build: {
      outDir: 'dist',
    }
  };
});