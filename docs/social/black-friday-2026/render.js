// Renders video.html to MP4 (30 images/s): v-reel 1080 × 1920 (Reel, Story,
// YouTube Short, TikTok) and v-feed 1080 × 1350 (LinkedIn and Instagram feed),
// with the sound of sfx.py (128 BPM pulse, hits, ticks, alarm).
// Then statics.html to PNG (stories, posts, LinkedIn).
// Usage: NODE_PATH=$(npm root -g) node render.js [video|statics|all] [--preview]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

(async () => {
  const what = process.argv[2] || 'all';
  const preview = process.argv.includes('--preview');
  const browser = await chromium.launch();

  if (what === 'video' || what === 'all') {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(__dirname, 'video.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'body{background:#000} .film{margin:0}' });
    const durations = await page.evaluate(() => window.durations);
    const sfx = await page.evaluate(() => window.sfx);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    const names = { 'v-reel': 'cantia-black-friday-9x16.mp4', 'v-feed': 'cantia-black-friday-4x5.mp4' };
    for (const [id, dur] of Object.entries(durations)) {
      await page.evaluate((id) => document.querySelectorAll('.film').forEach((r) => (r.style.display = r.id === id ? 'block' : 'none')), id);
      const h = await page.evaluate((id) => +document.getElementById(id).dataset.h, id);
      await page.setViewportSize({ width: 1080, height: h });
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bf-'));
      const times = preview ? [0.5, 1.8, 2.7, 3.6, 4.3, 5.35, 5.9, 6.9, 8.9, 11.2, 12.9, 14.6, 16.2, 18.6] : Array.from({ length: Math.round(dur * 30) }, (_, i) => i / 30);
      for (let i = 0; i < times.length; i++) {
        await page.evaluate(([id, t]) => window.frame(id, t), [id, times[i]]);
        await page.screenshot({ path: path.join(tmp, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 93 });
      }
      const outDir = path.join(__dirname, 'videos');
      if (preview) {
        for (const f of fs.readdirSync(tmp)) fs.copyFileSync(path.join(tmp, f), path.join(outDir, `preview-${id}-${f}`));
      } else {
        const wav = path.join(tmp, 'slides.wav');
        execFileSync('python3', [path.join(__dirname, 'sfx.py'), JSON.stringify(sfx), String(dur), wav]);
        const out = path.join(outDir, names[id]);
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(tmp, '%04d.jpg'), '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out]);
        console.log(out);
      }
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    await page.close();
  }

  if (what === 'statics' || what === 'all') {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(__dirname, 'statics.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    for (const el of await page.$$('[data-out]')) {
      const out = await el.getAttribute('data-out');
      await el.screenshot({ path: path.join(__dirname, out) });
      console.log(out);
    }
    await page.close();
  }
  await browser.close();
})();
