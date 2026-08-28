import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

const deploymentConfig = JSON.parse(
  readFileSync(resolve(rootDir, 'site/public/staticwebapp.config.json'), 'utf8')
) as { globalHeaders: Record<string, string> };

export default defineConfig({
  root: 'site',
  publicDir: 'public',
  preview: {
    // Browser tests exercise the same security policy as the static deployment.
    headers: deploymentConfig.globalHeaders
  },
  build: {
    target: 'es2022',
    outDir: resolve(rootDir, 'dist/site'),
    emptyOutDir: true,
    sourcemap: false
  }
});
