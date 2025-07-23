import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
      plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
      ],
  resolve: {
    alias: {
            '@': resolve(__dirname, '.'),
            '@/components': resolve(__dirname, 'components'),
            '@/lib': resolve(__dirname, 'lib'),
    },
  },
});