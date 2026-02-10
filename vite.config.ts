import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_', // Vite solo expondrá variables que empiecen con VITE_
  build: {
    outDir: 'dist',
  }
});