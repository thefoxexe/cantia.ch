// Writes dist/version.json at build time: which deploy is live, for the
// health monitoring (docs/health-monitoring.md). Netlify provides
// COMMIT_REF / DEPLOY_ID / CONTEXT; locally they are missing and the file
// says "local" instead of failing the build.
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2] ?? 'dist', 'version.json');
const commit = (process.env.COMMIT_REF ?? '').slice(0, 7) || 'local';
const body = {
  version: commit,
  context: process.env.CONTEXT ?? 'local',
  deployId: process.env.DEPLOY_ID ?? null,
  builtAt: new Date().toISOString(),
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(body) + '\n');
console.log(`version.json: ${commit}`);
