import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Field, Sheet, kit } from '../admin/ledger/kit';
import { deletePlan, listPlans, uploadPlan, type SitePlanSummary, type UploadStep } from '../../lib/tenders/plansApi';
import { usePlanCopy } from '../../lib/tenders/planCopy';
import { fill } from '../../lib/tenders/copy';
import type { PickedFile } from '../../lib/tenders/importer';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { monoType } from '../../lib/marketingTheme';

// Plans of the chantier, under its métrés: import, open, delete.
export function PlansSection({ projectId, organizationId, userId, editable }: { projectId: string; organizationId: string; userId: string | null; editable: boolean }) {
  const c = usePlanCopy();
  const router = useRouter();
  const [plans, setPlans] = useState<SitePlanSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [toDelete, setToDelete] = useState<SitePlanSummary | null>(null);

  const load = useCallback(async () => {
    const { plans: list, error: err } = await listPlans(projectId);
    setPlans(list);
    if (err) setError(err);
  }, [projectId]);
  useEffect(() => {
    load();
  }, [load]);

  async function pick() {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: false, copyToCacheDirectory: true });
    if (r.canceled || !r.assets?.[0]) return;
    const a = r.assets[0] as DocumentPicker.DocumentPickerAsset & { file?: File };
    setPicked({ name: a.name, uri: a.uri, size: a.size, mimeType: a.mimeType, file: a.file ?? null });
  }

  const open = (p: SitePlanSummary) => router.push(`/(app)/chantiers/${projectId}/plans/${p.id}` as any);
  const canUpload = editable && Platform.OS === 'web';

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 220, gap: 2 }}>
          <Text style={kit.eyebrow}>{c.plans}</Text>
          <Text style={kit.hint}>{c.plansIntro}</Text>
        </View>
        {canUpload ? <Btn label={c.uploadPlan} icon="map" onPress={pick} /> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!plans ? (
        <ActivityIndicator color={colors.primary} />
      ) : plans.length === 0 ? (
        <Text style={[kit.hint, styles.empty]}>{c.noPlan}</Text>
      ) : (
        <View style={styles.grid}>
          {plans.map((p) => (
            <Pressable key={p.id} onPress={() => open(p)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
              <View style={styles.cardIcon}>
                <Feather name="map" size={18} color={colors.slate} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {p.number ? <Text style={styles.cardNumber}>{p.number} · </Text> : null}
                  {p.name}
                </Text>
                <Text style={kit.hint} numberOfLines={1}>
                  {[p.revision_label, p.page_count > 1 ? fill(c.pages, { n: p.page_count }) : null, p.measures === 0 ? c.noMeasure : p.measures === 1 ? c.oneMeasure : fill(c.measures, { n: p.measures })].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <View style={[styles.badge, !p.calibrated && { backgroundColor: colors.warningSoft }]}>
                <Text style={[styles.badgeText, !p.calibrated && { color: colors.warning }]}>{p.calibrated ? c.calibrated : c.notCalibrated}</Text>
              </View>
              {editable ? (
                <Pressable onPress={() => setToDelete(p)} hitSlop={8} accessibilityLabel={c.deletePlan}>
                  <Feather name="trash-2" size={15} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      {picked ? (
        <UploadSheet
          file={picked}
          plans={plans ?? []}
          onClose={() => setPicked(null)}
          onUpload={async (fields, onStep) => {
            const { planId, error: err } = await uploadPlan(projectId, organizationId, userId, picked, fields, onStep);
            if (err) return err;
            setPicked(null);
            await load();
            if (planId) router.push(`/(app)/chantiers/${projectId}/plans/${planId}` as any);
            return null;
          }}
        />
      ) : null}

      {toDelete ? (
        <Sheet
          title={c.deletePlan}
          onClose={() => setToDelete(null)}
          footer={
            <>
              <Btn label={c.cancel} onPress={() => setToDelete(null)} grow />
              <Btn
                label={c.confirmDelete}
                icon="trash-2"
                variant="bad"
                grow
                onPress={async () => {
                  const { error: err } = await deletePlan(toDelete.id);
                  setToDelete(null);
                  if (err) setError(err);
                  load();
                }}
              />
            </>
          }
        >
          <Text style={kit.body}>{fill(c.deletePlanText, { name: toDelete.name })}</Text>
        </Sheet>
      ) : null}
    </View>
  );
}

function UploadSheet({
  file,
  plans,
  onClose,
  onUpload,
}: {
  file: PickedFile;
  plans: SitePlanSummary[];
  onClose: () => void;
  onUpload: (f: { planId: string | null; name: string; number: string | null; label: string }, onStep: (s: UploadStep) => void) => Promise<string | null>;
}) {
  const c = usePlanCopy();
  const [planId, setPlanId] = useState<string | null>(null);
  const [name, setName] = useState(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim());
  const [number, setNumber] = useState('');
  const [label, setLabel] = useState('Rev A');
  const [step, setStep] = useState<UploadStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const err = await onUpload({ planId, name: name.trim(), number: number.trim() || null, label: label.trim() || 'Rev A' }, setStep);
    setStep(null);
    if (err) setError(err);
  }

  return (
    <Sheet
      title={c.uploadPlan}
      onClose={step ? () => {} : onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow disabled={!!step} />
          <Btn label={step ? c.uploadSteps[step] : c.upload} icon="upload" variant="primary" onPress={submit} disabled={!!step || (!planId && !name.trim())} grow />
        </>
      }
    >
      <View style={styles.file}>
        <Feather name="file" size={15} color={colors.slate} />
        <Text style={[kit.body, { flex: 1 }]} numberOfLines={1}>
          {file.name}
        </Text>
      </View>
      {plans.length ? (
        <Field label={c.newRevision}>
          <View style={kit.row}>
            <Pressable onPress={() => setPlanId(null)} style={[styles.opt, !planId && styles.optOn]}>
              <Text style={[styles.optText, !planId && { color: colors.primaryDark }]}>{c.uploadPlan}</Text>
            </Pressable>
            {plans.map((p) => (
              <Pressable key={p.id} onPress={() => setPlanId(p.id)} style={[styles.opt, planId === p.id && styles.optOn]}>
                <Text style={[styles.optText, planId === p.id && { color: colors.primaryDark }]} numberOfLines={1}>
                  {c.newRevision} · {p.number ?? p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>
      ) : null}
      {!planId ? (
        <View style={[kit.row, { alignItems: 'flex-start' }]}>
          <Field label={c.planName} half>
            <TextInput style={kit.input} value={name} onChangeText={setName} placeholder={c.planNamePh} placeholderTextColor={colors.textMuted} />
          </Field>
          <Field label={c.planNumber} half>
            <TextInput style={kit.input} value={number} onChangeText={setNumber} placeholder="A-102" placeholderTextColor={colors.textMuted} />
          </Field>
        </View>
      ) : null}
      <Field label={c.revisionLabel}>
        <TextInput style={kit.input} value={label} onChangeText={setLabel} placeholder="Rev A" placeholderTextColor={colors.textMuted} />
      </Field>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  empty: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.xl, textAlign: 'center' },
  grid: { gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  cardIcon: { width: 38, height: 38, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.slateSoft },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  cardNumber: { ...monoType, fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.successSoft },
  badgeText: { fontSize: 11.5, fontWeight: '700', color: colors.success },
  error: { fontSize: fontSize.sm, color: colors.danger },
  file: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  opt: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, maxWidth: 260 },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optText: { fontSize: 13, fontWeight: '700', color: colors.text },
});
