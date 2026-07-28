import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;

const INK = rgb(0.12, 0.14, 0.18);
const MUTED = rgb(0.45, 0.48, 0.53);
const BRAND = rgb(0.14, 0.35, 0.85);
const LINE = rgb(0.85, 0.87, 0.9);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of (text || '').split('\n')) {
    const words = paragraph.split(' ').filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawText(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color: RGB = INK) {
  page.drawText(text, { x, y, size, font, color });
}

async function fetchStorageBytes(
  supabase: { storage: { from: (b: string) => any } },
  bucket: string,
  path: string,
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) return null;
  const buf = new Uint8Array(await data.arrayBuffer());
  const contentType = (data.type as string) || guessContentType(path);
  return { bytes: buf, contentType };
}

function guessContentType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

async function embedImageSmart(pdfDoc: PDFDocument, bytes: Uint8Array, contentType: string) {
  try {
    if (contentType.includes('png')) return await pdfDoc.embedPng(bytes);
    return await pdfDoc.embedJpg(bytes);
  } catch {
    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return await pdfDoc.embedJpg(bytes);
    }
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function chf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { devis_id } = await req.json();
    if (!devis_id) return json({ error: 'devis_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: devis, error: devisError } = await userClient
      .from('devis')
      .select('*, projects(name)')
      .eq('id', devis_id)
      .single();

    if (devisError || !devis) return json({ error: 'Devis introuvable ou accès refusé' }, 404);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', devis.organization_id).single(),
      admin.from('devis_items').select('*').eq('devis_id', devis_id).order('sort_order', { ascending: true }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;
    let pageNum = 1;

    const newPage = () => {
      drawFooter(page, font, pageNum);
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNum += 1;
      y = PAGE_HEIGHT - MARGIN;
    };

    // ---- Header ----
    let logoImg = null;
    if (org?.logo_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.logo_url);
      if (bytes) logoImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }
    if (logoImg) {
      const h = 46;
      const w = (logoImg.width / logoImg.height) * h;
      page.drawImage(logoImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h + 10, width: w, height: h });
    }

    drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 17, BRAND);
    y -= 16;
    const orgLine = [org?.address, org?.ide_number ? `IDE ${org.ide_number}` : null].filter(Boolean).join(' · ');
    if (orgLine) {
      drawText(page, orgLine, MARGIN, y, font, 9, MUTED);
      y -= 12;
    }
    y -= 16;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
    y -= 28;

    // ---- Title ----
    drawText(page, `Devis ${devis.number ?? ''}`, MARGIN, y, fontBold, 16, INK);
    drawText(page, formatDate(devis.created_at), PAGE_WIDTH - MARGIN - 90, y, font, 10, MUTED);
    y -= 22;

    const clientLines = [
      devis.client_name,
      devis.client_address,
      devis.client_email,
      devis.projects?.name ? `Chantier : ${devis.projects.name}` : null,
    ].filter(Boolean) as string[];
    drawText(page, 'Client', MARGIN, y, fontBold, 10, MUTED);
    y -= 14;
    for (const line of clientLines) {
      drawText(page, line, MARGIN, y, font, 10.5, INK);
      y -= 14;
    }
    y -= 16;

    if (devis.notes?.trim()) {
      const lines = wrapText(devis.notes, font, 9.5, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        drawText(page, line, MARGIN, y, font, 9.5, MUTED);
        y -= 12;
      }
      y -= 12;
    }

    // ---- Items table ----
    const colX = { desc: MARGIN, qty: 330, unit: 380, price: 430, total: 500 };
    const tableRight = PAGE_WIDTH - MARGIN;

    const drawTableHeader = () => {
      drawText(page, 'Description', colX.desc, y, fontBold, 9.5, MUTED);
      drawText(page, 'Qté', colX.qty, y, fontBold, 9.5, MUTED);
      drawText(page, 'Unité', colX.unit, y, fontBold, 9.5, MUTED);
      drawText(page, 'Prix', colX.price, y, fontBold, 9.5, MUTED);
      drawText(page, 'Total', colX.total, y, fontBold, 9.5, MUTED);
      y -= 8;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: tableRight, y }, thickness: 1, color: LINE });
      y -= 16;
    };

    drawTableHeader();

    let subtotal = 0;
    for (const item of items ?? []) {
      const lineTotal = Number(item.quantity) * Number(item.unit_price);
      subtotal += lineTotal;

      const descLines = wrapText(item.description, font, 10, colX.qty - colX.desc - 10);
      if (y - descLines.length * 13 < MARGIN + 120) {
        newPage();
        drawTableHeader();
      }
      const rowTop = y;
      for (const line of descLines) {
        drawText(page, line, colX.desc, y, font, 10, INK);
        y -= 13;
      }
      drawText(page, String(item.quantity), colX.qty, rowTop, font, 10, INK);
      drawText(page, item.unit ?? 'pce', colX.unit, rowTop, font, 10, INK);
      drawText(page, chf(Number(item.unit_price)), colX.price, rowTop, font, 10, INK);
      drawText(page, chf(lineTotal), colX.total, rowTop, font, 10, INK);
      y -= 6;
    }

    y -= 6;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: tableRight, y }, thickness: 1, color: LINE });
    y -= 20;

    if (y < MARGIN + 100) {
      newPage();
    }

    const vat = subtotal * (Number(devis.vat_rate) / 100);
    const total = subtotal + vat;

    drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
    y -= 15;
    drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
    y -= 15;
    drawTotalsLine(page, fontBold, y, 'Total TTC', chf(total), 12);
    y -= 30;

    drawText(page, 'Devis valable 30 jours. Prix en francs suisses (CHF).', MARGIN, y, font, 8.5, MUTED);
    y -= 30;

    if (org?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.signature_url);
      if (bytes) {
        if (y < MARGIN + 90) newPage();
        const img = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
        const h = 50;
        const w = (img.width / img.height) * h;
        drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
        page.drawImage(img, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
      }
    }

    drawFooter(page, font, pageNum);

    const pdfBytes = await pdfDoc.save();
    const path = `${devis.organization_id}/devis/${devis.id}/devis-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);

    await admin.from('devis').update({ pdf_path: path }).eq('id', devis_id);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ path, url: signed?.signedUrl ?? null });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function drawTotalsLine(page: PDFPage, font: PDFFont, y: number, label: string, value: string, size = 10.5) {
  const x = 500 - 130;
  drawText(page, label, x, y, font, size, INK);
  drawText(page, value, 500, y, font, size, INK);
}

function drawFooter(page: PDFPage, font: PDFFont, pageNum: number) {
  drawText(page, 'Généré via Opus', MARGIN, 24, font, 8, MUTED);
  drawText(page, `Page ${pageNum}`, PAGE_WIDTH - MARGIN - 40, 24, font, 8, MUTED);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
