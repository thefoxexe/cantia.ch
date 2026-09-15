import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained (see generate-payslip-pdf's own comment for why).
//
// Verifies the employee's public-portal session, confirms the requested
// slip actually belongs to that employee, then generates the PDF by
// calling generate-payslip-pdf internally with the SERVICE ROLE key as
// Authorization — that function's own RLS-based check
// (payroll_profiles select via the caller's JWT) passes trivially for the
// service role, which bypasses RLS entirely, so this is a genuine "trusted
// internal call" rather than a workaround. This reuses 100% of the existing
// gross/deductions/wage-lines calculation logic instead of duplicating it a
// third time.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, email, session, slip_id } = await req.json();
    if (!token || !email || !session || !slip_id) return json({ error: 'Paramètres manquants' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: profile } = await admin
      .from('payroll_profiles')
      .select('organization_id, user_id, ghost_employee_id, owner_key, personal_email')
      .eq('public_token', token)
      .maybeSingle();
    if (!profile || !profile.personal_email || profile.personal_email.trim().toLowerCase() !== normalizedEmail) {
      return json({ error: 'Lien invalide' }, 404);
    }

    const { data: validSession } = await admin.rpc('has_valid_document_session', { p_token: token, p_email: normalizedEmail, p_session: session });
    if (!validSession) return json({ error: 'Vérification requise' }, 403);

    const { data: slip } = await admin
      .from('payroll_slips')
      .select('id, year, month, status, organization_id, owner_key')
      .eq('id', slip_id)
      .maybeSingle();
    if (!slip || slip.organization_id !== profile.organization_id || slip.owner_key !== profile.owner_key || !['validee', 'payee'].includes(slip.status)) {
      return json({ error: 'Fiche introuvable' }, 404);
    }

    const periodStart = `${slip.year}-${String(slip.month).padStart(2, '0')}-01`;

    const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-payslip-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: profile.user_id ?? undefined,
        ghost_employee_id: profile.ghost_employee_id ?? undefined,
        period_start: periodStart,
      }),
    });
    const genData = await genRes.json().catch(() => null);
    if (!genRes.ok || !genData?.url) {
      return json({ error: genData?.error ?? 'Échec de la génération du PDF.' }, 500);
    }

    return json({ url: genData.url });
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
