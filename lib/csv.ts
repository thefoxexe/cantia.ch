// Minimal RFC 4180-ish CSV parser — no dependency, since this only ever
// needs to handle the plain "export as CSV" output of another software
// (BauBit Pro, Excel "Enregistrer sous > CSV"…), not arbitrary CSV in the
// wild. Handles quoted fields (including embedded commas/newlines) and
// both \n and \r\n line endings, plus a leading UTF-8 BOM some exporters add.
export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

// Swiss/European exports (Excel with a French/German locale, BauBit Pro…)
// commonly use ';' instead of ',' as the field separator — detected from
// the first line rather than hardcoded, so both work.
function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.slice(0, text.indexOf('\n') === -1 ? text.length : text.indexOf('\n'));
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

export function parseCsv(text: string): ParsedCsv {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const delimiter = detectDelimiter(clean);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  function pushField() {
    row.push(field);
    field = '';
  }
  function pushRow() {
    pushField();
    rows.push(row);
    row = [];
  }

  while (i < clean.length) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === delimiter) {
      pushField();
      i += 1;
      continue;
    }
    if (ch === '\r') {
      i += 1;
      continue;
    }
    if (ch === '\n') {
      pushRow();
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) pushRow();

  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim().length > 0));
  const [headers, ...dataRows] = nonEmpty;
  return { headers: headers ?? [], rows: dataRows };
}
