import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained (see generate-payslip-pdf's own comment for why — the MCP
// deploy path has repeatedly failed to resolve relative _shared/*.ts
// imports for functions authored this way).
//
// The employee-facing counterpart to public-document-pdf/list_client_documents
// but for payroll_profiles.public_token instead of devis/factures.public_token
// — an edge function rather than a plain RPC specifically because it also
// signs the org's logo out of private storage, which only an edge function
// (not SQL) can do. Verifies the same two-factor session as every other
// public-portal endpoint (has_valid_document_session), then returns the
// employee's finalized (validee/payee) payslips — never brouillon/calculee,
// which can still change before a manager finalizes them.

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, email, session } = await req.json();
    if (!token || !email || !session) return json({ error: 'Paramètres manquants' }, 400);

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

    const [{ data: org }, { data: member }, { data: slips }] = await Promise.all([
      admin.from('organizations').select('name, logo_url, locale').eq('id', profile.organization_id).single(),
      profile.user_id
        ? admin.from('organization_members').select('full_name').eq('organization_id', profile.organization_id).eq('user_id', profile.user_id).maybeSingle()
        : admin.from('payroll_ghost_employees').select('full_name').eq('id', profile.ghost_employee_id).maybeSingle(),
      admin
        .from('payroll_slips')
        .select('id, year, month, status, net_chf')
        .eq('organization_id', profile.organization_id)
        .eq('owner_key', profile.owner_key)
        .in('status', ['validee', 'payee'])
        .order('year', { ascending: false })
        .order('month', { ascending: false }),
    ]);

    let logoUrl: string | null = null;
    if (org?.logo_url) {
      const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(org.logo_url, 3600);
      logoUrl = signed?.signedUrl ?? null;
    }

    return json({
      organization_name: org?.name ?? 'Cantia',
      organization_locale: org?.locale === 'de' || org?.locale === 'it' ? org.locale : 'fr',
      organization_logo_url: logoUrl,
      employee_name: member?.full_name ?? '',
      payslips: (slips ?? []).map((s: any) => ({ id: s.id, year: s.year, month: s.month, status: s.status, net_chf: Number(s.net_chf) })),
    });
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
