import './style.css';

export type SceneName = 'ribbons' | 'lanterns' | 'horizon';
export type MotionMode = 'auto' | 'full' | 'static';

export interface SceneOptions {
  scene?: SceneName;
  intensity?: number;
  motion?: MotionMode;
  label?: string;
}

const clamp = (value: number, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
const HTMLElementBase = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as typeof HTMLElement;

/**
 * A canvas scene driven by a Web Audio AnalyserNode.
 * Audio connections always remain under the host page's control.
 *
 * @example
 * const scene = document.querySelector('audio-reactive-scene');
 * const context = new AudioContext();
 * const source = context.createMediaElementSource(document.querySelector('audio'));
 * scene.connect(source);
 * source.connect(context.destination);
 */
export class AudioReactiveScene extends HTMLElementBase {
  static observedAttributes = ['scene', 'intensity', 'motion', 'label'];

  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #analyser?: AnalyserNode;
  #source?: AudioNode;
  #data = new Uint8Array(64);
  #frame = 0;
  #resize?: ResizeObserver;
  #time = 0;
  #last = 0;
  #connected = false;
  #reduced = matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    super();
    this.#canvas = document.createElement('canvas');
    this.#canvas.className = 'audio-reactive-scene__canvas';
    this.#canvas.part.add('canvas');
    this.append(this.#canvas);
    this.#ctx = this.#canvas.getContext('2d', { alpha: false })!;
  }

  connectedCallback(): void {
    this.setAttribute('role', 'img');
    this.#updateLabel();
    this.#resize = new ResizeObserver(() => this.#fit());
    this.#resize.observe(this);
    this.#reduced.addEventListener('change', this.#motionChange);
    this.#fit();
    this.#start();
  }

  disconnectedCallback(): void {
    this.disconnect();
    this.#resize?.disconnect();
    this.#reduced.removeEventListener('change', this.#motionChange);
    cancelAnimationFrame(this.#frame);
  }

  attributeChangedCallback(): void {
    this.#updateLabel();
    this.#draw(this.#energy());
    this.#start();
  }

  get scene(): SceneName {
    const value = this.getAttribute('scene');
    return value === 'lanterns' || value === 'horizon' ? value : 'ribbons';
  }

  set scene(value: SceneName) { this.setAttribute('scene', value); }

  get intensity(): number { return clamp(Number(this.getAttribute('intensity') ?? 0.7)); }
  set intensity(value: number) { this.setAttribute('intensity', String(clamp(value))); }

  get motion(): MotionMode {
    const value = this.getAttribute('motion');
    return value === 'full' || value === 'static' ? value : 'auto';
  }
  set motion(value: MotionMode) { this.setAttribute('motion', value); }

  /** Connect an existing audio graph node. The component never starts capture. */
  connect(source: AudioNode): AnalyserNode {
    this.disconnect();
    this.#analyser = source.context.createAnalyser();
    this.#analyser.fftSize = 128;
    this.#analyser.smoothingTimeConstant = 0.82;
    source.connect(this.#analyser);
    this.#source = source;
    this.#connected = true;
    this.#updateLabel();
    this.#start();
    return this.#analyser;
  }

  /** Stop reading audio. This does not close the host page's AudioContext. */
  disconnect(): void {
    cancelAnimationFrame(this.#frame);
    if (this.#source && this.#analyser) {
      try { this.#source.disconnect(this.#analyser); } catch { /* The host may have disconnected its graph first. */ }
    }
    this.#analyser?.disconnect();
    this.#analyser = undefined;
    this.#source = undefined;
    this.#connected = false;
    this.#time = 0;
    this.#updateLabel();
    this.drawPoster();
  }

  /** Redraw a deterministic poster frame, useful for screenshots and reduced motion. */
  drawPoster(): void {
    this.#time = 0;
    this.#draw(0.34);
  }

  #motionChange = (): void => { this.#start(); };

  #isStatic(): boolean {
    return this.motion === 'static' || (this.motion === 'auto' && this.#reduced.matches);
  }

  #shouldAnimate(): boolean {
    return this.#connected && !this.#isStatic();
  }

  #updateLabel(): void {
    const state = this.#connected ? 'connected to audio' : 'showing a static poster';
    this.setAttribute('aria-label', this.getAttribute('label') || `${this.scene} audio-reactive scene, ${state}`);
  }

  #fit(): void {
    const box = this.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.#canvas.width = Math.max(1, Math.round(box.width * ratio));
    this.#canvas.height = Math.max(1, Math.round(box.height * ratio));
    if (this.#shouldAnimate()) this.#draw(this.#energy());
    else this.drawPoster();
  }

  #start(): void {
    cancelAnimationFrame(this.#frame);
    if (!this.#shouldAnimate()) {
      this.drawPoster();
      return;
    }
    this.#last = performance.now();
    this.#frame = requestAnimationFrame(this.#tick);
  }

  #tick = (now: number): void => {
    if (!this.#shouldAnimate()) {
      this.#start();
      return;
    }
    const delta = Math.min(40, now - this.#last);
    this.#last = now;
    this.#time += delta / 1000;
    this.#draw(this.#energy());
    this.#frame = requestAnimationFrame(this.#tick);
  };

  #energy(): number {
    if (!this.#analyser) return 0.24;
    this.#analyser.getByteFrequencyData(this.#data);
    let total = 0;
    for (const value of this.#data) total += value;
    return clamp((total / this.#data.length / 255) * 1.7);
  }

  #draw(energy: number): void {
    const { width: w, height: h } = this.#canvas;
    if (!w || !h) return;
    const ctx = this.#ctx;
    const strength = clamp(energy * this.intensity + 0.08);
    ctx.fillStyle = '#090b12';
    ctx.fillRect(0, 0, w, h);
    this.#drawGrid(ctx, w, h);
    if (this.scene === 'lanterns') this.#drawLanterns(ctx, w, h, strength);
    else if (this.scene === 'horizon') this.#drawHorizon(ctx, w, h, strength);
    else this.#drawRibbons(ctx, w, h, strength);
  }

  #drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.strokeStyle = 'rgba(244,230,193,.055)';
    ctx.lineWidth = 1;
    const unit = Math.max(28, Math.round(w / 24));
    for (let x = 0; x < w; x += unit) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += unit) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  #drawRibbons(ctx: CanvasRenderingContext2D, w: number, h: number, energy: number): void {
    const colors = ['#61e7df', '#ff6b5f', '#ffc857'];
    colors.forEach((color, lane) => {
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 10) {
        const wave = Math.sin(x / (80 + lane * 20) + this.#time * (0.7 + lane * .13) + lane * 2);
        const y = h * (.3 + lane * .2) + wave * h * (.04 + energy * .13);
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(4, w / 170) * (0.75 + energy);
      ctx.shadowBlur = 12 + energy * 22;
      ctx.shadowColor = color;
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
  }

  #drawLanterns(ctx: CanvasRenderingContext2D, w: number, h: number, energy: number): void {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const seed = (i * 73) % count;
      const x = ((seed + 1) / (count + 1)) * w;
      const baseY = ((i * 41) % 90) / 100 * h + h * .05;
      const y = (baseY + Math.sin(this.#time * .45 + i) * h * .025 + h) % h;
      const radius = Math.max(3, w / 220) * (1 + energy * (i % 4));
      const color = i % 3 === 0 ? '#61e7df' : i % 3 === 1 ? '#ff6b5f' : '#ffc857';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 + energy * 25;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  #drawHorizon(ctx: CanvasRenderingContext2D, w: number, h: number, energy: number): void {
    const horizon = h * .58;
    ctx.fillStyle = '#111522';
    ctx.fillRect(0, horizon, w, h - horizon);
    for (let i = 0; i < 14; i++) {
      const y = horizon + (i * i / 170) * (h - horizon);
      ctx.strokeStyle = `rgba(97,231,223,${.16 + energy * .5})`;
      ctx.lineWidth = Math.max(1, energy * 4);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    const sun = Math.min(w, h) * (.08 + energy * .05);
    ctx.fillStyle = '#ff6b5f'; ctx.shadowColor = '#ff6b5f'; ctx.shadowBlur = 22 + energy * 35;
    ctx.beginPath(); ctx.arc(w * .5, horizon - sun * .85, sun, Math.PI, 0); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffc857'; ctx.lineWidth = Math.max(3, w / 250);
    ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(w, horizon); ctx.stroke();
  }
}

export function defineAudioReactiveScene(tagName = 'audio-reactive-scene'): typeof AudioReactiveScene {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, tagName === 'audio-reactive-scene' ? AudioReactiveScene : class extends AudioReactiveScene {});
  }
  return AudioReactiveScene;
}

if (typeof customElements !== 'undefined') defineAudioReactiveScene();
