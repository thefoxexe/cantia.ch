// « PDF de la soumission rempli »: the architect's original file with our
// unit prices, amounts, carries and totals written into its own fields
// (see pdfFill.ts). Browser only; pdf-lib is loaded on demand from cdnjs,
// like pdf.js, so it never weighs on the app bundle.

import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { fileSignedUrl } from './importer.ts';
import { loadPdfJs } from './pdfjs.ts';
import { extractText } from './parser/extract.ts';
import type { OcrFields } from './parser/ocrLayout.ts';
import { applyFill, contactWrites, detectContactFields, detectFieldLines, fieldLinesFromOcr, planFill, type ContactField, type ContactKey, type FillNode, type PdfLibLike } from './pdfFill.ts';
import type { TenderBundle } from './api.ts';

let loading: Promise<PdfLibLike> | null = null;
function loadPdfLib(): Promise<PdfLibLike> {
  const w = window as unknown as { PDFLib?: PdfLibLike };
  if (w.PDFLib) return Promise.resolve(w.PDFLib);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    s.async = true;
    s.onload = () => ((window as unknown as { PDFLib?: PdfLibLike }).PDFLib ? resolve((window as unknown as { PDFLib: PdfLibLike }).PDFLib) : reject(new Error('pdf-lib introuvable')));
    s.onerror = () => {
      loading = null;
      reject(new Error('Impossible de charger l’outil PDF. Vérifiez votre connexion.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type QuantityBasis = 'document' | 'selected';

export interface FilledResult {
  error: string | null;
  filled: number;
  unpriced: number;
  notPlaced: number;
  total: number;
}

export async function hasSourcePdf(tenderId: string): Promise<boolean> {
  const { data } = await supabase.from('tender_documents').select('file_id').eq('tender_id', tenderId).eq('role', 'soumission').not('file_id', 'is', null).limit(1);
  return !!data?.length;
}

export type BidderValues = Partial<Record<ContactKey, string>>;

// The bidder block the soumission asks for (Nom, Rue, NP lieu, Téléphone…),
// read from the original PDF so the recap can offer exactly those entries.
const contactCache = new Map<string, Promise<ContactField[]>>();
export function soumissionContactFields(tenderId: string): Promise<ContactField[]> {
  if (Platform.OS !== 'web') return Promise.resolve([]);
  let p = contactCache.get(tenderId);
  if (!p) {
    p = (async () => {
      const { data: docs } = await supabase.from('tender_documents').select('file_id').eq('tender_id', tenderId).eq('role', 'soumission').not('file_id', 'is', null).limit(1);
      const fileId = docs?.[0]?.file_id;
      if (!fileId) return [];
      const url = await fileSignedUrl(fileId);
      if (!url) return [];
      const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
      const text = await extractText(await loadPdfJs(), bytes);
      return text.scanned ? [] : detectContactFields(text);
    })().catch(() => {
      contactCache.delete(tenderId);
      return [];
    });
    contactCache.set(tenderId, p);
  }
  return p;
}

export function bidderOf(bundle: TenderBundle): BidderValues {
  const b = (bundle.tender.metadata as { bidder?: BidderValues } | null)?.bidder;
  return b && typeof b === 'object' ? b : {};
}

export async function exportFilledSoumission(bundle: TenderBundle, basis: QuantityBasis): Promise<FilledResult> {
  const empty = { filled: 0, unpriced: 0, notPlaced: 0, total: 0 };
  if (Platform.OS !== 'web') return { error: 'Disponible sur ordinateur.', ...empty };
  try {
    const { data: docs } = await supabase.from('tender_documents').select('file_id, file_name, detected').eq('tender_id', bundle.tender.id).eq('role', 'soumission').not('file_id', 'is', null).limit(1);
    const src = docs?.[0];
    if (!src?.file_id) return { error: 'Ce métré n’a pas de PDF de soumission d’origine.', ...empty };
    const url = await fileSignedUrl(src.file_id);
    if (!url) return { error: 'PDF d’origine introuvable.', ...empty };
    const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());

    const [pdfjs, pdfLib] = await Promise.all([loadPdfJs(), loadPdfLib()]);
    const text = await extractText(pdfjs, bytes.slice());
    // A scan has no text layer: its field grid was read by the OCR at import.
    let lines = text.scanned ? [] : detectFieldLines(text);
    if (text.scanned) {
      const ocr = (src.detected as { ocr_fields?: OcrFields[] } | null)?.ocr_fields;
      if (!ocr?.length) return { error: 'Ce scan a été importé avant la lecture des cases : réimportez la soumission pour obtenir le PDF rempli, ou utilisez l’export Excel.', ...empty };
      lines = fieldLinesFromOcr(ocr, text.pages);
    }
    const heights = new Map(text.pages.map((p) => [p.page, p.height]));

    const nodes = new Map(bundle.nodes.map((n) => [n.id, n]));
    const prices = new Map(bundle.prices.map((p) => [p.position_id, p]));
    const fill: FillNode[] = [];
    for (const pos of bundle.positions) {
      const n = nodes.get(pos.node_id);
      if (!n?.source_page || !n.source_bbox || !heights.has(n.source_page)) continue;
      const pr = prices.get(pos.id);
      const qty = basis === 'document' ? pos.quantity_original ?? pos.quantity_selected : pos.quantity_selected;
      const unitPrice = pos.excluded ? null : pr?.unit_price ?? null;
      fill.push({
        id: pos.id,
        page: n.source_page,
        y: n.source_bbox.y * heights.get(n.source_page)!,
        unitPrice,
        amount: unitPrice != null && qty != null ? Math.round(qty * unitPrice * 100) / 100 : null,
        printedAmount: pr?.document_amount ?? null,
        chapter: n.can_chapter,
        // The soumission left the quantity blank: write the one we offer.
        quantity: pos.quantity_original == null ? pos.quantity_selected : null,
      });
    }
    const plan = planFill(lines, fill, { discountPercent: Number(bundle.tender.discount_percent) || 0, escomptePercent: Number(bundle.tender.escompte_percent) || 0, vatRate: Number(bundle.tender.vat_rate) || 0 });
    if (!text.scanned) plan.writes.push(...contactWrites(detectContactFields(text), bidderOf(bundle)));
    const out = await applyFill(pdfLib, bytes, plan);

    const name = `${(src.file_name ?? bundle.tender.name).replace(/\.pdf$/i, '')} - rempli.pdf`;
    const blobUrl = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    return { error: null, filled: plan.filled, unpriced: plan.unpriced.length, notPlaced: plan.notPlaced.length, total: plan.total };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e), ...empty };
  }
}
