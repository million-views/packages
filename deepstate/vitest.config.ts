import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: [
      {
        // add "extends: true" to inherit the options from the root config
        extends: true,
        test: {
          include: ['test/spa/**/*.test.{ts,js}'],
          // it is recommended to define a name when using inline configs
          name: 'SPA',
          setupFiles: ["./test/setup.spa.js"],
        }
      },
      {
        test: {
          include: ['test/ssr/**/*.test.{ts,js}'],
          name: 'node',
          environment: 'node',
          setupFiles: ["./test/setup.ssr.js"],
        }
      }
    ]
  }
});