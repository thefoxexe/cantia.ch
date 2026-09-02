import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
  drawFooter,
  formatDate,
  orgHasCustomization,
  resolveBrand,
  resolveFooterText,
  resolvePdfTemplate,
  swissRound,
} from '../_shared/pdf-helpers.ts';
import { appendQrBillPage, isValidSwissIban } from '../_shared/qrbill.ts';
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
    const { facture_id } = await req.json();
    if (!facture_id) return json({ error: 'facture_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    // The org-member browser client always sends its own apikey (the anon
    // key) alongside its user JWT. Internal calls from send-facture-email
    // instead forward the service-role key as BOTH apikey and Authorization
    // — using the anon key here for those would pair an anon apikey with a
    // service-role bearer token, which PostgREST rejects as an invalid JWT
    // (401), even though the caller already re-verified org membership.
    const apikeyHeader = req.headers.get('apikey') ?? anonKey;

    const userClient = createClient(supabaseUrl, apikeyHeader, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: facture, error: factureError } = await userClient
      .from('factures')
      .select('*, projects(name)')
      .eq('id', facture_id)
      .single();

    if (factureError || !facture) return json({ error: 'Facture introuvable ou accès refusé' }, 404);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('*, plans(has_customization)').eq('id', facture.organization_id).single(),
      admin.from('facture_items').select('*').eq('facture_id', facture_id).order('sort_order', { ascending: true }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Factures share the org's devis templates (kind 'devis') rather than
    // having their own — the layout needs (client block, items table,
    // totals) are identical, only the label/meta line differ, which is
    // handled via docLabel/metaLine below instead of a separate template kind.
    const locale = resolveDocLocale(facture, org);
    const template = await resolvePdfTemplate(admin, facture.organization_id, 'devis', facture.template_id);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org, orgHasCustomization(org), locale);

    const metaLine =
      facture.status === 'paid' && facture.paid_at
        ? pdfT(locale, 'paidOn', { date: formatDate(facture.paid_at, locale) })
        : pdfT(locale, 'dueDate', { date: formatDate(facture.due_date, locale) });

    let pdfBytes: Uint8Array;
    const docLabel = pdfT(locale, facture.is_deposit ? 'factureDepositLabel' : 'factureLabel');

    {
      const rendered = RENDERERS[template.base_layout]({
        pdfDoc,
        font,
        fontBold,
        org,
        devis: facture,
        items: items ?? [],
        signatureImg: null,
        signatureLabel: '',
        showSignatures: false,
        brand,
        footerText,
        docLabel,
        docKind: 'facture',
        metaLine,
        locale,
      });

      // The QR-bill band goes on this same last page when there's enough
      // clear space below the content (checked inside appendQrBillPage);
      // in that case the band takes over the bottom of the page instead of
      // the normal footer, so the footer is only drawn when the band ended
      // up on a fresh page of its own (or wasn't generated at all).
      let footerOwedOnContentPage = true;
      if (facture.status !== 'paid' && isValidSwissIban(org?.iban)) {
        try {
          const itemsList = items ?? [];
          const subtotal = itemsList.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
          const vat = subtotal * (Number(facture.vat_rate) / 100);
          const total = swissRound(subtotal + vat);
          const reusedContentPage = await appendQrBillPage(
            pdfDoc,
            font,
            fontBold,
            {
              iban: org.iban,
              creditor: {
                name: org.name ?? pdfT(locale, 'entrepriseFallback'),
                addressLine1: org.street ?? org.address ?? null,
                postalCode: org.postal_code ?? null,
                town: org.locality ?? null,
              },
              amount: total,
              currency: 'CHF',
              debtor: facture.client_name
                ? { name: facture.client_name, addressLine1: facture.client_address ?? null }
                : null,
              referenceId: facture.id,
              unstructuredMessage: facture.number ? `${docLabel} ${facture.number}` : undefined,
            },
            { page: rendered.page, y: rendered.y },
            locale,
          );
          footerOwedOnContentPage = !reusedContentPage;
        } catch (qrErr) {
          console.error('QR-bill generation failed:', qrErr);
        }
      }
      if (footerOwedOnContentPage) {
        drawFooter(rendered.page, font, rendered.pageNum, footerText ?? org?.name ?? 'Cantia', locale);
      }
      pdfBytes = await pdfDoc.save();
    }

    const path = `${facture.organization_id}/factures/${facture.id}/facture-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);

    await admin.from('factures').update({ pdf_path: path }).eq('id', facture_id);

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
