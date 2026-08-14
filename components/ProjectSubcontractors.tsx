import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { getSignedUrl } from '../lib/api/storage';
import {
  assignSubcontractorToProject,
  createSubcontractor,
  listProjectSubcontractors,
  listSubcontractors,
  removeAssignment,
  updateAssignment,
  updateAssignmentStatus,
  updateSubcontractor,
  uploadInsuranceDoc,
} from '../lib/api/subcontractors';
import { downloadFile } from '../lib/downloadFile';
import { confirm } from '../lib/confirm';
import { Button, Card, EmptyState, Field, StatusBadge } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { ProjectSubcontractor, Subcontractor, SubcontractorAssignmentStatus } from '../lib/types';

const STATUS_CYCLE: SubcontractorAssignmentStatus[] = ['planifie', 'en_cours', 'termine', 'annule'];

// "JJ.MM.AAAA" <-> ISO, same convention as the rest of the app (see
// devis/factures/[id].tsx) rather than a native date picker.
function parseSwissDate(value: string): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

function displayDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-CH');
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ProjectSubcontractors({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ProjectSubcontractor[]>([]);
  const [directory, setDirectory] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newTrade, setNewTrade] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ProjectSubcontractor | null>(null);
  const [editTask, setEditTask] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, d] = await Promise.all([listProjectSubcontractors(projectId), listSubcontractors(organizationId)]);
    setAssignments(a);
    setDirectory(d);
    setLoading(false);
  }, [projectId, organizationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const assignedIds = useMemo(() => new Set(assignments.map((a) => a.subcontractor_id)), [assignments]);
  const filteredDirectory = useMemo(
    () =>
      directory.filter(
        (s) => !assignedIds.has(s.id) && (!search.trim() || s.company_name.toLowerCase().includes(search.trim().toLowerCase())),
      ),
    [directory, assignedIds, search],
  );

  function openPicker() {
    setSearch('');
    setCreatingNew(false);
    setNewCompany('');
    setNewTrade('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setError(null);
    setPickerOpen(true);
  }

  async function pickExisting(sub: Subcontractor) {
    if (!user) return;
    setSaving(true);
    const { error: err } = await assignSubcontractorToProject(organizationId, projectId, sub.id, user.id, {});
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setPickerOpen(false);
    load();
  }

  async function createAndAssign() {
    if (!user) return;
    if (!newCompany.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const { subcontractor, error: createErr } = await createSubcontractor(organizationId, user.id, {
      companyName: newCompany,
      trade: newTrade,
      contactName: newContact,
      phone: newPhone,
      email: newEmail,
    });
    if (createErr || !subcontractor) {
      setSaving(false);
      setError(createErr ?? 'Erreur lors de la création.');
      return;
    }
    const { error: assignErr } = await assignSubcontractorToProject(organizationId, projectId, subcontractor.id, user.id, {});
    setSaving(false);
    if (assignErr) {
      setError(assignErr);
      return;
    }
    setPickerOpen(false);
    load();
  }

  function openEdit(a: ProjectSubcontractor) {
    setError(null);
    setEditing(a);
    setEditTask(a.task ?? '');
    setEditStart(displayDate(a.start_date));
    setEditEnd(displayDate(a.end_date));
    setEditNotes(a.notes ?? '');
    setEditContact(a.subcontractors?.contact_name ?? '');
    setEditPhone(a.subcontractors?.phone ?? '');
    setEditEmail(a.subcontractors?.email ?? '');
    setEditExpiry(displayDate(a.subcontractors?.insurance_expires_on));
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await updateAssignment(editing.id, {
      task: editTask,
      startDate: editStart.trim() ? parseSwissDate(editStart) : null,
      endDate: editEnd.trim() ? parseSwissDate(editEnd) : null,
      notes: editNotes,
    });
    if (editing.subcontractors) {
      await updateSubcontractor(editing.subcontractors.id, {
        contactName: editContact,
        phone: editPhone,
        email: editEmail,
      });
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function cycleStatus(a: ProjectSubcontractor) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status) + 1) % STATUS_CYCLE.length];
    setAssignments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    await updateAssignmentStatus(a.id, next);
  }

  async function handleRemoveAssignment(a: ProjectSubcontractor) {
    const ok = await confirm('Retirer ce sous-traitant du chantier ?', a.subcontractors?.company_name ?? '');
    if (!ok) return;
    await removeAssignment(a.id);
    setEditing(null);
    load();
  }

  async function pickInsuranceDoc() {
    if (!editing?.subcontractors) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const extension = (asset.name.split('.').pop() || 'pdf').toLowerCase();
    setUploadingDoc(true);
    await uploadInsuranceDoc(
      editing.subcontractors,
      asset.uri,
      asset.mimeType ?? 'application/octet-stream',
      extension,
      editExpiry.trim() ? parseSwissDate(editExpiry) : null,
    );
    setUploadingDoc(false);
    load();
  }

  async function viewInsuranceDoc() {
    const path = editing?.subcontractors?.insurance_doc_path;
    if (!path) return;
    const url = await getSignedUrl(path);
    if (url) await downloadFile(url, 'attestation-assurance');
  }

  return (
    <View>
      <Button title="Ajouter un sous-traitant" icon="plus" onPress={openPicker} style={{ marginBottom: spacing.lg }} />

      {assignments.length === 0 && !loading ? (
        <EmptyState
          title="Aucun sous-traitant"
          subtitle="Ajoutez les entreprises sous-traitées sur ce chantier pour suivre leurs interventions et leurs documents."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {assignments.map((a) => {
            const insurance = a.subcontractors?.insurance_expires_on;
            const expired = !!insurance && insurance < todayIso();
            return (
              <Pressable key={a.id} onPress={() => openEdit(a)}>
                <Card>
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.company}>{a.subcontractors?.company_name}</Text>
                      {a.subcontractors?.trade || a.task ? (
                        <Text style={styles.meta}>{[a.subcontractors?.trade, a.task].filter(Boolean).join(' · ')}</Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => cycleStatus(a)} hitSlop={8}>
                      <StatusBadge status={a.status} />
                    </Pressable>
                  </View>
                  {a.start_date || a.end_date ? (
                    <Text style={styles.dates}>
                      {a.start_date ? displayDate(a.start_date) : '?'} → {a.end_date ? displayDate(a.end_date) : '?'}
                    </Text>
                  ) : null}
                  {a.subcontractors?.insurance_doc_path ? (
                    <View style={styles.insuranceRow}>
                      <Feather name={expired ? 'alert-triangle' : 'shield'} size={13} color={expired ? colors.danger : colors.success} />
                      <Text style={[styles.insuranceText, expired && { color: colors.danger }]}>
                        {expired ? "Attestation d'assurance expirée" : "Attestation d'assurance à jour"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.insuranceRow}>
                      <Feather name="alert-circle" size={13} color={colors.textMuted} />
                      <Text style={styles.insuranceTextMuted}>Aucune attestation d'assurance</Text>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Add: pick from directory or create a new one */}
      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Ajouter un sous-traitant</Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>

            {!creatingNew ? (
              <ScrollView style={{ maxHeight: 420 }}>
                <Field label="Rechercher" value={search} onChangeText={setSearch} placeholder="Nom de l'entreprise" />
                <Pressable style={styles.newEntryRow} onPress={() => setCreatingNew(true)}>
                  <Feather name="plus-circle" size={16} color={colors.primary} />
                  <Text style={styles.newEntryText}>Nouvelle entreprise sous-traitée</Text>
                </Pressable>
                {filteredDirectory.map((s) => (
                  <Pressable key={s.id} style={styles.directoryRow} onPress={() => pickExisting(s)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.directoryName}>{s.company_name}</Text>
                      {s.trade ? <Text style={styles.meta}>{s.trade}</Text> : null}
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
                {filteredDirectory.length === 0 ? (
                  <Text style={styles.emptyHint}>
                    {directory.length === 0 ? "Aucun sous-traitant enregistré pour l'instant." : 'Aucun résultat.'}
                  </Text>
                ) : null}
              </ScrollView>
            ) : (
              <ScrollView style={{ maxHeight: 420 }}>
                <Field label="Nom de l'entreprise" value={newCompany} onChangeText={setNewCompany} placeholder="Ex. Électricité Progin SA" />
                <Field label="Métier" value={newTrade} onChangeText={setNewTrade} placeholder="Électricité, plâtrerie…" />
                <Field label="Contact" value={newContact} onChangeText={setNewContact} placeholder="Nom du contact" />
                <Field label="Téléphone" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
                <Field label="E-mail" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" />
              </ScrollView>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.sheetActions}>
              {creatingNew ? <Button title="Retour" variant="secondary" onPress={() => setCreatingNew(false)} style={{ flex: 1 }} /> : null}
              {creatingNew ? <Button title="Créer et ajouter" onPress={createAndAssign} loading={saving} style={{ flex: 1 }} /> : null}
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit an existing assignment: intervention, dates, contact, insurance. */}
      <Modal visible={!!editing} animationType="slide" transparent onRequestClose={() => setEditing(null)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editing?.subcontractors?.company_name}</Text>
              <Pressable onPress={() => setEditing(null)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 480 }}>
              <Field label="Intervention" value={editTask} onChangeText={setEditTask} placeholder="Ce que fait ce sous-traitant sur ce chantier" />
              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <Field label="Début" value={editStart} onChangeText={setEditStart} placeholder="JJ.MM.AAAA" />
                </View>
                <View style={styles.row2Item}>
                  <Field label="Fin" value={editEnd} onChangeText={setEditEnd} placeholder="JJ.MM.AAAA" />
                </View>
              </View>
              <Field
                label="Notes"
                value={editNotes}
                onChangeText={setEditNotes}
                multiline
                style={{ minHeight: 70, textAlignVertical: 'top' }}
              />

              <Text style={styles.sectionLabel}>Contact</Text>
              <Field label="Nom du contact" value={editContact} onChangeText={setEditContact} />
              <Field label="Téléphone" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
              <Field label="E-mail" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.sectionLabel}>Attestation d'assurance</Text>
              {editing?.subcontractors?.insurance_doc_path ? (
                <View style={styles.docRow}>
                  <Pressable style={styles.docButton} onPress={viewInsuranceDoc}>
                    <Feather name="file-text" size={14} color={colors.primary} />
                    <Text style={styles.docButtonText}>Voir le document</Text>
                  </Pressable>
                </View>
              ) : null}
              <Field label="Date d'expiration" value={editExpiry} onChangeText={setEditExpiry} placeholder="JJ.MM.AAAA" />
              <Button
                title={editing?.subcontractors?.insurance_doc_path ? 'Remplacer le document' : 'Téléverser le document'}
                variant="secondary"
                icon="upload"
                onPress={pickInsuranceDoc}
                loading={uploadingDoc}
                style={{ marginTop: spacing.sm }}
              />
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.sheetActions}>
              <Button title="Retirer du chantier" variant="danger" onPress={() => editing && handleRemoveAssignment(editing)} style={{ flex: 1 }} />
              <Button title="Enregistrer" onPress={saveEdit} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  company: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  dates: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  insuranceText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.success,
  },
  insuranceTextMuted: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
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
    flexShrink: 1,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  newEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  newEntryText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  directoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  directoryName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
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
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
