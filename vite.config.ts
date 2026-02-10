import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Exponemos variables que empiecen con REACT_APP_ (legacy) y VITE_ en import.meta.env
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: {
      // Mapeo manual para API_KEY usada por el SDK de Gemini
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // ELIMINADO: 'process.env': {} -> Esto rompía process.env.NODE_ENV en librerías
    },
    build: {
      outDir: 'dist',
    }
  };
});