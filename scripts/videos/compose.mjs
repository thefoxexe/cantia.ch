// Puts a filmed tutorial together (recordings of scripts/videos/recorder.mjs):
//   YouTube 1920×1080 — the app at 1440×900, the step captions on the right,
//                       between the intro card and the closing card;
//   reel   1080×1920 — the app cropped around the cursor (desktop screen,
//                       ×1.64), the caption above it, sped up.
import fs from 'fs';
import path from 'path';
import { FPS, LOGO, esc, pad, renderCards, renderPng, run, youtubeIntro, youtubeOutro, reelHook, reelOutro } from './slides.mjs';

const YT = { W: 1920, H: 1080, app: { x: 60, y: 90, w: 1440, h: 900 }, panel: 1548 };
const RL = { W: 1080, H: 1920, top: 440, cropW: 1314 }; // crop of the 2880×1800 frames
const REEL_SPEED = 1.5;

// One recording (or several, played one after the other) → the parts of the
// screen videos to keep, and step and cursor times on the joined timeline.
function timelineOf(recDirs) {
  const parts = [];
  const steps = [];
  const camera = [];
  let offset = 0;
  for (const dir of recDirs) {
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
    const start = meta.steps.find((s) => s.kind === '__start').t;
    const end = meta.steps.find((s) => s.kind === '__end').t;
    parts.push({ video: meta.video, from: start - meta.t0, to: end - meta.t0 });
    for (const s of meta.steps) if (s.kind === 'step') steps.push({ ...s, t: offset + Math.max(0, s.t - start) });
    for (const c of meta.camera) camera.push({ t: offset + Math.max(0, c.t - start), x: c.x * meta.scale });
    offset += end - start;
  }
  return { parts, steps, camera, duration: offset };
}

// ffmpeg inputs and the filter that joins the kept parts into [screen].
function screenInputs(tl, firstIndex) {
  const inputs = tl.parts.flatMap((p) => ['-i', p.video]);
  const chains = tl.parts.map((p, i) => `[${firstIndex + i}:v]trim=start=${p.from.toFixed(3)}:end=${p.to.toFixed(3)},setpts=PTS-STARTPTS,fps=${FPS}[p${i}]`);
  const join = tl.parts.length > 1 ? `${tl.parts.map((_, i) => `[p${i}]`).join('')}concat=n=${tl.parts.length}:v=1:a=0[screen]` : '[p0]null[screen]';
  return { inputs, filter: `${chains.join(';')};${join}` };
}

function stepDots(n, i, big) {
  return Array.from({ length: n }, (_, k) => `<i style="display:inline-block;height:${big ? 8 : 6}px;border-radius:4px;margin-right:9px;width:${k === i ? (big ? 64 : 48) : big ? 20 : 14}px;background:${k === i ? 'var(--terra)' : '#D6CFC2'}"></i>`).join('');
}

// Reel crop: follows the cursor, smoothly and never faster than a set speed.
function cropCommands(camera, duration) {
  const half = RL.cropW / 2;
  const maxX = 2880 - RL.cropW;
  let k = 0;
  let target = camera.length ? camera[0].x : 1440;
  let x = target;
  const lines = [];
  for (let t = 0; t <= duration + 0.001; t += 1 / FPS) {
    while (k < camera.length && camera[k].t <= t) target = camera[k++].x;
    const dx = target - x;
    // Dead zone: small moves of the cursor do not move the picture.
    if (Math.abs(dx) > RL.cropW * 0.28) x += Math.sign(dx) * Math.min(Math.abs(dx) - RL.cropW * 0.28, 900 / FPS) * 0.35;
    const cx = Math.min(maxX, Math.max(0, x - half));
    lines.push(`${t.toFixed(3)} crop x ${Math.round(cx)};`);
  }
  return { lines, first: Math.min(maxX, Math.max(0, (camera[0]?.x ?? 1440) - half)) };
}

export async function compose(browser, ch, recDirs, outYoutube, outReel, tmp) {
  const work = path.join(tmp, `compose-${pad(ch.n)}`);
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  const tl = timelineOf(recDirs);
  const n = tl.steps.length;
  const spans = tl.steps.map((s, i) => [s.t, i + 1 < n ? tl.steps[i + 1].t : tl.duration]);

  // ---- YouTube
  const A = YT.app;
  await renderPng(browser, `
    <div style="position:absolute;left:${A.x}px;top:${A.y}px;width:${A.w}px;height:${A.h}px;border-radius:14px;box-shadow:0 30px 80px rgba(37,41,33,.16),0 0 0 1px rgba(37,41,33,.10);background:#fff"></div>
    <img src="${LOGO}" style="position:absolute;left:${YT.panel}px;top:96px;height:32px">
    <div style="position:absolute;left:${YT.panel}px;top:150px;width:320px;color:var(--muted);font-size:22px;font-weight:500;line-height:1.35">Tutoriel ${pad(ch.n)} · ${esc(ch.area)}</div>
    <div style="position:absolute;left:${YT.panel}px;bottom:96px;color:var(--muted);font-size:24px;font-weight:600">cantia.ch</div>`, YT.W, YT.H, path.join(work, 'yt-bg.png'), work, false);
  await renderPng(browser, `<div style="position:absolute;left:${A.x}px;top:${A.y}px;width:${A.w}px;height:${A.h}px;border-radius:14px;box-shadow:0 0 0 18px var(--cream)"></div>`, YT.W, YT.H, path.join(work, 'yt-mask.png'), work);
  for (let i = 0; i < n; i++) {
    const s = tl.steps[i];
    await renderPng(browser, `
      <div style="position:absolute;left:${YT.panel}px;top:0;bottom:0;width:330px;display:flex;flex-direction:column;justify-content:center;gap:22px">
        <div style="color:var(--terra);font-weight:700;font-size:20px;letter-spacing:4px">ÉTAPE ${i + 1} SUR ${n}</div>
        <div style="font-size:44px;line-height:1.12;font-weight:700;letter-spacing:-.02em;text-wrap:balance">${esc(s.text)}</div>
        ${s.detail ? `<div style="font-size:26px;line-height:1.4;color:var(--muted);text-wrap:pretty">${esc(s.detail)}</div>` : ''}
        <div style="margin-top:6px">${stepDots(n, i)}</div>
      </div>`, YT.W, YT.H, path.join(work, `yt-cap${i}.png`), work);
  }
  const ytMain = path.join(work, 'yt-main.mp4');
  {
    const inputs = ['-loop', '1', '-i', path.join(work, 'yt-bg.png'), '-loop', '1', '-i', path.join(work, 'yt-mask.png')];
    for (let i = 0; i < n; i++) inputs.push('-loop', '1', '-i', path.join(work, `yt-cap${i}.png`));
    const sc = screenInputs(tl, 2 + n);
    inputs.push(...sc.inputs);
    let g = `${sc.filter};[screen]scale=${A.w}:${A.h}:flags=lanczos,setsar=1[app];[0:v][app]overlay=${A.x}:${A.y}:shortest=1[v0];[v0][1:v]overlay=0:0[v1]`;
    let last = 'v1';
    spans.forEach(([a, b], i) => {
      const fadeOut = Math.max(a + 0.4, b - 0.3);
      g += `;[${1 + i}:v]format=rgba,fade=in:st=${a.toFixed(3)}:d=0.35:alpha=1,fade=out:st=${fadeOut.toFixed(3)}:d=0.3:alpha=1[c${i}];[${last}][c${i}]overlay=0:0:enable='between(t,${a.toFixed(3)},${(b + 0.05).toFixed(3)})'[w${i}]`;
      last = `w${i}`;
    });
    await run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', g, '-map', `[${last}]`, '-t', tl.duration.toFixed(3), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', ytMain]);
  }
  const ytIntro = path.join(work, 'yt-intro.mp4');
  const ytOutro = path.join(work, 'yt-outro.mp4');
  await renderCards(browser, [youtubeIntro(ch)], YT.W, YT.H, ytIntro, work);
  await renderCards(browser, [youtubeOutro()], YT.W, YT.H, ytOutro, work);
  await joinClips([ytIntro, ytMain, ytOutro], outYoutube, 1);

  // ---- Reel
  await renderPng(browser, `
    <img src="${LOGO}" style="position:absolute;left:80px;top:150px;height:34px">
    <div style="position:absolute;right:80px;top:152px;color:var(--muted);font-size:27px;font-weight:500">${pad(ch.n)} · ${esc(ch.area)}</div>
    <div style="position:absolute;left:0;right:0;top:${RL.top - 1}px;height:1px;background:var(--line)"></div>`, RL.W, RL.H, path.join(work, 'rl-bg.png'), work, false);
  for (let i = 0; i < n; i++) {
    const s = tl.steps[i];
    await renderPng(browser, `
      <div style="position:absolute;left:80px;top:220px;width:920px;height:${RL.top - 250}px;display:flex;flex-direction:column;justify-content:flex-end;gap:18px">
        <div>${stepDots(n, i, true)}</div>
        <div style="font-size:${s.text.length > 34 ? 52 : 60}px;line-height:1.08;font-weight:700;letter-spacing:-.02em;text-wrap:balance">${esc(s.text)}</div>
      </div>`, RL.W, RL.H, path.join(work, `rl-cap${i}.png`), work);
  }
  const crop = cropCommands(tl.camera, tl.duration);
  fs.writeFileSync(path.join(work, 'crop.txt'), crop.lines.join('\n'));
  const rlMain = path.join(work, 'rl-main.mp4');
  {
    const inputs = ['-loop', '1', '-i', path.join(work, 'rl-bg.png')];
    for (let i = 0; i < n; i++) inputs.push('-loop', '1', '-i', path.join(work, `rl-cap${i}.png`));
    const sc = screenInputs(tl, 1 + n);
    inputs.push(...sc.inputs);
    let g = `${sc.filter};[screen]sendcmd=f='${path.join(work, 'crop.txt')}',crop=w=${RL.cropW}:h=1800:x=${Math.round(crop.first)}:y=0,scale=1080:${RL.H - RL.top}:flags=lanczos,setsar=1[app];[0:v][app]overlay=0:${RL.top}:shortest=1[v1]`;
    let last = 'v1';
    spans.forEach(([a, b], i) => {
      g += `;[${1 + i}:v]format=rgba,fade=in:st=${a.toFixed(3)}:d=0.3:alpha=1[c${i}];[${last}][c${i}]overlay=0:0:enable='between(t,${a.toFixed(3)},${(b + 0.02).toFixed(3)})'[w${i}]`;
      last = `w${i}`;
    });
    g += `;[${last}]setpts=PTS/${REEL_SPEED}[out]`;
    await run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', g, '-map', '[out]', '-t', (tl.duration / REEL_SPEED).toFixed(3), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', rlMain]);
  }
  const rlIntro = path.join(work, 'rl-intro.mp4');
  const rlOutro = path.join(work, 'rl-outro.mp4');
  await renderCards(browser, [reelHook(ch)], RL.W, RL.H, rlIntro, work);
  await renderCards(browser, [reelOutro()], RL.W, RL.H, rlOutro, work);
  await joinClips([rlIntro, rlMain, rlOutro], outReel, 1);
  fs.rmSync(work, { recursive: true, force: true });
  return { duration: tl.duration, steps: n };
}

// Clips one after the other, with a short cross-fade, and a silent track.
async function joinClips(files, out) {
  const inputs = files.flatMap((f) => ['-i', f]);
  const durs = [];
  for (const f of files) durs.push(await probeDuration(f));
  const X = 0.35;
  let g = '';
  let last = '0:v';
  let acc = durs[0];
  for (let i = 1; i < files.length; i++) {
    g += `${g ? ';' : ''}[${last}][${i}:v]xfade=transition=fade:duration=${X}:offset=${(acc - X).toFixed(3)}[x${i}]`;
    last = `x${i}`;
    acc += durs[i] - X;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await run('ffmpeg', [
    '-y', '-v', 'error', ...inputs, '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-filter_complex', `${g};[${last}]format=yuv420p[v]`, '-map', '[v]', '-map', `${files.length}:a`, '-t', acc.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', out,
  ]);
}

function probeDuration(file) {
  return new Promise((resolve, reject) => {
    import('child_process').then(({ execFile }) =>
      execFile('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], (err, stdout) => (err ? reject(err) : resolve(Number(stdout.trim())))),
    );
  });
}
