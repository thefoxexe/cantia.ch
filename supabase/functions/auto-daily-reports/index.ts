import { createClient } from 'npm:@supabase/supabase-js@2';

// Called only by pg_cron (see migration for the schedule + shared secret),
// never by a client — once a day, sweeps every active chantier with
// auto_daily_report_enabled turned on, and for each one still carrying
// un-folded feed_entries from roughly the last day (a chef d'équipe wrote a
// note or left a voice message), compiles them into a report exactly like
// the manual "Générer le rapport" action does: report row, photos, AI
// polish pass on the notes, PDF. A chantier with zero feed activity in the
// window is skipped entirely — this never invents a report out of nothing.
const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: projects } = await admin
    .from('projects')
    .select('id, organization_id, name')
    .eq('auto_daily_report_enabled', true)
    .eq('status', 'active');

  const summary: { project_id: string; report_id: string | null; skipped: boolean; error: string | null }[] = [];

  for (const project of projects ?? []) {
    const { data: entries } = await admin
      .from('feed_entries')
      .select('*')
      .eq('project_id', project.id)
      .is('report_id', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (!entries || entries.length === 0) {
      summary.push({ project_id: project.id, report_id: null, skipped: true, error: null });
      continue;
    }

    const { data: members } = await admin
      .from('organization_members')
      .select('user_id, full_name')
      .eq('organization_id', project.organization_id);
    const authorNames: Record<string, string> = {};
    for (const m of members ?? []) {
      if (m.user_id && m.full_name) authorNames[m.user_id] = m.full_name;
    }

    const dateLabel = new Date().toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const noteLines = entries
      .filter((e) => (e.type === 'note' && e.body) || (e.type === 'voice' && e.transcript))
      .map((e) => {
        const author = (e.created_by && authorNames[e.created_by]) || 'Membre';
        const when = new Date(e.created_at).toLocaleString('fr-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const text = e.type === 'voice' ? e.transcript : e.body;
        return `[${when}] ${author} : ${text}`;
      });

    const { data: report, error: reportError } = await admin
      .from('reports')
      .insert({
        organization_id: project.organization_id,
        project_id: project.id,
        title: `Rapport automatique du ${dateLabel}`,
        notes: noteLines.join('\n\n') || null,
      })
      .select()
      .single();

    if (reportError || !report) {
      summary.push({ project_id: project.id, report_id: null, skipped: false, error: reportError?.message ?? 'Échec de la création du rapport' });
      continue;
    }

    const photoEntries = entries.filter((e) => e.type === 'photo' && e.storage_path);
    for (let i = 0; i < photoEntries.length; i++) {
      const e = photoEntries[i];
      await admin.from('report_photos').insert({
        report_id: report.id,
        storage_path: e.storage_path,
        caption: e.caption,
        latitude: e.latitude,
        longitude: e.longitude,
        taken_at: e.taken_at ?? e.created_at,
        sort_order: i,
      });
    }

    await admin.from('feed_entries').update({ report_id: report.id }).in('id', entries.map((e) => e.id));

    // Both calls below run as service_role (Bearer = the service key itself,
    // same trick used by send-devis-email/send-facture-email to call
    // generate-*-pdf without a real end-user session) — this cron sweep has
    // no user JWT to forward, and service_role bypasses RLS entirely so the
    // downstream RLS-scoped selects inside those functions still resolve.
    if (noteLines.length > 0) {
      const polishRes = await fetch(`${supabaseUrl}/functions/v1/polish-report-notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: report.id }),
      });
      const polishData = await polishRes.json().catch(() => null);
      if (polishRes.ok && polishData?.notes) {
        await admin.from('reports').update({ notes: polishData.notes }).eq('id', report.id);
      }
    }

    const pdfRes = await fetch(`${supabaseUrl}/functions/v1/generate-report-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: report.id }),
    });
    const pdfData = await pdfRes.json().catch(() => null);
    if (!pdfRes.ok) {
      summary.push({ project_id: project.id, report_id: report.id, skipped: false, error: pdfData?.error ?? 'Échec de la génération du PDF' });
      continue;
    }

    summary.push({ project_id: project.id, report_id: report.id, skipped: false, error: null });
  }

  return new Response(JSON.stringify({ processed: summary.length, summary }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
