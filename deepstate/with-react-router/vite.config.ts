import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from '@vitejs/plugin-react';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/// The rabbit holes...
/// - [Option to skip fast refresh](https://github.com/vitejs/vite-plugin-react/issues/346)
/// - 
export default defineConfig(({ isSsrBuild }) => {
  return {
    resolve: {
      alias: {
        '@preact/signals-react': path.resolve(__dirname, 'node_modules/@preact/signals-react'),
        '@preact/signals-react-transform': path.resolve(__dirname, 'node_modules/@preact/signals-react-transform'),
      }
    },
    server: {
      /// hack to get signals-react-transform to do its thing in dev mode
      hmr: false
    },
    plugins: [react({
      babel: {
        babelrc: false,
        plugins: [[
          "module:@preact/signals-react-transform"
        ]]
      }
    }), tailwindcss(), reactRouter(), tsconfigPaths()],

    // see https://glama.ai/blog/2025-02-07-react-router-without-server-bundles
    output: isSsrBuild
      ? {
        // Preserve the original scripts without bundling them.
        preserveModules: true,
      }
      : {},
  }
});
