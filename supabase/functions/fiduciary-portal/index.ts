import { createClient } from 'npm:@supabase/supabase-js@2';

// Self-contained (the MCP deploy path does not resolve _shared/*.ts).
//
// The private link of a fiduciary's client that is not on Cantia
// (accounting.cantia.ch/depot?t=…): the client sees the documents its
// fiduciary asks for, uploads files, answers, and validates / signs the
// documents it is sent. No account: the token is the key. Every check is
// in the database (fiduciary_portal_* functions, service role only); this
// function adds what SQL cannot do: signed URLs for downloads and uploads,
// and the caller's IP for the signature proof.

const BUCKET = 'opus-storage';
const MAX_BYTES = 20 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  try {
    const body = await req.json();
    const token = String(body?.token ?? '');
    if (!UUID.test(token)) return json({ error: 'Lien invalide' }, 404);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const rpc = async (fn: string, args: Record<string, unknown>) => {
      const { data, error } = await admin.rpc(fn, args);
      if (error) throw new Error(error.message);
      return data;
    };

    switch (body.action) {
      case 'get': {
        const data = await rpc('fiduciary_portal_get', { p_token: token });
        if (!data) return json({ error: 'Lien invalide' }, 404);
        for (const a of data.approvals ?? []) {
          a.file_url = null;
          if (a.file_path) {
            const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(a.file_path, 3600);
            a.file_url = signed?.signedUrl ?? null;
          }
          delete a.file_path;
        }
        delete data.firm.id;
        delete data.client.id;
        return json(data);
      }
      case 'upload': {
        const request = String(body.request_id ?? '');
        const size = Number(body.size ?? 0);
        if (!UUID.test(request)) return json({ error: 'Demande introuvable' }, 404);
        if (!(size > 0) || size > MAX_BYTES) return json({ error: 'Fichier trop lourd (20 Mo maximum).' }, 400);
        const prefix = await rpc('fiduciary_portal_upload_prefix', { p_token: token, p_request: request });
        const safe = String(body.file_name ?? 'document')
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^A-Za-z0-9._-]+/g, '-')
          .slice(-120) || 'document';
        const path = `${prefix}${crypto.randomUUID().slice(0, 8)}-${safe}`;
        const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
        if (error || !data) return json({ error: error?.message ?? 'Envoi impossible' }, 500);
        return json({ path, upload_token: data.token });
      }
      case 'attach': {
        const request = String(body.request_id ?? '');
        const path = String(body.path ?? '');
        if (!UUID.test(request)) return json({ error: 'Demande introuvable' }, 404);
        const dir = path.slice(0, path.lastIndexOf('/'));
        const name = path.slice(path.lastIndexOf('/') + 1);
        const { data: found } = await admin.storage.from(BUCKET).list(dir, { search: name, limit: 1 });
        if (!found?.some((f) => f.name === name)) return json({ error: 'Fichier introuvable' }, 400);
        await rpc('fiduciary_portal_add_file', { p_token: token, p_request: request, p_path: path, p_name: String(body.file_name ?? name).slice(0, 255), p_size: Number(body.size ?? 0) || null });
        return json({ ok: true });
      }
      case 'answer': {
        await rpc('fiduciary_portal_answer', { p_token: token, p_request: String(body.request_id ?? ''), p_message: body.message ? String(body.message).slice(0, 2000) : null });
        return json({ ok: true });
      }
      case 'decide': {
        const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || null;
        const signature = body.signature ? String(body.signature) : null;
        if (signature && signature.length > 300000) return json({ error: 'Signature trop lourde' }, 400);
        await rpc('fiduciary_portal_decide', {
          p_token: token,
          p_approval: String(body.approval_id ?? ''),
          p_accept: body.accept === true,
          p_signer: body.signer_name ? String(body.signer_name).slice(0, 120) : null,
          p_signature: signature,
          p_reason: body.reason ? String(body.reason).slice(0, 1000) : null,
          p_ip: ip,
        });
        return json({ ok: true });
      }
      default:
        return json({ error: 'Action inconnue' }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Business errors raised by the database are shown as such.
    return json({ error: message.slice(0, 300) }, 400);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
