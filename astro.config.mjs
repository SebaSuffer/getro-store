import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server', // Server mode para rutas API dinámicas
  adapter: vercel({
    // Usar Node.js 24.x del panel de Vercel
  }),
});

