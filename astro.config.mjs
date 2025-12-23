import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'hybrid', // Hybrid permite archivos estáticos + rutas API dinámicas
  adapter: vercel({
    // El runtime se toma del panel de Vercel (24.x) y package.json
  }),
});

