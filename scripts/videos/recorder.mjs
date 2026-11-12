// Films a tutorial in the real app: a Chromium window at 1440×900 (2× pixels)
// on a virtual screen, recorded by ffmpeg, with a visible cursor that moves,
// clicks and types like a person.
// Each step of the tutorial is marked in time so its caption can be shown
// over the recording (scripts/videos/compose.mjs).
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const VIEW = { width: 1440, height: 900 };
export const SCALE = 2;

// The cursor: an arrow drawn in the page (a headless browser shows none), a
// ring when it clicks. Survives navigations (position kept in sessionStorage).
const CURSOR_SCRIPT = () => {
  const make = () => {
    if (document.getElementById('__tutocursor') || !document.body) return;
    const c = document.createElement('div');
    c.id = '__tutocursor';
    c.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2.5 L4 19 L8.6 14.8 L11.6 21.4 L14.4 20.1 L11.5 13.7 L17.6 13.7 Z" fill="#252921" stroke="#FFFEFA" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', width: '30px', height: '30px', zIndex: '2147483647', pointerEvents: 'none', transform: 'translate(-4px,-2px)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.25))' });
    const ring = document.createElement('div');
    ring.id = '__tutoring';
    Object.assign(ring.style, { position: 'fixed', width: '44px', height: '44px', marginLeft: '-22px', marginTop: '-22px', borderRadius: '50%', border: '3px solid #A65D36', background: 'rgba(166,93,54,.18)', zIndex: '2147483646', pointerEvents: 'none', opacity: '0', transform: 'scale(.4)', transition: 'opacity .35s, transform .35s' });
    document.body.append(ring, c);
    let pos = { x: 720, y: 450 };
    try { pos = JSON.parse(sessionStorage.getItem('__tutopos') || 'null') || pos; } catch {}
    const place = (x, y) => { c.style.left = x + 'px'; c.style.top = y + 'px'; };
    place(pos.x, pos.y);
    addEventListener('mousemove', (e) => { place(e.clientX, e.clientY); try { sessionStorage.setItem('__tutopos', JSON.stringify({ x: e.clientX, y: e.clientY })); } catch {} }, true);
    addEventListener('mousedown', (e) => {
      ring.style.transition = 'none'; ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; ring.style.opacity = '1'; ring.style.transform = 'scale(.4)';
      requestAnimationFrame(() => { ring.style.transition = 'opacity .45s, transform .45s'; ring.style.transform = 'scale(1.1)'; ring.style.opacity = '0'; });
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', make); else make();
  new MutationObserver(make).observe(document.documentElement, { childList: true, subtree: true });
};

// A Chromium window filling a virtual screen (Xvfb, 2880×1800): the app at
// 1440×900 with 2× pixels, without any browser bar. Filmed with ffmpeg
// (x11grab), so the reel can zoom into the picture and stay sharp.
export async function openWindow(chromium, profileDir) {
  // No translation bar, no « save password? » bubble.
  const prefs = path.join(profileDir, 'Default', 'Preferences');
  fs.mkdirSync(path.dirname(prefs), { recursive: true });
  let cur = {};
  try { cur = JSON.parse(fs.readFileSync(prefs, 'utf8')); } catch {}
  Object.assign(cur, { credentials_enable_service: false, translate: { enabled: false }, translate_blocked_languages: ['fr'], intl: { accept_languages: 'fr-CH,fr' } });
  cur.profile = { ...(cur.profile || {}), password_manager_enabled: false };
  fs.writeFileSync(prefs, JSON.stringify(cur));
  const ctx = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: null,
    locale: 'fr-CH',
    args: ['--force-device-scale-factor=2', '--kiosk', '--window-position=0,0', `--window-size=${VIEW.width},${VIEW.height}`, '--disable-features=Translate,TranslateUI,PasswordManagerOnboarding,PasswordLeakDetection', '--password-store=basic', '--lang=fr-CH', '--hide-scrollbars', '--disable-infobars', '--no-first-run', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', ...(process.env.FAKE_AUDIO ? [`--use-file-for-fake-audio-capture=${process.env.FAKE_AUDIO}`] : [])],
    ignoreDefaultArgs: ['--enable-automation'],
  });
  await ctx.addInitScript(CURSOR_SCRIPT);
  await ctx.addInitScript(() => { document.cookie = 'cantia_cookie_consent=refused; path=/; max-age=31536000'; });
  return ctx;
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class Recorder {
  constructor(page, dir) {
    this.page = page;
    this.dir = dir;
    this.steps = [];
    this.camera = [];
    this.pos = { x: 720, y: 450 };
  }

  async start() {
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
    this.video = path.join(this.dir, 'screen.mkv');
    this.ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'x11grab', '-draw_mouse', '0', '-framerate', '30', '-video_size', `${VIEW.width * SCALE}x${VIEW.height * SCALE}`, '-i', process.env.DISPLAY,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '12', '-pix_fmt', 'yuv420p', this.video], { stdio: ['pipe', 'ignore', 'inherit'] });
    this.t0 = Date.now() / 1000 + 0.15; // ffmpeg's first frame, about
    await sleep(1200);
    await this.mark('__start');
  }

  now() { return Date.now() / 1000; }

  async mark(kind, data = {}) { this.steps.push({ kind, t: this.now(), ...data }); }

  // A new step of the tutorial: its caption shows from now on.
  async step(t, d) { await this.mark('step', { text: t, detail: d || '' }); await sleep(900); }

  // Where the reel's crop looks (defaults to the cursor).
  look(x) { this.camera.push({ t: this.now(), x }); }

  async moveTo(x, y, ms) {
    const from = { ...this.pos };
    const dist = Math.hypot(x - from.x, y - from.y);
    const dur = ms ?? Math.min(1100, 380 + dist * 0.55);
    const steps = Math.max(8, Math.round(dur / 16));
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps);
      const px = from.x + (x - from.x) * k;
      const py = from.y + (y - from.y) * k;
      await this.page.mouse.move(px, py);
      this.look(px);
      await sleep(dur / steps);
    }
    this.pos = { x, y };
  }

  async box(target) {
    const loc = typeof target === 'string' ? this.page.getByText(target, { exact: true }).first() : target;
    await loc.waitFor({ state: 'visible', timeout: 20000 });
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    return { loc, b };
  }

  async hover(target, pause = 500) {
    const { b } = await this.box(target);
    await this.moveTo(b.x + Math.min(b.width / 2, 60 + b.width * 0.3), b.y + b.height / 2);
    await sleep(pause);
  }

  async click(target, pause = 900) {
    const { b } = await this.box(target);
    await this.moveTo(b.x + Math.min(b.width / 2, 60 + b.width * 0.3), b.y + b.height / 2);
    await sleep(180);
    await this.page.mouse.down();
    await sleep(90);
    await this.page.mouse.up();
    await sleep(pause);
  }

  async type(target, text, { delay = 55, pause = 500 } = {}) {
    await this.click(target, 250);
    for (const ch of text) {
      await this.page.keyboard.type(ch);
      await sleep(delay + Math.random() * delay * 0.6);
    }
    await sleep(pause);
  }

  // Clicks a button that opens a file picker and gives it a file.
  async upload(target, file, pause = 1800) {
    const chooser = this.page.waitForEvent('filechooser', { timeout: 15000 });
    await this.click(target, 200);
    await (await chooser).setFiles(file);
    await sleep(pause);
  }

  async press(key, pause = 600) { await this.page.keyboard.press(key); await sleep(pause); }

  async scroll(dy, ms = 900) {
    const steps = 30;
    for (let i = 0; i < steps; i++) { await this.page.mouse.wheel(0, dy / steps); await sleep(ms / steps); }
    await sleep(300);
  }

  async wait(ms) { await sleep(ms); }

  async stop() {
    await sleep(600);
    await this.mark('__end');
    await sleep(400);
    this.ff.stdin.write('q');
    await new Promise((r) => this.ff.on('close', r));
    const meta = { view: VIEW, scale: SCALE, t0: this.t0, video: this.video, steps: this.steps, camera: this.camera };
    fs.writeFileSync(path.join(this.dir, 'meta.json'), JSON.stringify(meta));
    return meta;
  }
}
