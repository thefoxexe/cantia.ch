import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import {
  assignSubcontractorToProject,
  createSubcontractor,
  listProjectSubcontractors,
  listSubcontractors,
  removeAssignment,
  updateAssignmentStatus,
} from '../lib/api/subcontractors';
import { confirm } from '../lib/confirm';
import { Button, Card, EmptyState, Field, StatusBadge } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { ProjectSubcontractor, Subcontractor, SubcontractorAssignmentStatus } from '../lib/types';

const STATUS_CYCLE: SubcontractorAssignmentStatus[] = ['planifie', 'en_cours', 'termine', 'annule'];

function displayDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-CH');
}

const todayIso = () => new Date().toISOString().slice(0, 10);

// Per-chantier view: who's assigned here, at a glance. Tapping a company
// opens its own dedicated page (app/(app)/sous-traitants/[id].tsx) — the
// single place to manage its contact info, insurance, every chantier it's
// on, and invoices received, rather than a chantier-scoped edit sheet.
export function ProjectSubcontractors({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { user } = useAuth();
  const router = useRouter();
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

  async function cycleStatus(a: ProjectSubcontractor) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status) + 1) % STATUS_CYCLE.length];
    setAssignments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    await updateAssignmentStatus(a.id, next);
  }

  async function handleRemoveAssignment(a: ProjectSubcontractor) {
    const ok = await confirm('Retirer ce sous-traitant du chantier ?', a.subcontractors?.company_name ?? '');
    if (!ok) return;
    await removeAssignment(a.id);
    load();
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
              <Pressable key={a.id} onPress={() => router.push(`/(app)/sous-traitants/${a.subcontractor_id}` as any)}>
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
                    <Pressable onPress={() => handleRemoveAssignment(a)} hitSlop={8}>
                      <Feather name="trash-2" size={15} color={colors.danger} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
