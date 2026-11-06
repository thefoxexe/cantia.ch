// The address position, the client's reference and the numbering settings
// need migration 20261106120000. Until it is applied, the organization row
// has no client_address_position column: those settings stay hidden and
// are never written, so devis and factures keep working either way.
import type { Organization } from './types';

export function documentOptionsReady(org: Organization | null | undefined): boolean {
  return !!org && Object.prototype.hasOwnProperty.call(org, 'client_address_position');
}
