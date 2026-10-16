import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { RELIEF_COPY, fill, reliefLocale, workTermWords } from '../../lib/relief/copy';
import { getReliefWorld, loadReliefActivity, loadReliefData, type ReliefEvent, type ReliefWorldRow } from '../../lib/relief/data';
import { defaultAnswers } from '../../lib/relief/process';
import { previewData, previewSpec } from '../../lib/relief/preview';
import type { ReliefData } from '../../lib/relief/types';
import ReliefPeekDom, { type PeekEvent } from './ReliefPeekDom';

// Cantia Relief on the dashboard (app/(app)/index.tsx), shown when the
// option is on: the company as a live city at dusk with today's figures and
// the latest activity, or, before the first build, a sketch of the company's
// process inviting the owner to create it. No amounts here: the dashboard
// shows none.

const LOCALE_TAG: Record<string, string> = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };

function ago(iso: string, tag: string) {
  const diff = (Date.parse(iso) - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}

export function ReliefDashboardCard() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = reliefLocale(i18n.language);
  const copy = RELIEF_COPY[locale];
  const { organization, role, canViewFinances, canManageDevis } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const { width } = useWindowDimensions();
  const [world, setWorld] = useState<ReliefWorldRow | null | undefined>(undefined);
  const [data, setData] = useState<ReliefData | null>(null);
  const [events, setEvents] = useState<ReliefEvent[]>([]);
  const orgId = organization?.id;
  const words = workTermWords(locale, (organization as { work_term?: string | null } | null)?.work_term);
  const spec = world?.spec ?? null;

  const load = useCallback(async () => {
    if (!orgId || !organization) return;
    const [w, ev] = await Promise.all([getReliefWorld(orgId), loadReliefActivity(orgId, { invoices: canViewFinances || canManageDevis })]);
    setWorld(w);
    setEvents(ev);
    if (w?.spec) {
      const todayLabel = new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : locale === 'it' ? 'it-CH' : 'fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
      setData(await loadReliefData({ id: orgId, name: organization.name }, w.spec, { withMoney: false, todayLabel }));
    }
  }, [orgId, organization, locale, canViewFinances, canManageDevis]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Live: someone plans themselves on a job, a task moves, a job is added.
  useEffect(() => {
    if (!orgId) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const later = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(load, 800);
    };
    const channel = supabase.channel(`relief-peek-${orgId}-${Date.now()}`);
    for (const table of ['projects', 'planning_assignments', 'dashboard_tasks', 'factures', 'relief_worlds']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `organization_id=eq.${orgId}` }, later);
    }
    channel.subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [orgId, load]);

  // Before the first build: the company's usual process as a sketch.
  const sketch = useMemo(() => {
    if (!organization) return null;
    const a = defaultAnswers(organization.trade ?? null, locale, []);
    const s = previewSpec(a, organization.trade ?? null, organization.name, words);
    return { spec: s, data: previewData(s, a, organization.name) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, organization?.trade, locale]);

  if (!organization || world === undefined || (spec && !data) || (!spec && !sketch)) return null;

  const wide = width >= 700;
  const height = wide ? 400 : 470;
  const open = () => router.push('/relief' as never);
  const tag = LOCALE_TAG[locale];
  const feed: PeekEvent[] = events.map((e) => {
    const when = ago(e.at, tag);
    if (e.kind === 'task') return { kind: e.kind, tag: copy.evTask, title: e.text, meta: [e.item, e.who, when].filter(Boolean).join(' · ') };
    if (e.kind === 'plan') {
      const day = new Date(`${e.text}T12:00:00`).toLocaleDateString(tag, { weekday: 'short', day: 'numeric', month: 'short' });
      return { kind: e.kind, tag: copy.evPlan, title: `${e.who ?? '—'} → ${e.item ?? '—'}`, meta: `${day} · ${when}` };
    }
    if (e.kind === 'paid') return { kind: e.kind, tag: copy.evPaid, title: e.text || '—', meta: [e.item, when].filter(Boolean).join(' · ') };
    return { kind: e.kind, tag: `${copy.evProject} · ${words.item}`, title: e.item ?? '—', meta: when };
  });
  const common = { feedTitle: copy.feedTitle, feed, feedEmpty: copy.feedEmpty, legend: copy.dashLegend };

  if (spec && data) {
    const active = data.items.filter((i) => i.status !== 'done' && !i.example).length;
    const people = new Set([...data.items.flatMap((i) => i.crew), ...data.atBase]).size;
    const late = data.items.filter((i) => i.status === 'late').length;
    const real = data.items.filter((i) => !i.example && i.status !== 'done');
    const avg = real.length ? Math.round((real.reduce((x, i) => x + i.progress, 0) / real.length) * 100) : 0;
    return (
      <View style={{ height, borderRadius: 18, overflow: 'hidden' }}>
        <ReliefPeekDom
          spec={spec}
          data={data}
          eyebrow={copy.brand}
          live={world?.status === 'building' ? copy.rebuilding : copy.dashLive}
          title={spec.title}
          subtitle={spec.tagline}
          stats={[
            { value: active, label: fill(copy.statInProgress, { items: spec.vocabulary.items }) },
            { value: people, label: copy.dashPlanned },
            { value: avg, suffix: '%', label: copy.dashProgress },
            { value: late, label: copy.statLate, tone: late ? ('late' as const) : undefined },
          ]}
          {...common}
          cta={copy.dashOpen}
          onOpen={open}
          dom={{ style: { height, width: '100%' }, scrollEnabled: false }}
        />
      </View>
    );
  }

  const building = world?.status === 'building';
  return (
    <View style={{ height, borderRadius: 18, overflow: 'hidden' }}>
      <ReliefPeekDom
        spec={sketch!.spec}
        data={sketch!.data}
        eyebrow={copy.brand}
        live={building ? copy.buildingTitle : copy.introEyebrow}
        title={copy.introTitle}
        subtitle={building ? copy.dashBuilding : fill(copy.dashTeaser, { items: words.items })}
        stats={[]}
        {...common}
        cta={building ? copy.dashOpen : isAdmin ? copy.dashCreate : copy.dashDiscover}
        onOpen={open}
        dom={{ style: { height, width: '100%' }, scrollEnabled: false }}
      />
    </View>
  );
}
