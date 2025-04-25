import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // ✅ ensures assets always load from root (e.g., /assets/index-xxxx.js)
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    open: true,
  },
  envPrefix: 'VITE_', // optional, fine to keep
});
