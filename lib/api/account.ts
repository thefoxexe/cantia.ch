import { invokeFunction } from './functions';

export async function deleteMyAccount(): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('delete-account', { action: 'account' });
  return { error };
}

export async function deleteOrganization(organizationId: string): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('delete-account', { action: 'organization', organizationId });
  return { error };
}
