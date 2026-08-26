// Actual sync operations shared between the client-triggered bexio-sync
// function and the hourly bexio-cron-sync function, so both call exactly
// the same logic rather than two copies drifting apart.
//
// deno-lint-ignore-file no-explicit-any

import { bexioJson, bexioSearch, fetchAllBexioPages, type BexioIntegrationRow } from './bexio.ts';

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

    const { data: existing } = await admin.from('integration_settings').select('id, entity_settings').eq('integration_id', integration.id).maybeSingle();
    if (existing) {
      await admin
        .from('integration_settings')
        .update({ entity_settings: { ...(existing.entity_settings ?? {}), invoice_defaults: invoiceDefaults } })
        .eq('id', existing.id);
    } else {
      await admin.from('integration_settings').insert({
        integration_id: integration.id,
        organization_id: integration.organization_id,
        entity_settings: { invoice_defaults: invoiceDefaults },
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
    for (const mapping of mappings ?? []) {
      const { data: facture } = await admin.from('factures').select('id, status, paid_at').eq('id', mapping.local_id).maybeSingle();
      // Never let an automated pull resurrect a locally cancelled/draft
      // invoice — those are deliberate local states, not payment states.
      if (!facture || facture.status === 'cancelled' || facture.status === 'draft') continue;

      let invoice: BexioInvoiceStatus;
      try {
        invoice = await bexioJson<BexioInvoiceStatus>(admin, integration, `/2.0/kb_invoice/${mapping.external_id}`);
      } catch {
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
    await admin.from('integrations').update({ last_sync_at: new Date().toISOString(), last_successful_sync_at: new Date().toISOString() }).eq('id', integration.id);
    await logSync(admin, integration, { direction: 'pull', action: 'update', status: 'success', entity_type: 'facture', payload_summary: { count } });
    return { action: 'invoice_status', ok: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin.from('integrations').update({ last_sync_at: new Date().toISOString(), last_error: message }).eq('id', integration.id);
    await logSync(admin, integration, { direction: 'pull', action: 'error', status: 'error', entity_type: 'facture', error_message: message });
    return { action: 'invoice_status', ok: false, error: message };
  }
}

// Re-exported so bexio-push-invoice can search for a Bexio contact by name
// as a last-resort diagnostic (never auto-creates or auto-links — V1 keeps
// contact creation Bexio-side only, per section 18).
export { bexioSearch };
