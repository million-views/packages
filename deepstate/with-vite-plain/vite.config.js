import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@preact/signals-react": path.resolve(
        __dirname,
        "node_modules/@preact/signals-react",
      ),
      "@preact/signals-react-transform": path.resolve(
        __dirname,
        "node_modules/@preact/signals-react-transform",
      ),
    },
  },

  plugins: [react({
    babel: {
      babelrc: false,
      plugins: [[
        "module:@preact/signals-react-transform",
      ]],
    },
  })],
});
