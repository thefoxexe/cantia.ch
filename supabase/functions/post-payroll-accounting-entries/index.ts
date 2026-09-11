import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Cahier des charges V2, §11 "Salaire simplifié" — one posted entry per
// employee per month: Débit Charges de personnel (brut), Crédit Charges
// sociales dues (retenues employé), Crédit Salaires à payer (net). Payroll
// has no single DB row a trigger can hang off (it's derived from a whole
// month of time entries), so this is a manual monthly batch action rather
// than an automatic trigger like factures/paiements/dépenses.
//
// Employer-side charges (§7.8 coût employeur) are deliberately NOT posted
// here — payroll_deduction_types only ever stored the EMPLOYEE's share
// (see 20260818120000's own comment), there is no employer-contribution
// rate anywhere in the schema yet to compute a real number from. Adding
// that is Lot 4 (§7.3) scope, not invented here.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { organization_id, year, month } = await req.json();
    if (!organization_id || !year || !month) return json({ error: 'organization_id, year et month requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(supabaseUrl, serviceKey);

    // Authorization: same RPC-based permission check the posting engine
    // itself uses, called as the calling user (not the service role) so
    // it reflects their real org_role.
    const { data: canPost, error: permError } = await userClient.rpc('can_post_org_accounting_entries', { org_id: organization_id });
    if (permError || !canPost) return json({ error: 'Accès refusé' }, 403);

    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEndDate = new Date(Date.UTC(Number(year), Number(month), 0));
    const monthEnd = monthEndDate.toISOString().slice(0, 10);

    const [{ data: profiles }, { data: members }, { data: deductionTypes }, { data: overrides }, { data: mappings }, { data: journal }] = await Promise.all([
      admin.from('payroll_profiles').select('*').eq('organization_id', organization_id),
      admin.from('organization_members').select('user_id, full_name').eq('organization_id', organization_id),
      admin.from('payroll_deduction_types').select('*').eq('organization_id', organization_id).eq('active', true),
      admin.from('payroll_profile_deductions').select('*').eq('organization_id', organization_id),
      admin.from('accounting_account_mappings').select('mapping_key, account_id').eq('organization_id', organization_id),
      admin.from('accounting_journals').select('id').eq('organization_id', organization_id).eq('code', 'SA').maybeSingle(),
    ]);

    const mappingByKey = new Map((mappings ?? []).map((m: any) => [m.mapping_key, m.account_id]));
    const accSalairesBruts = mappingByKey.get('salaires_bruts');
    const accChargesSocialesEmploye = mappingByKey.get('charges_sociales_employe');
    const accSalairesAPayer = mappingByKey.get('salaires_a_payer');
    if (!accSalairesBruts || !accChargesSocialesEmploye || !accSalairesAPayer || !journal?.id) {
      return json({ error: 'Mapping de comptes ou journal salaires manquant. Complétez-les dans Comptabilité → Paramètres.' }, 422);
    }

    const { data: fiscalYear } = await admin
      .from('accounting_fiscal_years')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('status', 'open')
      .lte('start_date', monthEnd)
      .gte('end_date', monthEnd)
      .maybeSingle();
    if (!fiscalYear?.id) return json({ error: `Aucun exercice ouvert ne couvre ${monthEnd}.` }, 422);

    const nameByUser = new Map((members ?? []).map((m: any) => [m.user_id, m.full_name as string | null]));
    const overridesByProfile = new Map<string, any[]>();
    for (const o of overrides ?? []) {
      const key = o.user_id ?? o.ghost_employee_id;
      if (!overridesByProfile.has(key)) overridesByProfile.set(key, []);
      overridesByProfile.get(key)!.push(o);
    }

    let posted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const profile of profiles ?? []) {
      const ownerId = profile.user_id ?? profile.ghost_employee_id;
      const externalRef = `payroll:${ownerId}:${year}-${String(month).padStart(2, '0')}`;

      const { data: existing } = await admin
        .from('accounting_entries')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('source', 'salaire')
        .eq('external_reference', externalRef)
        .maybeSingle();
      if (existing) {
        skipped += 1;
        continue;
      }

      const isHourly = profile.salary_type === 'hourly';
      let gross = 0;
      if (isHourly) {
        const { data: entries } = await admin
          .from('payroll_time_entries')
          .select('hours')
          .eq('organization_id', organization_id)
          .eq('user_id', profile.user_id)
          .gte('entry_date', monthStart)
          .lte('entry_date', monthEnd);
        const hours = (entries ?? []).reduce((s: number, e: any) => s + Number(e.hours), 0);
        gross = Math.round(hours * Number(profile.hourly_rate_chf ?? 0) * 100) / 100;
      } else {
        gross = Number(profile.monthly_salary_chf ?? 0);
      }
      if (gross === 0) continue;

      const ownerOverrides = overridesByProfile.get(ownerId) ?? [];
      const overrideByType = new Map(ownerOverrides.map((o: any) => [o.deduction_type_id, o]));
      let totalDeductions = 0;
      for (const dt of deductionTypes ?? []) {
        const override: any = overrideByType.get(dt.id);
        if (override && !override.enabled) continue;
        const ratePercent = override?.rate_percent ?? dt.default_rate_percent;
        const fixedAmount = override?.fixed_amount_chf;
        const amount = fixedAmount != null ? Number(fixedAmount) : ratePercent != null ? (gross * Number(ratePercent)) / 100 : 0;
        totalDeductions += amount;
      }
      totalDeductions = Math.round(totalDeductions * 100) / 100;
      const net = Math.round((gross - totalDeductions) * 100) / 100;

      const employeeName = profile.user_id ? (nameByUser.get(profile.user_id) ?? 'Employé') : 'Employé';
      const label = `Salaire ${String(month).padStart(2, '0')}/${year} — ${employeeName}`;

      try {
        const { data: entry, error: entryError } = await admin
          .from('accounting_entries')
          .insert({
            organization_id,
            fiscal_year_id: fiscalYear.id,
            journal_id: journal.id,
            entry_date: monthEnd,
            label,
            source: 'salaire',
            source_id: profile.id,
            external_reference: externalRef,
            status: 'brouillon',
          })
          .select('id')
          .single();
        if (entryError || !entry) throw new Error(entryError?.message ?? 'insert failed');

        const lines = [{ account_id: accSalairesBruts, debit: gross, credit: 0, label, sort_order: 0 }];
        if (totalDeductions > 0) lines.push({ account_id: accChargesSocialesEmploye, debit: 0, credit: totalDeductions, label: `Charges sociales — ${label}`, sort_order: 1 });
        lines.push({ account_id: accSalairesAPayer, debit: 0, credit: net, label: `Net à payer — ${label}`, sort_order: 2 });

        const { error: linesError } = await admin.from('accounting_entry_lines').insert(lines.map((l) => ({ ...l, entry_id: entry.id })));
        if (linesError) throw new Error(linesError.message);

        const { error: postError } = await admin.rpc('post_accounting_entry', { p_entry_id: entry.id });
        if (postError) throw new Error(postError.message);

        posted += 1;
      } catch (err) {
        errors.push(`${employeeName}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return json({ posted, skipped, errors });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
