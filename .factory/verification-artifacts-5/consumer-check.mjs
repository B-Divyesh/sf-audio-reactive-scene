import { chromium } from 'playwright';
import { execFile as execFileCallback } from 'node:child_process';
import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const root = process.cwd();
const temporary = await mkdtemp(join(tmpdir(), 'audio-scene-consumer-5-'));
const report = {};

try {
  const packed = JSON.parse((await execFile('npm', ['pack', '--json', '--pack-destination', temporary], { cwd: root })).stdout)[0];
  const tarball = join(temporary, packed.filename);
  await copyFile(tarball, join(root, '.factory/verification-artifacts-5', packed.filename));
  const consumer = join(temporary, 'consumer');
  await mkdir(consumer);
  await writeFile(join(consumer, 'package.json'), '{"name":"qa-consumer","private":true,"type":"module"}\n');
  const installed = await execFile('npm', ['install', '--ignore-scripts', '--no-package-lock', tarball], { cwd: consumer });
  const esm = await execFile(process.execPath, ['--input-type=module', '--eval', "import * as pkg from 'audio-reactive-scene'; if (!pkg.AudioReactiveScene || !pkg.defineAudioReactiveScene) process.exit(2); console.log(Object.keys(pkg).sort().join(','))"], { cwd: consumer });
  const commonjs = await execFile(process.execPath, ['--eval', "const pkg=require('audio-reactive-scene'); if (!pkg.AudioReactiveScene || !pkg.defineAudioReactiveScene) process.exit(2); console.log(Object.keys(pkg).sort().join(','))"], { cwd: consumer });
  const installedRoot = join(consumer, 'node_modules/audio-reactive-scene');
  const manifest = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'));
  await access(join(installedRoot, 'dist/lib/audio-reactive-scene.css'));
  await access(join(installedRoot, 'dist/lib/index.d.ts'));

  const library = await readFile(join(installedRoot, 'dist/lib/audio-reactive-scene.js'), 'utf8');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setContent('<main><div id="mount"></div></main>');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(library).toString('base64')}`;
  const api = await page.evaluate(async (url) => {
    const pkg = await import(url);
    pkg.defineAudioReactiveScene('qa-audio-scene');
    const defaultCreated = document.createElement('audio-reactive-scene');
    const customCreated = document.createElement('qa-audio-scene');
    const CustomScene = customElements.get('qa-audio-scene');
    document.querySelector('#mount').insertAdjacentHTML('beforeend', '<qa-audio-scene id="parsed-scene"></qa-audio-scene>');
    const parsed = document.querySelector('#parsed-scene');
    const scene = new pkg.AudioReactiveScene();
    scene.style.cssText = 'display:block;width:640px;height:360px';
    document.querySelector('#mount').append(scene);
    scene.setAttribute('scene', 'bogus');
    scene.setAttribute('motion', 'bogus');
    scene.setAttribute('intensity', 'bogus');
    const invalid = { scene: scene.scene, motion: scene.motion, intensity: scene.intensity };
    scene.intensity = -5;
    const minimum = scene.intensity;
    scene.intensity = 5;
    const maximum = scene.intensity;
    scene.scene = 'horizon';
    scene.motion = 'static';
    scene.setAttribute('label', 'Consumer visual');
    const audio = new AudioContext();
    const source = audio.createOscillator();
    const analyser = scene.connect(source);
    const connectedLabel = scene.getAttribute('aria-label');
    scene.disconnect();
    scene.drawPoster();
    return {
      exports: Object.keys(pkg).sort(),
      registered: customElements.get('audio-reactive-scene') === pkg.AudioReactiveScene,
      customRegistered: Boolean(CustomScene),
      documentCreateElement: {
        defaultConstructor: defaultCreated.constructor.name,
        defaultConnect: typeof defaultCreated.connect,
        customConstructor: customCreated.constructor.name,
        customConnect: typeof customCreated.connect
      },
      parserCreated: { constructor: parsed.constructor.name, connect: typeof parsed.connect, canvas: Boolean(parsed.querySelector('canvas')) },
      directCustomConstruction: (() => {
        const custom = new CustomScene();
        return { constructor: custom.constructor.name, connect: typeof custom.connect, canvas: Boolean(custom.querySelector('canvas')) };
      })(),
      canvas: Boolean(scene.querySelector('canvas')),
      role: scene.getAttribute('role'),
      invalid,
      minimum,
      maximum,
      current: { scene: scene.scene, motion: scene.motion, intensity: scene.intensity },
      analyser: analyser instanceof AnalyserNode,
      connectedLabel,
      disconnectedLabel: scene.getAttribute('aria-label')
    };
  }, moduleUrl);
  const canvas = page.locator('audio-reactive-scene canvas');
  const first = await canvas.screenshot();
  await page.evaluate(() => document.querySelector('audio-reactive-scene').drawPoster());
  const second = await canvas.screenshot();
  api.posterDeterministic = first.equals(second);
  await browser.close();

  report.pack = { filename: packed.filename, size: packed.size, unpackedSize: packed.unpackedSize, files: packed.files.map((file) => file.path), bundled: packed.bundled ?? [] };
  report.install = { stdout: installed.stdout.trim(), stderr: installed.stderr.trim(), dependencies: manifest.dependencies ?? {}, esm: esm.stdout.trim(), commonjs: commonjs.stdout.trim() };
  report.browser = { api, consoleErrors, pageErrors };
} finally {
  await rm(temporary, { recursive: true, force: true });
}

await writeFile('.factory/verification-artifacts-5/consumer.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
