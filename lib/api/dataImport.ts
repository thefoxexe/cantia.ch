import { supabase } from '../supabase';

// Manual/self-service migration path for orgs switching from another
// software (BauBit Pro, A3 Finance & Salaire…) — those export as Excel/CSV,
// not through any API Cantia could hook into directly (BauBit's "Spiderbus"
// is an internal bus between ARC Logiciels' own two products, not a public
// export mechanism). Scope is deliberately narrow: clients and a chantier's
// basic identity (name/client/address/status), as plain rows via the
// regular RLS-gated insert path — no attempt to reconstruct devis/facture
// line items from arbitrary spreadsheet columns, which would be guesswork.
export type ImportKind = 'clients' | 'chantiers';

export interface ClientImportRow {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ChantierImportRow {
  name: string;
  clientName: string;
  address: string;
}

export async function importClients(
  organizationId: string,
  userId: string | undefined,
  rows: ClientImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const payload = rows
    .filter((r) => {
      if (!r.name.trim()) {
        errors.push(`Ligne ignorée (nom manquant) : ${JSON.stringify(r)}`);
        return false;
      }
      return true;
    })
    .map((r) => ({
      organization_id: organizationId,
      name: r.name.trim(),
      email: r.email.trim() || null,
      phone: r.phone.trim() || null,
      address: r.address.trim() || null,
      created_by: userId,
    }));

  if (payload.length === 0) return { imported: 0, errors };

  const { error, count } = await supabase.from('clients').insert(payload, { count: 'exact' });
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }
  return { imported: count ?? payload.length, errors };
}

export async function importChantiers(
  organizationId: string,
  userId: string | undefined,
  rows: ChantierImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const payload = rows
    .filter((r) => {
      if (!r.name.trim()) {
        errors.push(`Ligne ignorée (nom manquant) : ${JSON.stringify(r)}`);
        return false;
      }
      return true;
    })
    .map((r) => ({
      organization_id: organizationId,
      name: r.name.trim(),
      client_name: r.clientName.trim() || null,
      address: r.address.trim() || null,
      status: 'completed',
      created_by: userId,
    }));

  if (payload.length === 0) return { imported: 0, errors };

  const { error, count } = await supabase.from('projects').insert(payload, { count: 'exact' });
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }
  return { imported: count ?? payload.length, errors };
}
