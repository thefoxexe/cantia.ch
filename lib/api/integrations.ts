import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';
import { invokeFunction } from './functions';
import type { Integration } from '../types';

// Fixed landing page bexio-oauth-callback redirects to once the token
// exchange is done — unlike Stripe Checkout's success_url, this can't vary
// per call: it's whatever's registered as the OAuth redirect_uri's final
// hop, so it has to be a stable URL. On native, passed as the prefix
// WebBrowser.openAuthSessionAsync watches for to auto-close the in-app
// browser sheet; if that detection doesn't fire for any reason, refetching
// the integration on screen focus (see compte/integrations.tsx) still picks
// up the result once the user closes the sheet themselves.
const BEXIO_RETURN_URL = 'https://app.cantia.ch/compte/integrations';

export type BexioConnectOutcome = 'connected' | 'error' | 'dismissed';

export async function getIntegration(organizationId: string, provider: 'bexio' = 'bexio'): Promise<{ data: Integration | null; error: string | null }> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('provider', provider)
    .maybeSingle();
  return { data: (data as Integration | null) ?? null, error: error?.message ?? null };
}

export async function connectBexio(organizationId: string): Promise<{ outcome: BexioConnectOutcome; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('bexio-oauth-start', { organization_id: organizationId });
  if (error || !data?.url) return { outcome: 'error', error: error ?? "Impossible de démarrer la connexion Bexio." };

  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return { outcome: 'connected', error: null };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, BEXIO_RETURN_URL);
  if (result.type === 'success') {
    return { outcome: result.url.includes('bexio=connected') ? 'connected' : 'error', error: null };
  }
  return { outcome: 'dismissed', error: null };
}

export async function disconnectBexio(organizationId: string): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('bexio-disconnect', { organization_id: organizationId });
  return { error };
}

export type BexioSyncAction = 'contacts' | 'settings' | 'articles' | 'invoices_pull' | 'invoice_status' | 'all';

export async function syncBexio(organizationId: string, action: BexioSyncAction): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('bexio-sync', { organization_id: organizationId, action });
  return { error };
}

export async function pushFactureToBexio(organizationId: string, factureId: string): Promise<{ externalId: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ external_id: string }>('bexio-push-invoice', {
    organization_id: organizationId,
    facture_id: factureId,
  });
  return { externalId: data?.external_id ?? null, error };
}

export async function setBexioAutoSync(organizationId: string, enabled: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('set_bexio_auto_sync', { org_id: organizationId, enabled });
  return { error: error?.message ?? null };
}

export async function getFactureBexioMapping(organizationId: string, factureId: string): Promise<{ externalId: string | null; lastSyncedAt: string | null }> {
  const { data: integration } = await supabase.from('integrations').select('id').eq('organization_id', organizationId).eq('provider', 'bexio').maybeSingle();
  if (!integration) return { externalId: null, lastSyncedAt: null };
  const { data } = await supabase
    .from('integration_mappings')
    .select('external_id, last_synced_at')
    .eq('integration_id', integration.id)
    .eq('entity_type', 'facture')
    .eq('local_id', factureId)
    .maybeSingle();
  return { externalId: data?.external_id ?? null, lastSyncedAt: data?.last_synced_at ?? null };
}

export async function getClientBexioMapping(organizationId: string, clientId: string): Promise<boolean> {
  const { data: integration } = await supabase.from('integrations').select('id').eq('organization_id', organizationId).eq('provider', 'bexio').maybeSingle();
  if (!integration) return false;
  const { data } = await supabase
    .from('integration_mappings')
    .select('id')
    .eq('integration_id', integration.id)
    .eq('entity_type', 'client')
    .eq('local_id', clientId)
    .maybeSingle();
  return !!data;
}
