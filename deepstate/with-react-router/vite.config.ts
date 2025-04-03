import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ isSsrBuild }) => {
  return {
    resolve: {
      alias: {
        '@preact/signals-react': path.resolve(__dirname, 'node_modules/@preact/signals-react'),
        '@preact/signals-react-transform': path.resolve(__dirname, 'node_modules/@preact/signals-react-transform'),
      }
    },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

    // see https://glama.ai/blog/2025-02-07-react-router-without-server-bundles
    output: isSsrBuild
      ? {
        // Preserve the original scripts without bundling them.
        preserveModules: true,
      }
      : {},
  }
});
