import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // ✅ Fix 'global is not defined' error (if needed for some libs)
  },
  server: {
    port: 3000,       // ✅ Runs frontend on http://localhost:3000
    open: true,       // ✅ Automatically opens in the browser
  },
});
