import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../dist/site/', import.meta.url);
const rootPath = root.pathname;
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (!['sw.js', 'staticwebapp.config.json'].includes(entry.name)) files.push(`/${relative(rootPath, path)}`);
  }
}

await walk(rootPath);
const digest = createHash('sha256').update((await readFile(new URL('../package.json', import.meta.url))).toString()).digest('hex').slice(0, 10);
const source = `const CACHE = 'audio-reactive-scene-${digest}';
const SHELL = ${JSON.stringify(files.sort())};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === 'navigate' ? caches.match('/index.html') : Response.error())));
});
`;
await writeFile(new URL('sw.js', root), source);
