import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: '@m5nv-ui-elements',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // - do not bundle React including jsx-runtime
      // - consumers must install both react and react/jsx-runtime
      // - NOTE: react/jsx-runtime is provided by React v17+, so no
      //   extra `npm install` is required
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      }
    },
    target: 'esnext',
  },
});