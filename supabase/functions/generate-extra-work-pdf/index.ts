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
  resolveLogoPlacement,
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

// Same unified layout as generate-devis-pdf — a travaux supplémentaires
// document is structurally a devis (client block, item lines, totals,
// creator + client signature) that happens to skip the "valable X jours"
// quote-validity notice (see docKind: 'extra_work' in
// pdf-document-renderers.ts) since it's either already signed or still a
// plain draft, never a time-limited offer.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { extra_work_id } = await req.json();
    if (!extra_work_id) return json({ error: 'extra_work_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: work, error: workError } = await userClient
      .from('extra_works')
      .select('*, projects(name)')
      .eq('id', extra_work_id)
      .single();

    if (workError || !work) return json({ error: 'Travaux supplémentaires introuvables ou accès refusé' }, 404);

    const [{ data: org }, { data: items }, { data: creator }] = await Promise.all([
      admin.from('organizations').select('*, plans(has_customization)').eq('id', work.organization_id).single(),
      admin.from('extra_work_items').select('*').eq('extra_work_id', extra_work_id).order('sort_order', { ascending: true }),
      work.created_by
        ? admin
            .from('organization_members')
            .select('full_name, signature_url')
            .eq('organization_id', work.organization_id)
            .eq('user_id', work.created_by)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let signatureImg: PDFImage | null = null;
    if (creator?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, creator.signature_url);
      if (bytes) signatureImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    // Captured either through the public client portal (email + token) or
    // through the in-app "Signer maintenant" live flow — both write to the
    // same client_signature_data column, so this embedding step doesn't
    // need to know which path produced it.
    let clientSignatureImg: PDFImage | null = null;
    if (work.client_signature_data) {
      const decoded = decodeDataUrl(work.client_signature_data);
      if (decoded) clientSignatureImg = await embedImageSmart(pdfDoc, decoded.bytes, decoded.contentType);
    }

    const locale = resolveDocLocale(work, org);
    const signatureLabel = creator?.full_name
      ? pdfT(locale, 'signatureOf', { name: creator.full_name })
      : pdfT(locale, 'signature');

    // No dedicated extra_work template concept (no template_id column) —
    // reuses the org's devis template/base_layout choice, same as every
    // other unified-layout document.
    const template = await resolvePdfTemplate(admin, work.organization_id, 'devis', null);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org, orgHasCustomization(org), locale);

    let logoImg: PDFImage | null = null;
    if (org?.logo_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.logo_url);
      if (bytes) logoImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }
    const logoPlacement = resolveLogoPlacement(template, org);

    const rendered = RENDERERS[template.base_layout]({
      pdfDoc,
      font,
      fontBold,
      org,
      devis: work,
      items: items ?? [],
      signatureImg,
      signatureLabel,
      showSignatures: true,
      clientSignatureImg,
      clientSignedAt: work.client_signed_at,
      clientSignerName: work.client_signer_name,
      logoImg,
      logoPlacement,
      brand,
      footerText,
      docLabel: pdfT(locale, 'extraWorkLabel'),
      docKind: 'extra_work',
      metaLine: null,
      locale,
    });
    drawFooter(rendered.page, font, rendered.pageNum, footerText ?? org?.name ?? 'Cantia', locale);
    const pdfBytes = await pdfDoc.save();

    const path = `${work.organization_id}/travaux-supplementaires/${work.id}/ts-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);

    await admin.from('extra_works').update({ pdf_path: path }).eq('id', extra_work_id);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ path, url: signed?.signedUrl ?? null });
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
