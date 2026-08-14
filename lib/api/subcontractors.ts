import { supabase } from '../supabase';
import { deleteFromOrgBucket, uploadToOrgBucket } from './storage';
import type { ProjectSubcontractor, Subcontractor, SubcontractorAssignmentStatus, SubcontractorInvoice } from '../types';

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

export async function addSubcontractorInvoice(
  assignment: ProjectSubcontractor,
  userId: string,
  fileUri: string,
  contentType: string,
  fileName: string,
  fields: { amount: number | null; invoiceDate: string | null; notes?: string },
): Promise<{ invoice: SubcontractorInvoice | null; error: string | null }> {
  const extension = (fileName.split('.').pop() || 'pdf').toLowerCase();
  const { path, error: uploadError } = await uploadToOrgBucket(
    assignment.organization_id,
    `sous-traitants/${assignment.subcontractor_id}/factures/${Date.now()}.${extension}`,
    fileUri,
    contentType,
  );
  if (uploadError || !path) return { invoice: null, error: uploadError ?? 'Échec du téléversement' };

  const { data, error } = await supabase
    .from('subcontractor_invoices')
    .insert({
      organization_id: assignment.organization_id,
      project_subcontractor_id: assignment.id,
      file_path: path,
      file_name: fileName,
      amount: fields.amount,
      invoice_date: fields.invoiceDate,
      notes: fields.notes?.trim() || null,
      created_by: userId,
    })
    .select('*')
    .single();
  return { invoice: data ?? null, error: error?.message ?? null };
}

export async function deleteSubcontractorInvoice(invoice: SubcontractorInvoice): Promise<{ error: string | null }> {
  await deleteFromOrgBucket(invoice.file_path);
  const { error } = await supabase.from('subcontractor_invoices').delete().eq('id', invoice.id);
  return { error: error?.message ?? null };
}

export async function getSubcontractor(id: string): Promise<Subcontractor | null> {
  const { data } = await supabase.from('subcontractors').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}

export interface SubcontractorAssignmentWithProject extends ProjectSubcontractor {
  projects?: { id: string; name: string };
}

// Every chantier this company has ever been assigned to, across the whole
// organization — the whole point of the dedicated company page: one place
// to see where things stand instead of digging through each chantier.
export async function listAssignmentsForSubcontractor(subcontractorId: string): Promise<SubcontractorAssignmentWithProject[]> {
  const { data } = await supabase
    .from('project_subcontractors')
    .select('*, projects(id, name)')
    .eq('subcontractor_id', subcontractorId)
    .order('created_at', { ascending: false });
  return (data as SubcontractorAssignmentWithProject[] | null) ?? [];
}

// All active assignments org-wide in one query, for the directory list —
// grouped client-side by subcontractor_id so each row can show "currently
// on: X, Y" without an N+1 query per company.
export async function listActiveAssignmentsForOrg(organizationId: string): Promise<SubcontractorAssignmentWithProject[]> {
  const { data } = await supabase
    .from('project_subcontractors')
    .select('*, projects(id, name)')
    .eq('organization_id', organizationId)
    .in('status', ['planifie', 'en_cours']);
  return (data as SubcontractorAssignmentWithProject[] | null) ?? [];
}

export interface SubcontractorInvoiceWithProject extends SubcontractorInvoice {
  project_subcontractors?: { project_id: string; projects?: { name: string } };
}

export async function listInvoicesForSubcontractorCompany(subcontractorId: string): Promise<SubcontractorInvoiceWithProject[]> {
  const { data } = await supabase
    .from('subcontractor_invoices')
    .select('*, project_subcontractors!inner(project_id, projects(name))')
    .eq('project_subcontractors.subcontractor_id', subcontractorId)
    .order('invoice_date', { ascending: false, nullsFirst: false });
  return (data as SubcontractorInvoiceWithProject[] | null) ?? [];
}

// Chantiers this company isn't already assigned to, for the "assigner à un
// chantier" picker on its page — filtered client-side against the
// already-loaded assignment list rather than a NOT IN query.
export async function listAssignableProjects(
  organizationId: string,
  excludeProjectIds: string[],
): Promise<{ id: string; name: string }[]> {
  const { data } = await supabase.from('projects').select('id, name').eq('organization_id', organizationId).order('name');
  const excluded = new Set(excludeProjectIds);
  return (data ?? []).filter((p) => !excluded.has(p.id));
}
