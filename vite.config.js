import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://nft-project-2y3b.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});