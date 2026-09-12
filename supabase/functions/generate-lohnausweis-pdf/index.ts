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

    const [{ data: org }, { data: member }, { data: deductionTypes }, { data: overrides }, { data: entries }, { data: expenseEntries }, { data: wageTypes }, { data: wageRateOverrides }, { data: wageLines }] = await Promise.all([
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
      // Same limitation as time entries — payroll_expenses only ever
      // belongs to a real app user, ghost employees never log expenses.
      user_id
        ? admin
            .from('payroll_expenses')
            .select('amount_chf, expense_type_id, payroll_expense_types(label, certificate_subbox, certificate_subbox_art, certificate_subbox_reviewed, active)')
            .eq('organization_id', organizationId)
            .eq('user_id', user_id)
            .gte('expense_date', `${yearNum}-01-01`)
            .lte('expense_date', `${yearNum}-12-31`)
        : Promise.resolve({ data: [] as any[] }),
      // §7.1 rubriques de salaire — see the wage-additions block below for
      // how these fold into gross and split across Ziffer 1 / Ziffer 3.
      admin.from('payroll_wage_types').select('*').eq('organization_id', organizationId),
      admin.from('payroll_profile_wage_rates').select('*').eq('organization_id', organizationId).eq(ownerColumn, ownerId),
      admin.from('payroll_slip_wage_lines').select('*').eq('organization_id', organizationId).eq(ownerColumn, ownerId).eq('year', yearNum),
    ]);

    const isHourly = profile.salary_type === 'hourly';
    const overrideByType = new Map((overrides ?? []).map((o: any) => [o.deduction_type_id, o]));
    const wageTypeById = new Map((wageTypes ?? []).map((w: any) => [w.id, w]));
    const wageRateOverrideByType = new Map((wageRateOverrides ?? []).map((o: any) => [o.wage_type_id, o]));

    // A hire date within the reporting year is the one signal this app has
    // for "part-year employment" (no departure date is tracked yet — see
    // this block's own comment further down). Per the ESTV Wegleitung, a
    // fixed 13e/14e salaire and a recurring rate-based addition (indemnité
    // vacances) always belong in Ziffer 1 regardless of employment length,
    // but a genuinely variable/irregular addition (bonus, heures
    // supplémentaires, or any other custom manual-entry type) must be
    // itemized separately in Ziffer 3 for a part-year employee — otherwise
    // the tax administration would incorrectly annualize that one-off
    // amount as if it recurred every month, inflating the withholding
    // rate. For a full-year employee both end up in the same total, so
    // this only changes anything for the part-year case.
    const hireDate: string | null = profile.hire_date ?? null;
    const isPartYearFromStart = !!hireDate && new Date(`${hireDate}T00:00:00`).getUTCFullYear() === yearNum;

    let ziffer1Total = 0;
    let ziffer3Total = 0;
    const ziffer3Labels = new Set<string>();
    const deductionTotals = new Map<string, number>();

    for (const m of monthsInYear(yearNum)) {
      const monthHours = isHourly
        ? (entries ?? [])
            .filter((e: any) => new Date(`${e.entry_date}T00:00:00`).getUTCMonth() === m.month)
            .reduce((sum: number, e: any) => sum + Number(e.hours), 0)
        : 0;
      const baseGross = isHourly
        ? Math.round(monthHours * Number(profile.hourly_rate_chf ?? 0) * 100) / 100
        : Number(profile.monthly_salary_chf ?? 0);

      const monthWageLines = (wageLines ?? []).filter((l: any) => l.month === m.month + 1);
      let manualAdditionsTotal = 0;
      let thirteenthSalary = 0;
      let irregularAdditions = 0;
      for (const line of monthWageLines) {
        const wt = wageTypeById.get(line.wage_type_id);
        if (!wt || wt.kind !== 'addition') continue; // net_adjustment (avances, régularisations) never touches gross/Ziffer1/3.
        const amount = Number(line.amount_chf);
        manualAdditionsTotal += amount;
        if (wt.label === '13e salaire') thirteenthSalary += amount;
        else {
          irregularAdditions += amount;
          ziffer3Labels.add(wt.label);
        }
      }

      const grossBeforeRecurring = baseGross + manualAdditionsTotal;
      let recurringAdditions = 0;
      for (const wt of wageTypes ?? []) {
        if (!wt.active || wt.mode !== 'recurring_rate' || wt.kind !== 'addition') continue;
        const override: any = wageRateOverrideByType.get(wt.id);
        if (override && !override.enabled) continue;
        const ratePercent = override?.rate_percent ?? wt.default_rate_percent;
        const fixedAmount = override?.fixed_amount_chf ?? wt.default_fixed_amount_chf;
        if (ratePercent == null && fixedAmount == null) continue;
        recurringAdditions += fixedAmount != null ? Number(fixedAmount) : (grossBeforeRecurring * Number(ratePercent)) / 100;
      }

      const monthTotalGross = grossBeforeRecurring + recurringAdditions;
      ziffer1Total += baseGross + thirteenthSalary + recurringAdditions;
      if (isPartYearFromStart) ziffer3Total += irregularAdditions;
      else ziffer1Total += irregularAdditions;

      for (const dt of deductionTypes ?? []) {
        const override: any = overrideByType.get(dt.id);
        if (override && !override.enabled) continue;
        const ratePercent = override?.rate_percent ?? dt.default_rate_percent;
        const fixedAmount = override?.fixed_amount_chf;
        const amount = fixedAmount != null ? Number(fixedAmount) : ratePercent != null ? (monthTotalGross * Number(ratePercent)) / 100 : 0;
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

    // Same "reviewed, not just non-null" gate as deduction types, applied
    // to case 13 (frais) — an expense TYPE with a real amount this year but
    // no explicit sub-box choice (see certificate_subbox_reviewed) can't be
    // silently left off or silently mis-boxed on an official tax document.
    const expenseTotalsBySubbox = new Map<string, number>();
    const expenseArtLabelsBySubbox = new Map<string, Set<string>>();
    const unmappedExpenseTypeLabels = new Set<string>();
    for (const row of expenseEntries ?? []) {
      const et = (row as any).payroll_expense_types;
      if (!et || et.active === false) continue;
      const amount = Number((row as any).amount_chf ?? 0);
      if (amount === 0) continue;
      if (!et.certificate_subbox_reviewed) {
        unmappedExpenseTypeLabels.add(et.label);
        continue;
      }
      if (!et.certificate_subbox) continue;
      expenseTotalsBySubbox.set(et.certificate_subbox, (expenseTotalsBySubbox.get(et.certificate_subbox) ?? 0) + amount);
      if (et.certificate_subbox === '13_1_2' || et.certificate_subbox === '13_2_3') {
        const set = expenseArtLabelsBySubbox.get(et.certificate_subbox) ?? new Set<string>();
        set.add(et.certificate_subbox_art || et.label);
        expenseArtLabelsBySubbox.set(et.certificate_subbox, set);
      }
    }
    if (unmappedExpenseTypeLabels.size > 0) {
      return json(
        {
          error: `Ces types de frais n'ont pas de case du certificat de salaire assignée : ${[...unmappedExpenseTypeLabels].join(', ')}. Complétez-les dans Compte → RH & Salaires avant de générer le Lohnausweis.`,
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
    // Case 15 (Bemerkungen/Observations/Osservazioni) is informational only
    // — unlike 9/10/12 it is never subtracted to derive the official net
    // (case 11). This is where a private loss-of-earnings-insurance premium
    // (IJM/APG maladie, Krankentaggeld) belongs: real payslips deduct it
    // from take-home pay, but the ESTV form doesn't fold it into the
    // standardized net figure, only discloses it as a remark line.
    const box15Remarks: string[] = [];
    for (const dt of deductionTypes ?? []) {
      const amount = deductionTotals.get(dt.id) ?? 0;
      if (amount === 0) continue;
      if (dt.certificate_box === 'box9') box9 += amount;
      else if (dt.certificate_box === 'box10_1') box10_1 += amount;
      else if (dt.certificate_box === 'box10_2') box10_2 += amount;
      else if (dt.certificate_box === 'box12') box12 += amount;
      else if (dt.certificate_box === 'box15') box15Remarks.push(`${dt.label} : Fr. ${Math.round(amount * 100) / 100}`);
    }

    const gross = Math.round(ziffer1Total);
    const ziffer3 = Math.round(ziffer3Total);
    // Ziffer 8 "Total Bruttolohn" per the Wegleitung is the sum of Ziffern
    // 1-7 — this app only ever populates 1 and 3, so it's just their sum.
    const totalBrutto = gross + ziffer3;
    box9 = Math.round(box9);
    box10_1 = Math.round(box10_1);
    box10_2 = Math.round(box10_2);
    box12 = Math.round(box12);
    const net = totalBrutto - box9 - box10_1 - box10_2 - box12;

    // Case 13 (frais) is informational too, same as case 15 — expense
    // reimbursements are never part of the salary these boxes derive from,
    // so nothing here touches gross/net.
    const box13_1_1 = Math.round(expenseTotalsBySubbox.get('13_1_1') ?? 0);
    const box13_1_2 = Math.round(expenseTotalsBySubbox.get('13_1_2') ?? 0);
    const box13_2_1 = Math.round(expenseTotalsBySubbox.get('13_2_1') ?? 0);
    const box13_2_2 = Math.round(expenseTotalsBySubbox.get('13_2_2') ?? 0);
    const box13_2_3 = Math.round(expenseTotalsBySubbox.get('13_2_3') ?? 0);
    const box13_3 = Math.round(expenseTotalsBySubbox.get('13_3') ?? 0);

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
    if (ziffer3 > 0) {
      form.getTextField('DezZahlNull_3').setText(String(ziffer3));
      form.getTextField('TextLinks_3-Art').setText([...ziffer3Labels].join(', '));
    }
    form.getTextField('DezZahlNull_8').setText(String(totalBrutto));
    // Case E "Durée des rapports de travail" — only the start date is ever
    // known here (no date de départ tracked on the payroll profile yet),
    // so this is filled only for the one part-year case this app can
    // actually detect (hired during the reporting year) rather than
    // guessing a departure date or always filling it with January 1st for
    // every employee.
    if (isPartYearFromStart && hireDate) form.getTextField('TextLinks_E-von').setText(formatSwissDate(hireDate));
    if (box9 > 0) form.getTextField('DezZahlNull_9').setText(String(box9));
    if (box10_1 > 0) form.getTextField('DezZahlNull_10_1').setText(String(box10_1));
    if (box10_2 > 0) form.getTextField('DezZahlNull_10_2').setText(String(box10_2));
    if (box12 > 0) form.getTextField('DezZahlNull_12').setText(String(box12));
    form.getTextField('DezZahlNull_11').setText(String(net));

    if (box13_1_1 > 0) form.getTextField('DezZahlNull_13_1_1').setText(String(box13_1_1));
    if (box13_1_2 > 0) {
      form.getTextField('DezZahlNull_13_1_2').setText(String(box13_1_2));
      const art = [...(expenseArtLabelsBySubbox.get('13_1_2') ?? [])].join(', ');
      if (art) form.getTextField('TextLinks_13_1_2-Art').setText(art);
    }
    if (box13_2_1 > 0) form.getTextField('DezZahlNull_13_2_1').setText(String(box13_2_1));
    if (box13_2_2 > 0) form.getTextField('DezZahlNull_13_2_2').setText(String(box13_2_2));
    if (box13_2_3 > 0) {
      form.getTextField('DezZahlNull_13_2_3').setText(String(box13_2_3));
      const art = [...(expenseArtLabelsBySubbox.get('13_2_3') ?? [])].join(', ');
      if (art) form.getTextField('TextLinks_13_2_3-Art').setText(art);
    }
    if (box13_3 > 0) form.getTextField('DezZahlNull_13_3').setText(String(box13_3));

    // Only two remark lines exist on the official form — combine overflow
    // onto the second line rather than silently dropping a third+ remark.
    if (box15Remarks.length > 0) form.getTextField('TextLinks_15_1').setText(box15Remarks[0]);
    if (box15Remarks.length > 1) form.getTextField('TextLinks_15_2').setText(box15Remarks.slice(1).join('; '));

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
