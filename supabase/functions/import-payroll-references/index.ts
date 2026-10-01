import { createClient } from 'npm:@supabase/supabase-js@2';
import { unzipSync, strFromU8 } from 'npm:fflate@0.8.2';
import { extractText, getDocumentProxy } from 'npm:unpdf@0.12.1';

// Official Swiss payroll references, fetched from the administrations
// themselves (never from a third party):
//   - withholding tax scales (ESTV): estv2.admin.ch/qst/<year>/loehne/tarYYxx.zip
//   - family allowances (OFAS / BSV): the yearly "Genres et montants" PDF
//
// POST { action: 'wht-sample', canton, year }   → first lines of the file (format check)
// POST { action: 'wht-import', cantons[], year } → parses and upserts swiss_wht_tariffs
// POST { action: 'famz-text', year }             → text of the OFAS family-allowance table
// POST { action: 'npa-cantons' }                  → { npa: canton } from swisstopo's official
//                                                   register of localities (PLZ / Ortschaften)
//
// Only these fixed official hosts are ever requested, so the function can't
// be used to fetch anything else. Import is idempotent (upsert by year,
// canton, code) and skipped for a canton imported less than an hour ago.

const CANTONS = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function fetchCantonFile(canton: string, year: number): Promise<string> {
  const yy = String(year).slice(2);
  const url = `https://www.estv2.admin.ch/qst/${year}/loehne/tar${yy}${canton.toLowerCase()}.zip`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESTV ${canton} ${year}: HTTP ${res.status}`);
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const name = Object.keys(files).find((n) => n.toLowerCase().endsWith('.txt'));
  if (!name) throw new Error(`ESTV ${canton} ${year}: no .txt in the archive`);
  // The files are ASCII / Latin-1.
  return strFromU8(files[name], true);
}

// Fixed-width record "06" (one tariff step), positions 1-based:
//  1-2 record type "06" | 3-4 transaction | 5-6 canton | 7-16 code
//  17-24 valid from YYYYMMDD | 25-33 taxable income from (CHF, 2 decimals)
//  34-42 step width (CHF, 2 dec.) | 43 gender | 44-45 children
//  46-54 minimum tax (CHF, 2 dec.) | 55-59 rate (%, 2 dec.)
export function parseTariffFile(text: string) {
  const byCode = new Map<string, { validFrom: string | null; steps: [number, number, number][] }>();
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.startsWith('06')) continue;
    const code = raw.slice(6, 16).trim();
    const valid = raw.slice(16, 24);
    const from = Number(raw.slice(24, 33)) / 100;
    const minTax = Number(raw.slice(45, 54)) / 100;
    const rate = Number(raw.slice(54, 59)) / 100;
    if (!code || !Number.isFinite(from) || !Number.isFinite(rate)) continue;
    const entry = byCode.get(code) ?? { validFrom: /^\d{8}$/.test(valid) ? `${valid.slice(0, 4)}-${valid.slice(4, 6)}-${valid.slice(6, 8)}` : null, steps: [] };
    entry.steps.push([from, rate, minTax]);
    byCode.set(code, entry);
  }
  for (const e of byCode.values()) e.steps.sort((a, b) => a[0] - b[0]);
  return byCode;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  let body: { action?: string; canton?: string; cantons?: string[]; year?: number };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'invalid json' });
  }
  const year = Number(body.year) || new Date().getFullYear();
  if (year < 2024 || year > new Date().getFullYear() + 1) return json(400, { error: 'year out of range' });

  try {
    if (body.action === 'wht-sample') {
      const canton = String(body.canton ?? '').toUpperCase();
      if (!CANTONS.includes(canton)) return json(400, { error: 'unknown canton' });
      const text = await fetchCantonFile(canton, year);
      const lines = text.split(/\r?\n/);
      return json(200, { lines: lines.length, head: lines.slice(0, 6), sample: lines.filter((l) => l.startsWith('06')).slice(0, 8) });
    }

    if (body.action === 'wht-import') {
      const cantons = (body.cantons ?? []).map((c) => String(c).toUpperCase()).filter((c) => CANTONS.includes(c));
      if (!cantons.length) return json(400, { error: 'no canton' });
      const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const result: Record<string, number | string> = {};
      for (const canton of cantons) {
        const { data: recent } = await admin
          .from('swiss_wht_tariffs')
          .select('imported_at')
          .eq('year', year)
          .eq('canton', canton)
          .gt('imported_at', new Date(Date.now() - 3600_000).toISOString())
          .limit(1);
        if (recent?.length) {
          result[canton] = 'skipped (imported < 1h ago)';
          continue;
        }
        const parsed = parseTariffFile(await fetchCantonFile(canton, year));
        const rows = [...parsed.entries()].map(([code, e]) => ({ year, canton, code, valid_from: e.validFrom, steps: e.steps, imported_at: new Date().toISOString() }));
        for (let i = 0; i < rows.length; i += 20) {
          const { error } = await admin.from('swiss_wht_tariffs').upsert(rows.slice(i, i + 20), { onConflict: 'year,canton,code' });
          if (error) throw new Error(`${canton}: ${error.message}`);
        }
        result[canton] = rows.length;
      }
      return json(200, { year, imported: result });
    }

    if (body.action === 'famz-text') {
      // The OFAS page lists the yearly PDF; take the link for this year.
      const page = await fetch('https://www.bsv.admin.ch/bsv/fr/home/assurances-sociales/famz/grundlagen-und-gesetze/ansaetze.html');
      const html = await page.text();
      const link = [...html.matchAll(/href="(https:\/\/www\.bsv\.admin\.ch\/dam\/[^"]+\.pdf)"/g)].map((m) => m[1]).find((u) => decodeURIComponent(u).includes(String(year)));
      if (!link) return json(404, { error: `no OFAS table for ${year}` });
      const pdf = await getDocumentProxy(new Uint8Array(await (await fetch(link)).arrayBuffer()));
      const { text } = await extractText(pdf, { mergePages: true });
      return json(200, { source: link, text });
    }

    if (body.action === 'npa-cantons') {
      // swisstopo publishes the register through its STAC catalogue; take
      // the CSV asset of the current item.
      const items = await (await fetch('https://data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo-vd.ortschaftenverzeichnis_plz/items')).json();
      const assets = (items.features ?? []).flatMap((f: { assets?: Record<string, { href: string }> }) => Object.values(f.assets ?? {}).map((a) => a.href));
      const href = assets.find((h: string) => /\.csv\.zip$/i.test(h) && /2056|4326/.test(h)) ?? assets.find((h: string) => /\.csv\.zip$/i.test(h));
      if (!href) return json(404, { error: 'no CSV in the swisstopo register', assets });
      const files = unzipSync(new Uint8Array(await (await fetch(href)).arrayBuffer()));
      const name = Object.keys(files).find((n) => n.toLowerCase().endsWith('.csv'));
      if (!name) return json(404, { error: 'no CSV in the archive' });
      const lines = strFromU8(files[name]).split(/\r?\n/);
      const header = lines[0].replace(/^\uFEFF/, '').split(';');
      const iNpa = header.findIndex((h) => /^(PLZ4|PLZ|NPA)$/i.test(h.trim()));
      const iCanton = header.findIndex((h) => /^Kantonsk/i.test(h.trim()));
      const iShare = header.findIndex((h) => /^Adressenanteil$/i.test(h.trim()));
      // A postcode can span cantons: keep the canton with most addresses.
      const best: Record<string, { canton: string; share: number }> = {};
      for (const line of lines.slice(1)) {
        const cols = line.split(';');
        const npa = cols[iNpa]?.trim();
        const canton = cols[iCanton]?.trim();
        const share = iShare >= 0 ? Number(String(cols[iShare] ?? '').replace('%', '').replace(',', '.')) || 0 : 0;
        if (!/^\d{4}$/.test(npa ?? '') || !/^[A-Z]{2}$/.test(canton ?? '')) continue;
        if (!best[npa] || share > best[npa].share) best[npa] = { canton, share };
      }
      const map = Object.fromEntries(Object.entries(best).map(([k, v]) => [k, v.canton]));
      return json(200, { source: href, header, count: Object.keys(map).length, map });
    }

    return json(400, { error: 'unknown action' });
  } catch (err) {
    console.error(err);
    return json(502, { error: err instanceof Error ? err.message : String(err) });
  }
});
