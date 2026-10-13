import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { hasModule, listMyPrivateModules, toggleModuleActivation } from '../../lib/modules';
import { RELIEF_COPY, reliefLocale } from '../../lib/relief/copy';
import { addReliefTask, getReliefWorld, loadReliefData, planOnItemToday, startReliefBuild, type ReliefWorldRow } from '../../lib/relief/data';
import type { ReliefData } from '../../lib/relief/types';
import ReliefDom from '../../components/relief/ReliefDom';
import { ReliefBuilding, ReliefFailed, ReliefLocked, ReliefNotAdmin, ReliefOnboarding } from '../../components/relief/ReliefScreens';

// Cantia Relief, full screen (app/(app)/_layout.tsx shows no menu here):
// the offer while the paid option isn't on, the onboarding where the owner
// dictates the business, the wait while the AI builds the world, then the
// world itself, fed live by the company's projects, planning and tasks.

type Access = 'loading' | 'none' | 'granted' | 'active';

const DATE_FMT: Record<string, string> = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };

export default function ReliefScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = reliefLocale(i18n.language);
  const copy = RELIEF_COPY[locale];
  const { organization, user, role, canViewFinances, permissions } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [access, setAccess] = useState<Access>('loading');
  const [activating, setActivating] = useState(false);
  const [world, setWorld] = useState<ReliefWorldRow | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<ReliefData | null>(null);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const worldRef = useRef(world);
  worldRef.current = world;
  const orgId = organization?.id;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, access]);

  const spec = world?.spec ?? null;

  // Live data: reloaded when projects, planning or tasks change.
  const loadData = useCallback(async () => {
    if (!organization || !spec) return;
    const todayLabel = new Date().toLocaleDateString(DATE_FMT[locale], { weekday: 'long', day: 'numeric', month: 'long' });
    const next = await loadReliefData({ id: organization.id, name: organization.name }, spec, { withMoney: canViewFinances, todayLabel });
    setData(next);
  }, [organization, spec, canViewFinances, locale]);

  useEffect(() => {
    if (!orgId || !spec) return;
    loadData();
    const later = () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(loadData, 600);
    };
    const channel = supabase.channel(`relief-data-${orgId}-${Date.now()}`);
    for (const table of ['projects', 'planning_assignments', 'dashboard_tasks']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `organization_id=eq.${orgId}` }, later);
    }
    channel.subscribe();
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
  }, [orgId, spec, loadData]);

  const submitBrief = async (brief: string) => {
    if (!orgId) return null;
    const { error } = await startReliefBuild(orgId, brief, locale);
    if (error) return error;
    setEditing(false);
    setWorld((w) => ({ ...(w ?? { id: '', spec: null, error: null, ready_at: null, updated_at: '' }), status: 'building', brief }) as ReliefWorldRow);
    return null;
  };

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

  if (!world || editing) {
    if (!isAdmin) return <ReliefNotAdmin copy={copy} onClose={close} />;
    return <ReliefOnboarding copy={copy} initialBrief={world?.brief ?? ''} skipIntro={!!world} onSubmit={submitBrief} onClose={world ? () => setEditing(false) : close} />;
  }

  if (!world.spec) {
    if (world.status === 'failed') return <ReliefFailed copy={copy} onRetry={() => submitBrief(world.brief)} onEdit={() => setEditing(true)} onClose={close} />;
    return <ReliefBuilding copy={copy} onClose={close} />;
  }

  if (!data || !user) {
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
        canPlan={isAdmin || permissions.planning}
        canRedo={isAdmin}
        rebuilding={world.status === 'building'}
        onOpenItem={(id) => router.push(`/chantiers/${id}` as never)}
        onAddTask={async (itemId, title) => {
          const { error } = await addReliefTask(organization.id, user.id, itemId, title);
          if (!error) loadData();
          return error;
        }}
        onPlan={async (itemId, personId) => {
          const { error } = await planOnItemToday(organization.id, user.id, personId, itemId);
          if (!error) loadData();
          return error;
        }}
        onClose={close}
        onRedo={() => setEditing(true)}
        dom={{ style: { flex: 1 } }}
      />
    </View>
  );
}
