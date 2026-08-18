import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { listWorkTypes } from '../../../lib/api/payroll';
import { listFacturesForProjects, type ProjectFactureSummary } from '../../../lib/api/factures';
import { PayrollEntryPanel, defaultMonthRange } from '../../../components/PayrollEntryPanel';
import { PayrollDateFilter, type DateRange } from '../../../components/PayrollDateFilter';
import { PayrollInvoiceModal, type InvoiceCandidateLine } from '../../../components/PayrollInvoiceModal';
import { Button, Card, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../components/ui';
import { colors, fontSize, radius, spacing, breakpoints } from '../../../lib/theme';
import type { Plan, PayrollWorkType } from '../../../lib/types';

interface MemberItem {
  id: string;
  label: string;
}

interface ProjectItem {
  id: string;
  name: string;
  client_name: string | null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface SummaryLine {
  projectId: string | null;
  projectName: string;
  workTypeId: string | null;
  workTypeLabel: string;
  hours: number;
  rate: number | null;
}

export default function PayrollScreen() {
  const { organization, user, canManagePayroll, canViewFinances } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.tablet;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>(defaultMonthRange);
  const [loading, setLoading] = useState(true);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLines, setSummaryLines] = useState<SummaryLine[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [hasWorkTypes, setHasWorkTypes] = useState(true);
  const [projectFactures, setProjectFactures] = useState<Record<string, ProjectFactureSummary[]>>({});

  const load = useCallback(async () => {
    if (!organization || !user) return;
    setLoading(true);
    const { data: planRow } = await supabase.from('plans').select('*').eq('id', organization.plan_id).single();
    setPlan(planRow ?? null);

    if (canManagePayroll) {
      const [{ data: memberRows }, workTypes] = await Promise.all([
        supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
        listWorkTypes(organization.id),
      ]);
      setMembers((memberRows ?? []).map((m) => ({ id: m.user_id, label: m.full_name || 'Membre' })));
      setHasWorkTypes(workTypes.length > 0);
    }
    setSelectedUserId((prev) => prev ?? user.id);
    setLoading(false);
  }, [organization, user, canManagePayroll]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const loadSummary = useCallback(async () => {
    if (!organization) return;
    setSummaryLoading(true);
    const [{ data: projectRows }, workTypes, { data: entryRows }] = await Promise.all([
      supabase.from('projects').select('id, name, client_name').eq('organization_id', organization.id),
      listWorkTypes(organization.id),
      supabase
        .from('payroll_time_entries')
        .select('project_id, work_type_id, hours')
        .eq('organization_id', organization.id)
        .gte('entry_date', range.start)
        .lte('entry_date', range.end),
    ]);
    setProjects(projectRows ?? []);
    const projectNames = new Map((projectRows ?? []).map((p) => [p.id, p.name]));
    const workTypeById = new Map<string, PayrollWorkType>(workTypes.map((w) => [w.id, w]));
    const totals = new Map<string, SummaryLine>();
    for (const row of entryRows ?? []) {
      const projectName = row.project_id ? projectNames.get(row.project_id) ?? 'Chantier' : 'Sans chantier';
      const wt = row.work_type_id ? workTypeById.get(row.work_type_id) : null;
      const key = `${row.project_id ?? 'none'}__${row.work_type_id ?? 'none'}`;
      const existing = totals.get(key);
      if (existing) {
        existing.hours = Math.round((existing.hours + Number(row.hours)) * 100) / 100;
      } else {
        totals.set(key, {
          projectId: row.project_id,
          projectName,
          workTypeId: row.work_type_id,
          workTypeLabel: wt?.label ?? 'Non précisé',
          hours: Math.round(Number(row.hours) * 100) / 100,
          rate: wt?.hourly_rate_chf ?? null,
        });
      }
    }
    setSummaryLines(Array.from(totals.values()).sort((a, b) => a.projectName.localeCompare(b.projectName)));

    const distinctProjectIds = Array.from(new Set((entryRows ?? []).map((r) => r.project_id).filter((id): id is string => !!id)));
    setProjectFactures(await listFacturesForProjects(distinctProjectIds));
    setSummaryLoading(false);
  }, [organization, range.start, range.end]);

  // Refreshes the summary (and its "already invoiced/paid" tracker) when
  // coming back from creating a facture — the admin lands back here after
  // finishing on the facture screen, and should see the up-to-date status
  // without having to manually re-open the summary.
  useFocusEffect(
    useCallback(() => {
      if (summaryOpen) loadSummary();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadSummary]),
  );

  function toggleSummary() {
    const next = !summaryOpen;
    setSummaryOpen(next);
    if (next) loadSummary();
  }

  const invoiceProject = projects.find((p) => p.id === invoiceProjectId) ?? null;
  // Memoized so the modal only sees a new array when the underlying hours
  // actually change — otherwise every unrelated re-render of this screen
  // (e.g. useFocusEffect refreshes) would hand the modal a brand-new array
  // reference and reset every draft the admin had already filled in.
  const invoiceCandidateLines: InvoiceCandidateLine[] = useMemo(
    () =>
      summaryLines
        .filter((l) => l.projectId === invoiceProjectId)
        .map((l) => ({ workTypeId: l.workTypeId, label: l.workTypeLabel, hours: l.hours, suggestedRate: l.rate })),
    [summaryLines, invoiceProjectId],
  );

  if (loading || !organization || !user) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  if (plan && !plan.has_payroll) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <PageHeader title="RH & Salaires" backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="dollar-sign" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>RH, heures & salaires</Text>
          <Text style={styles.upsellText}>
            Chaque employé pointe ses heures par chantier et ses frais professionnels ; la secrétaire ou
            l'administrateur gère la fiche de salaire de toute l'équipe.
          </Text>
          <Text style={styles.upsellText}>Disponible à partir du plan Équipe.</Text>
          <Button title="Voir les plans" variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </Screen>
    );
  }

  if (!canManagePayroll) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <View style={styles.selfContainer}>
          <PageHeader title="RH & Salaires" backTo="/(app)" />
          <Text style={styles.pageSubtitle}>Vos heures et frais professionnels, chantier par chantier.</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
            <PayrollEntryPanel
              organizationId={organization.id}
              targetUserId={user.id}
              currentUserId={user.id}
              range={range}
              onRangeChange={setRange}
            />
          </ScrollView>
        </View>
      </Screen>
    );
  }

  const summaryTotalHours = Math.round(summaryLines.reduce((s, l) => s + l.hours, 0) * 100) / 100;
  const summaryTotalChf = Math.round(summaryLines.reduce((s, l) => s + (l.rate ? l.rate * l.hours : 0), 0) * 100) / 100;

  const employeeList = (
    <View style={styles.employeeList}>
      <Text style={styles.employeeListTitle}>Équipe</Text>
      {members.map((m) => (
        <Pressable
          key={m.id}
          onPress={() => setSelectedUserId(m.id)}
          style={[styles.memberRow, selectedUserId === m.id && styles.memberRowActive]}
        >
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>{initials(m.label)}</Text>
          </View>
          <Text style={[styles.memberName, selectedUserId === m.id && styles.memberNameActive]} numberOfLines={1}>
            {m.id === user.id ? `${m.label} (moi)` : m.label}
          </Text>
        </Pressable>
      ))}
      {selectedUserId ? (
        <Button
          title="Voir la fiche de salaire"
          icon="file-text"
          variant="secondary"
          onPress={() => router.push(`/(app)/rh/${selectedUserId}`)}
          style={styles.ficheButton}
        />
      ) : null}
    </View>
  );

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.adminContainer}>
        <PageHeader
          title="RH & Salaires"
          backTo="/(app)"
          right={
            <Pressable onPress={() => router.push('/(app)/compte/rh')} hitSlop={8}>
              <Feather name="settings" size={18} color={colors.textMuted} />
            </Pressable>
          }
        />
        <Text style={styles.pageSubtitle}>Heures, frais et salaires de toute l'équipe.</Text>

        {!hasWorkTypes ? (
          <Pressable onPress={() => router.push('/(app)/compte/rh')} style={styles.setupBanner}>
            <Feather name="settings" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.setupBannerTitle}>Première visite ? Configurez d'abord vos types de travail</Text>
              <Text style={styles.setupBannerText}>
                Ex : élaboration de projets, dessin. C'est ce que chaque employé choisira en saisissant ses heures.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}

        {isDesktop ? (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
            <View style={styles.desktopLayout}>
              <View style={styles.calendarCol}>
                <PayrollDateFilter range={range} onChange={setRange} />
              </View>
              <View style={styles.employeeCol}>{employeeList}</View>
              <View style={[styles.panelCol, { gap: spacing.lg }]}>
                {selectedUserId ? (
                  <PayrollEntryPanel
                    organizationId={organization.id}
                    targetUserId={selectedUserId}
                    currentUserId={user.id}
                    range={range}
                    onRangeChange={setRange}
                    showCalendar={false}
                  />
                ) : null}
                <SummaryCard
                  open={summaryOpen}
                  onToggle={toggleSummary}
                  loading={summaryLoading}
                  lines={summaryLines}
                  totalHours={summaryTotalHours}
                  totalChf={summaryTotalChf}
                  canInvoice={canViewFinances}
                  projectFactures={projectFactures}
                  onInvoiceProject={(id) => {
                    setInvoiceProjectId(id);
                    setShowInvoiceModal(true);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.lg }}>
            <PayrollDateFilter range={range} onChange={setRange} />
            {employeeList}
            {selectedUserId ? (
              <PayrollEntryPanel
                organizationId={organization.id}
                targetUserId={selectedUserId}
                currentUserId={user.id}
                range={range}
                onRangeChange={setRange}
                showCalendar={false}
              />
            ) : null}
            <SummaryCard
              open={summaryOpen}
              onToggle={toggleSummary}
              loading={summaryLoading}
              lines={summaryLines}
              totalHours={summaryTotalHours}
              totalChf={summaryTotalChf}
              canInvoice={canViewFinances}
              projectFactures={projectFactures}
              onInvoiceProject={(id) => {
                setInvoiceProjectId(id);
                setShowInvoiceModal(true);
              }}
            />
          </ScrollView>
        )}
      </View>

      <PayrollInvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        organizationId={organization.id}
        defaultVatRate={organization.default_vat_rate}
        project={invoiceProject}
        candidateLines={invoiceCandidateLines}
        onCreated={(factureId) => {
          setShowInvoiceModal(false);
          router.push(`/(app)/devis/factures/${factureId}`);
        }}
      />
    </Screen>
  );
}

function SummaryCard({
  open,
  onToggle,
  loading,
  lines,
  totalHours,
  totalChf,
  canInvoice,
  projectFactures,
  onInvoiceProject,
}: {
  open: boolean;
  onToggle: () => void;
  loading: boolean;
  lines: SummaryLine[];
  totalHours: number;
  totalChf: number;
  canInvoice: boolean;
  projectFactures: Record<string, ProjectFactureSummary[]>;
  onInvoiceProject: (projectId: string) => void;
}) {
  const router = useRouter();
  const byProject = new Map<string, { projectId: string | null; projectName: string; lines: SummaryLine[] }>();
  for (const l of lines) {
    const key = l.projectId ?? 'none';
    const existing = byProject.get(key);
    if (existing) existing.lines.push(l);
    else byProject.set(key, { projectId: l.projectId, projectName: l.projectName, lines: [l] });
  }

  return (
    <Card>
      <Pressable onPress={onToggle} style={styles.summaryHeader}>
        <Text style={styles.sectionTitle}>Sommaire par chantier</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open ? (
        loading ? (
          <Text style={styles.hint}>Chargement…</Text>
        ) : lines.length === 0 ? (
          <Text style={styles.hint}>Aucune heure enregistrée sur cette période.</Text>
        ) : (
          <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
            {Array.from(byProject.values()).map((group) => {
              const factures = (group.projectId && projectFactures[group.projectId]) || [];
              return (
                <View key={group.projectId ?? 'none'}>
                  <View style={styles.summaryGroupHeader}>
                    <Text style={styles.summaryProject}>{group.projectName}</Text>
                    {group.projectId && canInvoice ? (
                      <Pressable onPress={() => onInvoiceProject(group.projectId!)} style={styles.invoiceButton}>
                        <Feather name="file-plus" size={13} color={colors.primary} />
                        <Text style={styles.invoiceButtonText}>Facturer ce chantier</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {group.lines.map((l, i) => (
                    <View key={i} style={styles.summaryRow}>
                      <Text style={styles.summaryType}>{l.workTypeLabel}</Text>
                      <Text style={styles.summaryHours}>{l.hours} h</Text>
                      <Text style={styles.summaryChf}>{l.rate ? `CHF ${(l.rate * l.hours).toFixed(2)}` : '—'}</Text>
                    </View>
                  ))}
                  {factures.length > 0 ? (
                    <View style={styles.trackerBox}>
                      <Text style={styles.trackerTitle}>Déjà facturé sur ce chantier</Text>
                      {factures.map((f) => (
                        <Pressable key={f.id} onPress={() => router.push(`/(app)/devis/factures/${f.id}`)} style={styles.trackerRow}>
                          <Text style={styles.trackerNumber} numberOfLines={1}>{f.number ?? 'Brouillon'}</Text>
                          <StatusBadge status={f.status} />
                          <Text style={styles.trackerAmount}>CHF {f.total.toFixed(2)}</Text>
                          <Text style={[styles.trackerRemaining, f.remaining > 0 && styles.trackerRemainingDue]}>
                            {f.remaining > 0 ? `Reste CHF ${f.remaining.toFixed(2)}` : 'Soldée'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : group.projectId ? (
                    <Text style={styles.trackerEmpty}>Aucune facture émise sur ce chantier pour l'instant.</Text>
                  ) : null}
                </View>
              );
            })}
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryHours}>{totalHours} h</Text>
              <Text style={styles.summaryChf}>CHF {totalChf.toFixed(2)}</Text>
            </View>
          </View>
        )
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  selfContainer: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  adminContainer: {
    flex: 1,
    width: '100%',
  },
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  upsellTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  upsellText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  setupBannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  setupBannerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  calendarCol: {
    width: 220,
  },
  employeeCol: {
    width: 200,
  },
  panelCol: {
    flex: 1,
  },
  employeeList: {
    gap: spacing.xs,
  },
  employeeListTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  memberRowActive: {
    backgroundColor: colors.primarySoft,
  },
  memberAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  memberName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  memberNameActive: {
    color: colors.primary,
  },
  ficheButton: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryGroupHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryProject: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  summaryType: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  summaryHours: {
    width: 56,
    textAlign: 'right',
    fontSize: fontSize.sm,
    color: colors.text,
  },
  summaryChf: {
    width: 90,
    textAlign: 'right',
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryTotalLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  trackerBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    gap: 4,
  },
  trackerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  trackerNumber: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  trackerAmount: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  trackerRemaining: {
    fontSize: fontSize.xs,
    color: colors.success,
    width: 100,
    textAlign: 'right',
  },
  trackerRemainingDue: {
    color: colors.warning,
    fontWeight: '700',
  },
  trackerEmpty: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
