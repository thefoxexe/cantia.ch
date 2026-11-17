import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, Field, LoadingScreen, PageHeader } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listModuleOrganizations, listModules, listOrganizations, setOrganizationModule, type AdminModuleOrganization } from '../../../lib/api/admin';
import { supabase } from '../../../lib/supabase';
import type { AdminModuleSummary, AdminOrganizationSummary } from '../../../lib/types';

// Super Admin › Modules › one module: the companies it is assigned to, and a
// search to assign it to another one. Assigning switches the module on for
// the company at once (admin_set_organization_module); removing switches it
// off. The same switch sits on each company's page, under « Modules privés ».
export default function AdminModuleDetail() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const [mod, setMod] = useState<AdminModuleSummary | null>(null);
  const [assigned, setAssigned] = useState<AdminModuleOrganization[]>([]);
  const [planNames, setPlanNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<AdminOrganizationSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const searchSeq = useRef(0);

  const load = useCallback(async () => {
    if (!key) return;
    const [mods, orgs, plans] = await Promise.all([
      listModules(),
      listModuleOrganizations(key),
      supabase.from('plans').select('id, name'),
    ]);
    setMod(mods.rows.find((m) => m.key === key) ?? null);
    setAssigned(orgs.rows);
    setPlanNames(new Map(((plans.data ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name])));
    setError(mods.error ?? orgs.error);
    setLoading(false);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  // Companies matching the search, a short moment after the last key.
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const seq = ++searchSeq.current;
    setSearching(true);
    const timer = setTimeout(async () => {
      const { rows } = await listOrganizations(q, 8, 0);
      if (seq !== searchSeq.current) return;
      setResults(rows);
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const assignedIds = useMemo(() => new Set(assigned.map((a) => a.organization_id)), [assigned]);

  async function setFor(orgId: string, orgName: string, next: boolean) {
    if (!key) return;
    setPending((prev) => new Set(prev).add(orgId));
    const { error: err } = await setOrganizationModule(orgId, key, next);
    setPending((prev) => {
      const copy = new Set(prev);
      copy.delete(orgId);
      return copy;
    });
    if (err) {
      setFeedback(`Erreur : ${err}`);
    } else {
      setFeedback(next ? `${mod?.name ?? 'Module'} assigné à ${orgName}.` : `${mod?.name ?? 'Module'} retiré à ${orgName}.`);
      if (next) setSearch('');
      await load();
    }
    setTimeout(() => setFeedback(null), 4000);
  }

  if (loading) return <LoadingScreen label="Chargement…" />;

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <PageHeader title={mod?.name ?? String(key)} subtitle={mod?.description ?? undefined} backTo="/(admin)/modules" />
        {error ? <AdminErrorBanner message={error} /> : null}
        {!mod ? (
          <EmptyState title="Module introuvable" subtitle="Il a peut-être été retiré du registre." />
        ) : (
          <>
            {mod.status === 'disabled' ? (
              <Text style={styles.warning}>Ce module est désactivé : il n’agit pour aucune entreprise, même assignée.</Text>
            ) : null}

            <Text style={styles.sectionTitle}>Assigner à une entreprise</Text>
            <Field label="Rechercher une entreprise" value={search} onChangeText={setSearch} placeholder="Nom de l’entreprise" autoCapitalize="none" />
            {search.trim().length >= 2 ? (
              <View style={styles.list}>
                {searching && results.length === 0 ? (
                  <Text style={styles.muted}>Recherche…</Text>
                ) : results.length === 0 ? (
                  <Text style={styles.muted}>Aucune entreprise trouvée.</Text>
                ) : (
                  results.map((o) => {
                    const already = assignedIds.has(o.id);
                    const busy = pending.has(o.id);
                    return (
                      <View key={o.id} style={styles.row}>
                        <View style={styles.rowMain}>
                          <Text style={styles.rowTitle}>{o.name}</Text>
                          <Text style={styles.muted}>{o.plan_name ?? 'Aucun plan'}</Text>
                        </View>
                        {already ? (
                          <Text style={styles.done}>Déjà assigné</Text>
                        ) : (
                          <Pressable style={[styles.action, styles.actionPrimary, busy && { opacity: 0.5 }]} disabled={busy} onPress={() => setFor(o.id, o.name, true)}>
                            <Feather name="plus" size={14} color={'#fff'} />
                            <Text style={styles.actionPrimaryText}>Assigner</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            ) : null}
            {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

            <Text style={styles.sectionTitle}>
              {assigned.length === 0 ? 'Entreprises' : `${assigned.length} entreprise${assigned.length > 1 ? 's' : ''}`}
            </Text>
            {assigned.length === 0 ? (
              <Text style={styles.muted}>Assigné à aucune entreprise pour l’instant.</Text>
            ) : (
              <View style={styles.list}>
                {assigned.map((a) => {
                  const busy = pending.has(a.organization_id);
                  return (
                    <View key={a.organization_id} style={styles.row}>
                      <Pressable style={styles.rowMain} onPress={() => router.push(`/(admin)/organizations/${a.organization_id}` as any)}>
                        <Text style={styles.rowTitle}>{a.name}</Text>
                        <Text style={styles.muted}>
                          {(a.plan_id && planNames.get(a.plan_id)) || a.plan_id || 'Aucun plan'}
                          {' · depuis le '}
                          {new Date(a.assigned_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {a.activated ? '' : ' · désactivé par l’entreprise'}
                        </Text>
                      </Pressable>
                      <Pressable style={[styles.action, busy && { opacity: 0.5 }]} disabled={busy} onPress={() => setFor(a.organization_id, a.name, false)}>
                        <Feather name="x" size={14} color={colors.danger} />
                        <Text style={styles.actionDangerText}>Retirer</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
  warning: { fontSize: fontSize.sm, color: colors.danger },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowMain: { flexGrow: 1, flexBasis: 200, minWidth: 0 },
  rowTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  done: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  feedback: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionPrimaryText: { fontSize: fontSize.sm, fontWeight: '600', color: '#fff' },
  actionDangerText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.danger },
});
