import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@preact/signals-react': path.resolve(__dirname, 'node_modules/@preact/signals-react'),
      '@preact/signals-react-transform': path.resolve(__dirname, 'node_modules/@preact/signals-react-transform'),
    }
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
