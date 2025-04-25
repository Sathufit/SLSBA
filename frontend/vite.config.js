import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ✅ Correct for static hosting like GitHub Pages
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    open: true,
  },
  envPrefix: 'VITE_', // ✅ Explicitly define VITE_ prefix usage
});
