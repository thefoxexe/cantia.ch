import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { useModule } from '../../lib/modules';
import { supabase } from '../../lib/supabase';
import { RELIEF_COPY, reliefLocale, workTermWords } from '../../lib/relief/copy';
import { getReliefWorld, loadReliefData, type ReliefWorldRow } from '../../lib/relief/data';
import { getReliefGeo, type ReliefGeo } from '../../lib/relief/geo';
import { defaultAnswers } from '../../lib/relief/process';
import { previewData, previewSpec } from '../../lib/relief/preview';
import type { ReliefData } from '../../lib/relief/types';
import MaquetteCardDom from './MaquetteCardDom';

// Cantia Maquette on the dashboard (app/(app)/index.tsx), when the option is
// on: the live card (components/relief/MaquetteCardDom.tsx), kept in sync
// with projects, steps, planning and tasks. No amounts here: the dashboard
// shows none.

export function MaquetteCard() {
  const on = useModule('relief');
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = reliefLocale(i18n.language);
  const copy = RELIEF_COPY[locale];
  const { organization, role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [world, setWorld] = useState<ReliefWorldRow | null | undefined>(undefined);
  const [data, setData] = useState<ReliefData | null>(null);
  const [geo, setGeo] = useState<ReliefGeo | null>(null);
  const [width, setWidth] = useState(0);
  const orgId = organization?.id;
  const locality = (organization as { locality?: string | null } | null)?.locality ?? null;
  const words = workTermWords(locale, (organization as { work_term?: string | null } | null)?.work_term);

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    getReliefGeo(locality, locale).then((g) => !cancelled && setGeo(g));
    return () => {
      cancelled = true;
    };
  }, [on, locality, locale]);

  const load = useCallback(async () => {
    if (!on || !orgId || !organization) return;
    const w = await getReliefWorld(orgId);
    setWorld(w);
    if (w?.spec) setData(await loadReliefData({ id: orgId, name: organization.name }, w.spec, { withMoney: false, todayLabel: '', answers: w.answers }));
  }, [on, orgId, organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Live: someone is planned on a project, a step moves, a task is ticked.
  useEffect(() => {
    if (!on || !orgId) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const later = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(load, 800);
    };
    const channel = supabase.channel(`maquette-card-${orgId}-${Date.now()}`);
    for (const table of ['projects', 'planning_assignments', 'dashboard_tasks', 'relief_item_progress', 'relief_worlds']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `organization_id=eq.${orgId}` }, later);
    }
    channel.subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [on, orgId, load]);

  // Before the first build: the usual process of the trade, as a sketch.
  const sketch = useMemo(() => {
    if (!organization) return null;
    const a = defaultAnswers(organization.trade ?? null, locale, []);
    const s = previewSpec(a, organization.trade ?? null, organization.name, words);
    return { spec: s, data: previewData(s, a, organization.name) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, organization?.trade, locale]);

  if (!on || !organization || world === undefined) return null;
  const spec = world?.spec ?? null;
  if (spec && !data) return null;
  const mode = spec ? 'live' : world?.status === 'building' ? 'building' : 'sketch';
  const shown = spec && data ? { spec, data } : sketch;
  if (!shown) return null;
  const narrow = width > 0 && width < 720;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: narrow ? 520 : 360, borderRadius: 6, overflow: 'hidden' }}>
      <MaquetteCardDom
        spec={shown.spec}
        data={shown.data}
        geo={geo}
        copy={copy}
        mode={mode}
        company={organization.name}
        items={words.items}
        canCreate={isAdmin}
        onOpen={() => router.push('/maquette' as never)}
        dom={{ style: { width: '100%', height: '100%' }, scrollEnabled: false }}
      />
    </View>
  );
}
