import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// demo.cantia.ch: the read-only demo of the app (lib/demo). The same build
// as app.cantia.ch, compiled with EXPO_PUBLIC_DEMO=1 so the Supabase client
// is served by the sample company and never reaches the network. Run by
// netlify.toml when the Netlify site has CANTIA_SURFACE=demo.
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, 'dist');
const env = { ...process.env, EXPO_PUBLIC_DEMO: '1' };
const run = (cmd, args) => execFileSync(cmd, args, { cwd: rootDir, stdio: 'inherit', env });

if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
run('node', ['scripts/patch-rnw-font.mjs']);
console.log('Building demo.cantia.ch (read-only demo)...');
run('npx', ['expo', 'export', '-p', 'web', '-c']);
run('node', ['scripts/write-version.mjs']);

// Out of search engines: the demo is a showcase, not content.
writeFileSync(path.join(outputDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
for (const f of ['sitemap.xml', 'llms.txt']) rmSync(path.join(outputDir, f), { force: true });
// Extra header for every page of the demo, on top of netlify.toml's.
writeFileSync(path.join(outputDir, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
console.log('demo.cantia.ch build ready.');
