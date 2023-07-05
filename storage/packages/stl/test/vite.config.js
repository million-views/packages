import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['**/node_modules/@m5nv/stl/src/**']
    },
  },
});