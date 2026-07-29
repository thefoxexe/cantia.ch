import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const BAND_H = 108;

const INK = rgb(0.0941, 0.1098, 0.1059);
const MUTED = rgb(0.3608, 0.3961, 0.3765);
const BRAND = rgb(0.1216, 0.2392, 0.2275);
const ACCENT = rgb(0.6902, 0.4118, 0.1725);
const LINE = rgb(0.8824, 0.8706, 0.8314);
const WHITE = rgb(1, 1, 1);
const PAPER_ALT = rgb(0.9569, 0.9490, 0.9412);
const BAND_MUTED = rgb(0.85, 0.89, 0.87);

// pdf-lib's standard fonts use WinAnsi (cp1252) encoding, which can't encode
// most unicode punctuation/space variants that pasted text or Intl
// formatters can produce. Sanitizing here (the choke point every string
// passes through) keeps a stray character from throwing mid-render and
// leaving the report half-generated.
function sanitizePdfText(text: string): string {
  return (text || '')
    .replace(/[  -   　]/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/Ÿ/g, 'Y')
    .replace(/[^\x00-\xFF]/g, '?');
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of sanitizePdfText(text).split('\n')) {
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
  page.drawText(sanitizePdfText(text), { x, y, size, font, color });
}

function drawTextRight(page: PDFPage, text: string, xRight: number, y: number, font: PDFFont, size: number, color: RGB = INK) {
  const safe = sanitizePdfText(text);
  const w = font.widthOfTextAtSize(safe, size);
  page.drawText(safe, { x: xRight - w, y, size, font, color });
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

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCoords(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { report_id } = await req.json();
    if (!report_id) {
      return json({ error: 'report_id requis' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Bound to the caller's JWT: RLS enforces the caller belongs to the org.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    // Service role: used only after the RLS-checked read above succeeds.
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: report, error: reportError } = await userClient
      .from('reports')
      .select('*, projects(name, client_name, address)')
      .eq('id', report_id)
      .single();

    if (reportError || !report) {
      return json({ error: 'Rapport introuvable ou accès refusé' }, 404);
    }

    const [{ data: org }, { data: photos }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', report.organization_id).single(),
      admin
        .from('report_photos')
        .select('*')
        .eq('report_id', report_id)
        .order('sort_order', { ascending: true }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let logoImg: PDFImage | null = null;
    if (org?.logo_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.logo_url);
      if (bytes) logoImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let pageNum = 1;

    // ---- Header band ----
    const drawBand = () => {
      page.drawRectangle({ x: 0, y: PAGE_HEIGHT - BAND_H, width: PAGE_WIDTH, height: BAND_H, color: BRAND });
      if (logoImg) {
        const h = 36;
        const w = (logoImg.width / logoImg.height) * h;
        page.drawRectangle({ x: PAGE_WIDTH - MARGIN - w - 12, y: PAGE_HEIGHT - BAND_H + 18, width: w + 12, height: h + 12, color: WHITE });
        page.drawImage(logoImg, { x: PAGE_WIDTH - MARGIN - w - 6, y: PAGE_HEIGHT - BAND_H + 24, width: w, height: h });
      }
      drawText(page, org?.name ?? 'Entreprise', MARGIN, PAGE_HEIGHT - 38, fontBold, 14, WHITE);
      const contactLine = [org?.address, org?.phone, org?.email].filter(Boolean).join(' · ');
      if (contactLine) drawText(page, contactLine, MARGIN, PAGE_HEIGHT - 54, font, 8.5, BAND_MUTED);
      drawText(page, 'RAPPORT DE CHANTIER', MARGIN, PAGE_HEIGHT - 84, fontBold, 15, WHITE);
    };
    drawBand();

    let y = PAGE_HEIGHT - BAND_H - 32;

    const newPage = () => {
      drawFooter(page, font, pageNum, org?.name ?? 'Cantia');
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNum += 1;
      y = PAGE_HEIGHT - MARGIN;
    };

    // ---- Title / meta card ----
    drawText(page, report.title, MARGIN, y, fontBold, 17, INK);
    drawTextRight(page, formatDate(report.created_at), PAGE_WIDTH - MARGIN, y, font, 10, MUTED);
    y -= 22;

    const project = report.projects;
    const metaLines = [
      project?.name ? `Chantier : ${project.name}` : null,
      project?.client_name ? `Client : ${project.client_name}` : null,
      project?.address ? `Adresse : ${project.address}` : null,
    ].filter(Boolean) as string[];
    if (metaLines.length) {
      const boxTop = y;
      let my = y - 12;
      for (const line of metaLines) {
        drawText(page, line, MARGIN + 10, my, font, 10, INK);
        my -= 14;
      }
      const boxBottom = my + 2;
      page.drawRectangle({
        x: MARGIN,
        y: boxBottom,
        width: PAGE_WIDTH - 2 * MARGIN,
        height: boxTop - boxBottom + 4,
        color: PAPER_ALT,
      });
      page.drawRectangle({ x: MARGIN, y: boxBottom, width: 3, height: boxTop - boxBottom + 4, color: ACCENT });
      // Redraw the text on top of the box (order matters: box first, then text).
      my = y - 12;
      for (const line of metaLines) {
        drawText(page, line, MARGIN + 10, my, font, 10, INK);
        my -= 14;
      }
      y = boxBottom - 20;
    }

    // ---- Notes ----
    if (report.notes?.trim()) {
      drawText(page, 'NOTES', MARGIN, y, fontBold, 10, ACCENT);
      y -= 16;
      const lines = wrapText(report.notes, font, 10.5, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        if (y < MARGIN + 60) newPage();
        drawText(page, line, MARGIN, y, font, 10.5, INK);
        y -= 14;
      }
      y -= 10;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
      y -= 20;
    }

    // ---- Photos ----
    const photoList = photos ?? [];
    if (photoList.length > 0) {
      if (y < MARGIN + 240) newPage();
      drawText(page, `PHOTOS (${photoList.length})`, MARGIN, y, fontBold, 10, ACCENT);
      y -= 20;

      const cols = 2;
      const gap = 16;
      const cellW = (PAGE_WIDTH - 2 * MARGIN - gap * (cols - 1)) / cols;
      const imgH = 155;
      const captionH = 36;
      const cardPad = 8;
      const cellH = imgH + captionH + cardPad * 2 + 10;
      let col = 0;

      for (const photo of photoList) {
        if (y - cellH < MARGIN + 30) {
          newPage();
          drawText(page, 'PHOTOS (suite)', MARGIN, y, fontBold, 10, ACCENT);
          y -= 20;
          col = 0;
        }
        const x = MARGIN + col * (cellW + gap);
        const cardTop = y;
        const cardBottom = y - cellH + 10;

        page.drawRectangle({
          x,
          y: cardBottom,
          width: cellW,
          height: cardTop - cardBottom,
          color: rgb(1, 1, 1),
          borderColor: LINE,
          borderWidth: 1,
        });

        const bytes = await fetchStorageBytes(admin, BUCKET, photo.storage_path);
        const imgTop = cardTop - cardPad;
        if (bytes) {
          const img = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
          const innerW = cellW - cardPad * 2;
          const scale = Math.min(innerW / img.width, imgH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawRectangle({ x: x + cardPad, y: imgTop - imgH, width: innerW, height: imgH, color: PAPER_ALT });
          page.drawImage(img, { x: x + cardPad + (innerW - w) / 2, y: imgTop - imgH + (imgH - h) / 2, width: w, height: h });
        }

        let capY = imgTop - imgH - 14;
        if (photo.caption) {
          drawText(page, truncate(photo.caption, fontBold, 9.5, cellW - cardPad * 2), x + cardPad, capY, fontBold, 9.5, INK);
          capY -= 12;
        }
        const coords = formatCoords(photo.latitude, photo.longitude);
        const meta = [coords ? `GPS ${coords}` : null, formatDateTime(photo.taken_at)].filter(Boolean).join('  ·  ');
        drawText(page, truncate(meta, font, 8, cellW - cardPad * 2), x + cardPad, capY, font, 8, MUTED);

        col += 1;
        if (col === cols) {
          col = 0;
          y -= cellH;
        }
      }
      if (col !== 0) y -= cellH;
      y -= 6;
    }

    // ---- Signature ----
    if (org?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.signature_url);
      if (bytes) {
        if (y < MARGIN + 100) newPage();
        const img = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
        const h = 50;
        const w = (img.width / img.height) * h;
        drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y - 12, font, 9, MUTED);
        page.drawImage(img, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 24, width: w, height: h });
      }
    }

    drawFooter(page, font, pageNum, org?.name ?? 'Cantia');

    const pdfBytes = await pdfDoc.save();

    const path = `${report.organization_id}/reports/${report.id}/rapport-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);
    }

    await admin.from('reports').update({ pdf_path: path, status: 'generated' }).eq('id', report_id);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ path, url: signed?.signedUrl ?? null });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function drawFooter(page: PDFPage, font: PDFFont, pageNum: number, brand: string) {
  drawText(page, brand, MARGIN, 24, font, 8, MUTED);
  drawTextRight(page, `Page ${pageNum}`, PAGE_WIDTH - MARGIN, 24, font, 8, MUTED);
}

function truncate(text: string, font: PDFFont, size: number, maxWidth: number): string {
  const safe = sanitizePdfText(text);
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
  let result = safe;
  while (result.length > 1 && font.widthOfTextAtSize(result + '...', size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return result + '...';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
