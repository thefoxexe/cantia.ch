import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFImage, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
  decodeDataUrl,
  drawFooter,
  embedImageSmart,
  fetchStorageBytes,
  orgHasCustomization,
  resolveBrand,
  resolveFooterText,
  resolvePdfTemplate,
} from '../_shared/pdf-helpers.ts';
import { RENDERERS } from '../_shared/pdf-document-renderers.ts';
import { pdfT, resolveDocLocale } from '../_shared/pdf-i18n.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { devis_id } = await req.json();
    if (!devis_id) return json({ error: 'devis_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    // The org-member browser client always sends its own apikey (the anon
    // key) alongside its user JWT. Internal calls from send-devis-email
    // instead forward the service-role key as BOTH apikey and Authorization
    // — using the anon key here for those would pair an anon apikey with a
    // service-role bearer token, which PostgREST rejects as an invalid JWT
    // (401), even though the caller already re-verified org membership.
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: devis, error: devisError } = await userClient
      .from('devis')
      .select('*, projects(name)')
      .eq('id', devis_id)
      .single();

    if (devisError || !devis) return json({ error: 'Devis introuvable ou accès refusé' }, 404);

    const [{ data: org }, { data: items }, { data: creator }] = await Promise.all([
      admin.from('organizations').select('*, plans(has_customization)').eq('id', devis.organization_id).single(),
      admin.from('devis_items').select('*').eq('devis_id', devis_id).order('sort_order', { ascending: true }),
      devis.created_by
        ? admin
            .from('organization_members')
            .select('full_name, signature_url')
            .eq('organization_id', devis.organization_id)
            .eq('user_id', devis.created_by)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // A devis is signed by whoever drew it up, not by "the company" — the
    // creator's own personal signature (organization_members.signature_url),
    // not org.signature_url.
    let signatureImg: PDFImage | null = null;
    if (creator?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, creator.signature_url);
      if (bytes) signatureImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    // Proof of the client's own e-signature (captured once via
    // accept_public_devis, stored inline as a data: URL rather than a
    // storage path) — baked into the PDF whenever present so the document
    // itself carries the evidence, not just a database row.
    let clientSignatureImg: PDFImage | null = null;
    if (devis.client_signature_data) {
      const decoded = decodeDataUrl(devis.client_signature_data);
      if (decoded) clientSignatureImg = await embedImageSmart(pdfDoc, decoded.bytes, decoded.contentType);
    }

    const locale = resolveDocLocale(devis, org);
    const signatureLabel = creator?.full_name
      ? pdfT(locale, 'signatureOf', { name: creator.full_name })
      : pdfT(locale, 'signature');

    const template = await resolvePdfTemplate(admin, devis.organization_id, 'devis', devis.template_id);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org, orgHasCustomization(org), locale);

    // A devis is a quote, not a payment request — no QR-bill here (that's
    // generate-facture-pdf's job, once the client has accepted and it's
    // been converted to a facture).
    const rendered = RENDERERS[template.base_layout]({
      pdfDoc,
      font,
      fontBold,
      org,
      devis,
      items: items ?? [],
      signatureImg,
      signatureLabel,
      showSignatures: true,
      clientSignatureImg,
      clientSignedAt: devis.client_signed_at,
      clientSignerName: devis.client_signer_name,
      brand,
      footerText,
      docLabel: pdfT(locale, 'devisLabel'),
      docKind: 'devis',
      metaLine: null,
      locale,
    });
    drawFooter(rendered.page, font, rendered.pageNum, footerText ?? org?.name ?? 'Cantia', locale);
    const pdfBytes = await pdfDoc.save();

    const path = `${devis.organization_id}/devis/${devis.id}/devis-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);

    await admin.from('devis').update({ pdf_path: path }).eq('id', devis_id);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ path, url: signed?.signedUrl ?? null, template: template.base_layout });
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
