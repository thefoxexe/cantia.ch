import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
  MARGIN,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  drawFooter,
  drawText,
  drawTextRight,
  embedImageSmart,
  fetchStorageBytes,
  formatChf,
  formatOrgAddress,
  INK,
  MUTED,
} from '../_shared/pdf-helpers.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MONTH_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { user_id, period_start } = await req.json();
    if (!user_id || !period_start) return json({ error: 'user_id et period_start requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    // The only authorization check: payroll_profiles is RLS-gated to
    // can_manage_org_payroll(organization_id), so this select fails (or
    // returns nothing) for anyone else — no manual permission check needed
    // beyond letting RLS do its job.
    const { data: profile, error: profileError } = await userClient
      .from('payroll_profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (profileError) return json({ error: 'Accès refusé' }, 403);
    if (!profile) return json({ error: "Aucune fiche de salaire configurée pour cet employé." }, 404);

    const organizationId = profile.organization_id as string;

    const start = new Date(`${period_start}T00:00:00`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const periodEndIso = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    const periodLabel = `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()}`;

    const [{ data: org }, { data: member }, { data: deductionTypes }, { data: overrides }, { data: entries }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', organizationId).single(),
      admin.from('organization_members').select('full_name').eq('organization_id', organizationId).eq('user_id', user_id).maybeSingle(),
      admin.from('payroll_deduction_types').select('*').eq('organization_id', organizationId).eq('active', true).order('sort_order', { ascending: true }),
      admin.from('payroll_profile_deductions').select('*').eq('organization_id', organizationId).eq('user_id', user_id),
      admin.from('payroll_time_entries').select('hours').eq('organization_id', organizationId).eq('user_id', user_id).gte('entry_date', period_start).lte('entry_date', periodEndIso),
    ]);

    const totalHours = (entries ?? []).reduce((sum: number, e: any) => sum + Number(e.hours), 0);
    const isHourly = profile.salary_type === 'hourly';
    const gross = isHourly ? Math.round(totalHours * Number(profile.hourly_rate_chf ?? 0) * 100) / 100 : Number(profile.monthly_salary_chf ?? 0);

    const overrideByType = new Map((overrides ?? []).map((o: any) => [o.deduction_type_id, o]));
    const lines: { label: string; ratePercent: number | null; amount: number }[] = [];
    for (const dt of deductionTypes ?? []) {
      const override: any = overrideByType.get(dt.id);
      if (override && !override.enabled) continue;
      const ratePercent = override?.rate_percent ?? dt.default_rate_percent;
      const fixedAmount = override?.fixed_amount_chf;
      const amount = fixedAmount != null ? Number(fixedAmount) : ratePercent != null ? Math.round((gross * Number(ratePercent)) / 100 * 100) / 100 : 0;
      if (amount === 0 && ratePercent == null && fixedAmount == null) continue;
      lines.push({ label: dt.label, ratePercent: ratePercent != null ? Number(ratePercent) : null, amount });
    }
    const totalDeductions = Math.round(lines.reduce((sum, l) => sum + l.amount, 0) * 100) / 100;
    const net = Math.round((gross - totalDeductions) * 100) / 100;

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

    // Letterhead: logo (if any) top-right, sender block top-left.
    if (logoImg) {
      const maxW = 110;
      const scale = Math.min(maxW / logoImg.width, 42 / logoImg.height);
      const w = logoImg.width * scale;
      const h = logoImg.height * scale;
      page.drawImage(logoImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h, width: w, height: h });
    }

    drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 12, INK);
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

    // Recipient block — positioned like a real letter, so the whole page
    // reads correctly through a window envelope if printed and mailed.
    const employeeName = member?.full_name || 'Employé';
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
    const dateLabel = `${org?.locality ?? ''}${org?.locality ? ', le ' : 'Le '}${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    drawTextRight(page, dateLabel, PAGE_WIDTH - MARGIN, y + 14, font, 9, MUTED);

    y -= 30;

    drawText(page, `Décompte de salaire — ${periodLabel}`, MARGIN, y, fontBold, 14, INK);
    y -= 30;

    const rowLabelX = MARGIN;
    const rowValueX = PAGE_WIDTH - MARGIN;

    function row(label: string, value: string, opts?: { bold?: boolean; size?: number; color?: any }) {
      const f = opts?.bold ? fontBold : font;
      const size = opts?.size ?? 10.5;
      drawText(page, label, rowLabelX, y, f, size, opts?.color ?? INK);
      drawTextRight(page, value, rowValueX, y, f, size, opts?.color ?? INK);
      y -= size + 8;
    }

    if (isHourly) {
      row('Heures effectuées', `${totalHours.toFixed(2).replace(/\.00$/, '')} h`);
      row('Taux horaire', `${formatChf(Number(profile.hourly_rate_chf ?? 0))} / h`);
    }
    row('Salaire brut', formatChf(gross), { bold: true });

    y -= 6;
    page.drawLine({ start: { x: MARGIN, y: y + 4 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 4 }, thickness: 0.5, color: MUTED });
    y -= 10;

    for (const l of lines) {
      const label = l.ratePercent != null ? `${l.label} (${l.ratePercent}%)` : l.label;
      row(label, `- ${formatChf(l.amount)}`, { size: 9.5, color: MUTED });
    }

    y -= 6;
    page.drawLine({ start: { x: MARGIN, y: y + 4 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 4 }, thickness: 0.5, color: MUTED });
    y -= 14;

    row('Salaire net', formatChf(net), { bold: true, size: 13 });

    drawFooter(page, font, 1, org?.name ?? 'Cantia');

    const pdfBytes = await pdfDoc.save();
    const path = `${organizationId}/payslips/${user_id}/${period_start}-${Date.now()}.pdf`;
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
