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
  drawRichLine,
  drawText,
  drawTextRight,
  embedImageSmart,
  fetchStorageBytes,
  formatDate,
  formatOrgAddress,
  hexToRgb,
  logoX,
  orgHasCustomization,
  pickReadableTextColor,
  resolveBrand,
  resolveFooterText,
  resolveLogoPlacement,
  resolvePdfTemplate,
  tint,
  wrapRichText,
  wrapText,
  type LogoPlacement,
} from '../_shared/pdf-helpers.ts';

// Fixed (not brand-tinted) — an anomaly flag reads the same regardless of
// which brand color the org picked, same way lib/theme.ts's warning token
// is independent of primary/accent.
const WARNING = hexToRgb('#9C6510');
const WARNING_SOFT = hexToRgb('#F3E8D6');
const WARNING_BORDER = hexToRgb('#DCC58F');

interface ReportStructuredContent {
  summary: string;
  sections: { label: string; text: string; photo_indexes: number[] }[];
  attention: { text: string; photo_indexes: number[] }[];
  next_steps: string | null;
}

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
  drawTextRight(page, formatDate(report.created_at), PAGE_WIDTH - MARGIN, y, font, 8.5, MUTED);
  y -= 22;
  // Wrapped rather than a single fixed line: the AI now writes a
  // descriptive title (e.g. "Pose des meubles bas et adaptation de
  // l'arrivée d'eau") instead of the old date-only placeholder, which at
  // 19pt bold routinely ran past the page width and collided with the date
  // that used to sit to its right on the same line.
  const titleLines = wrapText(report.title, fontBold, 19, PAGE_WIDTH - 2 * MARGIN);
  for (const line of titleLines) {
    drawText(page, line, MARGIN, y, fontBold, 19, INK);
    y -= 23;
  }
  y -= 3;

  const project = report.projects;
  const metaLines = [
    project?.name ? `Chantier : ${project.name}` : null,
    project?.client_name ? `Client : ${project.client_name}` : null,
    project?.address ? `Adresse : ${project.address}` : null,
  ].filter(Boolean) as string[];
  if (metaLines.length) {
    const boxTop = y;
    let my = y - 12;
    for (const _line of metaLines) my -= 14;
    const boxBottom = my + 4;
    page.drawRectangle({ x: MARGIN, y: boxBottom, width: PAGE_WIDTH - 2 * MARGIN, height: boxTop - boxBottom + 6, color: PAPER_ALT });
    page.drawRectangle({ x: MARGIN, y: boxBottom, width: 3, height: boxTop - boxBottom + 6, color: brand });
    my = y - 12;
    for (const line of metaLines) {
      drawText(page, line, MARGIN + 12, my, font, 10, INK);
      my -= 14;
    }
    y = boxBottom - 26;
  }

  // A small filled dot, inline with the label's cap-height — reads as a
  // bullet/marker rather than the disconnected-looking vertical tick this
  // used to be (a 3×10 bar floating a few points off the text baseline).
  const sectionLabel = (label: string) => {
    page.drawEllipse({ x: MARGIN + 2.5, y: y - 3, xScale: 2.5, yScale: 2.5, color: brand });
    drawText(page, label, MARGIN + 13, y, fontBold, 9.5, MUTED);
  };

  // Set by the 'intro' drawer below so 'photos' can skip whatever already
  // ran inline next to a section/point d'attention — nothing is dropped
  // either way: a photo referenced by structured_content still appears in
  // the trailing grid if it wasn't one of the (at most one per
  // section/point) actually drawn inline.
  const usedPhotoIndexes = new Set<number>();

  // Fetches one photo and draws it scaled-to-fit inside a fixed box —
  // shared by the section and point-d'attention inline thumbnails below.
  // Silently draws nothing (just the placeholder tint) if the photo can't
  // be embedded, same graceful-degradation as drawPhotoGrid.
  async function drawInlinePhoto(index: number, x: number, yTop: number, w: number, h: number) {
    const photo = photos[index];
    if (!photo) return;
    page.drawRectangle({ x, y: yTop - h, width: w, height: h, color: PAPER_ALT });
    const bytes = await fetchStorageBytes(admin, BUCKET, photo.storage_path);
    if (!bytes) return;
    const img = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    if (!img) return;
    const scale = Math.min(w / img.width, h / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    page.drawImage(img, { x: x + (w - iw) / 2, y: yTop - h + (h - ih) / 2, width: iw, height: ih });
  }

  await runSections(sections, {
    intro: async () => {
      const structured = report.structured_content as ReportStructuredContent | null;
      if (structured && Array.isArray(structured.sections) && structured.sections.length > 0) {
        // ---- "En bref" summary chip ----
        if (structured.summary?.trim()) {
          const chipLines = wrapText(structured.summary, font, 10, PAGE_WIDTH - 2 * MARGIN - 20);
          const chipH = chipLines.length * 14.5 + 24;
          if (y < MARGIN + chipH + 40) newPage();
          page.drawRectangle({ x: MARGIN, y: y - chipH, width: PAGE_WIDTH - 2 * MARGIN, height: chipH, color: tint(brand, 0.88) });
          let cy = y - 16;
          drawText(page, 'EN BREF', MARGIN + 10, cy, fontBold, 8, brand);
          cy -= 16;
          for (const line of chipLines) {
            drawText(page, line, MARGIN + 10, cy, font, 10, INK);
            cy -= 14.5;
          }
          y -= chipH + 24;
        }

        // ---- sections (each an optional inline photo + a short paragraph) ----
        for (const section of structured.sections) {
          const photoIdx = section.photo_indexes.find((i) => photos[i]);
          const hasPhoto = photoIdx != null;
          const PHOTO_W = 72;
          const PHOTO_H = 54;
          const textX = hasPhoto ? MARGIN + PHOTO_W + 14 : MARGIN;
          const textWidth = PAGE_WIDTH - MARGIN - textX;
          const lines = wrapText(section.text, font, 10, textWidth);
          const blockH = Math.max(hasPhoto ? PHOTO_H : 0, lines.length * 14.5) + 30;
          if (y < MARGIN + blockH + 30) newPage();

          sectionLabel(section.label.toUpperCase());
          y -= 20;
          const blockTop = y;
          if (hasPhoto) await drawInlinePhoto(photoIdx!, MARGIN, blockTop, PHOTO_W, PHOTO_H);
          if (hasPhoto) usedPhotoIndexes.add(photoIdx!);
          let ty = blockTop;
          for (const line of lines) {
            drawText(page, line, textX, ty, font, 10, INK);
            ty -= 14.5;
          }
          y = blockTop - Math.max(hasPhoto ? PHOTO_H : 0, lines.length * 14.5) - 26;
        }

        // ---- points d'attention ----
        for (const item of structured.attention) {
          const photoIdx = item.photo_indexes.find((i) => photos[i]);
          const hasPhoto = photoIdx != null;
          const PHOTO_SIZE = 46;
          const padX = 10;
          const iconColW = 24;
          const textX = MARGIN + padX + iconColW;
          const textWidth = PAGE_WIDTH - MARGIN - padX - textX - (hasPhoto ? PHOTO_SIZE + 12 : 0);
          const lines = wrapText(item.text, font, 9.8, textWidth);
          // 27pt from box top to the first line's baseline (room for the
          // icon + "POINT D'ATTENTION" label above it), 13.5pt per
          // subsequent line, 14pt of bottom padding below the last line.
          const contentH = Math.max(27 + (lines.length - 1) * 13.5 + 14, hasPhoto ? PHOTO_SIZE + 16 : 0);
          if (y < MARGIN + contentH + 30) newPage();

          const boxTop = y;
          const boxBottom = boxTop - contentH;
          page.drawRectangle({
            x: MARGIN,
            y: boxBottom,
            width: PAGE_WIDTH - 2 * MARGIN,
            height: contentH,
            color: WARNING_SOFT,
            borderColor: WARNING_BORDER,
            borderWidth: 1,
          });
          const iconCx = MARGIN + padX + 7;
          const iconCy = boxTop - 16;
          page.drawEllipse({ x: iconCx, y: iconCy, xScale: 7.5, yScale: 7.5, color: WARNING });
          drawText(page, '!', iconCx - 2, iconCy - 4, fontBold, 10, WHITE);
          drawText(page, "POINT D'ATTENTION", textX, boxTop - 13, fontBold, 8.5, WARNING);
          let ty = boxTop - 27;
          for (const line of lines) {
            drawText(page, line, textX, ty, font, 9.8, INK);
            ty -= 13.5;
          }
          if (hasPhoto) {
            await drawInlinePhoto(photoIdx!, PAGE_WIDTH - MARGIN - padX - PHOTO_SIZE, boxTop - 8, PHOTO_SIZE, PHOTO_SIZE);
            usedPhotoIndexes.add(photoIdx!);
          }
          y = boxBottom - 22;
        }

        // ---- next steps ----
        if (structured.next_steps?.trim()) {
          const lines = wrapText(structured.next_steps, font, 9.8, PAGE_WIDTH - 2 * MARGIN - 60);
          const h = lines.length * 13.5 + 8;
          if (y < MARGIN + h + 20) newPage();
          drawText(page, 'SUITE ->', MARGIN, y, fontBold, 8.5, brand);
          let ty = y;
          for (const line of lines) {
            drawText(page, line, MARGIN + 52, ty, font, 9.8, INK);
            ty -= 13.5;
          }
          y -= h + 16;
        }

        y -= 10;
        page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
        y -= 26;
        return;
      }

      // Fallback for reports with no AI-structured breakdown (older
      // reports, or notes edited by hand after structuring — see
      // rapports/[reportId].tsx's saveEdits) — identical to the original
      // flat-paragraph rendering.
      if (!report.notes?.trim()) return;
      sectionLabel('NOTES');
      y -= 20;
      const lines = wrapRichText(report.notes, font, fontBold, 10, PAGE_WIDTH - 2 * MARGIN);
      for (const line of lines) {
        if (y < MARGIN + 60) newPage();
        drawRichLine(page, line, MARGIN, y, font, fontBold, 10, INK);
        y -= 14.5;
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
      // Photos already shown inline next to a section or point d'attention
      // (see 'intro' above) are skipped here — everything else still gets
      // its own card, so nothing uploaded is ever silently left out of the
      // document.
      const remaining = photos.filter((_, i) => !usedPhotoIndexes.has(i));
      if (!remaining.length) return;
      if (y < MARGIN + 240) newPage();
      const label = usedPhotoIndexes.size > 0 ? `AUTRES PHOTOS (${remaining.length})` : `PHOTOS (${remaining.length})`;
      sectionLabel(label);
      y -= 20;
      const state = await drawPhotoGrid({
        pdfDoc,
        admin,
        bucket: BUCKET,
        page,
        pageNum,
        y,
        photos: remaining,
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
