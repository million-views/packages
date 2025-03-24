// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import preact from "@astrojs/preact";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",

  server: {
    port: 5321,
  },

  adapter: node({
    mode: "standalone",
  }),

  integrations: [preact({ compat: true })],

  vite: {
    plugins: [tailwindcss()],
  },
});
