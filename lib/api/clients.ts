import { supabase } from '../supabase';
import type { Client, ClientType } from '../types';

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
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateClient(id: string, input: ClientInput): Promise<{ error: string | null }> {
  const { error } = await supabase.from('clients').update(input).eq('id', id);
  return { error: error?.message ?? null };
}
