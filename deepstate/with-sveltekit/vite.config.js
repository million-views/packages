import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      "@preact/signals-core": path.resolve(
        __dirname,
        "node_modules/@preact/signals-core",
      ),
    },
  },
});
