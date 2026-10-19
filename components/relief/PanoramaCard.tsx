import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { useModule } from '../../lib/modules';
import { supabase } from '../../lib/supabase';
import { RELIEF_COPY, fill, reliefLocale, workTermWords } from '../../lib/relief/copy';
import { getReliefWorld, loadReliefData, type ReliefWorldRow } from '../../lib/relief/data';
import { getReliefGeo, locateAddresses, type ReliefGeo } from '../../lib/relief/geo';
import type { GlobePoint } from '../../lib/relief/globe';
import type { ReliefData } from '../../lib/relief/types';
import PanoramaGlobeDom from './PanoramaGlobeDom';

// Cantia Panorama at the very bottom of the dashboard (app/(app)/index.tsx),
// when the option is on: just the planet turning, with the company's
// projects lit up in Switzerland (components/relief/PanoramaGlobeDom.tsx),
// and a small button to create the Panorama when there isn't one yet.
// Kept in sync with projects, steps and planning. No amounts here.

export function PanoramaCard() {
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
  const [places, setPlaces] = useState<Record<string, { lat: number; lon: number }>>({});
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
    if (!w?.spec) return;
    const d = await loadReliefData({ id: orgId, name: organization.name }, w.spec, { withMoney: false, todayLabel: '', answers: w.answers });
    setData(d);
    setPlaces(await locateAddresses(d.items.filter((i) => !i.example).map((i) => ({ id: i.id, address: i.place }))));
  }, [on, orgId, organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!on || !orgId) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const later = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(load, 1000);
    };
    const channel = supabase.channel(`panorama-globe-${orgId}-${Date.now()}`);
    for (const table of ['projects', 'planning_assignments', 'relief_item_progress', 'relief_worlds']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `organization_id=eq.${orgId}` }, later);
    }
    channel.subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [on, orgId, load]);

  const hq = geo?.lat != null && geo?.lon != null ? { lat: geo.lat, lon: geo.lon } : null;
  const points = useMemo<GlobePoint[]>(() => {
    if (!data) return [];
    const home = hq ?? { lat: 46.948, lon: 7.447 };
    return data.items
      .filter((i) => !i.example)
      .slice(0, 40)
      .map((i) => ({ id: i.id, lat: places[i.id]?.lat ?? home.lat, lon: places[i.id]?.lon ?? home.lon, status: i.status, crew: i.crew.length }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, places, hq?.lat, hq?.lon]);

  if (!on || !organization || world === undefined) return null;
  const live = !!world?.spec;
  const out = data ? new Set(data.items.flatMap((i) => i.crew)).size : 0;
  const active = data ? data.items.filter((i) => !i.example && i.status !== 'done').length : 0;
  const line = live
    ? [out ? (out === 1 ? copy.cardOutOne : fill(copy.cardOut, { n: String(out) })) : null, active ? `${active} ${fill(copy.cardActive, { items: words.items })}` : null].filter(Boolean).join(' · ')
    : world?.status === 'building'
      ? copy.cardBuilding
      : '';
  const action = live || world?.status === 'building' ? copy.cardEnter : isAdmin ? copy.cardCreate : copy.cardDiscover;
  const narrow = width > 0 && width < 600;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: narrow ? 340 : 420, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0A1222' }}>
      <PanoramaGlobeDom
        accent="#F2B880"
        points={points}
        hq={hq}
        brand={copy.brand}
        line={line}
        action={action}
        primary={!live && world?.status !== 'building'}
        onOpen={() => router.push('/panorama' as never)}
        dom={{ style: { width: '100%', height: '100%' }, scrollEnabled: false }}
      />
    </View>
  );
}
