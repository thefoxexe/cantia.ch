import { supabase } from '../supabase';
import { pushClientToBexio } from './integrations';
import type { Client, ClientNote, ClientType, Devis, ExtraWork, Facture } from '../types';

export interface ClientInput {
  type: ClientType;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export async function listClients(organizationId: string): Promise<Client[]> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  return data ?? [];
}

export async function createClient(
  organizationId: string,
  input: ClientInput,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ organization_id: organizationId, ...input })
    .select('id')
    .single();
  if (data?.id) {
    // Best-effort, never blocks/fails client creation — if Bexio isn't
    // connected or entitled for this org, or the push itself fails, the
    // client still exists in Cantia; the retry affordance on its detail
    // screen (or the next hourly sweep, for the pull direction) covers it.
    pushClientToBexio(organizationId, data.id).catch(() => {});
  }
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateClient(id: string, input: ClientInput): Promise<{ error: string | null }> {
  const { error } = await supabase.from('clients').update(input).eq('id', id);
  return { error: error?.message ?? null };
}

export async function getClient(id: string): Promise<Client | null> {
  const { data } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}

// Journal de notes horodaté — remplace le champ clients.notes unique, qui
// perdait l'historique à chaque écrasement.
export async function listClientNotes(clientId: string): Promise<ClientNote[]> {
  const { data } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function addClientNote(
  organizationId: string,
  clientId: string,
  body: string,
  userId: string | undefined,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('client_notes')
    .insert({ organization_id: organizationId, client_id: clientId, body, created_by: userId })
    .select('id')
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function deleteClientNote(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('client_notes').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Historique documents liés à un client — devis/factures/travaux
// supplémentaires reliés via client_id (cf. migration client_id_notes_expenses).
export interface ClientHistory {
  devis: Pick<Devis, 'id' | 'number' | 'status' | 'created_at'>[];
  factures: Pick<Facture, 'id' | 'number' | 'status' | 'due_date' | 'created_at'>[];
  extraWorks: (Pick<ExtraWork, 'id' | 'number' | 'title' | 'status' | 'created_at'> & { project_id: string })[];
}

export async function getClientHistory(clientId: string): Promise<ClientHistory> {
  const [devisRes, facturesRes, ewRes] = await Promise.all([
    supabase.from('devis').select('id, number, status, created_at').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('factures').select('id, number, status, due_date, created_at').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('extra_works').select('id, number, title, status, created_at, project_id').eq('client_id', clientId).order('created_at', { ascending: false }),
  ]);
  return {
    devis: devisRes.data ?? [],
    factures: facturesRes.data ?? [],
    extraWorks: ewRes.data ?? [],
  };
}
