// Live Swiss address search against the federal geo.admin.ch geoportal —
// public, free, no API key. Used to power the street-address autocomplete
// (SwissAddressField): as the user types a street name, this returns real
// matching addresses (street, NPA, locality) so picking one fills the
// whole address at once instead of typing NPA/locality by hand too.
export interface SwissAddressResult {
  label: string;
  street: string;
  postalCode: string;
  locality: string;
}

const SEARCH_URL = 'https://api3.geo.admin.ch/rest/services/api/SearchServer';

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

// geo.admin.ch often repeats the commune name twice in the address label
// (once for the locality, once for the commune) — e.g. "1950 Sion Sion".
// Collapse that duplication so the locality reads naturally.
function dedupeLocality(raw: string): string {
  const words = raw.trim().split(/\s+/);
  const half = words.length / 2;
  if (words.length >= 2 && Number.isInteger(half)) {
    const first = words.slice(0, half).join(' ');
    const second = words.slice(half).join(' ');
    if (first.toLowerCase() === second.toLowerCase()) return first;
  }
  return raw.trim();
}

export async function searchSwissAddress(query: string): Promise<SwissAddressResult[]> {
  const url = `${SEARCH_URL}?type=locations&origins=address&limit=6&searchText=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const out: SwissAddressResult[] = [];
    for (const r of json.results ?? []) {
      const raw = stripHtml(r.attrs?.label ?? '').trim();
      const match = raw.match(/^(.*?)\s+(\d{4})\s+(.+)$/);
      if (!match) continue;
      const [, street, postalCode, localityRaw] = match;
      out.push({ label: raw, street: street.trim(), postalCode, locality: dedupeLocality(localityRaw) });
    }
    return out;
  } catch {
    return [];
  }
}
