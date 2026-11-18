import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen, PageHeader } from '../../../components/ui';
import { Btn, Field, Sheet, kit, usePhone } from '../../../components/admin/ledger/kit';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { POSTCALC_ROLE, createPostcalc, isPostcalc } from '../../../lib/tenders/postcalc';
import { postcalcCopy } from '../../../lib/tenders/postcalcCopy';
import { formatChf } from '../../../lib/tenders/numbers';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Module Métrés (post-calcul): every métré of the company, made from the
// soumission of a chantier. Creating one: pick the chantier, then the
// soumission it starts from (lib/tenders/postcalc.ts).

interface Row {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  project: { name: string } | null;
  base_name: string | null;
  real: number | null;
}

interface BaseOption {
  id: string;
  name: string;
  number: string | null;
  kind: string;
  metadata: Record<string, unknown> | null;
  positions: number;
}

export default function MetresScreen() {
  const c = postcalcCopy();
  const router = useRouter();
  const { phone } = usePhone();
  const { organization } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  // Creation: chantier, then its soumissions, then the name.
  const [picking, setPicking] = useState(false);
  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [bases, setBases] = useState<BaseOption[] | null>(null);
  const [base, setBase] = useState<BaseOption | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ data }, { data: proj }] = await Promise.all([
      supabase
        .from('tenders')
        .select('id, project_id, name, created_at, metadata, projects(name)')
        .eq('organization_id', organization.id)
        .eq('metadata->>role', POSTCALC_ROLE)
        .order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(200),
    ]);
    const list = (data ?? []) as any[];
    const ids = list.map((r) => r.id);
    const baseIds = list.map((r) => r.metadata?.base_tender_id).filter((x): x is string => typeof x === 'string');
    const [{ data: prices }, { data: baseRows }] = await Promise.all([
      ids.length ? supabase.from('tender_position_prices').select('tender_id, amount').in('tender_id', ids) : Promise.resolve({ data: [] as any[] }),
      baseIds.length ? supabase.from('tenders').select('id, name').in('id', baseIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const totals = new Map<string, number>();
    for (const p of (prices ?? []) as { tender_id: string; amount: number | null }[]) totals.set(p.tender_id, (totals.get(p.tender_id) ?? 0) + Number(p.amount ?? 0));
    const baseName = new Map(((baseRows ?? []) as { id: string; name: string }[]).map((b) => [b.id, b.name]));
    setRows(
      list.map((r) => ({
        id: r.id,
        project_id: r.project_id,
        name: r.name,
        created_at: r.created_at,
        project: r.projects ?? null,
        base_name: baseName.get(r.metadata?.base_tender_id) ?? null,
        real: totals.has(r.id) ? totals.get(r.id)! : null,
      })),
    );
    setProjects((proj ?? []) as { id: string; name: string }[]);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function chooseProject(p: { id: string; name: string }) {
    setProject(p);
    setBases(null);
    setBase(null);
    setError(null);
    const { data } = await supabase
      .from('tenders')
      .select('id, name, number, kind, metadata, tender_positions(count)')
      .eq('project_id', p.id)
      .order('created_at', { ascending: false });
    const options = ((data ?? []) as any[])
      .filter((t) => !isPostcalc(t))
      .map((t) => ({ id: t.id, name: t.name, number: t.number, kind: t.kind, metadata: t.metadata, positions: t.tender_positions?.[0]?.count ?? 0 }))
      // The soumission received first, then variants and internal métrés.
      .sort((a, b) => Number(b.kind === 'soumission') - Number(a.kind === 'soumission'));
    setBases(options);
    if (options.length === 1) chooseBase(options[0]);
  }

  function chooseBase(b: BaseOption) {
    setBase(b);
    setName(c.defaultName(b.name));
  }

  function closeSheet() {
    setPicking(false);
    setProject(null);
    setBases(null);
    setBase(null);
    setError(null);
  }

  async function create() {
    if (!base || !project || creating) return;
    setCreating(true);
    setError(null);
    const { id, error: err } = await createPostcalc({ id: base.id, name: base.name, metadata: base.metadata ?? {} }, name.trim() || c.defaultName(base.name));
    setCreating(false);
    if (!id || err) {
      setError(err ?? 'Erreur');
      return;
    }
    closeSheet();
    router.push(`/(app)/metres/${id}` as any);
  }

  if (!rows) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.page, phone && { padding: spacing.lg }]}>
        <View style={styles.head}>
          <PageHeader title={c.title} style={{ marginBottom: 0, flex: 1, minWidth: 220 }} />
          {!phone ? <Btn label={c.newCta} icon="plus" variant="primary" onPress={() => setPicking(true)} /> : null}
        </View>
        <Text style={[kit.muted, { maxWidth: 700 }]}>{c.intro}</Text>

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="sliders" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{c.empty}</Text>
            <Text style={[kit.muted, { textAlign: 'center', maxWidth: 460 }]}>{c.emptyText}</Text>
            {!phone ? <Btn label={c.newCta} icon="plus" variant="primary" onPress={() => setPicking(true)} /> : null}
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {rows.map((r) => (
              <Pressable key={r.id} onPress={() => router.push(`/(app)/metres/${r.id}` as any)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
                <View style={styles.cardIcon}>
                  <Feather name="sliders" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {r.name}
                  </Text>
                  <Text style={kit.hint} numberOfLines={1}>
                    {[r.project?.name, r.base_name ? `${c.base} : ${r.base_name}` : null].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {r.real != null ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={kit.hint}>{c.real}</Text>
                    <Text style={styles.amount}>{formatChf(r.real)}</Text>
                  </View>
                ) : null}
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.how}>
          <Text style={styles.howTitle}>{c.howTitle}</Text>
          {c.how.map((h, i) => (
            <View key={h} style={styles.howRow}>
              <Text style={styles.howNum}>{i + 1}</Text>
              <Text style={[kit.body, { flex: 1 }]}>{h}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {picking ? (
        <Sheet
          title={!project ? c.pickChantier : !base ? c.pickBase : c.nameLabel}
          onClose={closeSheet}
          footer={
            base ? (
              <View style={[kit.row, { justifyContent: 'flex-end', gap: spacing.sm }]}>
                <Btn label={c.back} onPress={() => (bases && bases.length > 1 ? setBase(null) : setProject(null))} />
                <Btn label={creating ? c.creating : c.create} icon="check" variant="primary" onPress={create} disabled={creating} />
              </View>
            ) : undefined
          }
        >
          {!project ? (
            <View style={{ gap: 6 }}>
              {projects.map((p) => (
                <Pressable key={p.id} onPress={() => chooseProject(p)} style={({ pressed }) => [styles.pickRow, pressed && { opacity: 0.85 }]}>
                  <Feather name="layers" size={15} color={colors.primary} />
                  <Text style={[kit.body, { flex: 1 }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Feather name="chevron-right" size={15} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : !bases ? (
            <LoadingScreen />
          ) : bases.length === 0 ? (
            <View style={{ gap: spacing.md }}>
              <Text style={kit.muted}>{c.noSoumission}</Text>
              <View style={[kit.row, { gap: spacing.sm }]}>
                <Btn label={c.back} onPress={() => setProject(null)} />
                <Btn
                  label={c.openChantier}
                  icon="arrow-right"
                  variant="primary"
                  onPress={() => {
                    const id = project.id;
                    closeSheet();
                    router.push(`/(app)/chantiers/${id}/metre` as any);
                  }}
                />
              </View>
            </View>
          ) : !base ? (
            <View style={{ gap: 6 }}>
              <Text style={kit.hint}>{c.pickBaseHint}</Text>
              {bases.map((b) => (
                <Pressable key={b.id} onPress={() => chooseBase(b)} style={({ pressed }) => [styles.pickRow, pressed && { opacity: 0.85 }]}>
                  <Feather name="file-text" size={15} color={colors.primary} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={kit.body} numberOfLines={1}>
                      {b.number ? `${b.number} · ` : ''}
                      {b.name}
                    </Text>
                    <Text style={kit.hint}>{c.positions(b.positions)}</Text>
                  </View>
                  <Feather name="chevron-right" size={15} color={colors.textMuted} />
                </Pressable>
              ))}
              <Btn label={c.back} onPress={() => setProject(null)} />
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              <Text style={kit.hint}>
                {project.name} · {c.base} : {base.name}
              </Text>
              <Field label={c.nameLabel}>
                <TextInput value={name} onChangeText={setName} style={kit.input} autoFocus onSubmitEditing={create} />
              </Field>
              <Text style={kit.hint}>{c.pickBaseHint}</Text>
              {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
            </View>
          )}
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 980, alignSelf: 'center', padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl * 3 },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg },
  emptyTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  cardIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  amount: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  how: { marginTop: spacing.lg, gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  howTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  howRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  howNum: { width: 22, height: 22, borderRadius: 11, textAlign: 'center', lineHeight: 22, fontSize: 12, fontWeight: '800', color: colors.primary, backgroundColor: colors.primarySoft },
});
