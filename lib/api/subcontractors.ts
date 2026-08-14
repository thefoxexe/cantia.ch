import { supabase } from '../supabase';
import { deleteFromOrgBucket, uploadToOrgBucket } from './storage';
import type { ProjectSubcontractor, Subcontractor, SubcontractorAssignmentStatus } from '../types';

export async function listSubcontractors(organizationId: string): Promise<Subcontractor[]> {
  const { data } = await supabase
    .from('subcontractors')
    .select('*')
    .eq('organization_id', organizationId)
    .order('company_name', { ascending: true });
  return data ?? [];
}

export async function createSubcontractor(
  organizationId: string,
  userId: string,
  fields: { companyName: string; trade?: string; contactName?: string; phone?: string; email?: string; notes?: string },
): Promise<{ subcontractor: Subcontractor | null; error: string | null }> {
  const { data, error } = await supabase
    .from('subcontractors')
    .insert({
      organization_id: organizationId,
      company_name: fields.companyName.trim(),
      trade: fields.trade?.trim() || null,
      contact_name: fields.contactName?.trim() || null,
      phone: fields.phone?.trim() || null,
      email: fields.email?.trim() || null,
      notes: fields.notes?.trim() || null,
      created_by: userId,
    })
    .select('*')
    .single();
  return { subcontractor: data ?? null, error: error?.message ?? null };
}

export async function updateSubcontractor(
  id: string,
  fields: Partial<{ companyName: string; trade: string; contactName: string; phone: string; email: string; notes: string }>,
): Promise<{ error: string | null }> {
  const patch: Record<string, string | null> = {};
  if (fields.companyName !== undefined) patch.company_name = fields.companyName.trim();
  if (fields.trade !== undefined) patch.trade = fields.trade.trim() || null;
  if (fields.contactName !== undefined) patch.contact_name = fields.contactName.trim() || null;
  if (fields.phone !== undefined) patch.phone = fields.phone.trim() || null;
  if (fields.email !== undefined) patch.email = fields.email.trim() || null;
  if (fields.notes !== undefined) patch.notes = fields.notes.trim() || null;
  const { error } = await supabase.from('subcontractors').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteSubcontractor(subcontractor: Subcontractor): Promise<{ error: string | null }> {
  if (subcontractor.insurance_doc_path) await deleteFromOrgBucket(subcontractor.insurance_doc_path);
  const { error } = await supabase.from('subcontractors').delete().eq('id', subcontractor.id);
  return { error: error?.message ?? null };
}

export async function uploadInsuranceDoc(
  subcontractor: Subcontractor,
  fileUri: string,
  contentType: string,
  extension: string,
  expiresOn: string | null,
): Promise<{ error: string | null }> {
  if (subcontractor.insurance_doc_path) await deleteFromOrgBucket(subcontractor.insurance_doc_path);
  const { path, error } = await uploadToOrgBucket(
    subcontractor.organization_id,
    `sous-traitants/${subcontractor.id}/assurance-${Date.now()}.${extension}`,
    fileUri,
    contentType,
  );
  if (error || !path) return { error: error ?? 'Échec du téléversement' };
  const { error: updateError } = await supabase
    .from('subcontractors')
    .update({ insurance_doc_path: path, insurance_expires_on: expiresOn })
    .eq('id', subcontractor.id);
  return { error: updateError?.message ?? null };
}

export async function listProjectSubcontractors(projectId: string): Promise<ProjectSubcontractor[]> {
  const { data } = await supabase
    .from('project_subcontractors')
    .select('*, subcontractors(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return (data as ProjectSubcontractor[] | null) ?? [];
}

export async function assignSubcontractorToProject(
  organizationId: string,
  projectId: string,
  subcontractorId: string,
  userId: string,
  fields: { task?: string; startDate?: string | null; endDate?: string | null; notes?: string },
): Promise<{ assignment: ProjectSubcontractor | null; error: string | null }> {
  const { data, error } = await supabase
    .from('project_subcontractors')
    .insert({
      organization_id: organizationId,
      project_id: projectId,
      subcontractor_id: subcontractorId,
      task: fields.task?.trim() || null,
      start_date: fields.startDate || null,
      end_date: fields.endDate || null,
      notes: fields.notes?.trim() || null,
      created_by: userId,
    })
    .select('*, subcontractors(*)')
    .single();
  return { assignment: (data as ProjectSubcontractor) ?? null, error: error?.message ?? null };
}

export async function updateAssignmentStatus(
  id: string,
  status: SubcontractorAssignmentStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_subcontractors').update({ status }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function updateAssignment(
  id: string,
  fields: Partial<{ task: string; startDate: string | null; endDate: string | null; notes: string }>,
): Promise<{ error: string | null }> {
  const patch: Record<string, string | null> = {};
  if (fields.task !== undefined) patch.task = fields.task.trim() || null;
  if (fields.startDate !== undefined) patch.start_date = fields.startDate;
  if (fields.endDate !== undefined) patch.end_date = fields.endDate;
  if (fields.notes !== undefined) patch.notes = fields.notes.trim() || null;
  const { error } = await supabase.from('project_subcontractors').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

export async function removeAssignment(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('project_subcontractors').delete().eq('id', id);
  return { error: error?.message ?? null };
}
