// Renders reels.html to MP4 (1080 × 1920, 30 images/s, no sound: add a
// track in Instagram). Usage: node render-reels.js [reel-id] [--preview]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
(async () => {
  const only = process.argv.slice(2).find((a) => !a.startsWith('--'));
  const preview = process.argv.includes('--preview');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'reels.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.addStyleTag({ content: 'body{background:#000} .reel{margin:0}' });
  const durations = await page.evaluate(() => window.durations);
  const outDir = path.join(__dirname, 'reels');
  fs.mkdirSync(outDir, { recursive: true });
  for (const [id, dur] of Object.entries(durations)) {
    if (only && id !== only) continue;
    await page.evaluate((id) => document.querySelectorAll('.reel').forEach((r) => (r.style.display = r.id === id ? 'block' : 'none')), id);
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'reel-'));
    const times = preview ? Array.from({ length: 14 }, (_, i) => 0.25 + (i * (dur - 0.5)) / 13) : Array.from({ length: Math.round(dur * 30) }, (_, i) => i / 30);
    for (let i = 0; i < times.length; i++) {
      await page.evaluate(([id, t]) => window.frame(id, t), [id, times[i]]);
      // a new scene may have just added its document image
      await page.waitForFunction(() => [...document.images].every((im) => im.complete));
      await page.screenshot({ path: path.join(tmp, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 94 });
    }
    if (preview) {
      for (const f of fs.readdirSync(tmp)) fs.copyFileSync(path.join(tmp, f), path.join(outDir, `preview-${id}-${f}`));
    } else {
      const out = path.join(outDir, `cantia-reel-${id.slice(2)}.mp4`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(tmp, '%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out]);
      console.log(out);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  await browser.close();
})();
