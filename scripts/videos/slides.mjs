// Animated title cards of the tutorial videos (intro and closing card of the
// YouTube video, hook and closing card of the reel), and the caption panels
// laid over the recording. Drawn as HTML in the site's art direction, their
// CSS animations paused and moved frame by frame, then encoded by ffmpeg.
// Only the moving parts are rendered: a still moment is one image shown for
// its whole duration.
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FPS = 30;
const EXIT = 0.4; // fade out at the end of a card
const OVERLAP = 0.25; // next card starts before the previous one is gone

export const fileUrl = (p) => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const pad = (n) => String(n).padStart(2, '0');

const FONT = (f) => fileUrl(path.join(ROOT, 'public', 'fonts', f));
export const LOGO = fileUrl(path.join(ROOT, 'assets', 'brand', 'logo.png'));

// « Plain : accent » or « plain, accent » → [plain, accent] (accent in serif italic).
export function splitTitle(title) {
  let i = title.indexOf(' : ');
  if (i > 0) return [title.slice(0, i), title.slice(i + 3)];
  i = title.lastIndexOf(', ');
  if (i > 0) return [title.slice(0, i) + ',', title.slice(i + 2)];
  return [title, ''];
}

export function baseCss(w, h, transparent = false) {
  return `
@font-face{font-family:'DM Sans';src:url(${FONT('dm-sans-latin.woff2')}) format('woff2');font-weight:100 1000;font-style:normal}
@font-face{font-family:'DM Sans';src:url(${FONT('dm-sans-latin-ext.woff2')}) format('woff2');font-weight:100 1000;font-style:normal;unicode-range:U+0100-024F,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'DM Serif Display';src:url(${FONT('dm-serif-display-latin.woff2')}) format('woff2');font-style:normal}
@font-face{font-family:'DM Serif Display';src:url(${FONT('dm-serif-display-latin-italic.woff2')}) format('woff2');font-style:italic}
:root{--cream:#F6F4EF;--ink:#252921;--muted:#6E7268;--terra:#A65D36;--panel:#ECE7DC;--line:#E2DCD0;--white:#FFFEFA;--ease:cubic-bezier(.2,.8,.2,1)}
*{box-sizing:border-box}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${transparent ? 'transparent' : 'var(--cream)'};color:var(--ink);font-family:'DM Sans',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.slide{position:absolute;inset:0;animation:fadeIn .45s linear both;animation-delay:var(--s)}
.slide>.in{position:absolute;inset:0;animation:fadeOut ${EXIT}s linear both;animation-delay:var(--e)}
.r{animation:rise .8s var(--ease) both;animation-delay:calc(var(--s) + var(--d,0s))}
.serif{font-family:'DM Serif Display',Georgia,serif;font-style:italic;font-weight:400;color:var(--terra)}
@keyframes rise{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeOut{from{opacity:1}to{opacity:0}}
@keyframes bandIn{from{transform:translateX(100%)}to{transform:none}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
`;
}

// ---------------------------------------------------------------- Cards

export function youtubeIntro(ch) {
  const [plain, accent] = splitTitle(ch.title);
  const tsize = ch.title.length <= 42 ? 100 : ch.title.length <= 62 ? 86 : 74;
  return { dur: 4.4, entry: 1.8, html: `
    <img class="r" src="${LOGO}" style="--d:.1s;position:absolute;left:140px;top:104px;height:58px">
    <div style="position:absolute;left:1420px;top:0;right:0;bottom:0;background:var(--terra);animation:bandIn .9s var(--ease) both;animation-delay:var(--s);color:var(--white);text-align:center">
      <div class="r" style="--d:.5s;margin-top:262px;font-weight:700;font-size:28px;letter-spacing:6px">TUTORIEL</div>
      <div class="r serif" style="--d:.6s;color:var(--white);font-size:380px;line-height:1;margin-top:12px">${pad(ch.n)}</div>
      <div class="r" style="--d:.8s;position:absolute;left:0;right:0;bottom:104px;font-size:30px;font-weight:500;line-height:40px;opacity:.85">Le logiciel suisse<br>des artisans et PME</div>
    </div>
    <div class="r" style="--d:.3s;position:absolute;left:140px;top:350px;color:var(--terra);font-weight:700;font-size:30px;letter-spacing:5px">${esc(ch.area.toUpperCase())}</div>
    <div style="position:absolute;left:140px;top:396px;width:88px;height:5px;background:var(--terra);transform-origin:left;animation:grow .7s var(--ease) both;animation-delay:calc(var(--s) + .4s)"></div>
    <div style="position:absolute;left:140px;top:450px;width:1180px;font-size:${tsize}px;line-height:1.1;letter-spacing:-.02em;font-weight:700;text-wrap:balance">
      <span class="r" style="--d:.45s;display:inline">${esc(plain)}</span>${accent ? ` <span class="r serif" style="--d:.6s;display:inline;font-size:1.04em;letter-spacing:0">${esc(accent)}</span>` : ''}
    </div>
    <div class="r" style="--d:1s;position:absolute;left:140px;bottom:110px;color:var(--muted);font-size:32px;font-weight:500">Tutoriel vidéo · cantia.ch</div>` };
}

export function youtubeOutro() {
  return { dur: 5.6, entry: 1.6, html: `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px">
      <img class="r" src="${LOGO}" style="--d:.05s;height:62px;margin-bottom:34px">
      <div class="r" style="--d:.2s;font-size:96px;font-weight:700;letter-spacing:-.02em;line-height:1.05">Essayez Cantia <span class="serif" style="letter-spacing:0">pendant 14 jours</span></div>
      <div class="r" style="--d:.35s;font-size:36px;color:var(--muted)">Sans engagement, résiliable en ligne.</div>
      <div class="r" style="--d:.5s;margin-top:22px;background:var(--terra);color:var(--white);font-size:46px;font-weight:700;padding:20px 54px;border-radius:999px">cantia.ch</div>
      <div class="r" style="--d:.7s;margin-top:40px;font-size:28px;color:var(--muted)">Tous les tutoriels : cantia.ch/aide/videos</div>
    </div>` };
}

export function reelHook(ch) {
  const [plain, accent] = splitTitle(ch.title);
  const tsize = ch.title.length <= 42 ? 100 : ch.title.length <= 62 ? 88 : 78;
  return { dur: 3.2, entry: 1.6, html: `
    <img class="r" src="${LOGO}" style="--d:.05s;position:absolute;left:80px;top:170px;height:44px">
    <div class="r serif" style="--d:.2s;position:absolute;right:70px;top:230px;font-size:340px;line-height:1">${pad(ch.n)}</div>
    <div class="r" style="--d:.3s;position:absolute;left:80px;top:690px;color:var(--terra);font-weight:700;font-size:32px;letter-spacing:5px">TUTORIEL · ${esc(ch.area.toUpperCase())}</div>
    <div style="position:absolute;left:80px;top:744px;width:96px;height:6px;background:var(--terra);transform-origin:left;animation:grow .7s var(--ease) both;animation-delay:calc(var(--s) + .4s)"></div>
    <div style="position:absolute;left:80px;top:800px;width:920px;font-size:${tsize}px;line-height:1.08;letter-spacing:-.02em;font-weight:700;text-wrap:balance">
      <span class="r" style="--d:.4s">${esc(plain)}</span>${accent ? ` <span class="r serif" style="--d:.55s;font-size:1.04em;letter-spacing:0">${esc(accent)}</span>` : ''}
    </div>` };
}

export function reelOutro() {
  return { dur: 3.6, entry: 1.5, html: `
    <div style="position:absolute;left:80px;right:80px;top:0;bottom:240px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:30px">
      <img class="r" src="${LOGO}" style="--d:.05s;height:50px;margin-bottom:40px">
      <div class="r" style="--d:.2s;font-size:104px;font-weight:700;letter-spacing:-.02em;line-height:1.04">Essayez Cantia <span class="serif" style="letter-spacing:0">pendant 14 jours</span></div>
      <div class="r" style="--d:.35s;font-size:40px;color:var(--muted)">Sans engagement, résiliable en ligne.</div>
      <div class="r" style="--d:.5s;margin-top:30px;background:var(--terra);color:var(--white);font-size:52px;font-weight:700;padding:22px 60px;border-radius:999px">cantia.ch</div>
    </div>` };
}

// ---------------------------------------------------------------- Render

export function run(cmd, argv) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${code}: ${err.slice(-800)}`))));
  });
}

function timeline(W, H, cards) {
  let t = 0;
  const windows = [];
  const body = cards
    .map((s, i) => {
      const start = t;
      const end = start + s.dur;
      windows.push([start, start + s.entry], [end - EXIT, end]);
      t = i === cards.length - 1 ? end : end - OVERLAP;
      return `<div class="slide" style="--s:${start.toFixed(3)}s;--e:${(end - EXIT).toFixed(3)}s"><div class="in">${s.html}</div></div>`;
    })
    .join('\n');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${baseCss(W, H)}</style></head><body>${body}
<script>window.__seek=(ms)=>{for(const a of document.getAnimations()){a.pause();a.currentTime=ms;}};</script></body></html>`;
  return { html, duration: t, windows };
}

async function openHtml(browser, dir, html, W, H) {
  fs.mkdirSync(dir, { recursive: true });
  const htmlPath = path.join(dir, `p${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(htmlPath, html);
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(fileUrl(htmlPath), { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });
  return page;
}

// Cards → MP4 (H.264, 30 fps, silent stereo track so every clip concatenates).
export async function renderCards(browser, cards, W, H, out, tmp) {
  const v = timeline(W, H, cards);
  const dir = path.join(tmp, `cards-${path.basename(out, '.mp4')}`);
  fs.rmSync(dir, { recursive: true, force: true });
  const page = await openHtml(browser, dir, v.html, W, H);
  const total = Math.round(v.duration * FPS);
  const moving = (t) => v.windows.some(([a, b]) => t >= a - 1e-6 && t <= b + 1 / FPS);
  const list = [];
  let last = null;
  let n = 0;
  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    if (last === null || moving(t)) {
      await page.evaluate((ms) => window.__seek(ms), t * 1000);
      const file = path.join(dir, `f${String(n++).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 94 });
      list.push({ file, frames: 1 });
      last = file;
    } else list[list.length - 1].frames++;
  }
  await page.close();
  fs.writeFileSync(path.join(dir, 'list.txt'), list.map((e) => `file '${e.file}'\nduration ${(e.frames / FPS).toFixed(5)}`).join('\n') + `\nfile '${last}'\n`);
  await run('ffmpeg', [
    '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf', `fps=${FPS},format=yuv420p`, '-t', v.duration.toFixed(3),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-b:a', '64k', '-shortest', out,
  ]);
  fs.rmSync(dir, { recursive: true, force: true });
  return v.duration;
}

// A still HTML (transparent or not) → PNG.
export async function renderPng(browser, html, W, H, out, tmp, transparent = true) {
  const page = await openHtml(browser, tmp, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${baseCss(W, H, transparent)}</style></head><body>${html}</body></html>`, W, H);
  await page.screenshot({ path: out, omitBackground: transparent });
  await page.close();
}
