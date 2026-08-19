import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { listWorkTypes } from '../../../lib/api/payroll';
import { listFacturesForProjects, markTimeEntriesInvoiced, type ProjectFactureSummary } from '../../../lib/api/factures';
import { PayrollEntryPanel, defaultTodayRange } from '../../../components/PayrollEntryPanel';
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
  hours: number; // remaining (not yet invoiced) — this is what "Facturer" bills
  totalHours: number; // remaining + already invoiced
  invoicedHours: number;
  rate: number | null;
  entryIds: string[]; // only the not-yet-invoiced entries
}

export default function PayrollScreen() {
  const { organization, user, canManagePayroll, canViewFinances } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.tablet;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [mode, setMode] = useState<'hours' | 'invoicing' | 'salaries'>('hours');
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>(defaultTodayRange);
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
        .select('id, project_id, work_type_id, hours, invoiced_facture_id')
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
      const invoiced = !!row.invoiced_facture_id;
      const h = Number(row.hours);
      if (!totals.has(key)) {
        totals.set(key, {
          projectId: row.project_id,
          projectName,
          workTypeId: row.work_type_id,
          workTypeLabel: wt?.label ?? 'Non précisé',
          hours: 0,
          totalHours: 0,
          invoicedHours: 0,
          rate: wt?.hourly_rate_chf ?? null,
          entryIds: [],
        });
      }
      const line = totals.get(key)!;
      line.totalHours = Math.round((line.totalHours + h) * 100) / 100;
      if (invoiced) {
        line.invoicedHours = Math.round((line.invoicedHours + h) * 100) / 100;
      } else {
        line.hours = Math.round((line.hours + h) * 100) / 100;
        line.entryIds.push(row.id);
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

  // The invoicing tab's whole point is browsing chantier totals for a
  // period, so — unlike the collapsed summary embedded elsewhere — it
  // reloads as soon as the date range changes instead of waiting for the
  // next screen focus.
  useEffect(() => {
    if (mode === 'invoicing') {
      setSummaryOpen(true);
      loadSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, range.start, range.end]);

  // Covers the gap "Facturer ce chantier" can't close on its own: a facture
  // created the normal way (not through this hours summary) already covers
  // some logged hours, but nothing ever told those entries they'd been
  // billed — so they kept showing up as fully facturable. This lets the
  // admin retroactively point a line's hours at whichever existing facture
  // already covers them.
  async function linkLineToFacture(line: SummaryLine, factureId: string) {
    if (line.entryIds.length === 0) return;
    await markTimeEntriesInvoiced(line.entryIds, factureId);
    loadSummary();
  }

  const invoiceProject = projects.find((p) => p.id === invoiceProjectId) ?? null;
  // Memoized so the modal only sees a new array when the underlying hours
  // actually change — otherwise every unrelated re-render of this screen
  // (e.g. useFocusEffect refreshes) would hand the modal a brand-new array
  // reference and reset every draft the admin had already filled in.
  const invoiceCandidateLines: InvoiceCandidateLine[] = useMemo(
    () =>
      summaryLines
        // Only lines with something left to bill — a work type that's
        // already fully invoiced still shows in the summary (for the
        // facturé/restant comparison) but has nothing to offer here.
        .filter((l) => l.projectId === invoiceProjectId && l.hours > 0)
        .map((l) => ({ workTypeId: l.workTypeId, label: l.workTypeLabel, hours: l.hours, suggestedRate: l.rate, entryIds: l.entryIds })),
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
  const summaryInvoicedHours = Math.round(summaryLines.reduce((s, l) => s + l.invoicedHours, 0) * 100) / 100;
  const summaryGrandTotalHours = Math.round(summaryLines.reduce((s, l) => s + l.totalHours, 0) * 100) / 100;

  const employeeList = (
    <View style={styles.employeeList}>
      <Text style={styles.employeeListTitle}>Équipe</Text>
      {members.map((m) => (
        <Pressable
          key={m.id}
          onPress={() => (mode === 'salaries' ? router.push(`/(app)/rh/${m.id}`) : setSelectedUserId(m.id))}
          style={[styles.memberRow, mode === 'hours' && selectedUserId === m.id && styles.memberRowActive]}
        >
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>{initials(m.label)}</Text>
          </View>
          <Text style={[styles.memberName, mode === 'hours' && selectedUserId === m.id && styles.memberNameActive]} numberOfLines={1}>
            {m.id === user.id ? `${m.label} (moi)` : m.label}
          </Text>
          {mode === 'salaries' ? <Feather name="chevron-right" size={16} color={colors.textMuted} /> : null}
        </Pressable>
      ))}
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

        <View style={styles.modeSwitch}>
          <Pressable onPress={() => setMode('hours')} style={[styles.modeTab, mode === 'hours' && styles.modeTabActive]}>
            <Feather name="clock" size={14} color={mode === 'hours' ? colors.primary : colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'hours' && styles.modeTabTextActive]}>Heures & frais</Text>
          </Pressable>
          {canViewFinances ? (
            <Pressable onPress={() => setMode('invoicing')} style={[styles.modeTab, mode === 'invoicing' && styles.modeTabActive]}>
              <Feather name="file-plus" size={14} color={mode === 'invoicing' ? colors.primary : colors.textMuted} />
              <Text style={[styles.modeTabText, mode === 'invoicing' && styles.modeTabTextActive]}>Facturation</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => setMode('salaries')} style={[styles.modeTab, mode === 'salaries' && styles.modeTabActive]}>
            <Feather name="dollar-sign" size={14} color={mode === 'salaries' ? colors.primary : colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'salaries' && styles.modeTabTextActive]}>Salaires</Text>
          </Pressable>
        </View>

        {mode === 'hours' && !hasWorkTypes ? (
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

        {mode === 'salaries' ? (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
            <View style={isDesktop ? styles.salariesLayout : undefined}>
              <View style={isDesktop ? styles.salariesCol : undefined}>{employeeList}</View>
              {isDesktop ? (
                <View style={styles.salariesHint}>
                  <Feather name="dollar-sign" size={22} color={colors.textMuted} />
                  <Text style={styles.salariesHintText}>
                    Cliquez sur un membre de l'équipe pour voir et éditer sa fiche de salaire — taux, cotisations et
                    fiche de paie imprimable.
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        ) : mode === 'invoicing' ? (
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2, gap: spacing.lg }}>
            <PayrollDateFilter range={range} onChange={setRange} />
            <SummaryCard
              open={summaryOpen}
              onToggle={toggleSummary}
              loading={summaryLoading}
              lines={summaryLines}
              totalHours={summaryTotalHours}
              totalChf={summaryTotalChf}
              invoicedHours={summaryInvoicedHours}
              grandTotalHours={summaryGrandTotalHours}
              canInvoice={canViewFinances}
              projectFactures={projectFactures}
              onInvoiceProject={(id) => {
                setInvoiceProjectId(id);
                setShowInvoiceModal(true);
              }}
              onLinkExisting={linkLineToFacture}
              collapsible={false}
            />
          </ScrollView>
        ) : isDesktop ? (
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
  invoicedHours,
  grandTotalHours,
  canInvoice,
  projectFactures,
  onInvoiceProject,
  onLinkExisting,
  collapsible = true,
}: {
  open: boolean;
  onToggle: () => void;
  loading: boolean;
  lines: SummaryLine[];
  totalHours: number;
  totalChf: number;
  invoicedHours: number;
  grandTotalHours: number;
  canInvoice: boolean;
  projectFactures: Record<string, ProjectFactureSummary[]>;
  onInvoiceProject: (projectId: string) => void;
  onLinkExisting: (line: SummaryLine, factureId: string) => Promise<void>;
  collapsible?: boolean;
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
      {collapsible ? (
        <Pressable onPress={onToggle} style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Sommaire par chantier</Text>
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        <Text style={styles.sectionTitle}>Facturation par chantier</Text>
      )}
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
                    <SummaryLineRow key={i} line={l} factures={factures} canInvoice={canInvoice} onLinkExisting={onLinkExisting} />
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
            {invoicedHours > 0 ? (
              <Text style={styles.grandTotalHint}>
                {grandTotalHours} h au total sur la période · {invoicedHours} h déjà facturées · {totalHours} h restant à facturer
              </Text>
            ) : null}
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Reste à facturer</Text>
              <Text style={styles.summaryHours}>{totalHours} h</Text>
              <Text style={styles.summaryChf}>CHF {totalChf.toFixed(2)}</Text>
            </View>
          </View>
        )
      ) : null}
    </Card>
  );
}

// A facture created the regular way (not through "Facturer ce chantier")
// has no way of telling the app which hours it already covers — so those
// hours kept showing up as fully facturable even once billed. The link
// icon lets an admin retroactively point a line's remaining hours at
// whichever existing facture on this chantier already covers them.
function SummaryLineRow({
  line,
  factures,
  canInvoice,
  onLinkExisting,
}: {
  line: SummaryLine;
  factures: ProjectFactureSummary[];
  canInvoice: boolean;
  onLinkExisting: (line: SummaryLine, factureId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const canLink = canInvoice && line.hours > 0 && factures.length > 0;

  return (
    <View>
      <View style={styles.summaryRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryType}>{line.workTypeLabel}</Text>
          {line.invoicedHours > 0 ? (
            <Text style={styles.summarySubline}>
              {line.hours > 0
                ? `${line.totalHours} h au total · ${line.invoicedHours} h déjà facturées`
                : `${line.totalHours} h — entièrement facturées`}
            </Text>
          ) : null}
        </View>
        <Text style={styles.summaryHours}>{line.hours} h</Text>
        <Text style={styles.summaryChf}>{line.rate ? `CHF ${(line.rate * line.hours).toFixed(2)}` : '—'}</Text>
        {canLink ? (
          <Pressable onPress={() => setOpen((o) => !o)} hitSlop={8} style={styles.linkToggle}>
            <Feather name={open ? 'x' : 'link'} size={13} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {open ? (
        <View style={styles.linkPanel}>
          <Text style={styles.linkPanelHint}>Ces heures sont déjà couvertes par une de ces factures ?</Text>
          {factures.map((f) => (
            <Pressable
              key={f.id}
              disabled={linkingId !== null}
              onPress={async () => {
                setLinkingId(f.id);
                await onLinkExisting(line, f.id);
                setLinkingId(null);
                setOpen(false);
              }}
              style={styles.linkFactureRow}
            >
              <Text style={styles.linkFactureNumber} numberOfLines={1}>
                {f.number ?? 'Brouillon'}
              </Text>
              <Text style={styles.linkFactureAmount}>{linkingId === f.id ? 'Association…' : `CHF ${f.total.toFixed(2)}`}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
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
  modeSwitch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  modeTabText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modeTabTextActive: {
    color: colors.primary,
  },
  salariesLayout: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  salariesCol: {
    width: 280,
  },
  salariesHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  salariesHintText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 20,
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
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  summarySubline: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  grandTotalHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  linkToggle: {
    marginLeft: spacing.sm,
    padding: 4,
  },
  linkPanel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: -4,
    marginBottom: spacing.xs,
    gap: 4,
  },
  linkPanelHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  linkFactureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkFactureNumber: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  linkFactureAmount: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
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
