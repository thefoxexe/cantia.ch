import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Self-contained rather than importing ../_shared/pdf-helpers.ts and
// ../_shared/pdf-i18n.ts — the MCP deploy path for this function couldn't
// resolve those relative imports, so the small subset actually needed here
// (layout constants, text-safe drawing, CHF/address formatting, FR/DE/IT
// labels) is inlined instead of fighting that. Every other PDF function in
// this project still shares the real _shared/ helpers when deployed via the
// Supabase CLI from the full repo checkout.
const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const INK = rgb(0.0941, 0.1098, 0.1059);
const MUTED = rgb(0.3608, 0.3961, 0.3765);

type PdfLocale = 'fr' | 'de' | 'it';

function resolvePdfLocale(org: any): PdfLocale {
  return org?.locale === 'de' ? 'de' : org?.locale === 'it' ? 'it' : 'fr';
}

const LABELS = {
  entrepriseFallback: { fr: 'Entreprise', de: 'Unternehmen', it: 'Azienda' },
  employeeFallback: { fr: 'Employé', de: 'Mitarbeiter', it: 'Dipendente' },
  salaryCertificateTitle: {
    fr: 'Récapitulatif annuel de salaire — {period}',
    de: 'Jährliche Lohnzusammenfassung — {period}',
    it: 'Riepilogo annuale del salario — {period}',
  },
  salaryCertificateDisclaimer: {
    fr: "Récapitulatif calculé à partir des fiches de salaire mensuelles enregistrées dans Cantia — pas un certificat de salaire officiel (formulaire AFC/Swissdec). À utiliser pour le préparer avec votre fiduciaire.",
    de: 'Zusammenfassung auf Basis der in Cantia erfassten monatlichen Lohnabrechnungen — kein offizieller Lohnausweis (ESTV-/Swissdec-Formular). Zur Vorbereitung mit Ihrer Treuhandstelle verwenden.',
    it: 'Riepilogo calcolato a partire dai conteggi salariali mensili registrati in Cantia — non è un certificato di salario ufficiale (modulo AFC/Swissdec). Da utilizzare per prepararlo con il suo fiduciario.',
  },
  hoursWorked: { fr: 'Heures effectuées', de: 'Geleistete Stunden', it: 'Ore lavorate' },
  grossSalary: { fr: 'Salaire brut', de: 'Bruttolohn', it: 'Salario lordo' },
  netSalary: { fr: 'Salaire net', de: 'Nettolohn', it: 'Salario netto' },
  dateLabel: { fr: '{place}, le {date}', de: '{place}, den {date}', it: '{place}, il {date}' },
  dateLabelNoPlace: { fr: 'Le {date}', de: 'Den {date}', it: 'Il {date}' },
  page: { fr: 'Page {n}', de: 'Seite {n}', it: 'Pagina {n}' },
} as const;

type LabelKey = keyof typeof LABELS;

function pdfT(locale: PdfLocale, key: LabelKey, vars?: Record<string, string | number>): string {
  let text: string = LABELS[key][locale];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  }
  return text;
}

// Same sanitization as _shared/pdf-helpers.ts's sanitizePdfText — pdf-lib's
// standard fonts use WinAnsi (cp1252) and throw on unicode punctuation/space
// variants Intl.NumberFormat produces (e.g. the fr-CH thousands separator).
function sanitizePdfText(text: string): string {
  const REPLACEMENTS: Record<number, string> = {
    0x2018: "'", 0x2019: "'",
    0x201c: '"', 0x201d: '"',
    0x2013: '-', 0x2014: '-', 0x2022: '-',
    0x20ac: 'EUR',
    0x2026: '...',
    0x0153: 'oe', 0x0152: 'OE', 0x0178: 'Y',
  };
  let result = '';
  for (const ch of text || '') {
    const code = ch.codePointAt(0) ?? 0;
    const isSpaceVariant =
      code === 0x00a0 || (code >= 0x2000 && code <= 0x200f) || (code >= 0x2028 && code <= 0x202f) || code === 0x205f || code === 0x3000;
    if (isSpaceVariant) result += ' ';
    else if (REPLACEMENTS[code] !== undefined) result += REPLACEMENTS[code];
    else if (code > 0xff) result += '?';
    else result += ch;
  }
  return result;
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

function formatChf(amount: number): string {
  return sanitizePdfText(new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount));
}

function formatOrgAddress(org: any): string | null {
  const structured = [org?.street, [org?.postal_code, org?.locality].filter(Boolean).join(' ')]
    .filter((part) => part && part.trim().length > 0)
    .join(', ');
  return structured || org?.address || null;
}

function drawFooter(page: PDFPage, font: PDFFont, pageNum: number, brand: string, locale: PdfLocale) {
  drawText(page, brand, MARGIN, 24, font, 8, MUTED);
  drawTextRight(page, pdfT(locale, 'page', { n: pageNum }), PAGE_WIDTH - MARGIN, 24, font, 8, MUTED);
}

function guessContentType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

async function fetchStorageBytes(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  const buf = new Uint8Array(await data.arrayBuffer());
  const contentType = (data.type as string) || guessContentType(path);
  return { bytes: buf, contentType };
}

async function embedImageSmart(pdfDoc: PDFDocument, bytes: Uint8Array, contentType: string) {
  const attempts = contentType.includes('png')
    ? [() => pdfDoc.embedPng(bytes), () => pdfDoc.embedJpg(bytes)]
    : [() => pdfDoc.embedJpg(bytes), () => pdfDoc.embedPng(bytes)];
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch {
      // try the next format
    }
  }
  return null;
}

// Same math as generate-payslip-pdf, run once per calendar month and summed
// — a récapitulatif annuel is deliberately nothing more than "what the 12
// monthly décomptes already said, added up", not an independently derived
// figure. That's also why it can't double as an official certificat de
// salaire (Swissdec ce-27 form): it has no notion of hire/leave dates or
// mid-year rate changes beyond what each month's own entries capture.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { user_id, ghost_employee_id, year } = await req.json();
    if ((!user_id && !ghost_employee_id) || !year) return json({ error: 'user_id (ou ghost_employee_id) et year requis' }, 400);
    // A ghost employee (payroll-only, no app account) is identified by
    // ghost_employee_id instead of user_id — every query below picks
    // whichever column applies.
    const ownerColumn: 'user_id' | 'ghost_employee_id' = user_id ? 'user_id' : 'ghost_employee_id';
    const ownerId: string = user_id ?? ghost_employee_id;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    // Same RLS-only authorization as generate-payslip-pdf.
    const { data: profile, error: profileError } = await userClient
      .from('payroll_profiles')
      .select('*')
      .eq(ownerColumn, ownerId)
      .maybeSingle();
    if (profileError) return json({ error: 'Accès refusé' }, 403);
    if (!profile) return json({ error: "Aucune fiche de salaire configurée pour cet employé." }, 404);

    const organizationId = profile.organization_id as string;
    const yearNum = Number(year);

    const [{ data: org }, { data: member }, { data: deductionTypes }, { data: overrides }, { data: entries }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', organizationId).single(),
      user_id
        ? admin.from('organization_members').select('full_name').eq('organization_id', organizationId).eq('user_id', user_id).maybeSingle()
        : admin.from('payroll_ghost_employees').select('full_name').eq('id', ghost_employee_id).maybeSingle(),
      admin.from('payroll_deduction_types').select('*').eq('organization_id', organizationId).eq('active', true).order('sort_order', { ascending: true }),
      admin.from('payroll_profile_deductions').select('*').eq('organization_id', organizationId).eq(ownerColumn, ownerId),
      user_id
        ? admin
            .from('payroll_time_entries')
            .select('hours, entry_date')
            .eq('organization_id', organizationId)
            .eq('user_id', user_id)
            .gte('entry_date', `${yearNum}-01-01`)
            .lte('entry_date', `${yearNum}-12-31`)
        : Promise.resolve({ data: [] as { hours: number; entry_date: string }[] }),
    ]);

    const locale = resolvePdfLocale(org);
    const isHourly = profile.salary_type === 'hourly';
    const overrideByType = new Map((overrides ?? []).map((o: any) => [o.deduction_type_id, o]));

    // One gross figure per calendar month present in the org (hourly: that
    // month's logged hours × rate; monthly: the flat salary every month —
    // there's no hire/leave date on payroll_profiles to prorate against).
    let totalHours = 0;
    let totalGross = 0;
    const deductionTotals = new Map<string, number>();

    for (let month = 0; month < 12; month++) {
      const monthHours = isHourly
        ? (entries ?? [])
            .filter((e: any) => new Date(`${e.entry_date}T00:00:00`).getUTCMonth() === month)
            .reduce((sum: number, e: any) => sum + Number(e.hours), 0)
        : 0;
      const monthGross = isHourly
        ? Math.round(monthHours * Number(profile.hourly_rate_chf ?? 0) * 100) / 100
        : Number(profile.monthly_salary_chf ?? 0);
      totalHours += monthHours;
      totalGross += monthGross;

      for (const dt of deductionTypes ?? []) {
        const override: any = overrideByType.get(dt.id);
        if (override && !override.enabled) continue;
        const ratePercent = override?.rate_percent ?? dt.default_rate_percent;
        const fixedAmount = override?.fixed_amount_chf;
        const amount = fixedAmount != null ? Number(fixedAmount) : ratePercent != null ? (monthGross * Number(ratePercent)) / 100 : 0;
        if (amount === 0 && ratePercent == null && fixedAmount == null) continue;
        deductionTotals.set(dt.id, (deductionTotals.get(dt.id) ?? 0) + amount);
      }
    }
    totalHours = Math.round(totalHours * 100) / 100;
    totalGross = Math.round(totalGross * 100) / 100;

    const lines = (deductionTypes ?? [])
      .filter((dt: any) => deductionTotals.has(dt.id))
      .map((dt: any) => ({ label: dt.label, amount: Math.round((deductionTotals.get(dt.id) ?? 0) * 100) / 100 }));
    const totalDeductions = Math.round(lines.reduce((sum: number, l: any) => sum + l.amount, 0) * 100) / 100;
    const net = Math.round((totalGross - totalDeductions) * 100) / 100;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    let logoImg = null;
    if (org?.logo_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.logo_url);
      if (bytes) logoImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    let y = PAGE_HEIGHT - MARGIN;

    if (logoImg) {
      const maxW = 110;
      const scale = Math.min(maxW / logoImg.width, 42 / logoImg.height);
      const w = logoImg.width * scale;
      const h = logoImg.height * scale;
      page.drawImage(logoImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h, width: w, height: h });
    }

    drawText(page, org?.name ?? pdfT(locale, 'entrepriseFallback'), MARGIN, y, fontBold, 12, INK);
    y -= 16;
    const orgAddress = formatOrgAddress(org);
    if (orgAddress) {
      for (const line of orgAddress.split(', ')) {
        drawText(page, line, MARGIN, y, font, 9, MUTED);
        y -= 12;
      }
    }
    if (org?.phone || org?.email) {
      drawText(page, [org?.phone, org?.email].filter(Boolean).join('  ·  '), MARGIN, y, font, 9, MUTED);
      y -= 12;
    }

    y -= 30;

    const employeeName = member?.full_name || pdfT(locale, 'employeeFallback');
    drawText(page, employeeName, MARGIN, y, font, 10, INK);
    y -= 14;
    if (profile.street) {
      drawText(page, profile.street, MARGIN, y, font, 10, INK);
      y -= 14;
    }
    if (profile.postal_code || profile.locality) {
      drawText(page, [profile.postal_code, profile.locality].filter(Boolean).join(' '), MARGIN, y, font, 10, INK);
      y -= 14;
    }

    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    const dateLabel = org?.locality
      ? pdfT(locale, 'dateLabel', { place: org.locality, date: todayStr })
      : pdfT(locale, 'dateLabelNoPlace', { date: todayStr });
    drawTextRight(page, dateLabel, PAGE_WIDTH - MARGIN, y + 14, font, 9, MUTED);

    y -= 30;

    drawText(page, pdfT(locale, 'salaryCertificateTitle', { period: String(yearNum) }), MARGIN, y, fontBold, 14, INK);
    y -= 20;

    const disclaimerLines = wrapText(pdfT(locale, 'salaryCertificateDisclaimer'), font, 8.5, PAGE_WIDTH - MARGIN * 2);
    for (const l of disclaimerLines) {
      drawText(page, l, MARGIN, y, font, 8.5, MUTED);
      y -= 11;
    }
    y -= 16;

    const rowLabelX = MARGIN;
    const rowValueX = PAGE_WIDTH - MARGIN;

    function row(label: string, value: string, opts?: { bold?: boolean; size?: number; color?: RGB }) {
      const f = opts?.bold ? fontBold : font;
      const size = opts?.size ?? 10.5;
      drawText(page, label, rowLabelX, y, f, size, opts?.color ?? INK);
      drawTextRight(page, value, rowValueX, y, f, size, opts?.color ?? INK);
      y -= size + 8;
    }

    if (isHourly) {
      row(pdfT(locale, 'hoursWorked'), `${totalHours.toFixed(2).replace(/\.00$/, '')} h`);
    }
    row(pdfT(locale, 'grossSalary'), formatChf(totalGross), { bold: true });

    y -= 6;
    page.drawLine({ start: { x: MARGIN, y: y + 4 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 4 }, thickness: 0.5, color: MUTED });
    y -= 10;

    for (const l of lines) {
      row(l.label, `- ${formatChf(l.amount)}`, { size: 9.5, color: MUTED });
    }

    y -= 6;
    page.drawLine({ start: { x: MARGIN, y: y + 4 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 4 }, thickness: 0.5, color: MUTED });
    y -= 14;

    row(pdfT(locale, 'netSalary'), formatChf(net), { bold: true, size: 13 });

    drawFooter(page, font, 1, org?.name ?? 'Cantia', locale);

    const pdfBytes = await pdfDoc.save();
    const path = `${organizationId}/salary-certificates/${ownerId}/${yearNum}-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });
    if (uploadError) return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ url: signed?.signedUrl ?? null });
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
