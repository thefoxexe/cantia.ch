import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Static export of accounting.cantia.ch (Cantia Fiduciaires / Treuhand /
// Fiduciari): Expo Router rooted at app-accounting/ (ACCOUNTING_BUILD=1, see
// app.config.js), written to dist/ like the other sites, so the same
// netlify.toml publish directory works for all of them.
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, process.env.ACCOUNTING_OUTPUT_DIR ?? 'dist');

if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });

execFileSync('node', ['scripts/patch-rnw-font.mjs'], { cwd: rootDir, stdio: 'inherit' });
console.log(`Building accounting.cantia.ch (app-accounting/ -> ${path.relative(rootDir, outputDir)}/)...`);
execFileSync('npx', ['expo', 'export', '-p', 'web', '-c', '--output-dir', path.relative(rootDir, outputDir)], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, ACCOUNTING_BUILD: '1' },
});

// public/ is shared with the main site: drop what only cantia.ch uses.
for (const entry of [
  'aide', 'downloads', 'showcase', '_sitemap.html', 'contact-form.html', 'sur-mesure-form.html', 'llms.txt', 'sw.js',
  'manifest.json', 'cantia-demo.mp4', 'cantia-demo.webm', 'cantia-demo-de.mp4', 'cantia-demo-de.webm',
  'cantia-dossier-b2b-fr.pdf', 'cantia-dossier-b2b-de.pdf',
]) {
  rmSync(path.join(outputDir, entry), { recursive: true, force: true });
}

// Every route has its own prerendered HTML; anything else goes home.
const routes = ['connexion', 'espace', 'mandant', 'invitation', 'de', 'it'];
writeFileSync(path.join(outputDir, '_redirects'), [...routes.map((r) => `/${r}  /${r}.html  200`), '/*  /  302', ''].join('\n'));
writeFileSync(
  path.join(outputDir, 'robots.txt'),
  'User-agent: *\nDisallow: /connexion\nDisallow: /espace\nDisallow: /mandant\nDisallow: /invitation\n\nSitemap: https://accounting.cantia.ch/sitemap.xml\n',
);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  path.join(outputDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', 'de', 'it'].map((p) => `  <url><loc>https://accounting.cantia.ch/${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
);
console.log('accounting.cantia.ch build ready.');
