// Instagram post (1080×1350) and story (1080×1920) for the new-company offer.
// Real app screens from assets/marketing; conditions as on cantia.ch/nouvelle-entreprise.
// node marketing/instagram/build.mjs  ->  marketing/instagram/*.png
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'marketing/instagram');
const f = (p) => 'file://' + path.join(ROOT, p);

const css = `
@font-face { font-family: 'DM Sans'; src: url('${f('public/fonts/dm-sans-latin.woff2')}') format('woff2'); font-weight: 100 1000; }
@font-face { font-family: 'DM Sans'; src: url('${f('public/fonts/dm-sans-latin-ext.woff2')}') format('woff2'); font-weight: 100 1000; unicode-range: U+0100-024F, U+2000-20FF; }
@font-face { font-family: 'DM Serif'; font-style: italic; src: url('${f('public/fonts/dm-serif-display-latin-italic.woff2')}') format('woff2'); }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: var(--w); height: var(--h); overflow: hidden; background: #252921; color: #f4f3e9; font-family: 'DM Sans', sans-serif; position: relative; }
.logo { height: 38px; width: auto; align-self: flex-start; }
.eyebrow { font-size: 22px; letter-spacing: 4px; text-transform: uppercase; color: #d9aa85; font-weight: 600; }
h1 { font-weight: 500; letter-spacing: -4px; line-height: 1.02; }
h1 em { font-family: 'DM Serif', serif; font-style: italic; font-weight: 400; color: #d9aa85; letter-spacing: -1px; }
.lead { color: #b2b9a7; line-height: 1.5; }
.shot { border-radius: 18px; box-shadow: 0 40px 90px rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.08); display: block; }
.badge { width: 190px; height: 190px; border-radius: 50%; border: 2px solid #d9aa85; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #252921; }
.badge b { font-size: 92px; font-weight: 500; line-height: .9; letter-spacing: -4px; }
.badge span { font-size: 20px; letter-spacing: 3px; text-transform: uppercase; color: #d9aa85; font-weight: 600; margin-top: 6px; }
.pill { display: inline-flex; align-items: center; gap: 14px; background: #a65d36; color: #fff; border-radius: 10px; font-weight: 600; }
.foot { color: #b2b9a7; font-size: 22px; }
.foot b { color: #f4f3e9; font-weight: 600; }
`;

const post = `
<style>:root{--w:1080px;--h:1350px}${css}
.wrap { position: absolute; inset: 0; padding: 78px 80px; }
h1 { font-size: 104px; margin-top: 26px; }
.lead { font-size: 30px; margin-top: 30px; max-width: 820px; }
.screen { position: absolute; left: 80px; top: 790px; width: 1180px; }
.badge { position: absolute; right: 70px; top: 660px; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 128px; background: #1c1f19; display: flex; align-items: center; justify-content: space-between; padding: 0 80px; border-top: 1px solid rgba(255,255,255,.08); }
.pill { font-size: 25px; padding: 18px 26px; white-space: nowrap; }
.foot { white-space: nowrap; }
</style>
<div class="wrap">
  <img class="logo" src="${f('assets/brand/logo-white.png')}">
  <div class="eyebrow" style="margin-top:64px">Nouvelle entreprise</div>
  <h1>Vous démarrez ?<br><em>3 mois offerts.</em></h1>
  <p class="lead">Cantia vous accompagne pendant vos premiers mois : devis, factures QR, heures et TVA dans un seul logiciel. Rien n’est débité pendant ces 3 mois.</p>
</div>
<img class="shot screen" src="${f('assets/marketing/screens/devis.jpg')}">
<div class="badge"><b>3</b><span>mois</span></div>
<div class="bar">
  <div class="foot"><b>Sans engagement</b> · 3 mois au lieu de 14 jours</div>
  <div class="pill">cantia.ch/nouvelle-entreprise</div>
</div>`;

const story = `
<style>:root{--w:1080px;--h:1920px}${css}
.wrap { position: absolute; inset: 0; padding: 230px 84px 0; display: flex; flex-direction: column; }
h1 { font-size: 104px; margin-top: 24px; }
.lead { font-size: 32px; margin-top: 28px; }
.steps { margin-top: 44px; display: flex; flex-direction: column; border-top: 1px solid rgba(255,255,255,.14); }
.step { display: flex; gap: 30px; padding: 24px 0; border-bottom: 1px solid rgba(255,255,255,.14); }
.when { width: 180px; flex-shrink: 0; font-size: 21px; letter-spacing: 3px; text-transform: uppercase; color: #d9aa85; font-weight: 600; padding-top: 8px; }
.step h3 { font-size: 34px; font-weight: 500; letter-spacing: -1px; }
.step p { font-size: 24px; color: #b2b9a7; margin-top: 6px; line-height: 1.4; }
.qrrow { position: relative; margin-top: 44px; }
.qr { height: 250px; overflow: hidden; border-radius: 18px; background: #fff; }
.qr img { width: 100%; display: block; margin-top: -24px; }
.badge { position: absolute; right: -24px; top: -70px; width: 160px; height: 160px; }
.badge b { font-size: 76px; }
.badge span { font-size: 18px; }
.cta { margin-top: 44px; display: flex; justify-content: space-between; align-items: center; }
.pill { font-size: 28px; padding: 20px 30px; white-space: nowrap; }
</style>
<div class="wrap">
  <img class="logo" src="${f('assets/brand/logo-white.png')}">
  <div class="eyebrow" style="margin-top:70px">Nouvelle entreprise</div>
  <h1>Vos 3 premiers mois,<br><em>offerts.</em></h1>
  <p class="lead">Pour les nouvelles entreprises suisses : Cantia offert 3 mois au lieu de 14 jours, sans engagement.</p>
  <div class="steps">
    <div class="step"><div class="when">Semaine 1</div><div><h3>Le premier devis part</h3><p>Signé en ligne par le client, sans créer de compte.</p></div></div>
    <div class="step"><div class="when">Mois 1</div><div><h3>Les premières factures sont payées</h3><p>Factures QR depuis le devis signé, paiements suivis.</p></div></div>
    <div class="step"><div class="when">Mois 3</div><div><h3>Vous savez où vous en êtes</h3><p>Facturé, encaissé, ouvert : tout au même endroit.</p></div></div>
  </div>
  <div class="qrrow">
    <div class="qr"><img src="${f('assets/marketing/site/facture-qr-section.jpg')}"></div>
    <div class="badge"><b>3</b><span>mois</span></div>
  </div>
  <div class="cta">
    <div class="foot" style="font-size:26px"><b>Demandez votre code</b><br>sur cantia.ch</div>
    <div class="pill">cantia.ch/nouvelle-entreprise</div>
  </div>
</div>`;

const b = await chromium.launch();
for (const [name, html, w, h] of [['post-4x5', post, 1080, 1350], ['story-9x16', story, 1080, 1920]]) {
  const file = path.join(OUT, `${name}.html`);
  fs.writeFileSync(file, `<!doctype html><meta charset="utf-8">${html}`);
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto('file://' + file);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `cantia-nouvelle-entreprise-${name}.png`) });
  fs.unlinkSync(file);
}
await b.close();
console.log('ok');
