import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: {
  //     '@preact/signals-react/runtime': path.resolve(__dirname, 'node_modules/@preact/signals-react/runtime'),
  //     '@preact/signals-react-transform': path.resolve(__dirname, 'node_modules/@preact/signals-react-transform'),
  //   }
  // },
  plugins: [react(), babel()],
})
