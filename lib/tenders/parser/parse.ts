// DeterministicTenderParser + ClassificationResolver + ValidationEngine.
//
// Rules, not AI. The AI resolver (supabase/functions/tender-ai-resolve)
// only ever sees the lines this parser could not settle. Nothing is
// invented: an unclear unit or quantity is left empty and turned into a
// question, the document's own spelling is always kept next to the
// normalized value, and every node points back to its page and box.

import { checkBreakdownSum, checkLineAmount } from '../calc.ts';
import { parseSwissNumber, round } from '../numbers.ts';
import { normalizeUnit, UNIT_CHOICES } from '../units.ts';
import type { NodeType, SourceBox } from '../types.ts';
import { isDots, isZoneToken, readDocument, type Columns } from './layout.ts';
import type { Certainty, DocumentMeta, DraftNode, DraftQuestion, ExtractedDocument, Line, ParseResult, TextItem } from './types.ts';

export const PARSER_VERSION = 'tenders-parser/1.1.0';

// "Contrat : 1    CAN Construction : 241 Constructions en béton coulé sur place F/04(V´11)"
// "NPK Bau : 241 Ortbetonbau D/04(V'11)"
const CAN_HEADER = /\b(?:CAN|NPK|CPN)\b[^:]*:\s*(\d{3})\s+(.+?)\s+([FDI])\/(\d{2})\s*\(\s*V.?\s*(\d{2})\s*\)/i;
const CAP_HEADER = /^(\d{3})\s*-\s*(?:CAP|CAN|NPK|CPN)\s*-\s*(.+)$/i;
const CONTRACT = /\b(?:Contrat|Vertrag|Contratto)\s*:\s*(\S+)/i;
const CFC = /\b(?:CFC|BKP|CCC)\s*(\d{1,4}(?:\.\d+)?)\s*[:\-–]?\s*(.*)$/i;
const DATE = /\b(\d{2})\.(\d{2})\.(\d{4})\b/;
const CARRY = /^(?:a\s+reporter|report|übertrag|riporto|da\s+riportare)\b/i;
const TOTAL = /^(?:total|totale|summe)\b\s*(.*)$/i;
const DASHES = /^-{8,}$/;
const LANG = { fr: /\b(soumission|maître d'ouvrage|architecte|fourniture|épaisseur)\b/i, de: /\b(leistungsverzeichnis|bauherr|lieferung|stärke|ausmass)\b/i, it: /\b(capitolato|committente|fornitura|spessore)\b/i };

interface Parsed {
  reserved: boolean;
  kind: 'article' | 'sub' | 'path';
  code: string; // "121", ".111" or "121.112"
  text: string;
}

// Numbering at the start of a line: "121 …", ".111 …", "121.112 …", "R 429", "R .903 …".
function parseNumbering(line: Line, cols: Columns): Parsed | null {
  const textX = cols.textX ?? 100;
  const head: TextItem[] = [];
  const rest: TextItem[] = [];
  for (const it of line.items) (it.x < textX - 2 && rest.length === 0 ? head : rest).push(it);
  let joined = head.map((h) => h.str.trim()).join(' ');
  // ".111 Epaisseur…" comes as a single run starting in the numbering column.
  if (!joined && line.items[0] && line.items[0].x < textX - 2) joined = line.items[0].str.trim();
  if (!joined) return null;
  let reserved = false;
  const r = /^R\b\s*/.exec(joined);
  if (r) {
    reserved = true;
    joined = joined.slice(r[0].length);
  }
  const textAfter = (consumed: string) => {
    const own = joined.slice(consumed.length).trim();
    const tail = rest.filter((it) => !isZoneToken(it.str) && it.x < (cols.zoneX ?? Infinity) - 2).map((it) => it.str.trim());
    return [own, ...tail].filter(Boolean).join(' ');
  };
  let m = /^(\d{3})\.(\d{3})\b/.exec(joined);
  if (m) return { reserved, kind: 'path', code: `${m[1]}.${m[2]}`, text: textAfter(m[0]) };
  m = /^(\d{3})\b/.exec(joined);
  if (m) return { reserved, kind: 'article', code: m[1], text: textAfter(m[0]) };
  m = /^\.(\d{3})\b/.exec(joined);
  if (m) return { reserved, kind: 'sub', code: `.${m[1]}`, text: textAfter(m[0]) };
  if (reserved && !joined) return { reserved, kind: 'sub', code: '', text: '' }; // lone "R" announcing the next number
  return null;
}

interface Fields {
  zone: string | null;
  quantity: number | null;
  rawQuantity: string | null;
  unit: string | null;
  price: number | null;
  amount: number | null;
  hasPriceColumns: boolean;
  blankQuantity: boolean; // "...... m2": quantity left for the bidder
  items: TextItem[];
}

// Zone, quantity, unit, unit price and amount on the right side of a line.
function readFields(line: Line, cols: Columns): Fields | null {
  const zoneX = cols.zoneX;
  const unitX = cols.unitX;
  const minX = Math.min(zoneX ?? Infinity, unitX != null ? unitX - 60 : Infinity);
  // A blank quantity field ("......") can start well left of the unit:
  // what counts is that it ends at the quantity column.
  const right = line.items.filter((it) => it.x >= minX - 4 || isZoneToken(it.str) || (isDots(it.str) && unitX != null && it.x + it.w >= unitX - 40 && it.x + it.w <= unitX + 2));
  if (!right.length) return null;
  const f: Fields = { zone: null, quantity: null, rawQuantity: null, unit: null, price: null, amount: null, hasPriceColumns: false, blankQuantity: false, items: right };
  const afterUnit: { n: number; edge: number }[] = [];
  for (const it of right) {
    const s = it.str.trim();
    const edge = it.x + it.w;
    if (isZoneToken(s)) {
      f.zone = s.slice(1).trim();
      continue;
    }
    if (unitX != null && Math.abs(it.x - unitX) <= 8 && parseSwissNumber(s) == null) {
      f.unit = s;
      continue;
    }
    if (isDots(s)) {
      if (unitX != null && edge <= unitX + 2) f.blankQuantity = true;
      else f.hasPriceColumns = true;
      continue;
    }
    const n = parseSwissNumber(s);
    if (n == null) continue;
    if (unitX != null && edge <= unitX + 2) {
      f.quantity = n;
      f.rawQuantity = s;
    } else {
      afterUnit.push({ n, edge });
    }
  }
  // Right of the unit: two numbers are unit price then amount (reading
  // order); a single one goes to the nearer learned column, amount by default.
  if (afterUnit.length >= 2) {
    f.price = afterUnit[afterUnit.length - 2].n;
    f.amount = afterUnit[afterUnit.length - 1].n;
  } else if (afterUnit.length === 1) {
    const { n, edge } = afterUnit[0];
    const dp = cols.priceRight != null ? Math.abs(edge - cols.priceRight) : Infinity;
    const da = cols.amountRight != null ? Math.abs(edge - cols.amountRight) : Infinity;
    if (dp < da) f.price = n;
    else f.amount = n;
  }
  if (afterUnit.length) f.hasPriceColumns = true;
  if (f.blankQuantity && !f.unit) f.blankQuantity = false;
  if (f.zone == null && f.quantity == null && f.unit == null && f.price == null && f.amount == null) return null;
  return f;
}

interface Ctx {
  nodes: DraftNode[];
  byKey: Map<string, DraftNode>;
  pageSize: Map<number, { w: number; h: number }>;
  chapter: DraftNode | null;
  chapterCode: string | null;
  canVersion: string | null;
  canLanguage: string | null;
  contract: DraftNode | null;
  // per chapter: 3-digit article codes → node; per article: sub codes → node
  articles: Map<string, DraftNode>;
  subs: Map<string, Map<string, DraftNode>>;
  current: DraftNode | null;
  currentArticle: DraftNode | null;
  pendingReserved: boolean;
  seq: number;
}

function box(ctx: Ctx, line: Line): SourceBox {
  const size = ctx.pageSize.get(line.page) ?? { w: 595, h: 842 };
  const x0 = Math.min(...line.items.map((i) => i.x));
  const x1 = Math.max(...line.items.map((i) => i.x + i.w));
  return { x: round(x0 / size.w, 4), y: round(line.y / size.h, 4), w: round((x1 - x0) / size.w, 4), h: round((line.h * 1.2) / size.h, 4) };
}

function newNode(ctx: Ctx, fields: Partial<DraftNode> & { nodeType: NodeType; parent: DraftNode | null }, line?: Line): DraftNode {
  const n: DraftNode = {
    key: `n${++ctx.seq}`,
    parentKey: fields.parent?.key ?? null,
    nodeType: fields.nodeType,
    depth: fields.parent ? fields.parent.depth + 1 : 0,
    rawNumber: fields.rawNumber ?? null,
    positionPath: fields.positionPath ?? null,
    displayReference: fields.displayReference ?? null,
    canChapter: ctx.chapterCode,
    canVersion: ctx.canVersion,
    canLanguage: ctx.canLanguage,
    cfcCode: null,
    isReserved: fields.isReserved ?? false,
    title: fields.title ?? '',
    description: fields.description ?? fields.title ?? '',
    rawText: line ? line.text : '',
    page: line?.page ?? null,
    bbox: line ? box(ctx, line) : null,
    rawUnit: null,
    unit: null,
    quantity: null,
    rawQuantity: null,
    breakdowns: [],
    documentUnitPrice: null,
    documentAmount: null,
    certainty: 'certain',
    issues: [],
  };
  ctx.nodes.push(n);
  ctx.byKey.set(n.key, n);
  return n;
}

function appendText(node: DraftNode, text: string, raw: string) {
  const t = text.trim();
  if (!t) return;
  // "rectangulai-" + "res." → "rectangulaires."
  if (/[a-zà-ÿ]-$/i.test(node.description) && /^[a-zà-ÿ]/i.test(t)) node.description = node.description.slice(0, -1) + t;
  else node.description = node.description ? `${node.description}\n${t}` : t;
  if (!node.rawText.split('\n').includes(raw)) node.rawText = node.rawText ? `${node.rawText}\n${raw}` : raw;
}

// CAN numbering: x00 main group → xy0 group → xyz article, and the same
// inside an article for .x00 → .xy0 → .xyz.
function articleParent(ctx: Ctx, code: string): DraftNode | null {
  const [a, b, c] = code;
  if (c !== '0') return ctx.articles.get(`${a}${b}0`) ?? ctx.articles.get(`${a}00`) ?? ctx.chapter;
  if (b !== '0') return ctx.articles.get(`${a}00`) ?? ctx.chapter;
  return ctx.chapter;
}
function subParent(subs: Map<string, DraftNode>, article: DraftNode, code: string): DraftNode {
  const [, a, b, c] = code; // ".abc"
  if (c !== '0') return subs.get(`.${a}${b}0`) ?? subs.get(`.${a}00`) ?? article;
  if (b !== '0') return subs.get(`.${a}00`) ?? article;
  return article;
}

function articleType(code: string): NodeType {
  if (code.endsWith('00')) return 'section';
  if (code.endsWith('0')) return 'subsection';
  return 'article';
}

function ensureChapter(ctx: Ctx, code: string, title: string, line: Line | null) {
  if (ctx.chapterCode === code && ctx.chapter) return;
  ctx.chapterCode = code;
  const existing = ctx.nodes.find((n) => n.nodeType === 'chapter' && n.rawNumber === code);
  ctx.chapter =
    existing ??
    newNode(ctx, { nodeType: 'chapter', parent: ctx.contract, rawNumber: code, positionPath: code, displayReference: `CAN ${code}`, title, description: title }, line ?? undefined);
  if (!existing && line) ctx.chapter.bbox = null; // header line, not a body line
  ctx.articles = new Map(ctx.nodes.filter((n) => n.canChapter === code && n.rawNumber && /^\d{3}$/.test(n.rawNumber)).map((n) => [n.rawNumber!, n]));
  ctx.current = ctx.chapter;
  ctx.currentArticle = null;
}

function onNumbering(ctx: Ctx, p: Parsed, line: Line) {
  const reserved = p.reserved || ctx.pendingReserved;
  ctx.pendingReserved = false;
  if (!p.code) {
    ctx.pendingReserved = true;
    return;
  }
  const chapter = ctx.chapterCode ?? '';
  const ref = (path: string) => `${reserved ? 'R ' : ''}${chapter ? `${chapter} / ` : ''}${path}`;
  if (p.kind === 'article') {
    const existing = ctx.articles.get(p.code);
    if (existing) {
      ctx.current = existing;
      ctx.currentArticle = existing;
      if (p.text && !existing.description.includes(p.text)) appendText(existing, p.text, line.text);
      return;
    }
    const n = newNode(ctx, { nodeType: articleType(p.code), parent: articleParent(ctx, p.code), rawNumber: `${reserved ? 'R ' : ''}${p.code}`, positionPath: p.code, displayReference: ref(p.code), isReserved: reserved, title: p.text, description: p.text }, line);
    ctx.articles.set(p.code, n);
    ctx.subs.set(n.key, new Map());
    ctx.current = n;
    ctx.currentArticle = n;
    return;
  }
  let article = ctx.currentArticle;
  let sub = p.code;
  if (p.kind === 'path') {
    const [art, s] = p.code.split('.');
    sub = `.${s}`;
    article = ctx.articles.get(art) ?? null;
    if (!article) {
      article = newNode(ctx, { nodeType: articleType(art), parent: articleParent(ctx, art), rawNumber: art, positionPath: art, displayReference: ref(art), title: '' }, line);
      ctx.articles.set(art, article);
      ctx.subs.set(article.key, new Map());
    }
    ctx.currentArticle = article;
  }
  if (!article) {
    // A sub-article with no article above it: keep it, flagged.
    const n = newNode(ctx, { nodeType: 'subarticle', parent: ctx.chapter, rawNumber: `${reserved ? 'R ' : ''}${sub}`, positionPath: sub, displayReference: ref(sub), isReserved: reserved, title: p.text, description: p.text }, line);
    n.certainty = 'probable';
    n.issues.push({ kind: 'number_ambiguous', message: 'Sous-article sans article parent.' });
    ctx.current = n;
    return;
  }
  const subs = ctx.subs.get(article.key) ?? new Map<string, DraftNode>();
  ctx.subs.set(article.key, subs);
  const path = `${article.positionPath}.${sub.slice(1)}`;
  const existing = subs.get(sub);
  // A repeated full path after a page break is the same sub-article…
  if (existing && p.kind === 'path') {
    ctx.current = existing;
    if (p.text && !existing.description.startsWith(p.text)) appendText(existing, p.text, line.text);
    return;
  }
  // …while the same local number under a new ".x00" heading is a new one.
  const n = newNode(
    ctx,
    { nodeType: 'subarticle', parent: subParent(subs, article, sub), rawNumber: `${reserved ? 'R ' : ''}${p.kind === 'path' ? p.code : sub}`, positionPath: path, displayReference: ref(path), isReserved: reserved, title: p.text, description: p.text },
    line,
  );
  subs.set(sub, n);
  ctx.current = n;
}

function onFields(ctx: Ctx, f: Fields, line: Line) {
  const target = ctx.current;
  if (!target || target.nodeType === 'chapter' || target.nodeType === 'contract') {
    // Quantities with no position to hang them on: never dropped silently.
    const n = newNode(ctx, { nodeType: 'billable_position', parent: ctx.chapter ?? ctx.contract, title: line.text, description: line.text }, line);
    n.certainty = 'uncertain';
    n.issues.push({ kind: 'orphan_quantity', message: 'Quantité trouvée sans position identifiable.' });
    ctx.current = n;
    return onFields(ctx, f, line);
  }
  target.rawText = target.rawText.includes(line.text) ? target.rawText : `${target.rawText}\n${line.text}`;
  if (f.zone != null || f.quantity != null || f.blankQuantity) {
    target.breakdowns.push({
      ...(f.blankQuantity && f.quantity == null ? { blank: true } : {}),
      code: f.zone ?? '',
      quantity: f.quantity,
      rawQuantity: f.rawQuantity,
      unit: f.unit,
      page: line.page,
      bbox: box(ctx, line),
    });
  }
  if (f.price != null) target.documentUnitPrice = f.price;
  if (f.amount != null) target.documentAmount = f.amount;
  (target as DraftNode & { _priceColumns?: boolean })._priceColumns ||= f.hasPriceColumns;
}

// ---------------------------------------------------------------------------

export function parseTender(doc: ExtractedDocument): ParseResult {
  const { lines, body, furniture, columns } = readDocument(doc);
  const ctx: Ctx = {
    nodes: [],
    byKey: new Map(),
    pageSize: new Map(doc.pages.map((p) => [p.page, { w: p.width, h: p.height }])),
    chapter: null,
    chapterCode: null,
    canVersion: null,
    canLanguage: null,
    contract: null,
    articles: new Map(),
    subs: new Map(),
    current: null,
    currentArticle: null,
    pendingReserved: false,
    seq: 0,
  };
  const meta = readMeta(lines, furniture, doc.items);
  let carryForwards = furniture.filter((l) => CARRY.test(l.text.trim())).length;
  let chapterTotals = 0;

  // Page furniture tells which CAN chapter each page belongs to.
  const chapterOfPage = new Map<number, { code: string; title: string; version: string; lang: string; contract: string | null }>();
  for (const l of [...furniture, ...lines.filter((x) => x.y < 120)]) {
    const m = CAN_HEADER.exec(l.text);
    if (m && !chapterOfPage.has(l.page)) chapterOfPage.set(l.page, { code: m[1], title: m[2].trim(), version: `${m[3]}/${m[4]}(V'${m[5]})`, lang: m[3].toUpperCase(), contract: CONTRACT.exec(l.text)?.[1] ?? null });
  }
  // Other programs head each page with "113 - CAP - Installations de chantier".
  for (const l of lines.filter((x) => x.y < 120)) {
    const m = CAP_HEADER.exec(l.text.replace(/\s+Page\s*:?\s*\d+\s*$/i, '').trim());
    if (m && !chapterOfPage.has(l.page)) chapterOfPage.set(l.page, { code: m[1], title: m[2].trim(), version: '', lang: 'F', contract: null });
  }
  const can = chapterOfPage.size > 0;
  const canLines = body.filter((l) => /^(R\s+)?\.?\d{3}(\.\d{3})?\b/.test(l.text)).length;
  const classification: ParseResult['classification'] = can ? 'CAN' : canLines > 20 ? 'CAN' : body.length ? 'CUSTOM' : 'UNKNOWN';
  const classificationConfidence = can ? 0.98 : canLines > 20 ? 0.7 : 0.6;

  if (meta.cfcCode || chapterOfPage.size) {
    const contractNo = [...chapterOfPage.values()][0]?.contract;
    if (contractNo || meta.cfcCode) {
      const title = meta.cfcCode ? `CFC ${meta.cfcCode}${meta.cfcLabel ? ` — ${meta.cfcLabel}` : ''}` : `Contrat ${contractNo}`;
      ctx.contract = newNode(ctx, { nodeType: 'contract', parent: null, rawNumber: contractNo ?? null, title, description: title });
      ctx.contract.cfcCode = meta.cfcCode;
    }
  }

  const firstContentPage = can ? Math.min(...chapterOfPage.keys()) : 1;
  for (const line of classification === 'CAN' ? body : []) {
    if (line.page < firstContentPage) continue; // cover + récapitulation: read into meta only
    const ch = chapterOfPage.get(line.page);
    if (ch) {
      ctx.canVersion = ch.version || null;
      ctx.canLanguage = ch.lang === 'D' ? 'de' : ch.lang === 'I' ? 'it' : 'fr';
      ensureChapter(ctx, ch.code, ch.title, null);
    }
    // Dotted amount fields are layout, not words.
    const text = line.items.filter((it) => !isDots(it.str)).map((it) => it.str.trim()).join(' ').trim();
    if (!text || DASHES.test(text)) continue;
    // "211 - CAP - Terrassements … Page: 8": page heading, not an article.
    if (line.y < 120 && CAP_HEADER.test(text.replace(/\s+Page\s*:?\s*\d+\s*$/i, '').trim())) continue;
    if (CARRY.test(text)) {
      carryForwards += 1;
      continue;
    }
    // "Total Constructions en béton coulé sur place" / "Total général": a
    // total line, never a position — recognised by its wording matching the
    // chapter title, or by carrying only an amount field.
    // "241 Total Constructions en béton coulé sur place" (chapter code first).
    const total = TOTAL.exec(text.replace(/^(\d{3})\s+(?=total\b|totale\b|summe\b)/i, (m, code) => (code === ctx.chapterCode ? '' : m)));
    if (total) {
      const rest = total[1].replace(/[.\s]+$/, '').trim().toLowerCase();
      const chapterTitle = (ctx.chapter?.title ?? '').trim().toLowerCase();
      const general = /^(g[ée]n[ée]ral|gesamt|generale|de la soumission)/i.test(rest);
      const amountOnly = line.items.filter((it) => !TOTAL.test(it.str.trim())).every((it) => isDots(it.str) || parseSwissNumber(it.str) != null);
      if (general || (chapterTitle && rest.startsWith(chapterTitle.slice(0, 20))) || amountOnly) {
        if (!general) chapterTotals += 1;
        continue;
      }
    }
    // A chapter number alone right after its "Total …" line.
    if (/^\d{3}$/.test(text) && line.items.length === 1 && line.items[0].x > (columns.textX ?? 100)) continue;

    const numbering = parseNumbering(line, columns);
    if (numbering) onNumbering(ctx, numbering, line);
    const fields = readFields(line, columns);
    if (fields) onFields(ctx, fields, line);
    if (!numbering && ctx.current) {
      // Running text: everything left of the quantity fields.
      const limit = Math.min(columns.zoneX ?? Infinity, columns.unitX != null ? columns.unitX - 60 : Infinity) - 4;
      const words = line.items.filter((it) => it.x < limit && !isZoneToken(it.str)).map((it) => it.str.trim()).join(' ');
      if (words) appendText(ctx.current, words, line.text);
    }
  }

  if (classification !== 'CAN') genericFallback(ctx, body, columns);
  finalize(ctx, columns);
  const questions = buildQuestions(ctx, meta, classification, classificationConfidence);
  const billable = ctx.nodes.filter((n) => n.nodeType === 'billable_position');
  return {
    parserVersion: PARSER_VERSION,
    classification,
    classificationConfidence,
    meta,
    nodes: ctx.nodes,
    questions,
    stats: {
      pages: doc.pages.length,
      nodes: ctx.nodes.length,
      billable: billable.length,
      certain: billable.filter((n) => n.certainty === 'certain').length,
      probable: billable.filter((n) => n.certainty === 'probable').length,
      uncertain: billable.filter((n) => n.certainty === 'uncertain').length,
      reserved: ctx.nodes.filter((n) => n.isReserved).length,
      breakdowns: billable.reduce((s, n) => s + n.breakdowns.length, 0),
      carryForwards,
      chapterTotals,
      pricesInDocument: billable.filter((n) => n.documentUnitPrice != null || n.documentAmount != null).length,
    },
  };
}

// Non-CAN documents: "1", "1.2", "1.2.3 Désignation … 12.5 m2 [PU] [montant]".
function genericFallback(ctx: Ctx, body: Line[], columns: Columns) {
  const stack: DraftNode[] = [];
  let current: DraftNode | null = null;
  for (const line of body) {
    const text = line.text.trim();
    if (!text || DASHES.test(text) || CARRY.test(text)) continue;
    if (TOTAL.test(text)) continue;
    const m = /^(\d+(?:\.\d+)*)\.?\s+(.+)$/.exec(text);
    const fields = readFields(line, columns);
    if (m && line.items[0].x < (columns.textX ?? 80) + 10) {
      const depth = m[1].split('.').length - 1;
      while (stack.length > depth) stack.pop();
      const parent = stack.at(-1) ?? null;
      const titleItems = line.items.filter((it) => !fields || !fields.items.includes(it));
      const title = titleItems.map((i) => i.str.trim()).join(' ').replace(/^\d+(?:\.\d+)*\.?\s*/, '');
      current = newNode(ctx, { nodeType: 'section', parent, rawNumber: m[1], positionPath: m[1], displayReference: m[1], title, description: title }, line);
      current.canChapter = null;
      stack[depth] = current;
      stack.length = depth + 1;
    } else if (current && !fields) {
      appendText(current, text, line.text);
    }
    if (fields && current) {
      ctx.current = current;
      onFields(ctx, fields, line);
    }
  }
}

function finalize(ctx: Ctx, cols: Columns) {
  for (const n of ctx.nodes) {
    if (!n.breakdowns.length && n.documentAmount == null) continue;
    n.nodeType = 'billable_position';
    const units = [...new Set(n.breakdowns.map((b) => b.unit).filter(Boolean))] as string[];
    const total = n.breakdowns.find((b) => /^(total|totale|summe|tot\.?)$/i.test(b.code));
    const zones = n.breakdowns.filter((b) => b !== total);
    n.breakdowns = zones;
    n.rawUnit = units[0] ?? null;
    const norm = normalizeUnit(n.rawUnit);
    n.unit = norm.unit;
    if (units.length > 1) n.issues.push({ kind: 'unit_unknown', message: `Plusieurs unités sur la même position : ${units.join(', ')}.`, choices: UNIT_CHOICES });
    if (!n.rawUnit) n.issues.push({ kind: 'unit_missing', message: 'Unité absente.', choices: UNIT_CHOICES });
    else if (!norm.known) n.issues.push({ kind: 'unit_unknown', message: `Unité « ${n.rawUnit} » non reconnue.`, choices: UNIT_CHOICES });

    if (total) {
      n.quantity = total.quantity;
      n.rawQuantity = total.rawQuantity;
      const check = checkBreakdownSum(zones.map((z) => z.quantity), total.quantity);
      if (!check.ok) n.issues.push({ kind: 'breakdown_sum', message: `Somme des zones ${check.sum} ≠ total ${total.quantity}.` });
    } else if (zones.length === 1) {
      n.quantity = zones[0].quantity;
      n.rawQuantity = zones[0].rawQuantity;
    } else if (zones.length > 1) {
      // No printed total: the sum is derived, so it is "probable", not "certain".
      n.quantity = round(zones.reduce((s, z) => s + (z.quantity ?? 0), 0), 3);
      n.certainty = 'probable';
    }
    // A blank field is not a missing quantity: it is the one to measure.
    const toMeasure = n.breakdowns.length > 0 && n.breakdowns.every((b) => b.blank);
    if (n.quantity == null && n.documentAmount == null && !toMeasure) n.issues.push({ kind: 'quantity_missing', message: 'Quantité absente.' });
    if (checkLineAmount(n.quantity, n.documentUnitPrice, n.documentAmount) === false) n.issues.push({ kind: 'amount_mismatch', message: 'Quantité × prix ≠ montant du document.' });
    // A bare zone code ("" when the document has no zones) is not a breakdown.
    if (n.breakdowns.length === 1 && !n.breakdowns[0].code) n.breakdowns = [];
    n.breakdowns = n.breakdowns.filter((b) => !b.blank || b.code);

    if (n.issues.some((i) => i.kind === 'unit_missing' || i.kind === 'unit_unknown' || i.kind === 'quantity_missing' || i.kind === 'orphan_quantity')) n.certainty = 'uncertain';
    else if (n.issues.length && n.certainty === 'certain') n.certainty = 'probable';
    delete (n as DraftNode & { _priceColumns?: boolean })._priceColumns;
  }
  // Titles: first line of the description, the rest stays in the description.
  for (const n of ctx.nodes) {
    if (!n.title) n.title = n.description.split('\n')[0] ?? '';
  }
  void cols;
}

function buildQuestions(ctx: Ctx, meta: DocumentMeta, classification: string, confidence: number): DraftQuestion[] {
  const qs: DraftQuestion[] = [];
  if (classification === 'CAN' && confidence < 0.9) {
    qs.push({ id: 'classification', kind: 'classification', prompt: 'Ce document semble utiliser une structure CAN. Confirmer ?', nodeKeys: [], choices: ['CAN', 'CUSTOM'] });
  }
  // One question per unclear unit spelling, applied to every line using it.
  const byUnit = new Map<string, string[]>();
  for (const n of ctx.nodes) {
    const issue = n.issues.find((i) => i.kind === 'unit_unknown' || i.kind === 'unit_missing');
    if (!issue) continue;
    const key = n.rawUnit ?? '';
    byUnit.set(key, [...(byUnit.get(key) ?? []), n.key]);
  }
  for (const [raw, keys] of byUnit) {
    qs.push({ id: `unit:${raw || 'none'}`, kind: 'unit', prompt: raw ? `Quelle est l’unité « ${raw} » ?` : 'Quelle est l’unité ?', nodeKeys: keys, choices: UNIT_CHOICES });
  }
  // Zone codes: the meaning is asked once per document (optional answer).
  const codes = new Set<string>(meta.zoneCodes);
  for (const n of ctx.nodes) for (const b of n.breakdowns) if (b.code) codes.add(b.code);
  for (const code of codes) {
    qs.push({ id: `zone:${code}`, kind: 'zone_label', prompt: `Que signifie « ${code} » dans cette soumission ?`, nodeKeys: [], code, answer: null });
  }
  return qs;
}

// Cover page, récapitulation and page furniture.
// The value of a cover-page label sits below it (or right after it) in the
// same column; cover pages often have two columns side by side.
function labelValue(items: TextItem[], label: TextItem, labelRe: RegExp, stop: RegExp): string | null {
  const own = label.str.replace(labelRe, '').trim();
  const sameLine = items.filter((it) => it.page === label.page && Math.abs(it.y - label.y) < 3 && it.x > label.x + label.w - 2 && it.x - (label.x + label.w) < 160);
  const parts: string[] = own ? [own] : [];
  let lastY = label.y;
  if (!own && sameLine.length) {
    parts.push(sameLine.map((i) => i.str.trim()).join(' '));
    // continuation lines aligned with the same-line value
    const vx = sameLine[0].x;
    for (const it of items.filter((i) => i.page === label.page && i.y > label.y + 2 && Math.abs(i.x - vx) < 6).sort((a, b) => a.y - b.y)) {
      if (it.y - lastY > 18 || stop.test(it.str.trim())) break;
      parts.push(it.str.trim());
      lastY = it.y;
    }
    return parts.join(', ');
  }
  const below = items.filter((i) => i.page === label.page && i.y > label.y + 2 && Math.abs(i.x - label.x) < 12).sort((a, b) => a.y - b.y);
  for (const it of below) {
    if (it.y - lastY > 22 || stop.test(it.str.trim()) || /^t[ée]l|^fax/i.test(it.str.trim())) break;
    parts.push(it.str.trim());
    lastY = it.y;
    if (parts.length >= 6) break;
  }
  return parts.join(', ') || null;
}

function readMeta(lines: Line[], furniture: Line[], items: TextItem[] = []): DocumentMeta {
  const meta: DocumentMeta = { title: null, tenderNumber: null, project: null, owner: null, architect: null, engineer: null, cfcCode: null, cfcLabel: null, date: null, language: null, zoneCodes: [], documentVatRate: null, chapters: [] };
  const early = lines.filter((l) => l.page <= 2);
  const labels: [keyof DocumentMeta, RegExp][] = [
    ['project', /^(projet|projekt|progetto|objet|objekt|oggetto)\s*:?/i],
    ['owner', /^(maître d.ouvrage|bauherr(schaft)?|committente)\s*:?/i],
    ['architect', /^(architecte|architekt|architetto)\s*:?/i],
    ['engineer', /^(ingénieur( civil)?|bauingenieur|ingegnere)\s*:?/i],
  ];
  const stop = /^(maître d.ouvrage|architecte|ingénieur|bauherr|architekt|ingenieur|cfc|bkp|montant|nom\s*:|tél|fax|projet|soumission)/i;
  for (let i = 0; i < early.length; i++) {
    const l = early[i];
    const t = l.text.trim();
    const num = /^(soumission|leistungsverzeichnis|capitolato)\s*n[°o]?\s*(\S+)/i.exec(t);
    if (num && !meta.tenderNumber) (meta.tenderNumber = num[2]), (meta.title = t);
    const cfc = CFC.exec(t);
    if (cfc && !meta.cfcCode && l.page === 1) (meta.cfcCode = cfc[1]), (meta.cfcLabel = cfc[2].replace(/\s+/g, ' ').trim() || null);
    for (const it of l.items) {
      for (const [key, re] of labels) {
        if (!re.test(it.str.trim()) || meta[key]) continue;
        (meta as unknown as Record<string, string | null>)[key] = labelValue(items.length ? items : l.items, it, re, stop);
      }
    }
    const zones = /^(structure|struktur|struttura)\s*:\s*(.+)$/i.exec(t);
    if (zones) meta.zoneCodes = zones[2].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const vat = /^(tva|mwst|iva)\b\s*([\d.,]+)\s*%/i.exec(t);
    if (vat) meta.documentVatRate = parseSwissNumber(vat[2]);
    const clean = l.items.filter((it) => !isDots(it.str)).map((it) => it.str.trim()).join(' ').trim();
    const ch = /^(\d{3})\s+(.{3,})$/.exec(clean);
    if (ch && l.page <= 2 && !meta.chapters.some((c) => c.code === ch[1])) meta.chapters.push({ code: ch[1], title: ch[2].trim(), version: null });
  }
  for (const l of [...furniture, ...lines]) {
    const d = DATE.exec(l.text);
    if (d) {
      meta.date = `${d[3]}-${d[2]}-${d[1]}`;
      break;
    }
  }
  const sample = lines.slice(0, 400).map((l) => l.text).join(' ');
  meta.language = LANG.de.test(sample) && !LANG.fr.test(sample) ? 'de' : LANG.it.test(sample) && !LANG.fr.test(sample) ? 'it' : 'fr';
  return meta;
}

export function certaintyOf(n: DraftNode): Certainty {
  return n.certainty;
}
