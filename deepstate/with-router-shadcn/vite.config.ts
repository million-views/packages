import path from "path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({isSsrBuild}) => {
  return {
    resolve: {
      alias: {
        // "@": path.resolve(__dirname, "./app"),
        "@/components": path.resolve(__dirname, "./app/components"),
        "@/lib": path.resolve(__dirname, "./app/lib"),
        "@/hooks": path.resolve(__dirname, "./app/hooks"),
        '@preact/signals-react': path.resolve(__dirname, 'node_modules/@preact/signals-react'),
        '@preact/signals-react-transform': path.resolve(__dirname, 'node_modules/@preact/signals-react-transform'),
      },
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
    }),tailwindcss(), reactRouter(), tsconfigPaths()],

    output: isSsrBuild
          ? {
            // Preserve the original scripts without bundling them.
            preserveModules: true,
          }
          : {},
    }
});
