import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ✅ This is critical for correct routing in production
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    open: true,
  },
});
