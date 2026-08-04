import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFImage, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
  drawFooter,
  embedImageSmart,
  fetchStorageBytes,
  resolveBrand,
  resolveFooterText,
  resolvePdfTemplate,
  swissRound,
} from '../_shared/pdf-helpers.ts';
import { appendQrBillPage, isValidSwissIban } from '../_shared/qrbill.ts';
import { RENDERERS } from '../_shared/pdf-document-renderers.ts';

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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: devis, error: devisError } = await userClient
      .from('devis')
      .select('*, projects(name)')
      .eq('id', devis_id)
      .single();

    if (devisError || !devis) return json({ error: 'Devis introuvable ou accès refusé' }, 404);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', devis.organization_id).single(),
      admin.from('devis_items').select('*').eq('devis_id', devis_id).order('sort_order', { ascending: true }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let signatureImg: PDFImage | null = null;
    if (org?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.signature_url);
      if (bytes) signatureImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    const template = await resolvePdfTemplate(admin, devis.organization_id, 'devis', devis.template_id);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org);

    let pdfBytes: Uint8Array;

    {
      const rendered = RENDERERS[template.base_layout]({
        pdfDoc,
        font,
        fontBold,
        org,
        devis,
        items: items ?? [],
        signatureImg,
        brand,
        footerText,
        docLabel: 'Devis',
        metaLine: null,
      });
      drawFooter(rendered.page, font, rendered.pageNum, footerText ?? org?.name ?? 'Cantia');
      pdfBytes = await pdfDoc.save();
    }

    // Swiss QR-bill: a dedicated final page appended to the already-rendered
    // PDF (pdfDoc is mutated in place, so this applies identically whether
    // the devis used a preset or a custom layout, without touching either
    // rendering path). Opt-in — only when the org has a valid CH/LI IBAN.
    // Always a fresh page here (unlike generate-facture-pdf) — the footer
    // above is already drawn on the content's last page, so there's no
    // "reuse that page" path to wire up without redoing that footer call.
    if (isValidSwissIban(org?.iban)) {
      try {
        const itemsList = items ?? [];
        const subtotal = itemsList.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
        const vat = subtotal * (Number(devis.vat_rate) / 100);
        const total = swissRound(subtotal + vat);
        await appendQrBillPage(pdfDoc, font, fontBold, {
          iban: org.iban,
          creditor: { name: org.name ?? 'Entreprise', addressLine1: org.address ?? null },
          amount: total,
          currency: 'CHF',
          debtor: devis.client_name
            ? { name: devis.client_name, addressLine1: devis.client_address ?? null }
            : null,
          referenceId: devis.id,
          unstructuredMessage: devis.number ? `Devis ${devis.number}` : undefined,
        });
        pdfBytes = await pdfDoc.save();
      } catch (qrErr) {
        // A QR-bill failure must never take down devis generation — the
        // rest of the PDF is still valid and useful without it.
        console.error('QR-bill generation failed:', qrErr);
      }
    }

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
