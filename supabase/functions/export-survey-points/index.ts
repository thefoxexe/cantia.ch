import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SurveyPointRow {
  code: string;
  description: string | null;
  class: string | null;
  latitude: number;
  longitude: number;
  elevation: number | null;
  lv95_e: number | null;
  lv95_n: number | null;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildCsv(points: SurveyPointRow[]): string {
  const header = 'code,class,description,longitude,latitude,elevation,lv95_e,lv95_n';
  const rows = points.map((p) =>
    [
      p.code,
      p.class ?? '',
      p.description ?? '',
      p.longitude,
      p.latitude,
      p.elevation ?? '',
      p.lv95_e ?? '',
      p.lv95_n ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

function buildDxf(points: SurveyPointRow[]): string {
  const lines: string[] = ['0', 'SECTION', '2', 'ENTITIES'];
  for (const p of points) {
    const x = p.lv95_e ?? 0;
    const y = p.lv95_n ?? 0;
    const z = p.elevation ?? 0;
    const layer = p.class ? p.class.replace(/[^A-Za-z0-9_-]/g, '_') : 'LEVES';
    lines.push('0', 'POINT', '8', layer, '10', String(x), '20', String(y), '30', String(z));
    lines.push(
      '0',
      'TEXT',
      '8',
      `${layer}_TEXT`,
      '10',
      String(x + 0.3),
      '20',
      String(y + 0.3),
      '30',
      String(z),
      '40',
      '0.5',
      '1',
      p.description ? `${p.code} - ${p.description}` : p.code,
    );
  }
  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

// LandXML CgPoints — widely supported "point XML" survey format (Civil 3D, etc.)
function buildLandXml(points: SurveyPointRow[]): string {
  const cgPoints = points
    .map((p) => {
      const code = [p.class, p.description].filter(Boolean).join(' - ');
      return `    <CgPoint name="${xmlEscape(p.code)}" code="${xmlEscape(code)}">${(p.lv95_n ?? 0).toFixed(3)} ${(p.lv95_e ?? 0).toFixed(3)} ${(p.elevation ?? 0).toFixed(3)}</CgPoint>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2" date="${new Date().toISOString().slice(0, 10)}">
  <CgPoints>
${cgPoints}
  </CgPoints>
</LandXML>`;
}

function buildGpx(points: SurveyPointRow[]): string {
  const waypoints = points
    .map((p) => {
      const eleLine = p.elevation != null ? `\n    <ele>${p.elevation}</ele>` : '';
      const desc = [p.class, p.description].filter(Boolean).join(' — ');
      return `  <wpt lat="${p.latitude}" lon="${p.longitude}">${eleLine}
    <name>${xmlEscape(p.code)}</name>${desc ? `\n    <desc>${xmlEscape(desc)}</desc>` : ''}
  </wpt>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cantia" xmlns="http://www.topografix.com/GPX/1/1">
${waypoints}
</gpx>`;
}

const EXPORTERS: Record<string, { build: (p: SurveyPointRow[]) => string; ext: string; contentType: string }> = {
  csv: { build: buildCsv, ext: 'csv', contentType: 'text/csv' },
  dxf: { build: buildDxf, ext: 'dxf', contentType: 'application/dxf' },
  xml: { build: buildLandXml, ext: 'xml', contentType: 'application/xml' },
  gpx: { build: buildGpx, ext: 'gpx', contentType: 'application/gpx+xml' },
};

async function sendExportEmail(toEmail: string, downloadUrl: string, projectName: string, format: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return { ok: false, error: "L'envoi par e-mail n'est pas encore configuré côté serveur. Utilisez le téléchargement direct." };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Cantia <noreply@cantia.ch>',
      to: [toEmail],
      subject: `Votre export de points — ${projectName}`,
      html: `<p>Votre export des points de levé (${format.toUpperCase()}) pour <strong>${projectName}</strong> est prêt.</p><p><a href="${downloadUrl}">Télécharger le fichier</a> (lien valable 24h).</p>`,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `Échec de l'envoi de l'e-mail (${res.status}).` };
  }
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { project_id, format, delivery, email } = await req.json();
    if (!project_id || !format || !EXPORTERS[format]) return json({ error: 'Paramètres invalides' }, 400);
    if (delivery === 'email' && !email) return json({ error: 'Adresse e-mail requise' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: project, error: projectError } = await userClient
      .from('projects')
      .select('id, name, organization_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) return json({ error: 'Chantier introuvable ou accès refusé' }, 404);

    const { data: points } = await admin
      .from('survey_points')
      .select('code, description, class, latitude, longitude, elevation, lv95_e, lv95_n')
      .eq('project_id', project_id)
      .order('sort_order', { ascending: true });

    if (!points || points.length === 0) return json({ error: 'Aucun point à exporter' }, 400);

    const exporter = EXPORTERS[format];
    const content = exporter.build(points as SurveyPointRow[]);
    const path = `${project.organization_id}/exports/${project.id}/points-${Date.now()}.${exporter.ext}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, new TextEncoder().encode(content), { contentType: exporter.contentType, upsert: true });

    if (uploadError) return json({ error: `Échec de la génération: ${uploadError.message}` }, 500);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
    if (!signed?.signedUrl) return json({ error: 'Impossible de générer le lien de téléchargement' }, 500);

    if (delivery === 'email') {
      const result = await sendExportEmail(email, signed.signedUrl, project.name, format);
      if (!result.ok) return json({ error: result.error }, 502);
      return json({ sent: true });
    }

    return json({ url: signed.signedUrl, path });
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
