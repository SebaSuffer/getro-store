import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'hybrid', // Cambiado a hybrid para que los archivos estáticos se copien correctamente
  adapter: vercel(),
});

