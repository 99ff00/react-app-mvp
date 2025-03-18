import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4000,
    strictPort: true,
    https: false,
    hmr: {
      clientPort: 443,
      path: 'ws',
    },
    allowedHosts: ['local.evisit.com'],
  },
});
