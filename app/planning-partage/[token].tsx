import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { ClientPortalFooter } from '../../components/ClientPortalFooter';
import { GanttView, StatusPill, type Zoom } from '../../components/schedule/GanttView';
import { PhoneList } from '../../components/schedule/PhoneList';
import { Btn, Sheet, kit } from '../../components/admin/ledger/kit';
import { flatten, rollup, type ScheduleItem } from '../../lib/schedule/calc';
import { fill, shortDate } from '../../lib/schedule/copy';
import { useScheduleCopy } from '../../lib/schedule/useCopy';
import { workCalendar, type Canton } from '../../lib/schedule/holidays';
import { getSharedSchedule, type SharedSchedule } from '../../lib/schedule/shares';
import { buildSchedulePdf } from '../../lib/schedule/pdf';
import { logoAsPng, saveBlob } from '../../lib/schedule/download';
import { loadPdfLib } from '../../lib/loadPdfLib';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { premiumCard, portalFonts, heroWash } from '../../lib/clientPortalTheme';
import { applyClientPortalLocale, detectAndApplyBrowserLocale, useTranslation } from '../../lib/translations';

detectAndApplyBrowserLocale();

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// A planning de chantier shared by link (schedule_shares): read-only, no
// account, always the current state. Opened by the client, the architect
// or the other companies on the chantier.
export default function SharedScheduleScreen() {
  useTranslation(); // re-render when the visitor switches language
  const c = useScheduleCopy();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { width, height } = useWindowDimensions();
  const phone = width < 760;
  const [data, setData] = useState<SharedSchedule | null | undefined>(undefined);
  const [view, setView] = useState<'gantt' | 'list'>('gantt');
  const [zoom, setZoom] = useState<Zoom>('week');
  const [toToday, setToToday] = useState(0);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<ScheduleItem | null>(null);
  const [busy, setBusy] = useState(false);
  const today = todayIso();

  useEffect(() => {
    if (!token) return;
    getSharedSchedule(token).then(({ data: d }) => {
      setData(d ?? null);
      if (d?.organization?.locale) applyClientPortalLocale(d.organization.locale);
    });
  }, [token]);

  const items: ScheduleItem[] = useMemo(
    () =>
      (data?.items ?? []).map((i) => ({
        ...i,
        responsible_user_id: null,
        team_size: null,
        fixed: false,
        baseline_start: null,
        baseline_end: null,
        actual_start: null,
        actual_end: null,
      })),
    [data],
  );
  const links = data?.links ?? [];
  const workdays = useMemo(() => {
    const cal = data?.calendar;
    const y = Number(today.slice(0, 4));
    return workCalendar(
      { workdays: cal?.workdays?.length ? cal.workdays : [1, 2, 3, 4, 5], canton: (cal?.canton as Canton | null) ?? null, holidays: cal?.holidays ?? true, closures: cal?.closures ?? [], extra: cal?.days_off ?? [] },
      `${y - 3}-01-01`,
      `${y + 6}-12-31`,
    );
  }, [data, today]);
  const rolled = useMemo(() => rollup(items, today), [items, today]);
  const rows = useMemo(() => flatten(items, collapsed), [items, collapsed]);
  const span = useMemo(() => {
    const d = [...rolled.values()].flatMap((r) => [r.start, r.end]).filter(Boolean).sort() as string[];
    return { from: d[0] ?? today, to: d.at(-1) ?? today };
  }, [rolled, today]);

  if (data === undefined) {
    return (
      <View style={[styles.screen, heroWash, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={kit.hint}>…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <ScrollView style={[styles.screen, heroWash]} contentContainerStyle={styles.content}>
        <ClientPortalHeader />
        <View style={[premiumCard, { alignItems: 'center', gap: spacing.md }]}>
          <View style={styles.badIcon}>
            <Feather name="link-2" size={22} color={colors.danger} />
          </View>
          <Text style={styles.title}>{c.sharedInvalid}</Text>
          <Text style={[kit.body, { textAlign: 'center', color: colors.textMuted }]}>{c.sharedInvalidText}</Text>
        </View>
        <ClientPortalFooter />
      </ScrollView>
    );
  }

  const org = data.organization;
  const accent = org.brand_color && /^#[0-9a-f]{6}$/i.test(org.brand_color) ? org.brand_color : colors.primary;
  const listView = phone || view === 'list';
  const ganttH = Math.max(380, Math.min(height * 0.78, rows.length * 36 + 110));

  const downloadPdf = async () => {
    setBusy(true);
    try {
      const pdfLib = await loadPdfLib();
      const now = new Date();
      const bytes = await buildSchedulePdf(pdfLib, {
        c,
        project: data.project.name,
        rows: flatten(items).map((r) => ({ item: r.item, depth: r.depth })),
        rolled,
        from: span.from,
        to: span.to,
        today,
        generatedAt: `${now.toLocaleDateString('fr-CH')} ${now.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}`,
        brand: org.name ? { name: org.name, logoPng: await logoAsPng(org.logo_url) } : null,
      });
      saveBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${c.pdfTitle} - ${data.project.name}`.replace(/[\\/:*?"<>|]+/g, ' ') + '.pdf');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, heroWash]} contentContainerStyle={[styles.content, !listView && styles.contentWide]}>
      <ClientPortalHeader />

      <View style={[premiumCard, styles.hero, { borderTopColor: accent }]}>
        <View style={styles.heroTop}>
          {org.logo_url ? <Image source={{ uri: org.logo_url }} style={styles.logo} resizeMode="contain" accessibilityLabel={org.name} /> : null}
          <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
            {org.name ? <Text style={styles.eyebrow}>{fill(c.sharedBy, { name: org.name })}</Text> : null}
            <Text style={styles.title}>{data.project.name}</Text>
            <Text style={kit.hint}>
              {[data.project.reference, data.project.address].filter(Boolean).join(' · ')}
            </Text>
          </View>
          {Platform.OS === 'web' ? <Btn icon="download" label={busy ? '…' : 'PDF'} onPress={downloadPdf} disabled={busy || !items.length} /> : null}
        </View>
        <View style={styles.facts}>
          <Fact icon="calendar" text={`${shortDate(span.from)} → ${shortDate(span.to)}`} />
          {data.updated_at ? <Fact icon="refresh-cw" text={fill(c.sharedUpdated, { date: shortDate(data.updated_at.slice(0, 10)) })} /> : null}
          {data.share.expires_at ? <Fact icon="clock" text={fill(c.shareUntil, { date: shortDate(data.share.expires_at.slice(0, 10)) })} /> : null}
        </View>
      </View>

      {!phone ? (
        <View style={styles.toolbar}>
          <View style={kit.seg}>
            {(['gantt', 'list'] as const).map((v) => (
              <Pressable key={v} onPress={() => setView(v)} style={[kit.segItem, view === v && kit.segOn]}>
                <Text style={[kit.segText, view === v && kit.segTextOn]}>{v === 'gantt' ? c.sharedGantt : c.sharedList}</Text>
              </Pressable>
            ))}
          </View>
          {view === 'gantt' ? (
            <>
              <View style={kit.seg}>
                {(['day', 'week', 'month'] as Zoom[]).map((z) => (
                  <Pressable key={z} onPress={() => setZoom(z)} style={[kit.segItem, zoom === z && kit.segOn]}>
                    <Text style={[kit.segText, zoom === z && kit.segTextOn]}>{z === 'day' ? c.zoomDay : z === 'week' ? c.zoomWeek : c.zoomMonth}</Text>
                  </Pressable>
                ))}
              </View>
              <Btn icon="crosshair" label={c.today} onPress={() => setToToday((n) => n + 1)} />
            </>
          ) : null}
        </View>
      ) : null}

      {listView ? (
        <PhoneList c={c} rows={rows} rolled={rolled} onOpen={setOpen} />
      ) : (
        <View style={{ height: ganttH }}>
          <GanttView
            c={c}
            rows={rows}
            rolled={rolled}
            links={links}
            zoom={zoom}
            today={today}
            workdays={workdays}
            showArrows
            editable={false}
            collapsed={collapsed}
            conflicts={new Set()}
            scrollToToday={toToday}
            onToggle={(id) =>
              setCollapsed((s) => {
                const n = new Set(s);
                if (n.has(id)) n.delete(id);
                else n.add(id);
                return n;
              })
            }
            onOpen={setOpen}
            onMove={() => {}}
          />
        </View>
      )}

      <ClientPortalFooter />

      {open ? (
        <Sheet title={open.name} onClose={() => setOpen(null)} footer={<Btn label={c.cancel} onPress={() => setOpen(null)} grow />}>
          {open.kind !== 'phase' ? <StatusPill c={c} item={open} late={rolled.get(open.id)?.late ?? 0} /> : null}
          <Row label={c.start} value={shortDate(rolled.get(open.id)?.start ?? open.start_date)} />
          <Row label={c.end} value={shortDate(rolled.get(open.id)?.end ?? open.end_date)} />
          {open.kind === 'task' && open.duration ? <Row label={c.duration} value={String(open.duration)} /> : null}
          {open.trade ? <Row label={c.trade} value={open.trade} /> : null}
          {open.company ? <Row label={c.company} value={open.company} /> : null}
          <Row label={c.progress} value={`${open.kind === 'phase' ? rolled.get(open.id)?.progress ?? 0 : open.status === 'done' ? 100 : open.progress} %`} />
          {open.notes ? <Row label={c.notes} value={open.notes} /> : null}
        </Sheet>
      ) : null}
    </ScrollView>
  );
}

function Fact({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.fact}>
      <Feather name={icon} size={13} color={colors.textMuted} />
      <Text style={styles.factText}>{text}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={[kit.hint, { width: 150 }]}>{label}</Text>
      <Text style={[kit.body, { flex: 1 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  contentWide: { maxWidth: 1600 },
  hero: { borderTopWidth: 4, gap: spacing.md },
  heroTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  logo: { width: 120, height: 48 },
  eyebrow: { fontFamily: portalFonts.body, fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontFamily: portalFonts.display, fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  factText: { fontSize: fontSize.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  badIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
  detail: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
});
