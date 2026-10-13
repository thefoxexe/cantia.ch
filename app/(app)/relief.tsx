import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../lib/translations';
import { hasModule, isModuleEnabled, listMyPrivateModules, toggleModuleActivation } from '../../lib/modules';
import { fillsSoumissions } from '../../lib/trades';
import { useDictation } from '../../lib/useDictation';
import { RELIEF_COPY, reliefLocale } from '../../lib/relief/copy';
import { defaultAnswers } from '../../lib/relief/process';
import { addReliefTask, getReliefWorld, loadItemDetails, loadReliefData, planOnItem, setReliefTaskDone, startReliefBuild, type ReliefWorldRow } from '../../lib/relief/data';
import type { ReliefAnswers, ReliefData, ReliefMember, ReliefSection } from '../../lib/relief/types';
import ReliefDom from '../../components/relief/ReliefDom';
import ReliefOnboardingDom from '../../components/relief/ReliefOnboardingDom';
import { ReliefLocked, ReliefNotAdmin } from '../../components/relief/ReliefScreens';

// Cantia Relief, full screen (app/(app)/_layout.tsx shows no menu here):
// the offer while the paid option isn't on, the onboarding where the owner
// describes the business and its process, the wait while the AI builds the
// world, then the world itself, fed live by the company's projects,
// planning, tasks, quotes and invoices, each member seeing what their rights
// allow.

type Access = 'loading' | 'none' | 'granted' | 'active';

const DATE_FMT: Record<string, string> = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };
const TERMS: Record<string, Record<string, [string, string]>> = {
  fr: { chantier: ['chantier', 'chantiers'], projet: ['projet', 'projets'], mandat: ['mandat', 'mandats'], dossier: ['dossier', 'dossiers'] },
  de: { chantier: ['Baustelle', 'Baustellen'], projet: ['Projekt', 'Projekte'], mandat: ['Mandat', 'Mandate'], dossier: ['Dossier', 'Dossiers'] },
  it: { chantier: ['cantiere', 'cantieri'], projet: ['progetto', 'progetti'], mandat: ['mandato', 'mandati'], dossier: ['dossier', 'dossier'] },
};

export default function ReliefScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const locale = reliefLocale(i18n.language);
  const copy = RELIEF_COPY[locale];
  const { organization, user, role, canViewFinances, canManageDevis, canCreateProjects, permissions } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [access, setAccess] = useState<Access>('loading');
  const [activating, setActivating] = useState(false);
  const [world, setWorld] = useState<ReliefWorldRow | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<ReliefData | null>(null);
  const [members, setMembers] = useState<ReliefMember[] | null>(null);
  const [dictated, setDictated] = useState({ seq: 0, text: '' });
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const worldRef = useRef(world);
  worldRef.current = world;
  const orgId = organization?.id;
  const term = (organization as { work_term?: string | null } | null)?.work_term ?? 'chantier';
  const [itemWord, itemsWord] = TERMS[locale][term] ?? TERMS[locale].chantier;
  const dictation = useDictation((text) => setDictated((d) => ({ seq: d.seq + 1, text })));

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  // Is the paid option granted, and switched on?
  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    Promise.all([hasModule(orgId, 'relief'), listMyPrivateModules()]).then(([active, grants]) => {
      if (cancelled) return;
      setAccess(active ? 'active' : grants.some((g) => g.key === 'relief') ? 'granted' : 'none');
    });
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  // The team, for the onboarding.
  useEffect(() => {
    if (!orgId) return;
    supabase
      .from('organization_members')
      .select('user_id, full_name')
      .eq('organization_id', orgId)
      .then(({ data: rows }) => setMembers(((rows ?? []) as { user_id: string; full_name: string | null }[]).map((m) => ({ id: m.user_id, name: m.full_name || '—' }))));
  }, [orgId]);

  // The world row, kept in sync while it is being built.
  useEffect(() => {
    if (!orgId || access !== 'active') return;
    let cancelled = false;
    const fetchWorld = () => getReliefWorld(orgId).then((w) => !cancelled && setWorld(w));
    fetchWorld();
    const channel = supabase
      .channel(`relief-world-${orgId}-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relief_worlds', filter: `organization_id=eq.${orgId}` }, fetchWorld)
      .subscribe();
    // Fallback while building, in case the realtime event is missed.
    const poll = setInterval(() => {
      if (worldRef.current?.status === 'building') fetchWorld();
    }, 15000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [orgId, access]);

  const spec = world?.spec ?? null;

  // Live data: reloaded when projects, planning, tasks or invoices change.
  const loadData = useCallback(async () => {
    if (!organization || !spec) return;
    const todayLabel = new Date().toLocaleDateString(DATE_FMT[locale], { weekday: 'long', day: 'numeric', month: 'long' });
    const next = await loadReliefData({ id: organization.id, name: organization.name }, spec, { withMoney: canViewFinances || canManageDevis, todayLabel });
    setData(next);
  }, [organization, spec, canViewFinances, canManageDevis, locale]);

  useEffect(() => {
    if (!orgId || !spec) return;
    loadData();
    const later = () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(loadData, 600);
    };
    const channel = supabase.channel(`relief-data-${orgId}-${Date.now()}`);
    for (const table of ['projects', 'planning_assignments', 'dashboard_tasks', 'devis', 'factures']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `organization_id=eq.${orgId}` }, later);
    }
    channel.subscribe();
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
  }, [orgId, spec, loadData]);

  const answers = useMemo<ReliefAnswers | null>(() => {
    if (!members) return null;
    const base = defaultAnswers(organization?.trade ?? null, locale, members);
    const saved = world?.answers;
    if (!saved) return base;
    // Keep what was answered, with today's team.
    return { ...base, ...saved, team: members.map((m) => saved.team.find((x) => x.id === m.id) ?? { id: m.id, name: m.name, job: '' }) };
  }, [members, world?.answers, organization?.trade, locale]);

  const submit = async (a: ReliefAnswers) => {
    if (!orgId) return null;
    const { error } = await startReliefBuild(orgId, a, locale);
    if (error) return error;
    setEditing(false);
    setWorld((w) => ({ ...(w ?? { id: '', spec: null, error: null, ready_at: null, updated_at: '' }), status: 'building', brief: '', answers: a }) as ReliefWorldRow);
    return null;
  };

  const toggleDictation = async () => {
    if (dictation.listening) {
      await dictation.stop();
      return null;
    }
    const ok = await dictation.start();
    return ok ? null : copy.micDenied;
  };

  // The parts of the file the member may open, like the project hub does.
  const sectionsFor = useCallback(
    async (projectId: string, counts: { documents: number | null; reports: number; feed: number }): Promise<ReliefSection[]> => {
      const { data: p } = await supabase.from('projects').select('enabled_modules').eq('id', projectId).maybeSingle();
      const enabled = ((p as { enabled_modules: string[] | null } | null)?.enabled_modules ?? []) as string[];
      const base = `/chantiers/${projectId}`;
      const all: (ReliefSection & { visible: boolean })[] = [
        { key: 'feed', label: t('chantierHub.feed'), icon: 'edit-3', route: `${base}/feed`, count: counts.feed, visible: true },
        { key: 'reports', label: t('chantierHub.reports'), icon: 'file-text', route: `${base}/reports`, count: counts.reports, visible: true },
        { key: 'gantt', label: t('chantierHub.gantt'), icon: 'calendar', route: `${base}/gantt`, visible: isModuleEnabled(enabled, 'gantt') && fillsSoumissions(organization) },
        { key: 'documents', label: t('chantierHub.documents'), icon: 'folder', route: `${base}/documents`, count: counts.documents, visible: isModuleEnabled(enabled, 'documents') && permissions.documents },
        { key: 'photos', label: t('chantierHub.photos'), icon: 'image', route: `${base}/photos`, visible: isModuleEnabled(enabled, 'photos') },
        { key: 'metre', label: t('chantierHub.metre'), icon: 'list', route: `${base}/metre`, visible: isModuleEnabled(enabled, 'metre') && permissions.metre && fillsSoumissions(organization) },
        { key: 'subcontractors', label: t('chantierHub.subcontractors'), icon: 'users', route: `${base}/subcontractors`, visible: isModuleEnabled(enabled, 'subcontractors') && permissions.subcontractors },
        { key: 'profitability', label: t('chantierHub.profitability'), icon: 'trending', route: `${base}/profitability`, visible: isModuleEnabled(enabled, 'profitability') && canViewFinances },
        { key: 'extraWorks', label: t('chantierHub.extraWorks'), icon: 'plus-circle', route: `${base}/travaux-supplementaires`, visible: canManageDevis },
        { key: 'situations', label: t('chantierHub.situations'), icon: 'bar-chart-2', route: `${base}/situations`, visible: canManageDevis },
      ];
      return all.filter((s) => s.visible).map(({ visible: _v, ...s }) => s);
    },
    [t, organization, permissions, canViewFinances, canManageDevis],
  );

  if (!organization || access === 'loading' || (access === 'active' && world === undefined)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE8DC' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (access !== 'active') {
    return (
      <ReliefLocked
        copy={copy}
        canActivate={access === 'granted' && isAdmin}
        activating={activating}
        onActivate={async () => {
          setActivating(true);
          const { error } = await toggleModuleActivation('relief', true);
          setActivating(false);
          if (!error) setAccess('active');
        }}
        onClose={close}
      />
    );
  }

  const needsOnboarding = !world || editing;
  const firstBuild = !!world && !world.spec;
  if (needsOnboarding || firstBuild) {
    if (needsOnboarding && !isAdmin) return <ReliefNotAdmin copy={copy} onClose={close} />;
    if (!answers) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE8DC' }}>
          <ActivityIndicator />
        </View>
      );
    }
    const mode = needsOnboarding ? 'onboarding' : world?.status === 'failed' ? 'failed' : 'building';
    return (
      <View style={{ flex: 1, backgroundColor: '#EFE8DC' }}>
        <ReliefOnboardingDom
          copy={copy}
          locale={locale}
          company={organization.name}
          trade={organization.trade ?? null}
          workTerm={{ item: itemWord, items: itemsWord }}
          members={members ?? []}
          answers={answers}
          mode={mode}
          skipWelcome={!!world}
          listening={dictation.listening}
          transcribing={dictation.transcribing}
          dictated={dictated}
          onToggleDictation={toggleDictation}
          onSubmit={submit}
          onRetry={() => {
            if (world?.answers) submit(world.answers);
            else setEditing(true);
          }}
          onEdit={() => setEditing(true)}
          onClose={world && editing && world.spec ? () => setEditing(false) : close}
          dom={{ style: { flex: 1 } }}
        />
      </View>
    );
  }

  if (!data || !user || !world?.spec) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE8DC' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#EFE8DC' }}>
      <ReliefDom
        spec={world.spec}
        data={data}
        copy={copy}
        locale={locale}
        caps={{ plan: isAdmin || permissions.planning, quotes: canManageDevis, finances: canViewFinances, redo: isAdmin, create: canCreateProjects }}
        rebuilding={world.status === 'building'}
        onLoadDetails={async (itemId) => {
          const details = await loadItemDetails(organization.id, itemId, { quotes: canManageDevis, finances: canViewFinances, documents: permissions.documents });
          return { details, sections: await sectionsFor(itemId, details.counts) };
        }}
        onAddTask={async (itemId, title) => {
          const { error } = await addReliefTask(organization.id, user.id, itemId, title);
          if (!error) loadData();
          return error;
        }}
        onToggleTask={async (taskId, done) => {
          const { error } = await setReliefTaskDone(taskId, done);
          if (!error) loadData();
          return error;
        }}
        onPlan={async (itemId, personId, day) => {
          const { error } = await planOnItem(organization.id, user.id, personId, itemId, day);
          if (!error) loadData();
          return error;
        }}
        onNavigate={(route) => router.push(route as never)}
        onClose={close}
        onRedo={() => setEditing(true)}
        dom={{ style: { flex: 1 } }}
      />
    </View>
  );
}
