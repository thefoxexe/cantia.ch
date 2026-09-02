import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../lib/theme';
import { marketingFonts } from '../../lib/marketingTheme';
import { useTranslation } from '../../lib/translations';

type IconName = keyof typeof Feather.glyphMap;

export type ModuleMockupKind =
  | 'devis'
  | 'facturation'
  | 'rapports-chantier'
  | 'dictee-vocale'
  | 'planning'
  | 'rentabilite'
  | 'rh-salaires'
  | 'travaux-supplementaires'
  | 'tresorerie';

// Illustrated (not photographic) mockup of the module in question, built
// entirely from Views/Text/Feather — same visual language already
// established on the homepage hero, the telechargement install guide and
// the pain-section document chips. One shared browser-window chrome, a
// different hand-drawn "screen" per module. This is the `visual` slot on
// SolutionPage's hero, not a real screenshot (the app's actual UI can
// change shape without this needing to be re-captured).
export function ModuleMockup({ kind }: { kind: ModuleMockupKind }) {
  return (
    <View style={styles.frame}>
      <View style={styles.topBar}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#E38B7A' }]} />
          <View style={[styles.dot, { backgroundColor: '#E8C57A' }]} />
          <View style={[styles.dot, { backgroundColor: '#8FB88A' }]} />
        </View>
        <View style={styles.addressBar}>
          <Feather name="lock" size={9} color={colors.textMuted} />
          <Text style={styles.addressText}>cantia.ch</Text>
        </View>
      </View>
      <View style={styles.screen}>
        <MockupContent kind={kind} />
      </View>
    </View>
  );
}

function MockupContent({ kind }: { kind: ModuleMockupKind }) {
  switch (kind) {
    case 'devis':
      return <DevisContent />;
    case 'facturation':
      return <FacturationContent />;
    case 'rapports-chantier':
      return <RapportsContent />;
    case 'dictee-vocale':
      return <DicteeContent />;
    case 'planning':
      return <PlanningContent />;
    case 'rentabilite':
      return <RentabiliteContent />;
    case 'rh-salaires':
      return <RhContent />;
    case 'travaux-supplementaires':
      return <TravauxSupContent />;
    case 'tresorerie':
      return <TresorerieContent />;
  }
}

function ScreenHeader({ icon, title }: { icon: IconName; title: string }) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderIcon}>
        <Feather name={icon} size={13} color={colors.primary} />
      </View>
      <Text style={styles.screenHeaderTitle}>{title}</Text>
    </View>
  );
}

function DevisContent() {
  const { t } = useTranslation();
  const lines = [
    { label: t('solutionMockup.devisLine1'), price: "3'150.—" },
    { label: t('solutionMockup.devisLine2'), price: "5'840.—" },
    { label: t('solutionMockup.devisLine3'), price: "2'420.—" },
  ];
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="file-text" title={t('solutionMockup.devisNumber')} />
      <View style={styles.card}>
        {lines.map((l) => (
          <View key={l.label} style={styles.lineRow}>
            <Text style={styles.lineLabel} numberOfLines={1}>{l.label}</Text>
            <Text style={styles.linePrice}>{l.price}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.lineRow}>
          <Text style={styles.totalLabel}>{t('solutionMockup.devisTotal')}</Text>
          <Text style={styles.totalPrice}>{"11'410.—"}</Text>
        </View>
      </View>
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: colors.successSoft }]}>
          <Feather name="check-circle" size={10} color={colors.success} />
          <Text style={[styles.pillText, { color: colors.success }]}>{t('solutionMockup.devisAccepted')}</Text>
        </View>
      </View>
    </View>
  );
}

function FacturationContent() {
  const { t } = useTranslation();
  const rows = [
    { name: t('solutionMockup.facturationRow1Name'), amount: "8'200.—", status: t('solutionMockup.facturationRow1Status'), color: colors.success, bg: colors.successSoft },
    { name: t('solutionMockup.facturationRow2Name'), amount: "4'950.—", status: t('solutionMockup.facturationRow2Status'), color: colors.primary, bg: colors.primarySoft },
    { name: t('solutionMockup.facturationRow3Name'), amount: "2'100.—", status: t('solutionMockup.facturationRow3Status'), color: colors.danger, bg: colors.dangerSoft },
  ];
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="credit-card" title={t('solutionMockup.facturationTitle')} />
      <View style={styles.card}>
        {rows.map((r) => (
          <View key={r.name} style={styles.invoiceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineLabel} numberOfLines={1}>{r.name}</Text>
              <Text style={styles.invoiceAmount}>{r.amount}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: r.bg }]}>
              <Text style={[styles.pillText, { color: r.color }]}>{r.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function RapportsContent() {
  const { t } = useTranslation();
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="camera" title={t('solutionMockup.rapportsTitle')} />
      <View style={styles.photoGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.photoTile}>
            <Feather name="image" size={16} color={colors.primary} style={{ opacity: 0.5 }} />
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <View style={styles.lineRow}>
          <Feather name="map-pin" size={11} color={colors.textMuted} />
          <Text style={styles.metaText}>{t('solutionMockup.rapportsMeta')}</Text>
        </View>
      </View>
    </View>
  );
}

function DicteeContent() {
  const { t } = useTranslation();
  const bars = [4, 9, 14, 8, 18, 11, 16, 6, 12, 9, 15, 5];
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="mic" title={t('solutionMockup.dicteeTitle')} />
      <View style={styles.waveRow}>
        {bars.map((h, i) => (
          <View key={i} style={[styles.waveBar, { height: h, opacity: i % 3 === 0 ? 1 : 0.55 }]} />
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.transcript}>
          {t('solutionMockup.dicteeTranscript')}
        </Text>
      </View>
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>
          <Feather name="check" size={10} color={colors.primaryDark} />
          <Text style={[styles.pillText, { color: colors.primaryDark }]}>{t('solutionMockup.dicteeGenerated')}</Text>
        </View>
      </View>
    </View>
  );
}

function PlanningContent() {
  const { t } = useTranslation();
  const days = [
    t('solutionMockup.planningDayMon'),
    t('solutionMockup.planningDayTue'),
    t('solutionMockup.planningDayWed'),
    t('solutionMockup.planningDayThu'),
    t('solutionMockup.planningDayFri'),
  ];
  const blocks: Record<number, { color: string; span: number }[]> = {
    0: [{ color: colors.primary, span: 2 }],
    1: [{ color: colors.primary, span: 2 }, { color: colors.accent, span: 1 }],
    2: [{ color: colors.accent, span: 3 }],
    3: [{ color: colors.accent, span: 3 }],
    4: [{ color: colors.success, span: 1 }],
  };
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="calendar" title={t('solutionMockup.planningTitle')} />
      <View style={styles.planningRow}>
        {days.map((d, i) => (
          <View key={i} style={styles.planningCol}>
            <Text style={styles.planningDay}>{d}</Text>
            <View style={styles.planningTrack}>
              {(blocks[i] ?? []).map((b, j) => (
                <View key={j} style={[styles.planningBlock, { backgroundColor: b.color, height: 14 * b.span }]} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function RentabiliteContent() {
  const { t } = useTranslation();
  const bars = [
    { label: t('solutionMockup.rentabiliteDevise'), h: 40, color: colors.border },
    { label: t('solutionMockup.rentabiliteReel'), h: 30, color: colors.primary },
  ];
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="trending-up" title={t('solutionMockup.rentabiliteTitle')} />
      <View style={styles.card}>
        <View style={styles.chartRow}>
          {bars.map((b) => (
            <View key={b.label} style={styles.chartCol}>
              <View style={[styles.chartBar, { height: b.h, backgroundColor: b.color }]} />
              <Text style={styles.chartLabel}>{b.label}</Text>
            </View>
          ))}
          <View style={styles.marginBadge}>
            <Feather name="arrow-up-right" size={11} color={colors.success} />
            <Text style={styles.marginText}>{t('solutionMockup.rentabiliteMargin')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function RhContent() {
  const { t } = useTranslation();
  const rows = [
    { name: 'S. Keller', hours: '38h', color: colors.success, bg: colors.successSoft },
    { name: 'M. Oliveira', hours: '41.5h', color: colors.primary, bg: colors.primarySoft },
  ];
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="clock" title={t('solutionMockup.rhTitle')} />
      <View style={styles.card}>
        {rows.map((r) => (
          <View key={r.name} style={styles.invoiceRow}>
            <Text style={styles.lineLabel}>{r.name}</Text>
            <View style={[styles.pill, { backgroundColor: r.bg }]}>
              <Text style={[styles.pillText, { color: r.color }]}>{r.hours} {t('solutionMockup.rhThisWeek')}</Text>
            </View>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.lineRow}>
          <Text style={styles.totalLabel}>{t('solutionMockup.rhNetSalary')}</Text>
          <Text style={styles.totalPrice}>{"5'240.—"}</Text>
        </View>
      </View>
    </View>
  );
}

function TravauxSupContent() {
  const { t } = useTranslation();
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="plus-circle" title={t('solutionMockup.travauxSupTitle')} />
      <View style={styles.card}>
        <View style={styles.lineRow}>
          <Text style={styles.lineLabel} numberOfLines={1}>{t('solutionMockup.travauxSupInitial')}</Text>
          <Text style={styles.linePrice}>{"11'410.—"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.lineRow}>
          <Text style={styles.extraLabel} numberOfLines={1}>{t('solutionMockup.travauxSupExtra')}</Text>
          <Text style={styles.extraPrice}>{"1'240.—"}</Text>
        </View>
      </View>
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.pillText, { color: colors.primaryDark }]}>TS-2026-004</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.successSoft }]}>
          <Feather name="check-circle" size={10} color={colors.success} />
          <Text style={[styles.pillText, { color: colors.success }]}>{t('solutionMockup.travauxSupSigned')}</Text>
        </View>
      </View>
    </View>
  );
}

function TresorerieContent() {
  const { t } = useTranslation();
  const rows: { label: string; date: string; amount: string; color: string }[] = [
    { label: t('solutionMockup.tresorerieRow1Label'), date: t('solutionMockup.tresorerieRow1Date'), amount: "+ 8'200.—", color: colors.success },
    { label: t('solutionMockup.tresorerieRow2Label'), date: t('solutionMockup.tresorerieRow2Date'), amount: "− 14'600.—", color: colors.danger },
    { label: t('solutionMockup.tresorerieRow3Label'), date: t('solutionMockup.tresorerieRow3Date'), amount: "− 890.—", color: colors.danger },
  ];
  return (
    <View style={styles.stack}>
      <ScreenHeader icon="trending-up" title={t('solutionMockup.tresorerieTitle')} />
      <View style={styles.card}>
        <View style={styles.lineRow}>
          <Text style={styles.totalLabel}>{t('solutionMockup.tresorerieBalance')}</Text>
          <Text style={styles.totalPrice}>{"24'300.—"}</Text>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.invoiceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineLabel} numberOfLines={1}>{r.label}</Text>
              <Text style={styles.invoiceAmount}>{r.date}</Text>
            </View>
            <Text style={[styles.linePrice, { color: r.color, fontWeight: '700' }]}>{r.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#231A12',
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  } as unknown as ViewStyle,
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  addressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  addressText: {
    fontFamily: marketingFonts.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  screen: {
    padding: spacing.lg,
    minHeight: 260,
    backgroundColor: colors.bg,
  },
  stack: { gap: spacing.sm },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  screenHeaderIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeaderTitle: {
    fontFamily: marketingFonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lineLabel: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  linePrice: {
    fontFamily: marketingFonts.body,
    fontSize: 11,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontFamily: marketingFonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  totalPrice: {
    fontFamily: marketingFonts.body,
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    fontVariant: ['tabular-nums'],
  },
  extraLabel: {
    flex: 1,
    fontFamily: marketingFonts.body,
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  extraPrice: {
    fontFamily: marketingFonts.body,
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    fontWeight: '700',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  photoTile: {
    width: '48%',
    aspectRatio: 1.4,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  } as unknown as ViewStyle,
  metaText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  invoiceAmount: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 22,
    paddingHorizontal: 2,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  transcript: {
    fontFamily: marketingFonts.body,
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 16,
  },
  planningRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  planningCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  planningDay: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  planningTrack: {
    width: '100%',
    gap: 3,
  },
  planningBlock: {
    width: '100%',
    borderRadius: 4,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  chartCol: {
    alignItems: 'center',
    gap: 4,
  },
  chartBar: {
    width: 26,
    borderRadius: 4,
  },
  chartLabel: {
    fontFamily: marketingFonts.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  marginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginLeft: 'auto',
    marginBottom: 8,
  } as unknown as ViewStyle,
  marginText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
});
