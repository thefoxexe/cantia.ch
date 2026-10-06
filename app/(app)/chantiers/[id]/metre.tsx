import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useProject } from '../../../../lib/useProject';
import { useAuth } from '../../../../lib/auth-context';
import { discardImport, importSoumission, pendingImports, type ImportJob, type ImportProgress } from '../../../../lib/tenders/importer';
import { FeatureHint } from '../../../../components/FeatureHint';
import { LoadingScreen, PageHeader, AppScreen } from '../../../../components/ui';
import { Btn, Chip, Field, Sheet, kit, usePhone } from '../../../../components/admin/ledger/kit';
import { canEditTenders, createTender, deleteTender, duplicateTender, listTenders, type TenderSummary } from '../../../../lib/tenders/api';
import { fill, useTenderCopy } from '../../../../lib/tenders/copy';
import { formatChf } from '../../../../lib/tenders/numbers';
import type { TenderKind } from '../../../../lib/tenders/types';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import { displayType, monoType } from '../../../../lib/marketingTheme';

const KINDS: TenderKind[] = ['soumission', 'interne', 'variante', 'complementaire'];

export default function ChantierMetresScreen() {
  const c = useTenderCopy();
  const router = useRouter();
  const { phone } = usePhone();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project } = useProject(id);
  const [tenders, setTenders] = useState<TenderSummary[] | null>(null);
  const [editable, setEditable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<TenderSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const [pending, setPending] = useState<ImportJob[]>([]);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const load = useCallback(async () => {
    if (!project) return;
    const [{ tenders: list, error: err }, can, jobs] = await Promise.all([listTenders(id), canEditTenders(project.organization_id), pendingImports(id)]);
    setTenders(list);
    setError(err);
    setEditable(can);
    setPending(jobs);
  }, [id, project]);

  async function startImport() {
    if (!project) return;
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: false, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const a = result.assets[0] as DocumentPicker.DocumentPickerAsset & { file?: File };
    setError(null);
    setProgress({ step: 'reading' });
    const { jobId, error: err } = await importSoumission(id, project.organization_id, user?.id ?? null, { name: a.name, uri: a.uri, size: a.size, mimeType: a.mimeType, file: a.file ?? null }, setProgress);
    setProgress(null);
    if (err && !jobId) return setError(err);
    if (jobId) router.push(`/(app)/chantiers/${id}/metres/import/${jobId}` as any);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!project || !tenders) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  const open = (t: TenderSummary) => router.push(`/(app)/chantiers/${id}/metres/${t.id}` as any);

  async function duplicate(t: TenderSummary) {
    setBusy(true);
    const { id: newId, error: err } = await duplicateTender(t.id, `${t.name} ${c.copySuffix}`);
    setBusy(false);
    if (err) return setError(err);
    await load();
    if (newId) router.push(`/(app)/chantiers/${id}/metres/${newId}` as any);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    const { error: err } = await deleteTender(toDelete.id);
    setBusy(false);
    setToDelete(null);
    if (err) setError(err);
    load();
  }

  return (
    <AppScreen>
      <PageHeader
        title={c.moduleTitle}
        backTo={`/(app)/chantiers/${id}`}
        style={{ maxWidth: 980, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: 0 }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.page, phone && { padding: spacing.lg }]}>
        <FeatureHint id="chantier-metres-v2" icon="layers" title={c.hintTitle} text={c.hintText} />

        {!editable ? (
          <View style={styles.upsell}>
            <View style={styles.upsellIcon}>
              <Feather name="lock" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2, minWidth: 200 }}>
              <Text style={styles.upsellTitle}>{c.upsellTitle}</Text>
              <Text style={kit.muted}>{c.upsellText}</Text>
            </View>
            <Btn label={c.upsellCta} icon="arrow-right" variant="primary" onPress={() => router.push('/(app)/compte/facturation' as any)} />
          </View>
        ) : null}

        <View style={styles.toolbar}>
          <Text style={kit.eyebrow}>{c.moduleTitle}</Text>
          {editable ? (
            <View style={kit.row}>
              {Platform.OS === 'web' ? <Btn label={c.importPdf} icon="upload" variant="primary" onPress={startImport} disabled={!!progress} /> : null}
              <Btn label={c.newTender} icon="plus" onPress={() => setCreating(true)} />
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {pending.length ? (
          <View style={styles.pending}>
            <Text style={kit.eyebrow}>{c.pendingImports}</Text>
            {pending.map((j) => (
              <View key={j.id} style={styles.pendingRow}>
                <Feather name={j.status === 'failed' ? 'alert-circle' : 'file-text'} size={16} color={j.status === 'failed' ? colors.danger : colors.primary} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={kit.body} numberOfLines={1}>
                    {j.file_name}
                  </Text>
                  <Text style={kit.hint}>{j.status === 'failed' ? `${c.failed} : ${j.error ?? ''}` : fill(c.detected, { n: (j as unknown as { stats?: { billable?: number } }).stats?.billable ?? 0 })}</Text>
                </View>
                {j.status !== 'failed' ? <Btn label={c.resume} icon="arrow-right" variant="ghost" onPress={() => router.push(`/(app)/chantiers/${id}/metres/import/${j.id}` as any)} /> : null}
                <Btn
                  label={c.discard}
                  icon="x"
                  variant="ghost"
                  onPress={async () => {
                    await discardImport(j.id);
                    load();
                  }}
                />
              </View>
            ))}
          </View>
        ) : null}

        {tenders.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="layers" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{c.empty}</Text>
            <Text style={[kit.muted, { textAlign: 'center', maxWidth: 420 }]}>{c.emptyText}</Text>
            {editable ? (
              <View style={kit.row}>
                {Platform.OS === 'web' ? <Btn label={c.importPdf} icon="upload" variant="primary" onPress={startImport} disabled={!!progress} /> : null}
                <Btn label={c.newTender} icon="plus" onPress={() => setCreating(true)} />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {tenders.map((t) => (
              <Pressable key={t.id} onPress={() => open(t)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
                <View style={styles.cardMain}>
                  <View style={styles.cardIcon}>
                    <Feather name={t.source_type === 'pdf' ? 'file-text' : t.kind === 'variante' ? 'git-branch' : 'layers'} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {t.number ? <Text style={styles.cardNumber}>{t.number} · </Text> : null}
                      {t.name}
                    </Text>
                    <View style={kit.row}>
                      <Tag label={c.kinds[t.kind] ?? t.kind} />
                      <Tag label={c.statuses[t.status] ?? t.status} tone={t.status === 'priced' || t.status === 'offered' ? 'ok' : undefined} />
                      {t.cfc_code ? <Tag label={`CFC ${t.cfc_code}`} mono /> : null}
                      <Text style={kit.hint}>{t.positions === 0 ? c.noPosition : t.positions === 1 ? c.onePosition : fill(c.positions, { n: t.positions })}</Text>
                    </View>
                  </View>
                  {t.amount != null ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.amount}>{formatChf(t.amount)}</Text>
                      <Text style={kit.hint}>CHF {c.brut.toLowerCase()}</Text>
                    </View>
                  ) : null}
                </View>
                {editable ? (
                  <View style={styles.cardActions}>
                    <Btn label={c.open} icon="arrow-right" variant="ghost" onPress={() => open(t)} />
                    <Btn label={c.duplicate} icon="copy" variant="ghost" onPress={() => duplicate(t)} disabled={busy} />
                    <Btn label={c.delete} icon="trash-2" variant="ghost" onPress={() => setToDelete(t)} disabled={busy} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {progress ? <ImportProgressSheet progress={progress} /> : null}

      {creating ? (
        <CreateTenderSheet
          onClose={() => setCreating(false)}
          onCreate={async (fields) => {
            const { tender, error: err } = await createTender(id, fields);
            if (err || !tender) return err ?? 'Erreur';
            setCreating(false);
            await load();
            router.push(`/(app)/chantiers/${id}/metres/${tender.id}` as any);
            return null;
          }}
        />
      ) : null}

      {toDelete ? (
        <Sheet
          title={c.delete}
          onClose={() => setToDelete(null)}
          footer={
            <>
              <Btn label={c.cancel} onPress={() => setToDelete(null)} grow />
              <Btn label={c.confirmDelete} icon="trash-2" variant="bad" onPress={confirmDelete} disabled={busy} grow />
            </>
          }
        >
          <Text style={kit.body}>{fill(c.deleteConfirm, { name: toDelete.name })}</Text>
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

const STEPS = ['reading', 'uploading', 'extracting', 'parsing', 'saving'];

function ImportProgressSheet({ progress }: { progress: ImportProgress }) {
  const c = useTenderCopy();
  const idx = progress.step === 'ocr' ? 2 : Math.max(0, STEPS.indexOf(progress.step));
  return (
    <Sheet title={c.importTitle} onClose={() => {}}>
      <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
        <ActivityIndicator color={colors.primary} />
        <Text style={kit.eyebrow}>{fill(c.importStepOf, { n: Math.min(5, idx + 1) })}</Text>
        <Text style={styles.upsellTitle}>
          {c.importSteps[progress.step]}
          {progress.page && progress.pages ? ` — ${fill(c.importPage, { page: progress.page, pages: progress.pages })}` : ''}
        </Text>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${((idx + (progress.page && progress.pages ? progress.page / progress.pages : 0.5)) / 5) * 100}%` }]} />
        </View>
        <Text style={[kit.hint, { textAlign: 'center', maxWidth: 420 }]}>{c.importIntro}</Text>
      </View>
    </Sheet>
  );
}

function Tag({ label, tone, mono }: { label: string; tone?: 'ok'; mono?: boolean }) {
  return (
    <View style={[styles.tag, tone === 'ok' && { backgroundColor: colors.successSoft }]}>
      <Text style={[styles.tagText, mono && { ...monoType, fontSize: 11 }, tone === 'ok' && { color: colors.success }]}>{label}</Text>
    </View>
  );
}

function CreateTenderSheet({ onClose, onCreate }: { onClose: () => void; onCreate: (f: { name: string; kind: TenderKind; number: string | null; cfc_code: string | null }) => Promise<string | null> }) {
  const c = useTenderCopy();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TenderKind>('soumission');
  const [number, setNumber] = useState('');
  const [cfc, setCfc] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    const err = await onCreate({ name: name.trim(), kind, number: number.trim() || null, cfc_code: cfc.trim() || null });
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <Sheet
      title={c.newTender}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn label={c.create} icon="check" variant="primary" onPress={submit} disabled={busy || !name.trim()} grow />
        </>
      }
    >
      <Field label={c.name}>
        <TextInput style={kit.input} value={name} onChangeText={setName} placeholder={c.namePlaceholder} placeholderTextColor={colors.textMuted} autoFocus onSubmitEditing={submit} />
      </Field>
      <Field label={c.kind}>
        <View style={kit.row}>
          {KINDS.map((k) => (
            <Chip key={k} label={c.kinds[k]} active={kind === k} onPress={() => setKind(k)} small />
          ))}
        </View>
      </Field>
      <View style={[kit.row, { alignItems: 'flex-start' }]}>
        <Field label={c.number} half>
          <TextInput style={kit.input} value={number} onChangeText={setNumber} />
        </Field>
        <Field label={c.cfc} half>
          <TextInput style={kit.input} value={cfc} onChangeText={setCfc} placeholder="211" placeholderTextColor={colors.textMuted} />
        </Field>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.xl, gap: spacing.lg, maxWidth: 980, width: '100%', alignSelf: 'center', paddingBottom: spacing.xxl * 2 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  upsell: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.primarySoft },
  upsellIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  upsellTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.xl, paddingHorizontal: spacing.lg },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.sm },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: { width: 42, height: 42, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  cardNumber: { ...monoType, fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: 2 },
  amount: { ...displayType, fontSize: 20, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt },
  tagText: { fontSize: 11.5, fontWeight: '700', color: colors.textMuted },
  error: { fontSize: fontSize.sm, color: colors.danger },
  pending: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.primary + '55', backgroundColor: colors.surface },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bar: { width: '100%', maxWidth: 360, height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
});
