import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist/lib',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AudioReactiveScene',
      formats: ['es', 'cjs'],
      fileName: (format) => `audio-reactive-scene.${format === 'es' ? 'js' : 'cjs'}`
    },
    minify: 'esbuild'
  }
});
