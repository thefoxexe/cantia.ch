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

const INK = rgb(0.0941, 0.1098, 0.1059);
const MUTED = rgb(0.3608, 0.3961, 0.3765);
const BRAND = rgb(0.1216, 0.2392, 0.2275);
const ACCENT = rgb(0.6902, 0.4118, 0.1725);
const LINE = rgb(0.8824, 0.8706, 0.8314);

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
    const contactLine = [org?.phone, org?.email, org?.website].filter(Boolean).join(' · ');
    if (contactLine) {
      drawText(page, contactLine, MARGIN, y, font, 9, MUTED);
      y -= 12;
    }
    y -= 16;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
    y -= 26;

    // ---- Title / meta ----
    drawText(page, report.title, MARGIN, y, fontBold, 15, INK);
    y -= 20;
    const project = report.projects;
    const metaLines = [
      project?.name ? `Chantier : ${project.name}` : null,
      project?.client_name ? `Client : ${project.client_name}` : null,
      project?.address ? `Adresse : ${project.address}` : null,
      `Date du rapport : ${formatDate(report.created_at)}`,
    ].filter(Boolean) as string[];
    for (const line of metaLines) {
      drawText(page, line, MARGIN, y, font, 10.5, INK);
      y -= 15;
    }
    y -= 12;

    // ---- Notes ----
    if (report.notes?.trim()) {
      drawText(page, 'Notes', MARGIN, y, fontBold, 12, ACCENT);
      y -= 16;
      const lines = wrapText(report.notes, font, 10.5, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        if (y < MARGIN + 60) newPage();
        drawText(page, line, MARGIN, y, font, 10.5, INK);
        y -= 14;
      }
      y -= 14;
    }

    // ---- Photos ----
    const photoList = photos ?? [];
    if (photoList.length > 0) {
      if (y < MARGIN + 220) newPage();
      drawText(page, `Photos (${photoList.length})`, MARGIN, y, fontBold, 12, ACCENT);
      y -= 18;

      const cols = 2;
      const gap = 16;
      const cellW = (PAGE_WIDTH - 2 * MARGIN - gap * (cols - 1)) / cols;
      const imgH = 150;
      const cellH = imgH + 40;
      let col = 0;

      for (const photo of photoList) {
        if (y - cellH < MARGIN + 30) newPage();
        const x = MARGIN + col * (cellW + gap);

        const bytes = await fetchStorageBytes(admin, BUCKET, photo.storage_path);
        if (bytes) {
          const img = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
          const scale = Math.min(cellW / img.width, imgH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawImage(img, { x: x + (cellW - w) / 2, y: y - imgH + (imgH - h), width: w, height: h });
          page.drawRectangle({ x, y: y - imgH, width: cellW, height: imgH, borderColor: LINE, borderWidth: 1 });
        }

        let capY = y - imgH - 13;
        if (photo.caption) {
          drawText(page, truncate(photo.caption, font, 9, cellW), x, capY, font, 9, INK);
          capY -= 12;
        }
        const coords = formatCoords(photo.latitude, photo.longitude);
        const meta = [coords ? `GPS ${coords}` : null, formatDateTime(photo.taken_at)].filter(Boolean).join('  ·  ');
        drawText(page, truncate(meta, font, 8, cellW), x, capY, font, 8, MUTED);

        col += 1;
        if (col === cols) {
          col = 0;
          y -= cellH;
        }
      }
      if (col !== 0) y -= cellH;
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

    drawFooter(page, font, pageNum);

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

function drawFooter(page: PDFPage, font: PDFFont, pageNum: number) {
  drawText(page, 'Généré via Opus', MARGIN, 24, font, 8, MUTED);
  drawText(page, `Page ${pageNum}`, PAGE_WIDTH - MARGIN - 40, 24, font, 8, MUTED);
}

function truncate(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && font.widthOfTextAtSize(result + '…', size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return result + '…';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
