import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
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
  formatOrgAddress,
  logoX,
  orgHasCustomization,
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
  signatureLabel: string;
  brand: RGB;
  textOnBrand: RGB;
  logoPlacement: LogoPlacement;
  footerText: string | null;
  sections: SectionId[];
  admin: ReturnType<typeof createClient>;
}

// Every renderer shares this shape: draw the fixed header/title/meta block,
// then walk the template's `sections` in order, calling whichever of these
// drawers matches — a section id the renderer doesn't know how to draw is
// silently skipped rather than crashing, since `sections` is data an org
// could one day edit.
type SectionDrawers = Partial<Record<SectionId, () => void | Promise<void>>>;

async function runSections(sections: SectionId[], drawers: SectionDrawers) {
  for (const id of sections) {
    const drawer = drawers[id];
    if (drawer) await drawer();
  }
}

// Draws a self-contained (no network, can't fail) locator diagram plotting
// each photo's GPS point relative to the others — not a real basemap (no
// tile server call from the edge function), but a reliable "where were
// these photos taken relative to each other" schematic: north up, dots
// scaled to fit the bounding box of the coordinates, numbered to match
// photo order. Only meaningful once photos are actually scattered across
// more than one spot, so callers should skip this when every photo shares
// (near enough) the same coordinates.
function drawGpsMap(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  points: { lat: number; lng: number }[],
  font: PDFFont,
  brand: RGB,
) {
  page.drawRectangle({ x, y: y - height, width, height, borderColor: LINE, borderWidth: 1, color: PAPER_ALT });

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 0.0001;
  const lngSpan = maxLng - minLng || 0.0001;

  const pad = 24;
  const plotX = x + pad;
  const plotY = y - height + pad;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;

  points.forEach((pt, i) => {
    const px = plotX + ((pt.lng - minLng) / lngSpan) * plotW;
    const py = plotY + ((pt.lat - minLat) / latSpan) * plotH;
    page.drawEllipse({ x: px, y: py, xScale: 4, yScale: 4, color: brand });
    drawText(page, String(i + 1), px + 7, py - 3, font, 8, MUTED);
  });

  drawText(page, 'N', x + width / 2 - 3, y - 12, font, 8, MUTED);
  drawText(
    page,
    'Localisation relative des photos (nord en haut, schéma non cartographique)',
    x,
    y - height - 12,
    font,
    7.5,
    MUTED,
  );
}

// Single unified report layout — sober header with logo, brand-colored
// title, notes, optional GPS locator, photo grid, then signatures.
// Previously offered 4 selectable designs (classic/moderne/minimal/
// structure); collapsed to this one so brand color is the only
// customization left, matching the devis/facture unification. RENDERERS/
// TemplateId are kept (rather than removed) so every existing pdf_templates
// row's base_layout value still resolves without a migration.
async function renderReportUnified(ctx: RenderCtx): Promise<Uint8Array> {
  const { pdfDoc, admin, font, fontBold, org, report, photos, logoImg, signatureImg, signatureLabel, brand, logoPlacement, footerText, sections } = ctx;
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
    // Sized by width, not a fixed height — a wide/landscape logo drawn at a
    // fixed 42pt height could stretch to an oversized, disproportionate
    // banner (e.g. a wordmark logo). Capping the width to a sensible
    // fraction of the page and deriving height from the image's own aspect
    // ratio keeps every logo shape looking intentional next to the company
    // name, instead of "correct" only for roughly-square logos.
    const maxW = 130;
    const naturalH = (logoImg.height / logoImg.width) * maxW;
    const h = Math.min(46, naturalH);
    const w = (logoImg.width / logoImg.height) * h;
    // A logo placed 'left' or 'center' shares the same horizontal band as
    // the company name/title below it — drawn at the same y without
    // reserving room, it would sit directly on top of that text. Only
    // 'right' is naturally clear of the left-anchored text column, so only
    // that placement keeps the side-by-side look; left/center get their own
    // row above the text instead.
    if (logoPlacement === 'right') {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 10, width: w, height: h });
    } else {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h, width: w, height: h });
      y -= h + 14;
    }
  }
  drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 16, brand);
  y -= 15;
  const contactLine = [formatOrgAddress(org), org?.phone, org?.email].filter(Boolean).join(' · ');
  if (contactLine) {
    drawText(page, contactLine, MARGIN, y, font, 9, MUTED);
    y -= 13;
  }
  y -= 10;
  page.drawRectangle({ x: MARGIN, y: y - 1, width: PAGE_WIDTH - 2 * MARGIN, height: 2, color: brand });
  y -= 26;

  drawText(page, 'RAPPORT DE CHANTIER', MARGIN, y, fontBold, 8.5, MUTED);
  y -= 22;
  drawText(page, report.title, MARGIN, y, fontBold, 19, INK);
  drawTextRight(page, formatDate(report.created_at), PAGE_WIDTH - MARGIN, y - 3, font, 10, MUTED);
  y -= 26;

  const project = report.projects;
  const metaLines = [
    project?.name ? `Chantier : ${project.name}` : null,
    project?.client_name ? `Client : ${project.client_name}` : null,
    project?.address ? `Adresse : ${project.address}` : null,
  ].filter(Boolean) as string[];
  if (metaLines.length) {
    const boxTop = y;
    let my = y - 10;
    for (const _line of metaLines) my -= 13;
    const boxBottom = my + 3;
    page.drawRectangle({ x: MARGIN, y: boxBottom, width: PAGE_WIDTH - 2 * MARGIN, height: boxTop - boxBottom + 4, color: PAPER_ALT });
    page.drawRectangle({ x: MARGIN, y: boxBottom, width: 3, height: boxTop - boxBottom + 4, color: brand });
    my = y - 10;
    for (const line of metaLines) {
      drawText(page, line, MARGIN + 10, my, font, 10, INK);
      my -= 13;
    }
    y = boxBottom - 22;
  }

  const sectionLabel = (label: string) => {
    page.drawRectangle({ x: MARGIN, y: y - 8, width: 3, height: 10, color: brand });
    drawText(page, label, MARGIN + 10, y, fontBold, 10, MUTED);
  };

  await runSections(sections, {
    intro: () => {
      if (!report.notes?.trim()) return;
      sectionLabel('NOTES');
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
    map: () => {
      const points = photos
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) }));
      if (points.length < 2) return;
      // Only worth drawing once the photos are actually spread out — a
      // handful of shots taken standing in the same spot would just plot as
      // one dot, which isn't useful.
      const spread = Math.max(...points.map((p) => p.lat)) - Math.min(...points.map((p) => p.lat));
      const spreadLng = Math.max(...points.map((p) => p.lng)) - Math.min(...points.map((p) => p.lng));
      if (spread < 0.0001 && spreadLng < 0.0001) return;
      const MAP_H = 160;
      if (y < MARGIN + MAP_H + 40) newPage();
      sectionLabel('LOCALISATION');
      y -= 16;
      drawGpsMap(page, MARGIN, y, PAGE_WIDTH - 2 * MARGIN, MAP_H, points, font, brand);
      y -= MAP_H + 20;
    },
    photos: async () => {
      if (!photos.length) return;
      if (y < MARGIN + 240) newPage();
      sectionLabel(`PHOTOS (${photos.length})`);
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
        onNewPage: (p, n) => drawFooter(p, font, n, footerText ?? org?.name ?? 'Cantia'),
      });
      page = state.page;
      pageNum = state.pageNum;
      y = state.y;
    },
    // A rapport is signed by whoever wrote it, not "the company" — and
    // unlike a devis, there's no client counter-signature to collect, so
    // this simply doesn't draw anything when the author hasn't uploaded a
    // personal signature (no forced blank slot).
    signature: () => {
      if (!signatureImg) return;
      const h = 50;
      const w = (signatureImg.width / signatureImg.height) * h;
      if (y < MARGIN + 90) newPage();
      const startX = PAGE_WIDTH - MARGIN - w;
      drawText(page, signatureLabel, startX, y, font, 9, MUTED);
      page.drawImage(signatureImg, { x: startX, y: y - h - 10, width: w, height: h });
      y -= h + 24;
    },
  });

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

const RENDERERS: Record<TemplateId, (ctx: RenderCtx) => Promise<Uint8Array>> = {
  classic: renderReportUnified,
  moderne: renderReportUnified,
  minimal: renderReportUnified,
  structure: renderReportUnified,
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

    const [{ data: org }, { data: photos }, { data: creator }] = await Promise.all([
      admin.from('organizations').select('*, plans(has_customization)').eq('id', report.organization_id).single(),
      admin
        .from('report_photos')
        .select('*')
        .eq('report_id', report_id)
        .order('sort_order', { ascending: true }),
      report.created_by
        ? admin
            .from('organization_members')
            .select('full_name, signature_url')
            .eq('organization_id', report.organization_id)
            .eq('user_id', report.created_by)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let logoImg: PDFImage | null = null;
    if (org?.logo_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.logo_url);
      if (bytes) logoImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }
    // The report author's own personal signature, not org.signature_url —
    // see the `signature` section drawer above.
    let signatureImg: PDFImage | null = null;
    if (creator?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, creator.signature_url);
      if (bytes) signatureImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }
    const signatureLabel = creator?.full_name ? `Signature ${creator.full_name}` : 'Signature';

    const template = await resolvePdfTemplate(admin, report.organization_id, 'report', report.template_id);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org, orgHasCustomization(org));
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
      signatureLabel,
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
