import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'site',
  publicDir: 'public',
  build: {
    target: 'es2022',
    outDir: resolve(__dirname, 'dist/site'),
    emptyOutDir: true,
    sourcemap: false
  }
});
