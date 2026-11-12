// Tutorial videos without voice: one YouTube video (1920×1080) and one
// Instagram reel (1080×1920) per chapter of scripts/videos/chapters.mjs,
// written to marketing/videos/{youtube,reels}/NN-slug.mp4.
//
//   node scripts/videos/make-tutorial-videos.mjs                 # everything
//   node scripts/videos/make-tutorial-videos.mjs --only 5,12     # some chapters
//   node scripts/videos/make-tutorial-videos.mjs --format reel   # one format
//   node scripts/videos/make-tutorial-videos.mjs --jobs 3        # pages in parallel
//
// Each video is an HTML page whose CSS animations are paused and moved
// frame by frame (Playwright screenshots), then put together by ffmpeg.
// Only the moving parts are rendered: a still moment is one image shown for
// its whole duration, which keeps the files small.
//
// Needs Playwright (Chromium) and ffmpeg. The screens come from
// scripts/videos/capture-screens.cjs. marketing/ is not part of any site
// build.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { CHAPTERS } from './chapters.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCREENS = path.join(ROOT, 'marketing', 'videos', 'screens');
const OUT = { youtube: path.join(ROOT, 'marketing', 'videos', 'youtube'), reel: path.join(ROOT, 'marketing', 'videos', 'reels') };
const TMP = path.join(process.env.VIDEO_TMP || os.tmpdir(), 'cantia-videos');
const FPS = 30;
const EXIT = 0.4; // fade out at the end of a slide
const OVERLAP = 0.25; // next slide starts before the previous one is gone

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const ONLY = opt('only') ? new Set(opt('only').split(',').map(Number)) : null;
const FORMATS = opt('format') ? [opt('format')] : ['youtube', 'reel'];
const JOBS = Number(opt('jobs') || 3);

const fileUrl = (p) => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pad = (n) => String(n).padStart(2, '0');

function screen(mode, name) {
  if (!name) return null;
  const p = path.join(SCREENS, `${mode}-${name}.jpg`);
  return fs.existsSync(p) ? p : null;
}
function stepScreen(step, mode) {
  const own = mode === 'desk' ? step.ds : step.ps;
  return screen(mode, own === undefined ? step.s : own);
}
// Address shown in the browser bar.
function urlOf(name) {
  const special = { home: '', emails_relances: 'emails/reglages', emails_modeles: 'emails/reglages' };
  return 'app.cantia.ch/' + (name in special ? special[name] : name.replace(/_/g, '/'));
}
function stepScreenName(step, mode) {
  const own = mode === 'desk' ? step.ds : step.ps;
  return own === undefined ? step.s : own;
}

// « Plain : accent » or « plain, accent » → [plain, accent] (accent in serif italic).
function splitTitle(title) {
  let i = title.indexOf(' : ');
  if (i > 0) return [title.slice(0, i), title.slice(i + 3)];
  i = title.lastIndexOf(', ');
  if (i > 0) return [title.slice(0, i) + ',', title.slice(i + 2)];
  return [title, ''];
}

const FONT = (f) => fileUrl(path.join(ROOT, 'public', 'fonts', f));
const LOGO = fileUrl(path.join(ROOT, 'assets', 'brand', 'logo.png'));

function baseCss(w, h) {
  return `
@font-face{font-family:'DM Sans';src:url(${FONT('dm-sans-latin.woff2')}) format('woff2');font-weight:100 1000;font-style:normal}
@font-face{font-family:'DM Sans';src:url(${FONT('dm-sans-latin-ext.woff2')}) format('woff2');font-weight:100 1000;font-style:normal;unicode-range:U+0100-024F,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'DM Serif Display';src:url(${FONT('dm-serif-display-latin.woff2')}) format('woff2');font-style:normal}
@font-face{font-family:'DM Serif Display';src:url(${FONT('dm-serif-display-latin-italic.woff2')}) format('woff2');font-style:italic}
:root{--cream:#F6F4EF;--ink:#252921;--muted:#6E7268;--terra:#A65D36;--panel:#ECE7DC;--line:#E2DCD0;--white:#FFFEFA;--ease:cubic-bezier(.2,.8,.2,1)}
*{box-sizing:border-box}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:var(--cream);color:var(--ink);font-family:'DM Sans',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.slide{position:absolute;inset:0;animation:fadeIn .45s linear both;animation-delay:var(--s)}
.slide>.in{position:absolute;inset:0;animation:fadeOut ${EXIT}s linear both;animation-delay:var(--e)}
.r{animation:rise .8s var(--ease) both;animation-delay:calc(var(--s) + var(--d,0s))}
.f{animation:fadeIn .7s linear both;animation-delay:calc(var(--s) + var(--d,0s))}
.serif{font-family:'DM Serif Display',Georgia,serif;font-style:italic;font-weight:400;color:var(--terra)}
@keyframes rise{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
@keyframes riseBig{from{opacity:0;transform:translateY(140px) scale(.97)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeOut{from{opacity:1}to{opacity:0}}
@keyframes bandIn{from{transform:translateX(100%)}to{transform:none}}
@keyframes zoom{from{transform:scale(1)}to{transform:scale(var(--z))}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
`;
}

// ---------------------------------------------------------------- YouTube

function youtube(ch) {
  const W = 1920, H = 1080;
  const slides = [];
  const [plain, accent] = splitTitle(ch.title);
  const tsize = ch.title.length <= 42 ? 100 : ch.title.length <= 62 ? 86 : 74;

  slides.push({ dur: 4.4, entry: 1.8, html: `
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
    <div class="r" style="--d:1s;position:absolute;left:140px;bottom:110px;color:var(--muted);font-size:32px;font-weight:500">Tutoriel vidéo · cantia.ch</div>` });

  ch.steps.forEach((st, i) => {
    const shot = stepScreen(st, 'desk');
    const name = stepScreenName(st, 'desk');
    const right = shot
      ? `<div style="position:absolute;left:720px;top:172px;width:1100px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(37,41,33,.16),0 0 0 1px rgba(37,41,33,.08);animation:riseBig 1s var(--ease) both;animation-delay:calc(var(--s) + .05s)">
          <div style="height:46px;background:#EFEBE3;display:flex;align-items:center;gap:9px;padding:0 18px;border-bottom:1px solid var(--line)">
            <i style="width:13px;height:13px;border-radius:50%;background:#D6CFC2"></i><i style="width:13px;height:13px;border-radius:50%;background:#D6CFC2"></i><i style="width:13px;height:13px;border-radius:50%;background:#D6CFC2"></i>
            <span style="margin-left:22px;flex:1;max-width:620px;height:28px;border-radius:14px;background:#fff;color:var(--muted);font-size:17px;line-height:28px;padding:0 16px">${esc(urlOf(name))}</span>
          </div>
          <div style="width:1100px;height:687.5px;overflow:hidden">
            <img src="${fileUrl(shot)}" style="display:block;width:1100px;height:687.5px;transform-origin:64% 26%;--z:1.12;animation:zoom 2.4s cubic-bezier(.45,0,.25,1) both;animation-delay:calc(var(--s) + 1.3s)">
          </div>
        </div>`
      : card(720, 172, 1100, 734, i + 1, st.card, 1);
    slides.push({ dur: 7.4, entry: 3.8, html: `
      <img src="${LOGO}" style="position:absolute;left:100px;top:72px;height:36px">
      <div style="position:absolute;left:720px;top:76px;width:1100px;text-align:right;color:var(--muted);font-size:24px;font-weight:500">Tutoriel ${pad(ch.n)} · ${esc(ch.area)}</div>
      <div style="position:absolute;left:100px;top:0;bottom:0;width:560px;display:flex;flex-direction:column;justify-content:center;gap:26px">
        <div class="r" style="--d:.1s;color:var(--terra);font-weight:700;font-size:22px;letter-spacing:4px">ÉTAPE ${i + 1} SUR ${ch.steps.length}</div>
        <div class="r" style="--d:.2s;font-size:58px;line-height:1.1;font-weight:700;letter-spacing:-.02em;text-wrap:balance">${esc(st.t)}</div>
        ${st.d ? `<div class="r" style="--d:.38s;font-size:30px;line-height:1.4;color:var(--muted);text-wrap:pretty">${esc(st.d)}</div>` : ''}
        <div class="r" style="--d:.5s;display:flex;gap:10px;margin-top:8px">${ch.steps.map((_, k) => `<i style="height:6px;border-radius:3px;width:${k === i ? 56 : 18}px;background:${k === i ? 'var(--terra)' : '#D6CFC2'}"></i>`).join('')}</div>
      </div>
      ${right}` });
  });

  slides.push({ dur: 5.6, entry: 1.6, html: `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px">
      <img class="r" src="${LOGO}" style="--d:.05s;height:62px;margin-bottom:34px">
      <div class="r" style="--d:.2s;font-size:96px;font-weight:700;letter-spacing:-.02em;line-height:1.05">Essayez Cantia <span class="serif" style="letter-spacing:0">pendant 14 jours</span></div>
      <div class="r" style="--d:.35s;font-size:36px;color:var(--muted)">Sans engagement, résiliable en ligne.</div>
      <div class="r" style="--d:.5s;margin-top:22px;background:var(--terra);color:var(--white);font-size:46px;font-weight:700;padding:20px 54px;border-radius:999px">cantia.ch</div>
      <div class="r" style="--d:.7s;margin-top:40px;font-size:28px;color:var(--muted)">Tous les tutoriels : cantia.ch/aide/videos</div>
    </div>` });

  return page(W, H, slides);
}

// A panel for a step the demo cannot show: its number and where it is in Cantia.
function card(x, y, w, h, n, c, scale) {
  const s = (v) => Math.round(v * scale);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${s(28)}px;background:var(--panel);display:flex;flex-direction:column;justify-content:center;padding:0 ${s(90)}px;animation:riseBig 1s var(--ease) both;animation-delay:calc(var(--s) + .05s)">
    <div class="serif r" style="--d:.35s;font-size:${s(240)}px;line-height:.9">${n}</div>
    <div class="r" style="--d:.5s;font-family:'DM Serif Display',Georgia,serif;font-size:${s(84)}px;line-height:1.05;margin-top:${s(26)}px">${esc(c?.label || '')}</div>
    <div class="r" style="--d:.62s;font-size:${s(30)}px;color:var(--muted);margin-top:${s(20)}px">${esc(c?.path || '')}</div>
  </div>`;
}

// ---------------------------------------------------------------- Reel

function reel(ch) {
  const W = 1080, H = 1920;
  const slides = [];
  const [plain, accent] = splitTitle(ch.title);
  const tsize = ch.title.length <= 42 ? 100 : ch.title.length <= 62 ? 88 : 78;

  slides.push({ dur: 3.4, entry: 1.6, html: `
    <img class="r" src="${LOGO}" style="--d:.05s;position:absolute;left:80px;top:170px;height:44px">
    <div class="r serif" style="--d:.2s;position:absolute;right:70px;top:230px;font-size:340px;line-height:1">${pad(ch.n)}</div>
    <div class="r" style="--d:.3s;position:absolute;left:80px;top:690px;color:var(--terra);font-weight:700;font-size:32px;letter-spacing:5px">TUTORIEL · ${esc(ch.area.toUpperCase())}</div>
    <div style="position:absolute;left:80px;top:744px;width:96px;height:6px;background:var(--terra);transform-origin:left;animation:grow .7s var(--ease) both;animation-delay:calc(var(--s) + .4s)"></div>
    <div style="position:absolute;left:80px;top:800px;width:920px;font-size:${tsize}px;line-height:1.08;letter-spacing:-.02em;font-weight:700;text-wrap:balance">
      <span class="r" style="--d:.4s">${esc(plain)}</span>${accent ? ` <span class="r serif" style="--d:.55s;font-size:1.04em;letter-spacing:0">${esc(accent)}</span>` : ''}
    </div>
    <div class="r" style="--d:.8s;position:absolute;left:80px;bottom:420px;font-size:38px;color:var(--muted)">Le tutoriel en ${ch.steps.length} étapes.</div>` });

  ch.steps.forEach((st, i) => {
    const shot = stepScreen(st, 'phone');
    const media = shot
      ? `<div style="position:absolute;left:220px;top:660px;width:640px;padding:14px;border-radius:78px;background:#20231C;box-shadow:0 40px 90px rgba(37,41,33,.25);animation:riseBig 1s var(--ease) both;animation-delay:calc(var(--s) + .05s)">
          <div style="border-radius:64px;overflow:hidden;background:#fff"><img src="${fileUrl(shot)}" style="display:block;width:612px"></div>
        </div>`
      : card(80, 680, 920, 900, i + 1, st.card, 1.12);
    slides.push({ dur: 4.8, entry: 1.4, html: `
      <img src="${LOGO}" style="position:absolute;left:80px;top:160px;height:36px">
      <div style="position:absolute;right:80px;top:162px;color:var(--muted);font-size:28px;font-weight:500">${pad(ch.n)} · ${esc(ch.area)}</div>
      <div style="position:absolute;left:80px;top:270px;width:920px;height:360px;display:flex;flex-direction:column;justify-content:flex-end;gap:20px">
        <div class="r" style="--d:.1s;display:flex;gap:10px">${ch.steps.map((_, k) => `<i style="height:8px;border-radius:4px;width:${k === i ? 70 : 22}px;background:${k === i ? 'var(--terra)' : '#D6CFC2'}"></i>`).join('')}</div>
        <div class="r" style="--d:.2s;font-size:68px;line-height:1.08;font-weight:700;letter-spacing:-.02em;text-wrap:balance">${esc(st.t)}</div>
      </div>
      ${media}` });
  });

  slides.push({ dur: 3.8, entry: 1.5, html: `
    <div style="position:absolute;left:80px;right:80px;top:0;bottom:240px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:30px">
      <img class="r" src="${LOGO}" style="--d:.05s;height:50px;margin-bottom:40px">
      <div class="r" style="--d:.2s;font-size:104px;font-weight:700;letter-spacing:-.02em;line-height:1.04">Essayez Cantia <span class="serif" style="letter-spacing:0">pendant 14 jours</span></div>
      <div class="r" style="--d:.35s;font-size:40px;color:var(--muted)">Sans engagement, résiliable en ligne.</div>
      <div class="r" style="--d:.5s;margin-top:30px;background:var(--terra);color:var(--white);font-size:52px;font-weight:700;padding:22px 60px;border-radius:999px">cantia.ch</div>
    </div>` });

  return page(W, H, slides);
}

// ---------------------------------------------------------------- Timeline

function page(W, H, slides) {
  let t = 0;
  const windows = [];
  const body = slides
    .map((s, i) => {
      const start = t;
      const end = start + s.dur;
      windows.push([start, start + s.entry], [end - EXIT, end]);
      t = i === slides.length - 1 ? end : end - OVERLAP;
      return `<div class="slide" style="--s:${start.toFixed(3)}s;--e:${(end - EXIT).toFixed(3)}s"><div class="in">${s.html}</div></div>`;
    })
    .join('\n');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${baseCss(W, H)}</style></head><body>${body}
<script>window.__seek=(ms)=>{for(const a of document.getAnimations()){a.pause();a.currentTime=ms;}};</script></body></html>`;
  return { W, H, html, duration: t, windows };
}

// ---------------------------------------------------------------- Render

function run(cmd, argv) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${code}: ${err.slice(-600)}`))));
  });
}

async function render(browser, ch, format) {
  const v = format === 'youtube' ? youtube(ch) : reel(ch);
  const id = `${pad(ch.n)}-${ch.slug}`;
  const dir = path.join(TMP, `${format}-${id}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const htmlPath = path.join(dir, 'index.html');
  fs.writeFileSync(htmlPath, v.html);

  const page = await browser.newPage({ viewport: { width: v.W, height: v.H }, deviceScaleFactor: 1 });
  await page.goto(fileUrl(htmlPath), { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });

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
    } else {
      list[list.length - 1].frames++;
    }
  }
  await page.close();

  const concat = list.map((e) => `file '${e.file}'\nduration ${(e.frames / FPS).toFixed(5)}`).join('\n') + `\nfile '${last}'\n`;
  fs.writeFileSync(path.join(dir, 'list.txt'), concat);
  fs.mkdirSync(OUT[format], { recursive: true });
  const out = path.join(OUT[format], `${id}.mp4`);
  await run('ffmpeg', [
    '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf', `fps=${FPS},format=yuv420p`, '-t', v.duration.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '64k', '-shortest', '-movflags', '+faststart', out,
  ]);
  fs.rmSync(dir, { recursive: true, force: true });
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`${format} ${id}  ${v.duration.toFixed(1)} s  ${n} images  ${mb} MB`);
}

const jobs = [];
for (const ch of CHAPTERS) if (!ONLY || ONLY.has(ch.n)) for (const f of FORMATS) jobs.push([ch, f]);

const browser = await chromium.launch();
let failed = 0;
await Promise.all(
  Array.from({ length: Math.min(JOBS, jobs.length) }, async () => {
    while (jobs.length) {
      const [ch, f] = jobs.shift();
      try {
        await render(browser, ch, f);
      } catch (e) {
        failed++;
        console.error(`FAILED ${f} ${ch.n}: ${e.message}`);
      }
    }
  }),
);
await browser.close();
process.exit(failed ? 1 : 0);
