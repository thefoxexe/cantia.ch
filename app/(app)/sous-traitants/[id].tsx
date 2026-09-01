import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { getSignedUrl } from '../../../lib/api/storage';
import {
  addSubcontractorInvoice,
  assignSubcontractorToProject,
  deleteSubcontractor,
  deleteSubcontractorInvoice,
  getSubcontractor,
  listAssignableProjects,
  listAssignmentsForSubcontractor,
  listInvoicesForSubcontractorCompany,
  removeAssignment,
  updateAssignment,
  updateAssignmentStatus,
  updateSubcontractor,
  uploadInsuranceDoc,
  type SubcontractorAssignmentWithProject,
  type SubcontractorInvoiceWithProject,
} from '../../../lib/api/subcontractors';
import { downloadFile } from '../../../lib/downloadFile';
import { confirm } from '../../../lib/confirm';
import { Button, Card, EmptyState, Field, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { DateField } from '../../../components/DateField';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Subcontractor, SubcontractorAssignmentStatus } from '../../../lib/types';

const STATUS_CYCLE: SubcontractorAssignmentStatus[] = ['planifie', 'en_cours', 'termine', 'annule'];

function displayDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(`${getAppLocale()}-CH`);
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function SubcontractorDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organization, user } = useAuth();

  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [assignments, setAssignments] = useState<SubcontractorAssignmentWithProject[]>([]);
  const [invoices, setInvoices] = useState<SubcontractorInvoiceWithProject[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Identity
  const [companyName, setCompanyName] = useState('');
  const [trade, setTrade] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Insurance
  const [expiry, setExpiry] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Assignment inline edit
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState('');
  const [editStart, setEditStart] = useState<string | null>(null);
  const [editEnd, setEditEnd] = useState<string | null>(null);
  const [editAssignNotes, setEditAssignNotes] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Assign to a new chantier
  const [assignPickerOpen, setAssignPickerOpen] = useState(false);
  const [assignableProjects, setAssignableProjects] = useState<{ id: string; name: string }[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Invoices
  const [invoiceAssignmentId, setInvoiceAssignmentId] = useState<string | null>(null);
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState<string | null>(null);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  const load = useCallback(async () => {
    const [sub, a, inv] = await Promise.all([
      getSubcontractor(id),
      listAssignmentsForSubcontractor(id),
      listInvoicesForSubcontractorCompany(id),
    ]);
    setSubcontractor(sub);
    setAssignments(a);
    setInvoices(inv);
    if (sub) {
      setCompanyName(sub.company_name);
      setTrade(sub.trade ?? '');
      setContactName(sub.contact_name ?? '');
      setPhone(sub.phone ?? '');
      setEmail(sub.email ?? '');
      setNotes(sub.notes ?? '');
      setExpiry(sub.insurance_expires_on);
    }
    if (a.length && !invoiceAssignmentId) setInvoiceAssignmentId(a[0].id);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function saveIdentity() {
    if (!companyName.trim()) {
      setError(t('projectSubcontractors.companyNameRequired'));
      return;
    }
    setSavingIdentity(true);
    setError(null);
    await updateSubcontractor(id, { companyName, trade, contactName, phone, email, notes });
    setSavingIdentity(false);
    load();
  }

  async function pickInsuranceDoc() {
    if (!subcontractor) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const extension = (asset.name.split('.').pop() || 'pdf').toLowerCase();
    setUploadingDoc(true);
    setUploadSuccess(false);
    const { error: uploadErr } = await uploadInsuranceDoc(subcontractor, asset.uri, asset.mimeType ?? 'application/octet-stream', extension, expiry);
    setUploadingDoc(false);
    if (uploadErr) {
      setError(uploadErr);
    } else {
      setUploadSuccess(true);
    }
    load();
  }

  async function viewInsuranceDoc() {
    if (!subcontractor?.insurance_doc_path) return;
    const url = await getSignedUrl(subcontractor.insurance_doc_path);
    if (url) await downloadFile(url, 'attestation-assurance');
  }

  function toggleExpand(a: SubcontractorAssignmentWithProject) {
    if (expandedId === a.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(a.id);
    setEditTask(a.task ?? '');
    setEditStart(a.start_date);
    setEditEnd(a.end_date);
    setEditAssignNotes(a.notes ?? '');
  }

  async function cycleStatus(a: SubcontractorAssignmentWithProject) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status) + 1) % STATUS_CYCLE.length];
    setAssignments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    await updateAssignmentStatus(a.id, next);
  }

  async function saveAssignmentEdit(assignmentId: string) {
    setSavingAssignment(true);
    await updateAssignment(assignmentId, { task: editTask, startDate: editStart, endDate: editEnd, notes: editAssignNotes });
    setSavingAssignment(false);
    setExpandedId(null);
    load();
  }

  async function removeAssignmentRow(a: SubcontractorAssignmentWithProject) {
    const ok = await confirm(t('subcontractorDetail.removeConfirmTitle'), a.projects?.name ?? '');
    if (!ok) return;
    await removeAssignment(a.id);
    load();
  }

  async function openAssignPicker() {
    if (!organization) return;
    const projects = await listAssignableProjects(
      organization.id,
      assignments.map((a) => a.project_id),
    );
    setAssignableProjects(projects);
    setAssignPickerOpen(true);
  }

  async function assignToProject(projectId: string) {
    if (!organization || !user) return;
    setAssigning(true);
    await assignSubcontractorToProject(organization.id, projectId, id, user.id, {});
    setAssigning(false);
    setAssignPickerOpen(false);
    load();
  }

  async function pickInvoice() {
    if (!user || !invoiceAssignmentId) return;
    const assignment = assignments.find((a) => a.id === invoiceAssignmentId);
    if (!assignment) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setUploadingInvoice(true);
    const { error: uploadErr } = await addSubcontractorInvoice(assignment, user.id, asset.uri, asset.mimeType ?? 'application/octet-stream', asset.name, {
      amount: newInvoiceAmount.trim() ? Number(newInvoiceAmount.replace(',', '.')) : null,
      invoiceDate: newInvoiceDate,
    });
    setUploadingInvoice(false);
    if (uploadErr) {
      setError(uploadErr);
      return;
    }
    setNewInvoiceAmount('');
    setNewInvoiceDate(null);
    load();
  }

  async function openInvoiceFile(inv: SubcontractorInvoiceWithProject) {
    const url = await getSignedUrl(inv.file_path);
    if (url) await downloadFile(url, inv.file_name);
  }

  async function removeInvoiceRow(inv: SubcontractorInvoiceWithProject) {
    const ok = await confirm(t('subcontractorDetail.deleteInvoiceConfirmTitle'), inv.file_name);
    if (!ok) return;
    await deleteSubcontractorInvoice(inv);
    load();
  }

  async function handleDeleteCompany() {
    if (!subcontractor) return;
    const ok = await confirm(t('subcontractorDetail.deleteCompanyConfirmTitle'), t('subcontractorDetail.deleteCompanyConfirmBody', { name: subcontractor.company_name }));
    if (!ok) return;
    await deleteSubcontractor(subcontractor);
    router.replace('/(app)/sous-traitants');
  }

  if (!loaded || !subcontractor) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const insuranceExpired = !!subcontractor.insurance_expires_on && subcontractor.insurance_expires_on < todayIso();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <View style={styles.container}>
          <PageHeader
            title={subcontractor.company_name}
            backTo="/(app)/sous-traitants"
            right={<RowActionMenu actions={[{ key: 'delete', icon: 'trash-2', label: t('subcontractorDetail.delete'), danger: true, onPress: handleDeleteCompany }]} />}
          />

          <Text style={styles.sectionTitle}>{t('subcontractorDetail.identityTitle')}</Text>
          <Card style={{ gap: spacing.sm }}>
            <Field label={t('projectSubcontractors.companyNameLabel')} value={companyName} onChangeText={setCompanyName} />
            <Field label={t('projectSubcontractors.tradeLabel')} value={trade} onChangeText={setTrade} placeholder={t('projectSubcontractors.tradePlaceholder')} />
            <Field label={t('projectSubcontractors.contactLabel')} value={contactName} onChangeText={setContactName} placeholder={t('projectSubcontractors.contactPlaceholder')} />
            <Field label={t('projectSubcontractors.phoneLabel')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label={t('projectSubcontractors.emailLabel')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field label={t('subcontractorDetail.notesLabel')} value={notes} onChangeText={setNotes} multiline style={{ minHeight: 70, textAlignVertical: 'top' }} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t('common.save')} icon="check" onPress={saveIdentity} loading={savingIdentity} />
          </Card>

          <Text style={styles.sectionTitle}>{t('subcontractorDetail.insuranceTitle')}</Text>
          <Card style={{ gap: spacing.sm }}>
            {subcontractor.insurance_doc_path ? (
              <View style={styles.insuranceRow}>
                <Feather name={insuranceExpired ? 'alert-triangle' : 'shield'} size={14} color={insuranceExpired ? colors.danger : colors.success} />
                <Text style={[styles.insuranceText, insuranceExpired && { color: colors.danger }]}>
                  {insuranceExpired ? t('subcontractorDetail.insuranceExpired') : t('subcontractorDetail.insuranceUpToDate')}
                </Text>
                <Pressable onPress={viewInsuranceDoc}>
                  <Text style={styles.link}>{t('subcontractorDetail.viewDocument')}</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.meta}>{t('subcontractorDetail.noInsuranceDoc')}</Text>
            )}
            <DateField label={t('subcontractorDetail.expiryDateLabel')} value={expiry} onChange={setExpiry} />
            <Button
              title={subcontractor.insurance_doc_path ? t('subcontractorDetail.replaceDocument') : t('subcontractorDetail.uploadDocument')}
              variant="secondary"
              icon="upload"
              onPress={pickInsuranceDoc}
              loading={uploadingDoc}
            />
            {uploadSuccess ? (
              <View style={styles.insuranceRow}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <Text style={styles.insuranceText}>{t('subcontractorDetail.uploadSuccess')}</Text>
              </View>
            ) : null}
          </Card>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('subcontractorDetail.projectsTitle')}</Text>
            <Pressable onPress={openAssignPicker}>
              <Text style={styles.link}>{t('subcontractorDetail.assignToProject')}</Text>
            </Pressable>
          </View>
          {assignments.length === 0 ? (
            <EmptyState title={t('subcontractorDetail.emptyProjectsTitle')} subtitle={t('subcontractorDetail.emptyProjectsSubtitle')} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {assignments.map((a) => {
                const expanded = expandedId === a.id;
                return (
                  <Card key={a.id} style={{ padding: 0, overflow: 'hidden' }}>
                    <Pressable onPress={() => toggleExpand(a)} style={styles.assignmentRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assignmentProject}>{a.projects?.name ?? t('subcontractorDetail.projectFallback')}</Text>
                        {a.task ? <Text style={styles.meta}>{a.task}</Text> : null}
                        {a.start_date || a.end_date ? (
                          <Text style={styles.meta}>
                            {a.start_date ? displayDate(a.start_date) : '?'} → {a.end_date ? displayDate(a.end_date) : '?'}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable onPress={() => cycleStatus(a)} hitSlop={8}>
                        <StatusBadge status={a.status} />
                      </Pressable>
                      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </Pressable>

                    {expanded ? (
                      <View style={styles.assignmentExpanded}>
                        <Field label={t('subcontractorDetail.interventionLabel')} value={editTask} onChangeText={setEditTask} placeholder={t('subcontractorDetail.interventionPlaceholder')} />
                        <View style={styles.row2}>
                          <View style={styles.row2Item}>
                            <DateField label={t('subcontractorDetail.startLabel')} value={editStart} onChange={setEditStart} />
                          </View>
                          <View style={styles.row2Item}>
                            <DateField label={t('subcontractorDetail.endLabel')} value={editEnd} onChange={setEditEnd} />
                          </View>
                        </View>
                        <Field
                          label={t('subcontractorDetail.notesLabel')}
                          value={editAssignNotes}
                          onChangeText={setEditAssignNotes}
                          multiline
                          style={{ minHeight: 60, textAlignVertical: 'top' }}
                        />
                        <View style={styles.assignmentActions}>
                          <Button title={t('subcontractorDetail.viewProject')} variant="secondary" onPress={() => router.push(`/(app)/chantiers/${a.project_id}`)} style={{ flex: 1 }} />
                          <Button title={t('subcontractorDetail.remove')} variant="danger" onPress={() => removeAssignmentRow(a)} style={{ flex: 1 }} />
                        </View>
                        <Button title={t('common.save')} icon="check" onPress={() => saveAssignmentEdit(a.id)} loading={savingAssignment} />
                      </View>
                    ) : null}
                  </Card>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionTitle}>{t('subcontractorDetail.invoicesTitle')}</Text>
          {invoices.length === 0 ? (
            <Text style={styles.meta}>{t('subcontractorDetail.emptyInvoices')}</Text>
          ) : (
            <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
              {invoices.map((inv) => (
                <View key={inv.id} style={styles.invoiceRow}>
                  <Pressable style={{ flex: 1 }} onPress={() => openInvoiceFile(inv)}>
                    <Text style={styles.invoiceName} numberOfLines={1}>
                      {inv.file_name}
                    </Text>
                    <Text style={styles.meta}>
                      {[inv.project_subcontractors?.projects?.name, inv.amount != null ? `CHF ${inv.amount.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2 })}` : null, displayDate(inv.invoice_date)]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => removeInvoiceRow(inv)}>
                    <Feather name="trash-2" size={15} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {assignments.length > 0 ? (
            <Card style={{ gap: spacing.sm }}>
              {assignments.length > 1 ? (
                <View>
                  <Text style={styles.fieldLabel}>{t('subcontractorDetail.concernedProject')}</Text>
                  <View style={styles.chipRow}>
                    {assignments.map((a) => (
                      <Pressable
                        key={a.id}
                        onPress={() => setInvoiceAssignmentId(a.id)}
                        style={[styles.chip, invoiceAssignmentId === a.id && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, invoiceAssignmentId === a.id && styles.chipTextActive]}>{a.projects?.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <Field label={t('subcontractorDetail.amountLabel')} value={newInvoiceAmount} onChangeText={setNewInvoiceAmount} keyboardType="decimal-pad" placeholder="0.00" />
                </View>
                <View style={styles.row2Item}>
                  <DateField label={t('subcontractorDetail.invoiceDateLabel')} value={newInvoiceDate} onChange={setNewInvoiceDate} />
                </View>
              </View>
              <Button title={t('subcontractorDetail.addInvoice')} variant="secondary" icon="upload" onPress={pickInvoice} loading={uploadingInvoice} />
            </Card>
          ) : (
            <Text style={styles.meta}>{t('subcontractorDetail.assignFirstHint')}</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={assignPickerOpen} animationType="slide" transparent onRequestClose={() => setAssignPickerOpen(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('subcontractorDetail.assignModalTitle')}</Text>
              <Pressable onPress={() => setAssignPickerOpen(false)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              {assignableProjects.map((p) => (
                <Pressable key={p.id} style={styles.directoryRow} onPress={() => assignToProject(p.id)}>
                  <Text style={styles.assignmentProject}>{p.name}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
              {assignableProjects.length === 0 ? (
                <Text style={styles.meta}>{t('subcontractorDetail.allProjectsAssigned')}</Text>
              ) : null}
            </ScrollView>
            {assigning ? <Text style={styles.meta}>{t('subcontractorDetail.adding')}</Text> : null}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  insuranceText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.success,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  assignmentProject: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  assignmentExpanded: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  assignmentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 140,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  invoiceName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  directoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
