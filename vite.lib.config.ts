import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist/lib',
    emptyOutDir: false,
    lib: {
      entry: resolve(rootDir, 'src/index.ts'),
      name: 'AudioReactiveScene',
      formats: ['es', 'cjs'],
      cssFileName: 'audio-reactive-scene',
      fileName: (format) => `audio-reactive-scene.${format === 'es' ? 'js' : 'cjs'}`
    },
    minify: 'esbuild'
  }
});
