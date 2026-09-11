import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

const BUCKET = 'opus-storage';
// The real, official federal template (Form. 11, Eidgenössische
// Steuerverwaltung) — not a recreation of it. Its 44 AcroForm fields
// (named things like DezZahlNull_9, TextMehrzeiligLinks_Empfaenger) are
// filled by name below rather than by drawing text at guessed
// coordinates, so the output lines up with the printed boxes exactly the
// way the form itself defines them.
//
// Source of truth, tried in order:
//  1. This path in storage — already cached from a previous run, from
//     either of the two paths below.
//  2. This exact file, committed to the GitHub repo (see TEMPLATE_GITHUB_URL
//     below) and fetched with a repo-scoped token (GITHUB_TEMPLATE_TOKEN
//     secret) — lets whoever maintains the repo drop in the exact PDF to
//     use by committing it, no app interaction needed.
//  3. The app's own upload control (Compte → RH & Salaires, platform-owner
//     only — see rh.tsx), which uploads straight to this same storage path.
//  4. ESTV's current published copy, as a last resort so generation still
//     works before either of the above has ever been set up.
// Whichever source succeeds gets cached at TEMPLATE_CACHE_PATH, so every
// generation after the first — for every employee, every organization —
// reads the same cached copy without re-fetching it.
const TEMPLATE_CACHE_PATH = '_shared/lohnausweis-form11.pdf';
const TEMPLATE_GITHUB_URL = 'https://raw.githubusercontent.com/thefoxexe/cantia.ch/cantia.ch/supabase/functions/_shared/assets/lohnausweis-form11.pdf';
const TEMPLATE_URL = 'https://www.estv.admin.ch/dam/de/sd-web/Nq1zXu8XwlCY/dbst-form-11lohna-rechts-dfi-de.pdf';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function loadTemplate(admin: ReturnType<typeof createClient>): Promise<Uint8Array> {
  const { data: cached } = await admin.storage.from(BUCKET).download(TEMPLATE_CACHE_PATH);
  if (cached) return new Uint8Array(await cached.arrayBuffer());

  const githubToken = Deno.env.get('GITHUB_TEMPLATE_TOKEN');
  if (githubToken) {
    try {
      const ghRes = await fetch(TEMPLATE_GITHUB_URL, { headers: { Authorization: `token ${githubToken}` } });
      if (ghRes.ok) {
        const bytes = new Uint8Array(await ghRes.arrayBuffer());
        await admin.storage.from(BUCKET).upload(TEMPLATE_CACHE_PATH, bytes, { contentType: 'application/pdf', upsert: true });
        return bytes;
      }
    } catch {
      // Falls through to the ESTV fetch below — a broken/misconfigured
      // GitHub source should never be the reason generation fails outright.
    }
  }

  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error("Impossible de récupérer le modèle officiel du certificat de salaire (ESTV).");
  const bytes = new Uint8Array(await res.arrayBuffer());
  await admin.storage.from(BUCKET).upload(TEMPLATE_CACHE_PATH, bytes, { contentType: 'application/pdf', upsert: true });
  return bytes;
}

function monthsInYear(year: number): { start: string; end: string; month: number }[] {
  const months: { start: string; end: string; month: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(Date.UTC(year, m, 1));
    const end = new Date(Date.UTC(year, m + 1, 0));
    months.push({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), month: m });
  }
  return months;
}

function formatSwissDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { user_id, ghost_employee_id, year } = await req.json();
    if ((!user_id && !ghost_employee_id) || !year) return json({ error: 'user_id (ou ghost_employee_id) et year requis' }, 400);
    const yearNum = Number(year);
    // A ghost employee (payroll-only, no app account — see
    // payroll_ghost_employees) is identified by ghost_employee_id instead
    // of user_id. Every query below picks whichever column applies.
    const ownerColumn: 'user_id' | 'ghost_employee_id' = user_id ? 'user_id' : 'ghost_employee_id';
    const ownerId: string = user_id ?? ghost_employee_id;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: profile, error: profileError } = await userClient
      .from('payroll_profiles')
      .select('*')
      .eq(ownerColumn, ownerId)
      .maybeSingle();
    if (profileError) return json({ error: 'Accès refusé' }, 403);
    if (!profile) return json({ error: "Aucune fiche de salaire configurée pour cet employé." }, 404);

    const organizationId = profile.organization_id as string;

    const [{ data: org }, { data: member }, { data: deductionTypes }, { data: overrides }, { data: entries }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', organizationId).single(),
      user_id
        ? admin.from('organization_members').select('full_name').eq('organization_id', organizationId).eq('user_id', user_id).maybeSingle()
        : admin.from('payroll_ghost_employees').select('full_name').eq('id', ghost_employee_id).maybeSingle(),
      admin.from('payroll_deduction_types').select('*').eq('organization_id', organizationId).eq('active', true).order('sort_order', { ascending: true }),
      admin.from('payroll_profile_deductions').select('*').eq('organization_id', organizationId).eq(ownerColumn, ownerId),
      // Ghost employees have no app account, so no hours were ever logged.
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

    const isHourly = profile.salary_type === 'hourly';
    const overrideByType = new Map((overrides ?? []).map((o: any) => [o.deduction_type_id, o]));

    let totalGross = 0;
    const deductionTotals = new Map<string, number>();

    for (const m of monthsInYear(yearNum)) {
      const monthHours = isHourly
        ? (entries ?? [])
            .filter((e: any) => new Date(`${e.entry_date}T00:00:00`).getUTCMonth() === m.month)
            .reduce((sum: number, e: any) => sum + Number(e.hours), 0)
        : 0;
      const monthGross = isHourly
        ? Math.round(monthHours * Number(profile.hourly_rate_chf ?? 0) * 100) / 100
        : Number(profile.monthly_salary_chf ?? 0);
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

    // Every deduction that actually amounted to something this year must be
    // reviewed (a box explicitly chosen, or explicitly left as "Aucune")
    // before this document can be generated — an unreviewed amount can't be
    // silently dropped or silently guessed onto a box on an official tax
    // form, so this blocks with a precise, actionable list instead.
    // certificate_box_reviewed (not certificate_box itself) is the check:
    // both "never configured" and "deliberately not on the certificate"
    // store certificate_box: null, and only the flag tells them apart.
    const unmapped = (deductionTypes ?? []).filter((dt: any) => (deductionTotals.get(dt.id) ?? 0) > 0 && !dt.certificate_box_reviewed);
    if (unmapped.length > 0) {
      return json(
        {
          error: `Ces cotisations n'ont pas de case du certificat de salaire assignée : ${unmapped.map((d: any) => d.label).join(', ')}. Complétez-les dans Compte → RH & Salaires avant de générer le Lohnausweis.`,
        },
        422,
      );
    }

    // The official form has a dedicated box for the AVS number and the
    // birth date (case C) — both required on every Lohnausweis. Rather
    // than generate a certificate with a blank official box, this blocks
    // and names exactly what's missing on the employee's payroll profile.
    const missingFields: string[] = [];
    if (!profile.avs_number) missingFields.push('numéro AVS');
    if (!profile.birth_date) missingFields.push('date de naissance');
    if (missingFields.length > 0) {
      return json(
        {
          error: `Informations manquantes sur la fiche de l'employé : ${missingFields.join(', ')}. Complétez-les dans sa fiche RH avant de générer le Lohnausweis.`,
        },
        422,
      );
    }

    let box9 = 0;
    let box10_1 = 0;
    let box10_2 = 0;
    let box12 = 0;
    for (const dt of deductionTypes ?? []) {
      const amount = deductionTotals.get(dt.id) ?? 0;
      if (amount === 0) continue;
      if (dt.certificate_box === 'box9') box9 += amount;
      else if (dt.certificate_box === 'box10_1') box10_1 += amount;
      else if (dt.certificate_box === 'box10_2') box10_2 += amount;
      else if (dt.certificate_box === 'box12') box12 += amount;
    }

    const gross = Math.round(totalGross);
    box9 = Math.round(box9);
    box10_1 = Math.round(box10_1);
    box10_2 = Math.round(box10_2);
    box12 = Math.round(box12);
    const net = gross - box9 - box10_1 - box10_2 - box12;

    const templateBytes = await loadTemplate(admin);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // "A" = ce document est un Lohnausweis (pas une Rentenbescheinigung, "B").
    form.getCheckBox('OptionKreuzOhneRahmen_A').check();

    if (profile.avs_number) form.getTextField('AHVLinks_C').setText(String(profile.avs_number));
    if (profile.birth_date) form.getTextField('TextLinks_C-GebDatum').setText(formatSwissDate(profile.birth_date));
    form.getTextField('TextLinks_D').setText(String(yearNum));

    const employeeName = member?.full_name || 'Employé';
    const employeeAddressLines = [employeeName, profile.street, [profile.postal_code, profile.locality].filter(Boolean).join(' ')].filter(
      (l) => l && String(l).trim(),
    );
    form.getTextField('TextMehrzeiligLinks_Empfaenger').setText(employeeAddressLines.join('\n'));

    form.getTextField('DezZahlNull_1').setText(String(gross));
    form.getTextField('DezZahlNull_8').setText(String(gross));
    if (box9 > 0) form.getTextField('DezZahlNull_9').setText(String(box9));
    if (box10_1 > 0) form.getTextField('DezZahlNull_10_1').setText(String(box10_1));
    if (box10_2 > 0) form.getTextField('DezZahlNull_10_2').setText(String(box10_2));
    if (box12 > 0) form.getTextField('DezZahlNull_12').setText(String(box12));
    form.getTextField('DezZahlNull_11').setText(String(net));

    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    form.getTextField('TextLinks_I').setText(org?.locality ? `${org.locality}, le ${todayStr}` : todayStr);

    const employerLines = [org?.name, org?.street, [org?.postal_code, org?.locality].filter(Boolean).join(' '), org?.phone].filter(
      (l) => l && String(l).trim(),
    );
    form.getTextField('TextMehrzeiligLinks_Bestaetigung').setText(employerLines.join('\n'));

    // No 2D barcode (PDF417) is drawn on the form. That barcode is a
    // Swissdec-standardized payload and can only be legitimately produced
    // by payroll software formally certified by Swissdec — printing one
    // without that certification would misrepresent an official tax
    // document, so this deliberately leaves the barcode zone blank rather
    // than fabricate a non-compliant code.

    // Flattened, not left as an editable form — this is meant to be handed
    // over as final, not silently altered after the fact.
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    const path = `${organizationId}/lohnausweis/${ownerId}/${yearNum}-${Date.now()}.pdf`;
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
