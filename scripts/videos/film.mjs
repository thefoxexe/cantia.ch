// Films tutorials in the real app and puts them together.
//
//   node scripts/videos/film.mjs --only 1 --part a        # film one part
//   node scripts/videos/film.mjs --only 1 --compose       # assemble (all parts filmed)
//
// Needs the app running (BASE, default http://localhost:8099) and the
// tutorial account's login in a JSON file (VIDEO_LOGIN, never committed):
// {"email": "...", "password": "..."}. Recordings go to REC_DIR.
import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { CHAPTERS } from './chapters.mjs';
import { FLOWS } from './flows.mjs';
import { Recorder, openWindow } from './recorder.mjs';
import { spawn } from 'child_process';
import { compose } from './compose.mjs';
import { ROOT, pad } from './slides.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const BASE = process.env.BASE || 'http://localhost:8099';
const REC_DIR = process.env.REC_DIR || path.join(os.tmpdir(), 'cantia-rec');
const ONLY = (opt('only') || '').split(',').filter(Boolean).map(Number);
const PART = opt('part');
const DRY = args.includes('--dry');

async function login(page, cred) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForTimeout(3000);
  if (!page.url().includes('/login')) return; // still logged in
  await page.getByPlaceholder('vous@entreprise.ch').fill(cred.email);
  await page.locator('input[type=password]').first().fill(cred.password);
  await page.locator('input[type=password]').first().press('Enter');
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 60000 });
  await page.waitForTimeout(1500);
}

// A virtual screen for the window (2880×1800), unless one is given.
let xvfb = null;
if (!process.env.DISPLAY) {
  const display = `:${90 + Math.floor(Math.random() * 9)}`;
  xvfb = spawn('Xvfb', [display, '-screen', '0', '2880x1800x24', '-nolisten', 'tcp'], { stdio: 'ignore' });
  process.env.DISPLAY = display;
  await new Promise((r) => setTimeout(r, 1500));
}
const PROFILE = path.join(REC_DIR, 'profile');
const browser = await chromium.launch();
let win = null;
try {
  for (const n of ONLY) {
    const ch = CHAPTERS.find((c) => c.n === n);
    const flow = FLOWS[n];
    if (!ch || !flow) throw new Error(`no flow for ${n}`);
    const recs = flow.parts.map((p) => path.join(REC_DIR, `${pad(n)}-${p.name}`));
    if (args.includes('--compose')) {
      const id = `${pad(n)}-${ch.slug}`;
      const r = await compose(browser, ch, recs, path.join(ROOT, 'marketing', 'videos', 'youtube', `${id}.mp4`), path.join(ROOT, 'marketing', 'videos', 'reels', `${id}.mp4`), path.join(REC_DIR, 'tmp'));
      console.log(`composed ${id}: ${r.duration.toFixed(1)} s, ${r.steps} steps`);
      continue;
    }
    const cred = JSON.parse(fs.readFileSync(process.env.VIDEO_LOGIN, 'utf8'));
    if (!win) win = await openWindow(chromium, PROFILE);
    const page = win.pages()[0] || (await win.newPage());
    for (const [i, part] of flow.parts.entries()) {
      if (PART && part.name !== PART) continue;
      await login(page, cred);
      await page.goto(BASE + part.start, { waitUntil: 'networkidle', timeout: 180000 });
      await page.waitForTimeout(2000);
      if (part.prepare) await part.prepare(page);
      const h = new Recorder(page, recs[i]);
      await h.start();
      try {
        await part.run(h, page, { dry: DRY, base: BASE });
      } catch (e) {
        await page.screenshot({ path: path.join(REC_DIR, `${pad(n)}-${part.name}-error.png`) });
        throw e;
      } finally {
        const meta = await h.stop();
        console.log(`filmed ${pad(n)}-${part.name}: ${meta.steps.filter((s) => s.kind === 'step').length} steps`);
      }
    }
  }
} finally {
  if (win) await win.close();
  await browser.close();
  if (xvfb) xvfb.kill();
}
