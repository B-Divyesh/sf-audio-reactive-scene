import { writeFile } from 'node:fs/promises';

const sampleRate = 16_000;
const duration = 8;
const length = sampleRate * duration;
const samples = new Float64Array(length);
let seed = 0x287b50b;

function noise() {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 0x100000000 * 2 - 1;
}

function addKick(time, strength = 1) {
  const start = Math.floor(time * sampleRate);
  const count = Math.floor(.34 * sampleRate);
  let phase = 0;
  for (let offset = 0; offset < count && start + offset < length; offset += 1) {
    const age = offset / sampleRate;
    const frequency = 48 + 92 * Math.exp(-age * 25);
    phase += 2 * Math.PI * frequency / sampleRate;
    samples[start + offset] += Math.sin(phase) * Math.exp(-age * 13) * .76 * strength;
  }
}

function addSnare(time, strength = 1) {
  const start = Math.floor(time * sampleRate);
  const count = Math.floor(.22 * sampleRate);
  let previous = 0;
  for (let offset = 0; offset < count && start + offset < length; offset += 1) {
    const age = offset / sampleRate;
    const raw = noise();
    const bright = raw - previous * .72;
    previous = raw;
    const body = Math.sin(2 * Math.PI * 176 * age) * .24;
    samples[start + offset] += (bright * .36 + body) * Math.exp(-age * 18) * strength;
  }
}

function addHat(time, open = false) {
  const start = Math.floor(time * sampleRate);
  const count = Math.floor((open ? .19 : .055) * sampleRate);
  let low = 0;
  for (let offset = 0; offset < count && start + offset < length; offset += 1) {
    const age = offset / sampleRate;
    const raw = noise();
    low += (raw - low) * .22;
    const high = raw - low;
    samples[start + offset] += high * Math.exp(-age * (open ? 18 : 60)) * (open ? .16 : .12);
  }
}

function addBass(time, midi, durationSeconds) {
  const start = Math.floor(time * sampleRate);
  const count = Math.floor(durationSeconds * sampleRate);
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  for (let offset = 0; offset < count && start + offset < length; offset += 1) {
    const age = offset / sampleRate;
    const release = Math.min(1, (durationSeconds - age) * 12);
    const envelope = Math.min(1, age * 45) * Math.max(0, release);
    const fundamental = Math.sin(2 * Math.PI * frequency * age);
    const harmonic = Math.sin(2 * Math.PI * frequency * 2 * age) * .22;
    samples[start + offset] += (fundamental + harmonic) * envelope * .22;
  }
}

function addBell(time, midi) {
  const start = Math.floor(time * sampleRate);
  const count = Math.floor(.7 * sampleRate);
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  for (let offset = 0; offset < count && start + offset < length; offset += 1) {
    const age = offset / sampleRate;
    const envelope = Math.exp(-age * 5.2);
    const tone = Math.sin(2 * Math.PI * frequency * age)
      + .42 * Math.sin(2 * Math.PI * frequency * 2.01 * age)
      + .18 * Math.sin(2 * Math.PI * frequency * 3.98 * age);
    samples[start + offset] += tone * envelope * .095;
  }
}

const beat = .5;
for (let step = 0; step < 16; step += 1) {
  const time = step * beat;
  if ([0, 3, 4, 7, 8, 10, 12, 15].includes(step)) addKick(time, step === 0 || step === 8 ? 1 : .82);
  if ([2, 6, 10, 14].includes(step)) addSnare(time, step === 14 ? 1.1 : .9);
  addHat(time, step === 7 || step === 15);
  addHat(time + beat / 2);
}

const bassLine = [38, 38, 41, 36, 38, 45, 43, 36, 38, 41, 45, 43, 36, 38, 33, 36];
bassLine.forEach((midi, step) => addBass(step * beat, midi, step % 4 === 3 ? .42 : .3));
[[.25, 69], [1.75, 72], [3.25, 74], [4.25, 69], [5.5, 76], [6.75, 72]].forEach(([time, midi]) => addBell(time, midi));

const bytesPerSample = 2;
const wav = Buffer.alloc(44 + length * bytesPerSample);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + length * bytesPerSample, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * bytesPerSample, 28);
wav.writeUInt16LE(bytesPerSample, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(length * bytesPerSample, 40);

for (let index = 0; index < length; index += 1) {
  const edge = Math.min(1, index / 320, (length - 1 - index) / 320);
  const shaped = Math.tanh(samples[index] * 1.2) * Math.max(0, edge) * .83;
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, shaped)) * 32767), 44 + index * bytesPerSample);
}

await writeFile(new URL('../site/public/assets/night-market-loop.wav', import.meta.url), wav);
