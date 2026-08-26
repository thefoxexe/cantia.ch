// Actual sync operations shared between the client-triggered bexio-sync
// function and the hourly bexio-cron-sync function, so both call exactly
// the same logic rather than two copies drifting apart.
//
// deno-lint-ignore-file no-explicit-any

import {
  bexioJson,
  bexioSearch,
  decodeBexioCompanyUserId,
  fetchAllBexioPages,
  getValidAccessToken,
  resolveBexioSalesTaxId,
  type BexioIntegrationRow,
} from './bexio.ts';

export interface SyncResult {
  action: string;
  ok: boolean;
  count?: number;
  error?: string;
}

async function logSync(
  admin: any,
  integration: BexioIntegrationRow,
  entry: {
    entity_type?: string;
    local_id?: string | null;
    external_id?: string | null;
    direction: 'push' | 'pull';
    action: 'create' | 'update' | 'delete' | 'skip' | 'error';
    status: 'success' | 'error' | 'retrying';
    error_message?: string;
    payload_summary?: Record<string, unknown>;
  },
) {
  await admin.from('integration_sync_logs').insert({
    integration_id: integration.id,
    organization_id: integration.organization_id,
    entity_type: entry.entity_type ?? null,
    local_id: entry.local_id ?? null,
    external_id: entry.external_id ?? null,
    direction: entry.direction,
    action: entry.action,
    status: entry.status,
    error_message: entry.error_message ?? null,
    payload_summary: entry.payload_summary ?? {},
  });
}

// ---------------------------------------------------------------------------
// kb_item_setting -> integration_settings defaults (cahier des charges
// section 42/43). Never hardcode currency/bank/language/payment-type/tax
// treatment — always resolve from the connected Bexio account.
// ---------------------------------------------------------------------------
export async function syncBexioSettings(admin: any, integration: BexioIntegrationRow): Promise<SyncResult> {
  try {
    const raw = await bexioJson<any>(admin, integration, '/2.0/kb_item_setting');
    const rows: any[] = Array.isArray(raw) ? raw : [raw];
    const invoiceSetting = rows.find((r) => r?.kb_item_class === 'KbInvoice') ?? rows[0];
    if (!invoiceSetting) throw new Error('Aucun réglage documentaire retourné par Bexio.');

    const invoiceDefaults = {
      default_language_id: invoiceSetting.default_language_id ?? null,
      default_bank_account_id: invoiceSetting.default_client_bank_account_new_id ?? null,
      default_currency_id: invoiceSetting.default_currency_id ?? null,
      default_payment_type_id: invoiceSetting.default_payment_type_id ?? null,
      default_mwst_type: invoiceSetting.default_mwst_type ?? null,
      default_mwst_is_net: invoiceSetting.default_mwst_is_net ?? null,
    };

    // KbOffer defaults for the devis -> kb_offer push (bexio-push-devis) —
    // same idea as invoice_defaults above, one more entry pulled from the
    // same endpoint. Falls back to rows[0] the same way invoiceSetting
    // does if this org's account genuinely has no KbOffer entry yet
    // (e.g. it's never had a quote/offer feature touched in Bexio).
    const offerSetting = rows.find((r) => r?.kb_item_class === 'KbOffer') ?? rows[0];
    const quoteDefaults = offerSetting
      ? {
          default_language_id: offerSetting.default_language_id ?? null,
          default_bank_account_id: offerSetting.default_client_bank_account_new_id ?? null,
          default_currency_id: offerSetting.default_currency_id ?? null,
          default_payment_type_id: offerSetting.default_payment_type_id ?? null,
          default_mwst_type: offerSetting.default_mwst_type ?? null,
          default_mwst_is_net: offerSetting.default_mwst_is_net ?? null,
          default_show_position_taxes: offerSetting.default_show_position_taxes ?? null,
          default_time_period_in_days: offerSetting.default_time_period_in_days ?? null,
        }
      : null;

    const { data: existing } = await admin.from('integration_settings').select('id, entity_settings').eq('integration_id', integration.id).maybeSingle();
    const nextEntitySettings = {
      ...(existing?.entity_settings ?? {}),
      invoice_defaults: invoiceDefaults,
      ...(quoteDefaults ? { quote_defaults: quoteDefaults } : {}),
    };
    if (existing) {
      await admin.from('integration_settings').update({ entity_settings: nextEntitySettings }).eq('id', existing.id);
    } else {
      await admin.from('integration_settings').insert({
        integration_id: integration.id,
        organization_id: integration.organization_id,
        entity_settings: nextEntitySettings,
      });
    }
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'settings', payload_summary: invoiceDefaults });
    return { action: 'settings', ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'settings', error_message: message });
    return { action: 'settings', ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Contacts: Bexio -> Cantia only for V1 (cahier des charges section 18) —
// safer, and Cantia never risks overwriting a Bexio record. Bexio is the
// source of truth for clients during V1 (section 58), so every sync
// overwrites the mapped fields with what Bexio currently has.
// ---------------------------------------------------------------------------
interface BexioContact {
  id: number;
  contact_type_id: number | null;
  name_1: string | null;
  name_2: string | null;
  mail: string | null;
  phone_fixed: string | null;
  phone_mobile: string | null;
  address: string | null;
  street_name: string | null;
  house_number: string | null;
  postcode: string | null;
  city: string | null;
  remarks: string | null;
  updated_at: string | null;
}

function mapBexioContactToClient(c: BexioContact): { type: 'entreprise' | 'particulier'; name: string; company_name: string | null; email: string | null; phone: string | null; address: string | null; notes: string | null } {
  const isCompany = c.contact_type_id === 1;
  const streetLine = [c.street_name ?? c.address, c.house_number].filter(Boolean).join(' ').trim();
  const cityLine = [c.postcode, c.city].filter(Boolean).join(' ').trim();
  const address = [streetLine, cityLine].filter(Boolean).join('\n') || null;
  return {
    type: isCompany ? 'entreprise' : 'particulier',
    name: isCompany ? (c.name_1 ?? '—') : [c.name_2, c.name_1].filter(Boolean).join(' ').trim() || c.name_1 || '—',
    company_name: isCompany ? c.name_1 : null,
    email: c.mail || null,
    phone: c.phone_mobile || c.phone_fixed || null,
    address,
    notes: c.remarks || null,
  };
}

export async function syncBexioContacts(admin: any, integration: BexioIntegrationRow): Promise<SyncResult> {
  try {
    const contacts = await fetchAllBexioPages<BexioContact>(admin, integration, '/2.0/contact');
    let count = 0;
    for (const contact of contacts) {
      const externalId = String(contact.id);
      const mapped = mapBexioContactToClient(contact);

      const { data: existingMapping } = await admin
        .from('integration_mappings')
        .select('id, local_id')
        .eq('integration_id', integration.id)
        .eq('entity_type', 'client')
        .eq('external_id', externalId)
        .maybeSingle();

      if (existingMapping) {
        const updatePayload: Record<string, unknown> = { type: mapped.type, name: mapped.name, company_name: mapped.company_name, email: mapped.email, phone: mapped.phone, address: mapped.address };
        if (mapped.notes) updatePayload.notes = mapped.notes;
        await admin.from('clients').update(updatePayload).eq('id', existingMapping.local_id);
        await admin
          .from('integration_mappings')
          .update({ last_synced_at: new Date().toISOString(), external_updated_at: contact.updated_at })
          .eq('id', existingMapping.id);
      } else {
        const { data: newClient, error: insertError } = await admin
          .from('clients')
          .insert({ organization_id: integration.organization_id, ...mapped })
          .select('id')
          .single();
        if (insertError || !newClient) throw new Error(insertError?.message ?? 'Échec de création du client');
        await admin.from('integration_mappings').insert({
          integration_id: integration.id,
          organization_id: integration.organization_id,
          entity_type: 'client',
          local_id: newClient.id,
          external_id: externalId,
          external_type: 'contact',
          sync_direction: 'pull',
          last_synced_at: new Date().toISOString(),
          external_updated_at: contact.updated_at,
        });
      }
      count += 1;
    }
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'client', payload_summary: { count } });
    return { action: 'contacts', ok: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'client', error_message: message });
    return { action: 'contacts', ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Articles: Bexio -> Cantia Catalogue, same one-directional, Bexio-is-
// source-of-truth pattern as contacts (article_show scope). Bexio's article
// field names aren't in a dedicated cahier des charges section beyond the
// scope grant, so they're inferred by analogy the same way KbPositionCustom
// was for the invoice push — an article missing a name or sale price is
// skipped rather than guessed. Manual/on-connect only (see bexio-cron-sync
// header), never part of the hourly sweep.
// ---------------------------------------------------------------------------
function normalizeCatalogKey(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

interface BexioArticle {
  id: number;
  intern_name: string | null;
  sale_price: string | number | null;
  updated_at: string | null;
}

export async function syncBexioArticles(admin: any, integration: BexioIntegrationRow): Promise<SyncResult> {
  try {
    const articles = await fetchAllBexioPages<BexioArticle>(admin, integration, '/2.0/article');
    let count = 0;
    let skipped = 0;
    for (const article of articles) {
      const name = article.intern_name?.trim();
      const price = article.sale_price != null ? Number(article.sale_price) : null;
      if (!name || price == null || Number.isNaN(price)) {
        skipped += 1;
        continue;
      }
      const externalId = String(article.id);

      const { data: existingMapping } = await admin
        .from('integration_mappings')
        .select('id, local_id')
        .eq('integration_id', integration.id)
        .eq('entity_type', 'article')
        .eq('external_id', externalId)
        .maybeSingle();

      if (existingMapping) {
        await admin.from('catalog_items').update({ description: name, unit_price: price }).eq('id', existingMapping.local_id);
        await admin
          .from('integration_mappings')
          .update({ last_synced_at: new Date().toISOString(), external_updated_at: article.updated_at })
          .eq('id', existingMapping.id);
      } else {
        const key = normalizeCatalogKey(name);
        if (!key) {
          skipped += 1;
          continue;
        }
        // A local catalogue row with the same normalized description
        // (e.g. created earlier from a devis line) is linked and refreshed
        // instead of duplicated — catalog_items enforces a unique
        // (organization_id, description_key).
        const { data: upserted, error: upsertError } = await admin
          .from('catalog_items')
          .upsert(
            { organization_id: integration.organization_id, description: name, description_key: key, unit_price: price },
            { onConflict: 'organization_id,description_key' },
          )
          .select('id')
          .single();
        if (upsertError || !upserted) throw new Error(upsertError?.message ?? 'Échec de création de la position de catalogue');
        await admin.from('integration_mappings').insert({
          integration_id: integration.id,
          organization_id: integration.organization_id,
          entity_type: 'article',
          local_id: upserted.id,
          external_id: externalId,
          external_type: 'article',
          sync_direction: 'pull',
          last_synced_at: new Date().toISOString(),
          external_updated_at: article.updated_at,
        });
      }
      count += 1;
    }
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'article', payload_summary: { count, skipped } });
    return { action: 'articles', ok: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'article', error_message: message });
    return { action: 'articles', ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Invoice status pull (cahier des charges section 44/47). Cantia stays the
// source of truth for the invoice content, Bexio for payment status — this
// only ever updates status/paid_at, never touches facture_items or amounts.
// ---------------------------------------------------------------------------
interface BexioInvoiceStatus {
  id: number;
  total_received_payments: string | number;
  total_remaining_payments: string | number;
  kb_item_status_id: number;
}

export async function syncBexioInvoiceStatuses(admin: any, integration: BexioIntegrationRow): Promise<SyncResult> {
  try {
    const { data: mappings } = await admin
      .from('integration_mappings')
      .select('id, local_id, external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'facture');
    let count = 0;
    let failed = 0;
    for (const mapping of mappings ?? []) {
      const { data: facture } = await admin.from('factures').select('id, status, paid_at').eq('id', mapping.local_id).maybeSingle();
      // Never let an automated pull resurrect a locally cancelled/draft
      // invoice — those are deliberate local states, not payment states.
      if (!facture || facture.status === 'cancelled' || facture.status === 'draft') continue;

      let invoice: BexioInvoiceStatus;
      try {
        invoice = await bexioJson<BexioInvoiceStatus>(admin, integration, `/2.0/kb_invoice/${mapping.external_id}`);
      } catch (err) {
        // Used to silently `continue` here — a broken connection (expired
        // token, revoked access) meant every single invoice failed the
        // same way, yet the loop finished and logged an overall "success"
        // with count=0, so a facture staying "envoyée" while paid in Bexio
        // looked like nothing was wrong. Each failure is now logged, and a
        // sweep where every mapped invoice failed surfaces as a real error
        // below instead of a quiet no-op.
        failed += 1;
        const message = err instanceof Error ? err.message : String(err);
        await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'facture', local_id: mapping.local_id, external_id: mapping.external_id, error_message: message });
        continue;
      }

      const remaining = Number(invoice.total_remaining_payments ?? 0);
      const received = Number(invoice.total_received_payments ?? 0);
      let nextStatus: string | null = null;
      if (remaining <= 0) nextStatus = 'paid';
      else if (received > 0) nextStatus = 'partial';

      if (nextStatus && nextStatus !== facture.status) {
        await admin
          .from('factures')
          .update({ status: nextStatus, paid_at: nextStatus === 'paid' && !facture.paid_at ? new Date().toISOString() : facture.paid_at })
          .eq('id', facture.id);
      }
      await admin.from('integration_mappings').update({ last_synced_at: new Date().toISOString() }).eq('id', mapping.id);
      count += 1;
    }
    if (failed > 0 && count === 0) {
      throw new Error(`Échec de synchronisation des statuts pour ${failed} facture(s) — la connexion Bexio est probablement invalide.`);
    }
    await admin.from('integrations').update({ last_sync_at: new Date().toISOString(), last_successful_sync_at: new Date().toISOString() }).eq('id', integration.id);
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'facture', payload_summary: { count, failed } });
    return { action: 'invoice_status', ok: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin.from('integrations').update({ last_sync_at: new Date().toISOString(), last_error: message }).eq('id', integration.id);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'facture', error_message: message });
    return { action: 'invoice_status', ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Invoices created directly in Bexio -> Cantia (pull, the missing other
// direction of the push in bexio-push-invoice). An invoice already mapped
// (created from Cantia, or already imported once) is skipped — this only
// ever picks up Bexio-side invoices Cantia has never seen. Positions are
// read back from the same /2.0/kb_invoice/{id} detail endpoint used to
// write them; if Bexio doesn't return a positions array for some invoice
// (e.g. it was built entirely from bexio-native article positions this
// integration doesn't resolve), a single synthetic line based on the
// invoice's own total is used instead of guessing item-level detail.
// ---------------------------------------------------------------------------
interface BexioInvoiceListEntry {
  id: number;
  contact_id: number | null;
}

interface BexioInvoiceDetail {
  id: number;
  title: string | null;
  contact_id: number | null;
  is_valid_to: string | null;
  total_net: string | number | null;
  total_received_payments: string | number | null;
  total_remaining_payments: string | number | null;
  positions?: { type?: string; text?: string | null; amount?: string | number | null; unit_price?: string | number | null }[];
}

export async function syncBexioInvoicesFromBexio(admin: any, integration: BexioIntegrationRow): Promise<SyncResult> {
  try {
    const invoices = await fetchAllBexioPages<BexioInvoiceListEntry>(admin, integration, '/2.0/kb_invoice');
    let count = 0;
    let skipped = 0;
    for (const entry of invoices) {
      const externalId = String(entry.id);
      const { data: existingMapping } = await admin
        .from('integration_mappings')
        .select('id')
        .eq('integration_id', integration.id)
        .eq('entity_type', 'facture')
        .eq('external_id', externalId)
        .maybeSingle();
      if (existingMapping) continue;

      let clientId: string | null = null;
      if (entry.contact_id != null) {
        const { data: clientMapping } = await admin
          .from('integration_mappings')
          .select('local_id')
          .eq('integration_id', integration.id)
          .eq('entity_type', 'client')
          .eq('external_id', String(entry.contact_id))
          .maybeSingle();
        clientId = clientMapping?.local_id ?? null;
      }
      if (!clientId) {
        // No known Cantia client for this Bexio contact — synchronize
        // clients first (or this invoice's contact predates the client
        // sync) rather than creating a facture with a guessed name.
        skipped += 1;
        continue;
      }
      const { data: client } = await admin.from('clients').select('name, address, email').eq('id', clientId).maybeSingle();
      if (!client) {
        skipped += 1;
        continue;
      }

      let detail: BexioInvoiceDetail;
      try {
        detail = await bexioJson<BexioInvoiceDetail>(admin, integration, `/2.0/kb_invoice/${entry.id}`);
      } catch {
        skipped += 1;
        continue;
      }

      const remaining = Number(detail.total_remaining_payments ?? 0);
      const received = Number(detail.total_received_payments ?? 0);
      const status = remaining <= 0 && received > 0 ? 'paid' : received > 0 ? 'partial' : 'sent';

      const { data: facture, error: factureError } = await admin
        .from('factures')
        .insert({
          organization_id: integration.organization_id,
          client_id: clientId,
          client_name: client.name,
          client_address: client.address,
          client_email: client.email,
          notes: 'Importée automatiquement depuis Bexio.',
          status,
          due_date: detail.is_valid_to ?? undefined,
          paid_at: status === 'paid' ? new Date().toISOString() : null,
        })
        .select('id')
        .single();
      if (factureError || !facture) {
        skipped += 1;
        continue;
      }

      const positions = Array.isArray(detail.positions) ? detail.positions.filter((p) => p.text) : [];
      const itemsPayload =
        positions.length > 0
          ? positions.map((p, i) => ({
              facture_id: facture.id,
              description: p.text ?? 'Position',
              quantity: p.amount != null ? Number(p.amount) : 1,
              unit: 'pce',
              unit_price: p.unit_price != null ? Number(p.unit_price) : 0,
              sort_order: i,
            }))
          : [
              {
                facture_id: facture.id,
                description: detail.title || 'Facture importée de Bexio',
                quantity: 1,
                unit: 'pce',
                unit_price: detail.total_net != null ? Number(detail.total_net) : 0,
                sort_order: 0,
              },
            ];
      await admin.from('facture_items').insert(itemsPayload);

      await admin.from('integration_mappings').insert({
        integration_id: integration.id,
        organization_id: integration.organization_id,
        entity_type: 'facture',
        local_id: facture.id,
        external_id: externalId,
        external_type: 'kb_invoice',
        sync_direction: 'pull',
        last_synced_at: new Date().toISOString(),
      });
      count += 1;
    }
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'facture', payload_summary: { count, skipped } });
    return { action: 'invoices_pull', ok: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'facture', error_message: message });
    return { action: 'invoices_pull', ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Devis status pull (kb_offer cahier des charges section 51). Cantia stays
// the source of truth for the devis content — this only ever refreshes the
// read-only Bexio-side display fields (document_nr, network_link) plus the
// raw kb_item_status_id. That status id is stored as-is and never
// translated into Cantia's own devis.status by guessing the full Bexio
// status-code table (cahier des charges section 35) — except for
// BEXIO_OFFER_STATUS_ACCEPTED below, which isn't a guess: it was confirmed
// live against the connected account by accepting a real offer in Bexio and
// observing its kb_item_status_id flip from 1 to 3 while an untouched
// sibling offer stayed at 1. That one value is the only one this file acts
// on; every other id is still just displayed, never interpreted.
// ---------------------------------------------------------------------------
const BEXIO_OFFER_STATUS_ACCEPTED = 3;

interface BexioOffer {
  id: number;
  document_nr: string | null;
  kb_item_status_id: number | null;
  network_link: string | null;
}

// Pushes a freshly auto-converted facture to Bexio as a kb_invoice draft —
// same payload shape as bexio-push-invoice/index.ts (kept in sync by hand,
// same as the bexio.ts helpers are across all six functions), reused here
// so a devis accepted on Bexio's side doesn't just create a local facture
// but also lands in Bexio without a separate manual click.
async function pushFactureToBexio(admin: any, integration: BexioIntegrationRow, factureId: string): Promise<{ ok: boolean; externalId?: string; error?: string }> {
  const { data: facture } = await admin
    .from('factures')
    .select('id, organization_id, number, client_id, notes, due_date, created_at, vat_rate')
    .eq('id', factureId)
    .maybeSingle();
  if (!facture || !facture.client_id) return { ok: false, error: 'Facture introuvable ou sans client.' };

  const { data: clientMapping } = await admin
    .from('integration_mappings')
    .select('external_id')
    .eq('integration_id', integration.id)
    .eq('entity_type', 'client')
    .eq('local_id', facture.client_id)
    .maybeSingle();
  if (!clientMapping) return { ok: false, error: "Le client de cette facture n'est pas relié à un contact Bexio." };

  const { data: items } = await admin
    .from('facture_items')
    .select('description, quantity, unit_price, sort_order')
    .eq('facture_id', facture.id)
    .order('sort_order', { ascending: true });
  if (!items || items.length === 0) return { ok: false, error: 'Cette facture ne contient aucune ligne.' };

  const { data: settingsRow } = await admin.from('integration_settings').select('entity_settings').eq('integration_id', integration.id).maybeSingle();
  const defaults = (settingsRow?.entity_settings as any)?.invoice_defaults ?? {};

  const accessToken = await getValidAccessToken(admin, integration);
  const companyUserId = decodeBexioCompanyUserId(accessToken);
  const taxId = await resolveBexioSalesTaxId(admin, integration, Number(facture.vat_rate));

  const positions = items.map((item: any) => ({
    type: 'KbPositionCustom',
    text: item.description,
    amount: String(item.quantity),
    unit_price: String(item.unit_price),
    tax_id: taxId ?? undefined,
  }));

  const payload: Record<string, unknown> = {
    title: facture.number ? `Facture ${facture.number}` : 'Facture Cantia',
    contact_id: Number(clientMapping.external_id),
    user_id: companyUserId ?? undefined,
    language_id: defaults.default_language_id ?? undefined,
    bank_account_id: defaults.default_bank_account_id ?? undefined,
    currency_id: defaults.default_currency_id ?? undefined,
    payment_type_id: defaults.default_payment_type_id ?? undefined,
    mwst_type: defaults.default_mwst_type ?? undefined,
    mwst_is_net: defaults.default_mwst_is_net ?? undefined,
    header: '',
    footer: facture.notes ?? '',
    is_valid_from: new Date(facture.created_at).toISOString().slice(0, 10),
    is_valid_to: facture.due_date,
    api_reference: `cantia:facture:${facture.id}`,
    positions,
  };

  try {
    const created = await bexioJson<{ id: number }>(admin, integration, '/2.0/kb_invoice', { method: 'POST', body: JSON.stringify(payload) });
    const externalId = String(created.id);
    await admin.from('integration_mappings').insert({
      integration_id: integration.id,
      organization_id: facture.organization_id,
      entity_type: 'facture',
      local_id: facture.id,
      external_id: externalId,
      external_type: 'kb_invoice',
      sync_direction: 'push',
      last_synced_at: new Date().toISOString(),
    });
    await logSync(admin, integration, { direction: 'push', action: 'create', status: 'success', entity_type: 'facture', local_id: facture.id, external_id: externalId, payload_summary: { position_count: positions.length, auto: true } });
    return { ok: true, externalId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(admin, integration, { direction: 'push', action: 'error', status: 'error', entity_type: 'facture', local_id: facture.id, error_message: message });
    return { ok: false, error: message };
  }
}

// Devis just turned 'accepted' via the Bexio pull above — auto-create the
// Cantia facture and push it to Bexio too, so accepting an offer on Bexio's
// side alone is enough to get a drafted invoice on both ends. Reuses
// convert_devis_to_facture_internal (no permission check of its own by
// design — it's also the function the public client-portal accept flow
// calls, since neither caller has an authenticated dashboard session).
// Guarded by "no non-cancelled facture already exists for this devis" so a
// repeated cron pass (or an already-accepted devis at deploy time) never
// creates a second facture — it only fires once, on the real transition.
async function autoCreateAndPushFactureForAcceptedDevis(admin: any, integration: BexioIntegrationRow, devisId: string) {
  const { data: existing } = await admin.from('factures').select('id').eq('devis_id', devisId).neq('status', 'cancelled').limit(1).maybeSingle();
  if (existing) return;

  const { data: factureId, error: convertError } = await admin.rpc('convert_devis_to_facture_internal', {
    p_devis_id: devisId,
    p_due_days: 30,
    p_deposit_percent: null,
  });
  if (convertError || !factureId) {
    const message = convertError?.message ?? 'Échec de la création automatique de la facture.';
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'facture', local_id: devisId, error_message: message });
    return;
  }

  const pushResult = await pushFactureToBexio(admin, integration, factureId);
  if (!pushResult.ok) {
    // The Cantia facture exists either way — only the Bexio push failed
    // (e.g. client not yet linked to a Bexio contact). Already logged by
    // pushFactureToBexio itself; nothing more to do here than leave it for
    // the next manual "Envoyer vers Bexio" or sync pass to retry.
  }
}

export async function syncBexioDevisStatuses(admin: any, integration: BexioIntegrationRow): Promise<SyncResult> {
  try {
    const { data: mappings } = await admin
      .from('integration_mappings')
      .select('id, local_id, external_id')
      .eq('integration_id', integration.id)
      .eq('entity_type', 'devis');
    let count = 0;
    let failed = 0;
    for (const mapping of mappings ?? []) {
      let offer: BexioOffer;
      try {
        offer = await bexioJson<BexioOffer>(admin, integration, `/2.0/kb_offer/${mapping.external_id}`);
      } catch (err) {
        failed += 1;
        const message = err instanceof Error ? err.message : String(err);
        await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'devis', local_id: mapping.local_id, external_id: mapping.external_id, error_message: message });
        continue;
      }

      const { data: localDevis } = await admin.from('devis').select('status').eq('id', mapping.local_id).maybeSingle();
      const wasAccepted = localDevis?.status === 'accepted';

      const updatePayload: Record<string, unknown> = { bexio_document_nr: offer.document_nr, bexio_status_id: offer.kb_item_status_id, bexio_network_link: offer.network_link };
      const justAccepted = offer.kb_item_status_id === BEXIO_OFFER_STATUS_ACCEPTED && !wasAccepted && localDevis != null;
      if (justAccepted) updatePayload.status = 'accepted';

      await admin.from('devis').update(updatePayload).eq('id', mapping.local_id);
      await admin.from('integration_mappings').update({ last_synced_at: new Date().toISOString() }).eq('id', mapping.id);
      count += 1;

      if (justAccepted) await autoCreateAndPushFactureForAcceptedDevis(admin, integration, mapping.local_id);
    }
    if (failed > 0 && count === 0) {
      throw new Error(`Échec de synchronisation des devis pour ${failed} devis — la connexion Bexio est probablement invalide.`);
    }
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'devis', payload_summary: { count, failed } });
    return { action: 'devis_status', ok: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'devis', error_message: message });
    return { action: 'devis_status', ok: false, error: message };
  }
}

// Re-exported so bexio-push-invoice can search for a Bexio contact by name
// as a last-resort diagnostic (never auto-creates or auto-links — V1 keeps
// contact creation Bexio-side only, per section 18).
export { bexioSearch };
