import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
  ACCENT,
  BAND_MUTED,
  INK,
  LINE,
  MARGIN,
  MUTED,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PAPER_ALT,
  WHITE,
  drawFooter,
  drawPhotoGrid,
  drawText,
  drawTextRight,
  embedImageSmart,
  fetchStorageBytes,
  formatDate,
  logoX,
  pickReadableTextColor,
  resolveBrand,
  resolveFooterText,
  resolveLogoPlacement,
  resolvePdfTemplate,
  wrapText,
  type LogoPlacement,
} from '../_shared/pdf-helpers.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type TemplateId = 'classic' | 'moderne' | 'minimal' | 'structure';
type SectionId = 'intro' | 'photos' | 'map' | 'signature';

interface RenderCtx {
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  org: any;
  report: any;
  photos: any[];
  logoImg: PDFImage | null;
  signatureImg: PDFImage | null;
  brand: RGB;
  textOnBrand: RGB;
  logoPlacement: LogoPlacement;
  footerText: string | null;
  sections: SectionId[];
  admin: ReturnType<typeof createClient>;
}

// Every renderer shares this shape: draw the fixed header/title/meta block,
// then walk the template's `sections` in order, calling whichever of these
// drawers matches — a section id the renderer doesn't know how to draw
// (currently just 'map', reserved for a later phase) is silently skipped
// rather than crashing, since `sections` is data an org could one day edit.
type SectionDrawers = Partial<Record<SectionId, () => void | Promise<void>>>;

async function runSections(sections: SectionId[], drawers: SectionDrawers) {
  for (const id of sections) {
    const drawer = drawers[id];
    if (drawer) await drawer();
  }
}

// ---------------------------------------------------------------------------
// Template: classic — sober header, thin rule, understated (default)
// ---------------------------------------------------------------------------
async function renderReportClassic(ctx: RenderCtx): Promise<Uint8Array> {
  const { pdfDoc, admin, font, fontBold, org, report, photos, logoImg, signatureImg, brand, logoPlacement, footerText, sections } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? 'Généré via Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  if (logoImg) {
    const h = 42;
    const w = (logoImg.width / logoImg.height) * h;
    // A logo placed 'left' or 'center' shares the same horizontal band as
    // the company name/title below it — drawn at the same y without
    // reserving room, it used to sit directly on top of that text. Only
    // 'right' is naturally clear of the left-anchored text column, so only
    // that placement keeps the side-by-side look; left/center get their own
    // row above the text instead (same fix pattern as the minimal template,
    // which never had this bug).
    if (logoPlacement === 'right') {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 10, width: w, height: h });
    } else {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h, width: w, height: h });
      y -= h + 12;
    }
  }
  drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 15, brand);
  y -= 14;
  const contactLine = [org?.address, org?.phone, org?.email].filter(Boolean).join(' · ');
  if (contactLine) {
    drawText(page, contactLine, MARGIN, y, font, 9, MUTED);
    y -= 12;
  }
  y -= 14;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
  y -= 24;

  drawText(page, 'Rapport de chantier', MARGIN, y, font, 9.5, MUTED);
  y -= 18;
  drawText(page, report.title, MARGIN, y, fontBold, 16, ACCENT);
  drawTextRight(page, formatDate(report.created_at), PAGE_WIDTH - MARGIN, y, font, 10, MUTED);
  y -= 22;

  const project = report.projects;
  const metaLines = [
    project?.name ? `Chantier : ${project.name}` : null,
    project?.client_name ? `Client : ${project.client_name}` : null,
    project?.address ? `Adresse : ${project.address}` : null,
  ].filter(Boolean) as string[];
  for (const line of metaLines) {
    drawText(page, line, MARGIN, y, font, 10.5, INK);
    y -= 14;
  }
  y -= 12;

  await runSections(sections, {
    intro: () => {
      if (!report.notes?.trim()) return;
      drawText(page, 'NOTES', MARGIN, y, fontBold, 10, MUTED);
      y -= 16;
      const lines = wrapText(report.notes, font, 10, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        if (y < MARGIN + 60) newPage();
        drawText(page, line, MARGIN, y, font, 10, INK);
        y -= 13;
      }
      y -= 10;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
      y -= 20;
    },
    photos: async () => {
      if (!photos.length) return;
      if (y < MARGIN + 240) newPage();
      drawText(page, `PHOTOS (${photos.length})`, MARGIN, y, fontBold, 10, MUTED);
      y -= 20;
      const state = await drawPhotoGrid({
        pdfDoc,
        admin,
        bucket: BUCKET,
        page,
        pageNum,
        y,
        photos,
        font,
        fontBold,
        labelColor: MUTED,
        cardBorder: LINE,
        cardBg: WHITE,
        onNewPage: (p, n) => drawFooter(p, font, n, footerText ?? 'Généré via Cantia'),
      });
      page = state.page;
      pageNum = state.pageNum;
      y = state.y;
    },
    signature: () => {
      if (!signatureImg) return;
      if (y < MARGIN + 90) newPage();
      const h = 50;
      const w = (signatureImg.width / signatureImg.height) * h;
      drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
      page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
      y -= h + 20;
    },
  });

  drawFooter(page, font, pageNum, footerText ?? 'Généré via Cantia');
  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Template: moderne — bold brand header band, big white title
// ---------------------------------------------------------------------------
async function renderReportModerne(ctx: RenderCtx): Promise<Uint8Array> {
  const { pdfDoc, admin, font, fontBold, org, report, photos, logoImg, signatureImg, brand, textOnBrand, logoPlacement, footerText, sections } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNum = 1;

  const BAND_H = 108;
  // 'left'/'center' logos share the band's left-anchored text column — the
  // fixed-offset badge used to sit right on top of the title (visible bug:
  // the logo box overlapping "RAPPORT DE CHANTIER"). Only 'right' is
  // naturally clear of that text, so only 'right' keeps the compact
  // side-by-side band; left/center get a taller band with the logo on its
  // own row above the text instead.
  const stackLogo = Boolean(logoImg) && logoPlacement !== 'right';
  const shift = stackLogo ? 48 : 0;
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - BAND_H - shift, width: PAGE_WIDTH, height: BAND_H + shift, color: brand });
  if (logoImg) {
    const h = 36;
    const w = (logoImg.width / logoImg.height) * h;
    const lx = logoX(logoPlacement, PAGE_WIDTH, MARGIN, w);
    const badgeY = stackLogo ? PAGE_HEIGHT - h - 24 : PAGE_HEIGHT - BAND_H + 18;
    const imgY = stackLogo ? PAGE_HEIGHT - h - 18 : PAGE_HEIGHT - BAND_H + 24;
    page.drawRectangle({ x: lx - 6, y: badgeY, width: w + 12, height: h + 12, color: WHITE });
    page.drawImage(logoImg, { x: lx, y: imgY, width: w, height: h });
  }
  drawText(page, org?.name ?? 'Entreprise', MARGIN, PAGE_HEIGHT - shift - 38, fontBold, 14, textOnBrand);
  const contactLine = [org?.address, org?.phone, org?.email].filter(Boolean).join(' · ');
  if (contactLine) drawText(page, contactLine, MARGIN, PAGE_HEIGHT - shift - 54, font, 8.5, textOnBrand === WHITE ? BAND_MUTED : MUTED);
  drawText(page, 'RAPPORT DE CHANTIER', MARGIN, PAGE_HEIGHT - shift - 84, fontBold, 15, textOnBrand);

  let y = PAGE_HEIGHT - BAND_H - shift - 32;
  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

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
    for (const _line of metaLines) {
      my -= 14;
    }
    const boxBottom = my + 2;
    page.drawRectangle({ x: MARGIN, y: boxBottom, width: PAGE_WIDTH - 2 * MARGIN, height: boxTop - boxBottom + 4, color: PAPER_ALT });
    page.drawRectangle({ x: MARGIN, y: boxBottom, width: 3, height: boxTop - boxBottom + 4, color: ACCENT });
    my = y - 12;
    for (const line of metaLines) {
      drawText(page, line, MARGIN + 10, my, font, 10, INK);
      my -= 14;
    }
    y = boxBottom - 20;
  }

  await runSections(sections, {
    intro: () => {
      if (!report.notes?.trim()) return;
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
    },
    photos: async () => {
      if (!photos.length) return;
      if (y < MARGIN + 240) newPage();
      drawText(page, `PHOTOS (${photos.length})`, MARGIN, y, fontBold, 10, ACCENT);
      y -= 20;
      const state = await drawPhotoGrid({
        pdfDoc,
        admin,
        bucket: BUCKET,
        page,
        pageNum,
        y,
        photos,
        font,
        fontBold,
        labelColor: brand,
        cardBorder: LINE,
        cardBg: WHITE,
        onNewPage: (p, n) => drawFooter(p, font, n, footerText ?? org?.name ?? 'Cantia'),
      });
      page = state.page;
      pageNum = state.pageNum;
      y = state.y;
    },
    signature: () => {
      if (!signatureImg) return;
      if (y < MARGIN + 100) newPage();
      const h = 50;
      const w = (signatureImg.width / signatureImg.height) * h;
      drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y - 12, font, 9, MUTED);
      page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 24, width: w, height: h });
      y -= h + 34;
    },
  });

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Template: minimal — generous whitespace, thin rules only, no color blocks
// ---------------------------------------------------------------------------
async function renderReportMinimal(ctx: RenderCtx): Promise<Uint8Array> {
  const { pdfDoc, admin, font, fontBold, org, report, photos, logoImg, signatureImg, logoPlacement, footerText, sections } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN - 10;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  if (logoImg) {
    const h = 30;
    const w = (logoImg.width / logoImg.height) * h;
    page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 8, width: w, height: h });
    y -= h + 18;
  }

  drawText(page, (org?.name ?? 'Entreprise').toUpperCase(), MARGIN, y, font, 10, MUTED);
  y -= 32;
  drawText(page, report.title, MARGIN, y, fontBold, 22, INK);
  y -= 20;
  drawText(page, formatDate(report.created_at), MARGIN, y, font, 9.5, MUTED);
  y -= 36;

  const project = report.projects;
  const metaLines = [
    project?.name ? `Chantier : ${project.name}` : null,
    project?.client_name ? `Client : ${project.client_name}` : null,
    project?.address ? `Adresse : ${project.address}` : null,
  ].filter(Boolean) as string[];
  for (const line of metaLines) {
    drawText(page, line, MARGIN, y, font, 10.5, INK);
    y -= 14;
  }
  y -= 18;

  await runSections(sections, {
    intro: () => {
      if (!report.notes?.trim()) return;
      const lines = wrapText(report.notes, font, 10.5, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        if (y < MARGIN + 60) newPage();
        drawText(page, line, MARGIN, y, font, 10.5, INK);
        y -= 14;
      }
      y -= 20;
    },
    photos: async () => {
      if (!photos.length) return;
      if (y < MARGIN + 240) newPage();
      const state = await drawPhotoGrid({
        pdfDoc,
        admin,
        bucket: BUCKET,
        page,
        pageNum,
        y,
        photos,
        font,
        fontBold,
        labelColor: MUTED,
        cardBorder: null,
        cardBg: null,
        onNewPage: (p, n) => drawFooter(p, font, n, footerText ?? org?.name ?? 'Cantia'),
      });
      page = state.page;
      pageNum = state.pageNum;
      y = state.y;
    },
    signature: () => {
      if (!signatureImg) return;
      if (y < MARGIN + 80) newPage();
      const h = 44;
      const w = (signatureImg.width / signatureImg.height) * h;
      page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h, width: w, height: h });
      y -= h + 14;
    },
  });

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Template: structure — bordered boxes, solid brand-colored section bars
// ---------------------------------------------------------------------------
async function renderReportStructure(ctx: RenderCtx): Promise<Uint8Array> {
  const { pdfDoc, admin, font, fontBold, org, report, photos, logoImg, signatureImg, brand, textOnBrand, logoPlacement, footerText, sections } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  if (logoImg) {
    const h = 40;
    const w = (logoImg.width / logoImg.height) * h;
    if (logoPlacement === 'right') {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 6, width: w, height: h });
    } else {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h, width: w, height: h });
      y -= h + 10;
    }
  }
  drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 15, brand);
  y -= 16;
  const contactLine = [org?.address, org?.phone, org?.email].filter(Boolean).join(' · ');
  if (contactLine) {
    drawText(page, contactLine, MARGIN, y, font, 8.5, MUTED);
    y -= 14;
  }
  y -= 10;

  page.drawRectangle({ x: MARGIN, y: y - 26, width: PAGE_WIDTH - 2 * MARGIN, height: 26, color: PAPER_ALT });
  drawText(page, `RAPPORT — ${report.title}`, MARGIN + 8, y - 18, fontBold, 11, INK);
  drawTextRight(page, formatDate(report.created_at), PAGE_WIDTH - MARGIN - 8, y - 18, font, 9.5, MUTED);
  y -= 40;

  const project = report.projects;
  const metaLines = [
    project?.name ? `Chantier : ${project.name}` : null,
    project?.client_name ? `Client : ${project.client_name}` : null,
    project?.address ? `Adresse : ${project.address}` : null,
  ].filter(Boolean) as string[];
  if (metaLines.length) {
    const boxTop = y;
    let my = y - 14;
    for (const _line of metaLines) my -= 13;
    const boxBottom = my + 2;
    page.drawRectangle({
      x: MARGIN,
      y: boxBottom,
      width: PAGE_WIDTH - 2 * MARGIN,
      height: boxTop - boxBottom,
      borderColor: LINE,
      borderWidth: 1,
    });
    my = y - 14;
    for (const line of metaLines) {
      drawText(page, line, MARGIN + 8, my, font, 10, INK);
      my -= 13;
    }
    y = boxBottom - 20;
  }

  const sectionBar = (label: string) => {
    page.drawRectangle({ x: MARGIN, y: y - 18, width: PAGE_WIDTH - 2 * MARGIN, height: 18, color: brand });
    drawText(page, label, MARGIN + 8, y - 13, fontBold, 8.5, textOnBrand);
    y -= 26;
  };

  await runSections(sections, {
    intro: () => {
      if (!report.notes?.trim()) return;
      sectionBar('NOTES');
      const lines = wrapText(report.notes, font, 9.5, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        if (y < MARGIN + 60) newPage();
        drawText(page, line, MARGIN, y, font, 9.5, INK);
        y -= 13;
      }
      y -= 14;
    },
    photos: async () => {
      if (!photos.length) return;
      if (y < MARGIN + 240) newPage();
      sectionBar(`PHOTOS (${photos.length})`);
      const state = await drawPhotoGrid({
        pdfDoc,
        admin,
        bucket: BUCKET,
        page,
        pageNum,
        y,
        photos,
        font,
        fontBold,
        labelColor: brand,
        cardBorder: LINE,
        cardBg: PAPER_ALT,
        onNewPage: (p, n) => drawFooter(p, font, n, footerText ?? org?.name ?? 'Cantia'),
      });
      page = state.page;
      pageNum = state.pageNum;
      y = state.y;
    },
    signature: () => {
      if (!signatureImg) return;
      if (y < MARGIN + 90) newPage();
      const h = 46;
      const w = (signatureImg.width / signatureImg.height) * h;
      drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
      page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
      y -= h + 20;
    },
  });

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

const RENDERERS: Record<TemplateId, (ctx: RenderCtx) => Promise<Uint8Array>> = {
  classic: renderReportClassic,
  moderne: renderReportModerne,
  minimal: renderReportMinimal,
  structure: renderReportStructure,
};

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
    let signatureImg: PDFImage | null = null;
    if (org?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.signature_url);
      if (bytes) signatureImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    const template = await resolvePdfTemplate(admin, report.organization_id, 'report', report.template_id);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org);
    const knownSections: SectionId[] = ['intro', 'photos', 'map', 'signature'];
    const sections = (Array.isArray(template.sections) ? template.sections : ['intro', 'photos', 'signature']).filter((s: string) =>
      knownSections.includes(s as SectionId),
    ) as SectionId[];

    const pdfBytes = await RENDERERS[template.base_layout]({
      pdfDoc,
      font,
      fontBold,
      org,
      report,
      photos: photos ?? [],
      logoImg,
      signatureImg,
      brand,
      textOnBrand: pickReadableTextColor(brand),
      logoPlacement: resolveLogoPlacement(template, org),
      footerText,
      sections,
      admin,
    });

    const path = `${report.organization_id}/reports/${report.id}/rapport-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);
    }

    await admin.from('reports').update({ pdf_path: path, status: 'generated' }).eq('id', report_id);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ path, url: signed?.signedUrl ?? null, template: template.base_layout });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
