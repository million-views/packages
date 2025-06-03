import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';

export default defineConfig({
  plugins: [
    cloudflare({
      // assigns worker to SSR environment for React Router
      viteEnvironment: { name: 'ssr' }
    }),
    reactRouter(),
  ]
});