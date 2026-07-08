// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        // Em desenvolvimento, /api/* é redirecionado ao backend Go
        // Em produção, PUBLIC_API_URL aponta para o servidor real
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  },
});