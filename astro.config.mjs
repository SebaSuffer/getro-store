import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'hybrid', // Hybrid permite archivos estáticos + rutas API dinámicas
  adapter: vercel({
    runtime: 'nodejs20.x', // Forzar Node.js 20.x para compatibilidad
  }),
});

