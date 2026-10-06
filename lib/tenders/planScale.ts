// Reading the scale printed on a plan ("Echelle 1:50", "M 1:100", "1/50",
// "Massstab 1:50", "Scala 1:100"). Only usual architecture scales are
// accepted, and a scale written next to its keyword wins over a bare "1:20"
// found in a detail callout. The result is a proposal: the screen says it
// was read on the plan and invites a check with a known dimension.

export const USUAL_SCALES = [1, 2, 5, 10, 20, 25, 50, 75, 100, 200, 250, 500, 1000, 2000, 2500, 5000];

export interface ScaleFound {
  scale: number;
  quote: string;
  confident: boolean; // written next to "Échelle / Massstab / Scala / M"
}

const KEYWORD = /(é|e)chelle|massstab|mst\.?|scala|scale|\bM\b/i;

export function detectScale(texts: string[]): ScaleFound | null {
  const found: { scale: number; quote: string; keyword: boolean }[] = [];
  const joined = texts.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  for (let i = 0; i < joined.length; i++) {
    const t = joined[i];
    const re = /(?<![\d.,])1\s*[:/]\s*(\d{1,4})(?![\d.,]*\d)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) {
      const scale = Number(m[1]);
      if (!USUAL_SCALES.includes(scale)) continue;
      // a date such as 1/12/2026 or a ratio inside a sentence is not a scale
      if (/^\s*[/.]\s*\d/.test(t.slice(m.index + m[0].length))) continue;
      // the keyword sits just before, on the same run or alone on the run before
      const prefix = t.slice(0, m.index).trim();
      const before = (prefix ? prefix : joined[i - 1] ?? '').slice(-24);
      found.push({ scale, quote: `${before.trim().split(' ').slice(-2).join(' ')} ${m[0]}`.trim(), keyword: KEYWORD.test(before) });
    }
  }
  if (!found.length) return null;
  const keyed = found.filter((f) => f.keyword);
  const pool = keyed.length ? keyed : found;
  const counts = new Map<number, number>();
  for (const f of pool) counts.set(f.scale, (counts.get(f.scale) ?? 0) + 1);
  const scales = [...counts.keys()];
  // Several different keyed scales on one sheet (plan + details): no guess.
  if (keyed.length && scales.length > 1) return null;
  const best = scales.sort((a, b) => counts.get(b)! - counts.get(a)!)[0];
  if (!keyed.length && scales.length > 1) return null;
  const f = pool.find((x) => x.scale === best)!;
  return { scale: best, quote: f.quote, confident: f.keyword };
}
