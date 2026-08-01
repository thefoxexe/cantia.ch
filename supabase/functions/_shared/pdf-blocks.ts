// Renders a free-canvas ('custom') pdf_templates layout — an admin-authored
// list of positioned PdfBlock objects — as a PDF, alongside the 4 hand-coded
// preset renderers in generate-devis-pdf/generate-report-pdf. Reuses the
// exact same low-level pdf-lib primitives those renderers use (drawText,
// drawImage, drawRectangle via pdf-helpers.ts) — no new rendering technology,
// just a data-driven dispatch instead of hand-written per-template code.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB } from 'npm:pdf-lib@1.17.1';
import {
  INK,
  LINE,
  MARGIN,
  MUTED,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  WHITE,
  drawFooter,
  drawPhotoGrid,
  drawText,
  drawTextRight,
  formatChf,
  formatDate,
  hexToRgb,
  wrapText,
  type PdfBlock,
  type PdfBlockBinding,
} from './pdf-helpers.ts';

const HEX_RE = /^#[0-9a-f]{6}$/i;

function resolveColor(hex: string | null | undefined, fallback: RGB): RGB {
  return hex && HEX_RE.test(hex) ? hexToRgb(hex) : fallback;
}

// Blocks are authored in top-left/y-down coordinates (matches how a mobile
// canvas editor naturally works: drag down = y increases) — pdf-lib draws
// bottom-left/y-up, so every block position is converted through these two
// helpers, and nowhere else, keeping the conversion a single choke point.
function blockTopY(block: PdfBlock): number {
  return PAGE_HEIGHT - block.y;
}
function blockBottomY(block: PdfBlock): number {
  return PAGE_HEIGHT - block.y - block.height;
}

interface CustomLayoutCtx {
  pdfDoc: PDFDocument;
  admin: ReturnType<typeof createClient>;
  bucket: string;
  font: PDFFont;
  fontBold: PDFFont;
  org: any;
  doc: any; // the devis or report row
  photos?: any[]; // report only
  items?: any[]; // devis only
  logoImg: PDFImage | null;
  signatureImg: PDFImage | null;
  brand: RGB;
  footerText: string | null;
  docLabel?: string; // 'Devis' (default) or 'Facture' — only affects the 'document.title' binding text
}

function resolveText(binding: PdfBlockBinding, kind: 'devis' | 'report', block: PdfBlock, ctx: CustomLayoutCtx): string {
  const { org, doc } = ctx;
  switch (binding) {
    case 'org.name':
      return org?.name ?? 'Entreprise';
    case 'org.contact':
      return [org?.address, org?.phone, org?.email].filter(Boolean).join(' · ');
    case 'document.title':
      return kind === 'report' ? doc.title ?? '' : `${ctx.docLabel ?? 'Devis'} ${doc.number ?? ''}`;
    case 'document.meta': {
      if (kind === 'report') {
        const project = doc.projects;
        return [
          project?.name ? `Chantier : ${project.name}` : null,
          project?.client_name ? `Client : ${project.client_name}` : null,
          project?.address ? `Adresse : ${project.address}` : null,
        ]
          .filter(Boolean)
          .join('\n');
      }
      return [doc.client_name, doc.client_address, doc.client_email, doc.projects?.name ? `Chantier : ${doc.projects.name}` : null]
        .filter(Boolean)
        .join('\n');
    }
    case 'notes':
      return doc.notes ?? '';
    case 'static':
      return block.text ?? '';
    default:
      return '';
  }
}

// Draws wrapped text top-down starting at the block's top edge. Deliberately
// does NOT clip at block.height — a block sized a little short is common
// (the editor's canvas preview uses the system font, which wraps slightly
// differently than pdf-lib's Helvetica) and silently dropping the overflow
// would lose real document content, which is worse than a block visually
// running a bit long.
function drawTextBlock(page: PDFPage, block: PdfBlock, text: string, font: PDFFont, fontBold: PDFFont, defaultColor: RGB) {
  if (!text.trim()) return;
  const size = block.style?.fontSize ?? 10;
  const useFont = block.style?.bold ? fontBold : font;
  const color = resolveColor(block.style?.color, defaultColor);
  const align = block.style?.align ?? 'left';
  const lineHeight = size * 1.35;
  let y = blockTopY(block) - size;
  for (const line of wrapText(text, useFont, size, block.width)) {
    if (align === 'center') {
      const w = useFont.widthOfTextAtSize(line, size);
      drawText(page, line, block.x + (block.width - w) / 2, y, useFont, size, color);
    } else if (align === 'right') {
      drawTextRight(page, line, block.x + block.width, y, useFont, size, color);
    } else {
      drawText(page, line, block.x, y, useFont, size, color);
    }
    y -= lineHeight;
  }
}

function drawImageBlock(page: PDFPage, block: PdfBlock, img: PDFImage | null) {
  if (!img) return; // same silent-skip as every preset renderer's logo/signature
  const scale = Math.min(block.width / img.width, block.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = block.x + (block.width - w) / 2;
  const y = blockBottomY(block) + (block.height - h) / 2;
  page.drawImage(img, { x, y, width: w, height: h });
}

function drawDividerBlock(page: PDFPage, block: PdfBlock) {
  const shapeKind = block.style?.shapeKind ?? 'line';
  if (shapeKind === 'rect') {
    const bg = block.style?.background && HEX_RE.test(block.style.background) ? hexToRgb(block.style.background) : undefined;
    const borderColor = resolveColor(block.style?.borderColor, LINE);
    page.drawRectangle({
      x: block.x,
      y: blockBottomY(block),
      width: block.width,
      height: block.height,
      color: bg,
      borderColor: block.style?.borderColor ? borderColor : undefined,
      borderWidth: block.style?.borderWidth ?? (block.style?.borderColor ? 1 : 0),
    });
  } else {
    const midY = blockTopY(block) - block.height / 2;
    page.drawLine({
      start: { x: block.x, y: midY },
      end: { x: block.x + block.width, y: midY },
      thickness: block.style?.borderWidth ?? 1,
      color: resolveColor(block.style?.color, LINE),
    });
  }
}

// Lets any block (text, image, whatever) carry an optional fill/border —
// used by the editor's "Fond" / "Bordure" controls. Drawn first so it sits
// behind the block's own content. Dividers manage their own rect fill
// (shapeKind: 'rect') and are excluded to avoid drawing the same rectangle
// twice.
function drawBlockBackground(page: PDFPage, block: PdfBlock) {
  const bg = block.style?.background && HEX_RE.test(block.style.background) ? hexToRgb(block.style.background) : undefined;
  const hasBorder = !!block.style?.borderColor && HEX_RE.test(block.style.borderColor);
  if (!bg && !hasBorder) return;
  page.drawRectangle({
    x: block.x,
    y: blockBottomY(block),
    width: block.width,
    height: block.height,
    color: bg,
    borderColor: hasBorder ? hexToRgb(block.style!.borderColor!) : undefined,
    borderWidth: hasBorder ? (block.style?.borderWidth ?? 1) : 0,
  });
}

function drawAnchoredBlock(page: PDFPage, block: PdfBlock, kind: 'devis' | 'report', ctx: CustomLayoutCtx) {
  const { font, fontBold, logoImg, signatureImg } = ctx;
  if (block.binding !== 'divider') drawBlockBackground(page, block);
  switch (block.binding) {
    case 'logo':
      return drawImageBlock(page, block, logoImg);
    case 'signature':
      return drawImageBlock(page, block, signatureImg);
    case 'divider':
      return drawDividerBlock(page, block);
    case 'document.title': {
      // 'document.title' defaults to a larger size than the generic 10pt
      // body-text default (drawTextBlock's fallback) — titles read as
      // titles even on a block an admin never touched in the inspector.
      // The date is drawn as a small second line right under it rather
      // than a separate binding, mirroring every preset renderer's layout.
      const titleSize = block.style?.fontSize ?? 16;
      const text = resolveText(block.binding, kind, block, ctx);
      drawTextBlock(page, { ...block, style: { ...block.style, fontSize: titleSize } }, text, font, fontBold, INK);
      if (ctx.doc.created_at) {
        drawText(page, formatDate(ctx.doc.created_at), block.x, blockTopY(block) - titleSize - 4, font, titleSize * 0.6, MUTED);
      }
      return;
    }
    case 'org.name':
    case 'org.contact':
    case 'document.meta':
    case 'notes':
    case 'static':
      return drawTextBlock(page, block, resolveText(block.binding, kind, block, ctx), font, fontBold, INK);
    default:
      return; // 'photos' / 'items_table' / 'totals' are flow blocks, handled separately
  }
}

// The 3 bindings whose content can overflow across pages — see
// pdf_template_blocks migration / plan doc for why v1 caps this at one
// instance each, always drawn last, in this fixed order. 'totals' isn't
// itself a flow binding (it's a small fixed box) but it must immediately
// follow wherever 'items_table' ends, so it's handled in the same pass.
const FLOW_BINDINGS: PdfBlockBinding[] = ['notes', 'photos', 'items_table'];

export async function drawCustomLayout(kind: 'devis' | 'report', blocks: PdfBlock[], ctx: CustomLayoutCtx): Promise<Uint8Array> {
  const { pdfDoc, admin, bucket, font, fontBold, org, doc, photos, items, brand, footerText } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNum = 1;

  const anchored = blocks.filter((b) => !FLOW_BINDINGS.includes(b.binding) && b.binding !== 'totals').sort((a, b) => a.z - b.z);
  for (const block of anchored) {
    drawAnchoredBlock(page, block, kind, ctx);
  }

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
  };

  const notesBlock = blocks.find((b) => b.binding === 'notes');
  if (notesBlock && doc.notes?.trim()) {
    const size = notesBlock.style?.fontSize ?? 10;
    const useFont = notesBlock.style?.bold ? fontBold : font;
    let y = blockTopY(notesBlock) - size;
    for (const line of wrapText(doc.notes, useFont, size, notesBlock.width)) {
      if (y < MARGIN + 40) {
        newPage();
        y = PAGE_HEIGHT - MARGIN;
      }
      drawText(page, line, notesBlock.x, y, useFont, size, resolveColor(notesBlock.style?.color, INK));
      y -= size * 1.35;
    }
  }

  if (kind === 'report') {
    const photosBlock = blocks.find((b) => b.binding === 'photos');
    if (photosBlock && photos?.length) {
      const state = await drawPhotoGrid({
        pdfDoc,
        admin,
        bucket,
        page,
        pageNum,
        y: blockTopY(photosBlock),
        photos,
        font,
        fontBold,
        labelColor: brand,
        cardBorder: LINE,
        cardBg: WHITE,
        onNewPage: (p, n) => drawFooter(p, font, n, footerText ?? org?.name ?? 'Cantia'),
        x: photosBlock.x,
        width: photosBlock.width,
      });
      page = state.page;
      pageNum = state.pageNum;
    }
  }

  if (kind === 'devis') {
    const itemsBlock = blocks.find((b) => b.binding === 'items_table');
    const totalsBlock = blocks.find((b) => b.binding === 'totals');
    if (itemsBlock && items?.length) {
      const x = itemsBlock.x;
      const width = itemsBlock.width;
      const colDesc = x;
      const colQty = x + width * 0.56;
      const colPrice = x + width * 0.78;
      const colTotal = x + width;

      let y = blockTopY(itemsBlock);
      const drawHeader = () => {
        drawText(page, 'Description', colDesc, y, fontBold, 9.5, MUTED);
        drawTextRight(page, 'Qté', colQty, y, fontBold, 9.5, MUTED);
        drawTextRight(page, 'Prix', colPrice, y, fontBold, 9.5, MUTED);
        drawTextRight(page, 'Total', colTotal, y, fontBold, 9.5, MUTED);
        y -= 8;
        page.drawLine({ start: { x, y }, end: { x: x + width, y }, thickness: 1, color: LINE });
        y -= 16;
      };
      drawHeader();

      let subtotal = 0;
      for (const item of items) {
        const lineTotal = Number(item.quantity) * Number(item.unit_price);
        subtotal += lineTotal;
        const descLines = wrapText(item.description, font, 10, colQty - colDesc - 10);
        if (y - descLines.length * 13 < MARGIN + 100) {
          newPage();
          y = PAGE_HEIGHT - MARGIN;
          drawHeader();
        }
        const rowTop = y;
        for (const line of descLines) {
          drawText(page, line, colDesc, y, font, 10, INK);
          y -= 13;
        }
        drawTextRight(page, `${item.quantity} ${item.unit ?? 'pce'}`, colQty, rowTop, font, 10, INK);
        drawTextRight(page, formatChf(Number(item.unit_price)), colPrice, rowTop, font, 10, INK);
        drawTextRight(page, formatChf(lineTotal), colTotal, rowTop, font, 10, INK);
        y -= 6;
      }
      y -= 6;
      page.drawLine({ start: { x, y }, end: { x: x + width, y }, thickness: 1, color: LINE });
      y -= 20;

      if (y < MARGIN + 90) {
        newPage();
        y = PAGE_HEIGHT - MARGIN;
      }

      const vat = subtotal * (Number(doc.vat_rate) / 100);
      const total = subtotal + vat;
      const totalsX = totalsBlock?.x ?? colPrice - 60;
      const totalsRight = totalsBlock ? totalsBlock.x + totalsBlock.width : colTotal;
      const totalsLine = (label: string, value: string, bold = false, size = 10.5) => {
        drawText(page, label, totalsX, y, bold ? fontBold : font, size, INK);
        drawTextRight(page, value, totalsRight, y, bold ? fontBold : font, size, INK);
        y -= size + 5;
      };
      totalsLine('Sous-total', formatChf(subtotal));
      totalsLine(`TVA (${doc.vat_rate}%)`, formatChf(vat));
      totalsLine('Total TTC', formatChf(total), true, 12);
    }
  }

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}
