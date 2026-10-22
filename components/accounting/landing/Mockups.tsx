import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useSiteCopy } from '../../../lib/accounting/siteCopy';
import { monoType } from '../../../lib/marketingTheme';
import { colors, spacing } from '../../../lib/theme';
import { BrandMark } from '../../brand/Logo';
import { useIsWide } from '../../partners/PartnersChrome';

// Product mockups of the accounting.cantia.ch landing, drawn after the real
// workspace screens (components/accounting/*) with example data from
// lib/accounting/siteCopy.ts. Decorative: hidden from screen readers, the
// same facts are written out next to each one.

const INK = '#16120E';
const LINE = '#EDE3D3';
const SOFT = '#FBF7F0';
const num: TextStyle = { ...monoType, fontVariant: ['tabular-nums'] };

// ------------------------------------------------------------ frames

// interactive: the content is usable (tabs, buttons), so it stays visible to screen readers.
export function Window({ url, children, maxWidth = 640, interactive = false }: { url: string; children: ReactNode; maxWidth?: number; interactive?: boolean }) {
  return (
    <View style={[f.window, { maxWidth }]} aria-hidden={!interactive}>
      <View style={f.bar}>
        <View style={f.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={f.dot} />
          ))}
        </View>
        <View style={f.url}>
          <Feather name="lock" size={9} color={colors.textMuted} />
          <Text style={f.urlText} numberOfLines={1}>
            {url}
          </Text>
        </View>
        <View style={{ width: 42 }} />
      </View>
      {children}
    </View>
  );
}

export function Phone({ children }: { children: ReactNode }) {
  return (
    <View style={f.phone} aria-hidden>
      <View style={f.phoneNotch} />
      <View style={f.phoneScreen}>{children}</View>
    </View>
  );
}

function ExampleTag() {
  const { s } = useSiteCopy();
  return (
    <View style={f.example}>
      <Text style={f.exampleText}>{s.shell.example}</Text>
    </View>
  );
}

// Client file header + tabs, as in the workspace (Comptabilité selected).
function ClientHeader({ sub }: { sub?: string[] }) {
  const { s } = useSiteCopy();
  const roomy = useIsWide(600);
  return (
    <View style={f.clientHead}>
      <View style={f.clientTitleRow}>
        <Text style={f.clientName} numberOfLines={1}>
          {s.shell.client}
        </Text>
        <ExampleTag />
      </View>
      <Text style={f.clientMeta} numberOfLines={1}>
        {s.shell.clientMeta}
      </Text>
      <View style={f.tabs}>
        {s.shell.tabs.slice(0, roomy ? 5 : 3).map((t, i) => (
          <Text key={t} style={[f.tab, i === 1 && f.tabOn]} numberOfLines={1}>
            {t}
          </Text>
        ))}
      </View>
      {sub ? (
        <View style={f.subTabs}>
          {sub.map((t, i) => (
            <Text key={t} style={[f.subTab, i === 0 && f.subTabOn]} numberOfLines={1}>
              {t}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ------------------------------------------------------------ hero: overview

const TODO_ICON = {
  answered: ['corner-down-left', colors.primary],
  soon: ['clock', colors.warning],
  late: ['alert-circle', colors.danger],
  done: ['check-circle', colors.success],
} as const;

export function OverviewMock({ wide }: { wide: boolean }) {
  const { s } = useSiteCopy();
  const o = s.overview;
  return (
    <View style={[f.window, f.heroWindow]} aria-hidden>
      <View style={f.bar}>
        <View style={f.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={f.dot} />
          ))}
        </View>
        <View style={f.url}>
          <Feather name="lock" size={9} color={colors.textMuted} />
          <Text style={f.urlText}>accounting.cantia.ch/espace</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {wide ? (
          <View style={f.side}>
            <View style={f.sideBrand}>
              <BrandMark size={18} />
              <Text style={f.sideBrandText}>ACCOUNTING</Text>
            </View>
            <View style={f.firm}>
              <View style={f.firmAvatar}>
                <Text style={f.firmAvatarText}>R</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={f.firmName} numberOfLines={1}>
                  {s.shell.firm}
                </Text>
                <Text style={f.firmUser} numberOfLines={1}>
                  {s.shell.user}
                </Text>
              </View>
            </View>
            {s.shell.nav.map((label, i) => (
              <View key={label} style={[f.sideItem, i === 0 && f.sideItemOn]}>
                <Feather name={SIDE_ICONS[i]} size={13} color={i === 0 ? colors.primary : colors.textMuted} />
                <Text style={[f.sideText, i === 0 && f.sideTextOn]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={[f.main, !wide && { padding: spacing.lg }]}>
          <View style={f.helloRow}>
            <View style={{ flex: 1 }}>
              <Text style={f.hello}>{o.hello}</Text>
              <Text style={f.date}>{o.date}</Text>
            </View>
            <ExampleTag />
          </View>
          <View style={[f.kpis, !wide && { flexWrap: 'wrap' }]}>
            {o.kpis.map(([label, value], i) => (
              <View key={label} style={[f.kpi, !wide && { flexBasis: '46%' }]}>
                <Text style={[f.kpiValue, i === 1 && { color: colors.primary }]}>{value}</Text>
                <Text style={f.kpiLabel} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View style={[{ gap: spacing.lg }, wide && { flexDirection: 'row' }]}>
            <View style={[f.panel, wide && { flex: 1.35 }]}>
              <Text style={f.panelTitle}>{o.todoTitle}</Text>
              {o.todo.map(([client, what, kind]) => (
                <View key={client} style={f.todoRow}>
                  <Feather name={TODO_ICON[kind][0]} size={14} color={TODO_ICON[kind][1]} style={{ marginTop: 2 }} />
                  <Text style={f.todoText} numberOfLines={2}>
                    <Text style={{ fontWeight: '700' }}>{client}</Text> {what}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[f.panel, wide && { flex: 1 }]}>
              <Text style={f.panelTitle}>{o.deadlinesTitle}</Text>
              {o.deadlines.map(([date, what, who]) => (
                <View key={what} style={f.deadlineRow}>
                  <View style={f.dateChip}>
                    <Text style={f.dateChipText}>{date}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={f.deadlineWhat} numberOfLines={1}>
                      {what}
                    </Text>
                    <Text style={f.deadlineWho} numberOfLines={1}>
                      {who}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const SIDE_ICONS: (keyof typeof Feather.glyphMap)[] = ['home', 'briefcase', 'check-square', 'inbox', 'calendar', 'edit-3', 'clock', 'file-text', 'users'];

// ------------------------------------------------------------ 01 entry

export function EntryMock() {
  const m = useSiteCopy().s.mocks.entry;
  const roomy = useIsWide(600);
  return (
    <Window url="accounting.cantia.ch/mandant">
      <ClientHeader />
      <View style={f.body}>
        <View style={f.formCard}>
          <Text style={f.cardTitle}>{m.title}</Text>
          {roomy ? (
            <View style={f.fieldRow}>
              {m.fields.map(([label, value], i) => (
                <Field key={label} label={label} value={value} grow={i === 2 ? 2.4 : 1} />
              ))}
            </View>
          ) : (
            <>
              <View style={f.fieldRow}>
                {m.fields.slice(0, 2).map(([label, value]) => (
                  <Field key={label} label={label} value={value} grow={1} />
                ))}
              </View>
              <Field label={m.fields[2][0]} value={m.fields[2][1]} grow={1} />
            </>
          )}
          <View style={f.fieldRow}>
            <Field label={m.debit[0]} value={m.debit[1]} grow={1} />
            <Field label={m.credit[0]} value={m.credit[1]} grow={1} />
          </View>
          <View style={f.fieldRow}>
            <Field label={m.amount[0]} value={m.amount[1]} grow={1} mono focus />
            <Field label={m.vat[0]} value={m.vat[1]} grow={1} />
          </View>
          <View style={f.split}>
            <Text style={f.splitTitle}>{m.splitTitle}</Text>
            {m.split.map(([acc, label, d, c]) => (
              <View key={acc} style={f.splitRow}>
                <Text style={[f.splitAcc, num]}>{acc}</Text>
                <Text style={f.splitLabel} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={[f.splitAmt, num]}>{d}</Text>
                <Text style={[f.splitAmt, num]}>{c}</Text>
              </View>
            ))}
          </View>
          <View style={f.primaryBtn}>
            <Feather name="corner-down-left" size={12} color="#FFFFFF" />
            <Text style={f.primaryBtnText}>{m.save}</Text>
          </View>
        </View>
        <View style={f.importLine}>
          <Feather name="upload" size={12} color={colors.success} />
          <Text style={f.importText}>{m.importLine}</Text>
        </View>
      </View>
    </Window>
  );
}

function Field({ label, value, grow, mono = false, focus = false }: { label: string; value: string; grow: number; mono?: boolean; focus?: boolean }) {
  return (
    <View style={{ flexGrow: grow, flexBasis: 0, minWidth: 0, gap: 3 }}>
      <Text style={f.fieldLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={[f.input, focus && f.inputFocus]}>
        <Text style={[f.inputText, mono && num]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------------ 02 reports

export function ReportsMock() {
  const m = useSiteCopy().s.mocks.reports;
  return (
    <Window url="accounting.cantia.ch/mandant">
      <ClientHeader />
      <View style={f.body}>
        <View style={f.segment}>
          {m.views.map((v, i) => (
            <Text key={v} style={[f.segmentItem, i === 4 && f.segmentOn]} numberOfLines={1}>
              {v}
            </Text>
          ))}
        </View>
        <View style={f.tableCard}>
          <View style={[f.tRow, f.tHead]}>
            <Text style={[f.tLabel, f.tHeadText]}>{m.title}</Text>
            {m.cols.slice(1).map((c) => (
              <Text key={c} style={[f.tNum, f.tHeadText, num]}>
                {c}
              </Text>
            ))}
          </View>
          {m.rows.map(([label, a, b, kind]) => (
            <View key={label} style={[f.tRow, kind === 'sub' && f.tSub, kind === 'total' && f.tTotal]}>
              <Text style={[f.tLabel, kind !== '' && { fontWeight: '700' }]} numberOfLines={1}>
                {label}
              </Text>
              <Text style={[f.tNum, num, kind !== '' && { fontWeight: '700' }]}>{a}</Text>
              <Text style={[f.tNum, num, f.tPrev]}>{b}</Text>
            </View>
          ))}
        </View>
        <View style={f.kpiStrip}>
          {m.kpis.map(([label, value]) => (
            <View key={label} style={f.kpiSmall}>
              <Text style={[f.kpiSmallValue, num]}>{value}</Text>
              <Text style={f.kpiSmallLabel} numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Window>
  );
}

// ------------------------------------------------------------ 03 VAT

const Q_TONE = {
  done: [colors.successSoft, colors.success],
  todo: [colors.warningSoft, colors.warning],
  idle: [SOFT, colors.textMuted],
} as const;

export function VatMock() {
  const m = useSiteCopy().s.mocks.vat;
  return (
    <Window url="accounting.cantia.ch/mandant">
      <ClientHeader />
      <View style={f.body}>
        <View style={f.quarters}>
          {m.quarters.map(([q, label, tone]) => (
            <View key={q} style={[f.quarter, tone === 'todo' && f.quarterOn]}>
              <Text style={f.quarterName}>{q}</Text>
              <View style={[f.pill, { backgroundColor: Q_TONE[tone][0] }]}>
                <Text style={[f.pillText, { color: Q_TONE[tone][1] }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={f.tableCard}>
          <View style={[f.tRow, f.tHead]}>
            <Text style={[f.vFig, f.tHeadText]}>{m.cols[0]}</Text>
            <Text style={[f.tLabel, f.tHeadText]}>{m.title}</Text>
            <Text style={[f.tNum, f.tHeadText]}>{m.cols[2]}</Text>
          </View>
          {m.rows.map(([fig, label, value]) => (
            <View key={fig} style={f.tRow}>
              <Text style={[f.vFig, num]}>{fig}</Text>
              <Text style={f.tLabel} numberOfLines={1}>
                {label}
              </Text>
              <Text style={[f.tNum, num]}>{value}</Text>
            </View>
          ))}
          <View style={[f.tRow, f.tTotal]}>
            <Text style={[f.vFig, num, { fontWeight: '800' }]}>{m.total[0]}</Text>
            <Text style={[f.tLabel, { fontWeight: '800' }]} numberOfLines={1}>
              {m.total[1]}
            </Text>
            <Text style={[f.tNum, num, { fontWeight: '800' }]}>{m.total[2]}</Text>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          {m.checks.map((c) => (
            <View key={c} style={f.check}>
              <Feather name="check-circle" size={13} color={colors.success} />
              <Text style={f.checkText} numberOfLines={1}>
                {c}
              </Text>
            </View>
          ))}
        </View>
        <View style={f.actions}>
          <Text style={f.due}>{m.due}</Text>
          <View style={{ flex: 1 }} />
          <View style={f.ghostBtn}>
            <Feather name="download" size={12} color={colors.text} />
            <Text style={f.ghostBtnText}>{m.xml}</Text>
          </View>
          <View style={f.primaryBtn}>
            <Feather name="send" size={12} color="#FFFFFF" />
            <Text style={f.primaryBtnText}>{m.file}</Text>
          </View>
        </View>
      </View>
    </Window>
  );
}

// ------------------------------------------------------------ 04 closing

export function ClosingMock() {
  const m = useSiteCopy().s.mocks.closing;
  return (
    <Window url="accounting.cantia.ch/mandant">
      <ClientHeader />
      <View style={f.body}>
        <View style={f.yearHead}>
          <View style={{ flex: 1 }}>
            <Text style={f.cardTitle}>{m.title}</Text>
            <Text style={f.muted}>{m.entries}</Text>
          </View>
          <View style={[f.pill, { backgroundColor: colors.warningSoft }]}>
            <Text style={[f.pillText, { color: colors.warning }]}>{m.status}</Text>
          </View>
        </View>
        <View style={f.tableCard}>
          <Text style={[f.checksTitle, { paddingHorizontal: 12, paddingVertical: 9 }]}>{m.checksTitle}</Text>
          {m.checks.map((c) => (
            <View key={c} style={[f.check, f.checkRow]}>
              <Feather name="check-circle" size={13} color={colors.success} />
              <Text style={f.checkText} numberOfLines={1}>
                {c}
              </Text>
            </View>
          ))}
        </View>
        <View style={f.resultCard}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={f.resultLabel}>{m.result[0]}</Text>
            <Text style={[f.resultValue, num]}>{m.result[1]}</Text>
          </View>
          <View style={{ gap: 4 }}>
            {m.moves.map(([date, move]) => (
              <View key={move} style={f.moveRow}>
                <Text style={[f.moveDate, num]}>{date}</Text>
                <Text style={f.moveText}>{move}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={f.actions}>
          <View style={f.ghostBtn}>
            <Feather name="file-text" size={12} color={colors.text} />
            <Text style={f.ghostBtnText}>{m.pdf}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={f.primaryBtn}>
            <Feather name="lock" size={12} color="#FFFFFF" />
            <Text style={f.primaryBtnText}>{m.close}</Text>
          </View>
        </View>
      </View>
    </Window>
  );
}

// ------------------------------------------------------------ 05 client link

export function PortalMock() {
  const m = useSiteCopy().s.mocks.portal;
  return (
    <Phone>
      <View style={f.pHead}>
        <View style={f.pLogo}>
          <Text style={f.pLogoText}>R</Text>
        </View>
        <Text style={f.pFirm} numberOfLines={1}>
          {m.firm}
        </Text>
      </View>
      <View style={{ padding: 14, gap: 12 }}>
        <Text style={f.pHello}>{m.hello}</Text>
        <Text style={f.pSection}>{m.requestsTitle}</Text>
        {m.requests.map(([title, when, state]) => (
          <View key={title} style={f.pCard}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Feather name={state === 'sent' ? 'check-circle' : 'file-plus'} size={14} color={state === 'sent' ? colors.success : colors.primary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={f.pCardTitle}>{title}</Text>
                <Text style={[f.pCardMeta, state === 'open' && { color: colors.warning }]}>{when}</Text>
              </View>
            </View>
            {state === 'open' ? (
              <View style={f.pUpload}>
                <Feather name="upload" size={12} color="#FFFFFF" />
                <Text style={f.pUploadText}>{m.upload}</Text>
              </View>
            ) : null}
          </View>
        ))}
        <Text style={f.pSection}>{m.signTitle}</Text>
        <View style={f.pCard}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Feather name="file-text" size={14} color={colors.text} />
            <Text style={f.pCardTitle}>{m.signDoc}</Text>
          </View>
          <View style={f.pad}>
            <Text style={f.padHint}>{m.signHint}</Text>
            <SignatureStroke />
          </View>
          <View style={[f.pUpload, { backgroundColor: INK }]}>
            <Feather name="pen-tool" size={12} color="#FFFFFF" />
            <Text style={f.pUploadText}>{m.sign}</Text>
          </View>
          <Text style={f.pProof}>{m.proof}</Text>
        </View>
      </View>
    </Phone>
  );
}

// A drawn signature in the pad.
function SignatureStroke() {
  return (
    <Svg width={170} height={56} viewBox="0 0 170 56" style={{ position: 'absolute', left: 16, top: 6 }}>
      <Path
        d="M6 40 C 14 12, 26 8, 22 30 C 19 46, 30 44, 38 30 C 44 20, 48 22, 46 34 C 45 42, 52 40, 58 30 C 64 20, 70 22, 68 32 C 66 42, 76 38, 84 26 C 90 17, 96 20, 92 32 C 89 41, 100 38, 110 28 C 120 18, 128 22, 124 30 M 70 46 C 96 40, 130 38, 162 34"
        stroke="#2A3D66"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ------------------------------------------------------------ 06 firm

const D_TONE = {
  soon: colors.warning,
  idle: colors.textMuted,
  done: colors.success,
} as const;

export function FirmMock() {
  const m = useSiteCopy().s.mocks.firm;
  const roomy = useIsWide(600);
  return (
    <Window url="accounting.cantia.ch/travaux">
      <View style={[f.body, { paddingTop: spacing.lg }]}>
        <View style={f.tableCard}>
          <View style={[f.tRow, f.tHead]}>
            <Text style={[f.tLabel, f.tHeadText]}>{m.workTitle}</Text>
            {roomy ? (
              <Text style={[f.wWho, f.tHeadText]} numberOfLines={1}>
                {m.cols[1]}
              </Text>
            ) : null}
            <Text style={[f.wBarCol, f.tHeadText]}>{m.cols[2]}</Text>
          </View>
          {m.work.map(([client, who, done, total]) => (
            <View key={client} style={f.tRow}>
              <Text style={f.tLabel} numberOfLines={1}>
                {client}
              </Text>
              {roomy ? (
                <View style={f.wWho}>
                  <View style={f.avatar}>
                    <Text style={f.avatarText}>{who}</Text>
                  </View>
                </View>
              ) : null}
              <View style={[f.wBarCol, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <View style={f.track}>
                  <View style={[f.fill, { width: `${(done / total) * 100}%` }, done === total && { backgroundColor: colors.success }]} />
                </View>
                <Text style={[f.wCount, num]}>
                  {done}/{total}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={[f.firmRow, !roomy && { flexDirection: 'column' }]}>
          <View style={[f.tableCard, roomy && { flex: 1 }, { padding: spacing.md, gap: 8 }]}>
            <Text style={f.checksTitle}>{m.timeTitle}</Text>
            {m.time.map(([label, value], i) => (
              <View key={label} style={f.timeRow}>
                <Text style={f.muted}>{label}</Text>
                <Text style={[f.timeValue, num, i === 2 && { color: colors.primary }]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={[f.tableCard, roomy && { flex: 1.25 }, { padding: spacing.md, gap: 8 }]}>
            <Text style={f.checksTitle}>{m.deadlinesTitle}</Text>
            {m.deadlines.map(([date, what, who, tone]) => (
              <View key={what} style={f.timeRow}>
                <Text style={[f.dDate, num, { color: D_TONE[tone] }]}>{date}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={f.dWhat} numberOfLines={1}>
                    {what}
                  </Text>
                  <Text style={f.muted} numberOfLines={1}>
                    {who}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Window>
  );
}

// ------------------------------------------------------------ styles

const f = StyleSheet.create({
  window: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E3D6C1',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#2B211A',
    shadowOpacity: 0.12,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 24 },
  },
  heroWindow: { maxWidth: 1120, borderRadius: 12 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    backgroundColor: SOFT,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  dots: { flexDirection: 'row', gap: 6, width: 42 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#E2D5C2' },
  url: {
    flex: 1,
    maxWidth: 360,
    alignSelf: 'center',
    marginHorizontal: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: LINE,
  },
  urlText: { fontSize: 11, color: colors.textMuted },
  example: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: SOFT,
  },
  exampleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  side: {
    width: 214,
    backgroundColor: SOFT,
    borderRightWidth: 1,
    borderRightColor: LINE,
    padding: 14,
    gap: 3,
  },
  sideBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sideBrandText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.primary,
  },
  firm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  firmAvatar: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firmAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  firmName: { fontSize: 12, fontWeight: '700', color: colors.text },
  firmUser: { fontSize: 11, color: colors.textMuted },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  sideItemOn: { backgroundColor: colors.primarySoft },
  sideText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
  sideTextOn: { color: colors.primary, fontWeight: '700' },

  main: {
    flex: 1,
    minWidth: 0,
    padding: 26,
    gap: 18,
    backgroundColor: '#FFFDF9',
  },
  helloRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  hello: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  date: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  kpis: { flexDirection: 'row', gap: 10 },
  kpi: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 12,
    gap: 2,
  },
  kpiValue: {
    ...monoType,
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  kpiLabel: { fontSize: 11.5, color: colors.textMuted },
  panel: {
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 14,
    gap: 4,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  todoRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  todoText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.text },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  dateChip: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: SOFT,
  },
  dateChipText: { ...monoType, fontSize: 11, color: colors.text },
  deadlineWhat: { fontSize: 12.5, fontWeight: '700', color: colors.text },
  deadlineWho: { fontSize: 11.5, color: colors.textMuted },

  clientHead: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    backgroundColor: '#FFFDF9',
  },
  clientTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clientName: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  clientMeta: { fontSize: 11, color: colors.textMuted },
  tabs: { flexDirection: 'row', gap: 14, marginTop: 10, overflow: 'hidden' },
  tab: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
    paddingBottom: 8,
  },
  tabOn: {
    color: colors.text,
    fontWeight: '800',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  subTabs: { flexDirection: 'row', gap: 4, paddingBottom: 10 },
  subTab: {
    fontSize: 11,
    color: colors.textMuted,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  subTabOn: {
    color: colors.text,
    fontWeight: '700',
    backgroundColor: SOFT,
    borderRadius: 4,
  },

  body: { padding: 18, gap: 12, backgroundColor: '#FFFDF9' },
  formCard: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  muted: { fontSize: 11.5, color: colors.textMuted },
  fieldRow: { flexDirection: 'row', gap: 8 },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  inputFocus: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1.5,
  },
  inputText: { fontSize: 12, color: colors.text },
  split: { backgroundColor: SOFT, borderRadius: 5, padding: 10, gap: 2 },
  splitTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  splitAcc: {
    width: 36,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  splitLabel: { flex: 1, fontSize: 11.5, color: colors.text },
  splitAmt: { width: 76, textAlign: 'right', fontSize: 11, color: colors.text },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  primaryBtnText: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  ghostBtnText: { fontSize: 11.5, fontWeight: '700', color: colors.text },
  importLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CFE2D6',
    backgroundColor: colors.successSoft,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  importText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.success,
    fontWeight: '600',
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: SOFT,
    borderRadius: 5,
    padding: 3,
    gap: 2,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  },
  segmentItem: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 4,
  },
  segmentOn: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontWeight: '800',
  },
  tableCard: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  tRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  tHead: { borderTopWidth: 0, backgroundColor: SOFT },
  tHeadText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tLabel: { flex: 1, fontSize: 12, color: colors.text },
  tNum: { width: 82, textAlign: 'right', fontSize: 11.5, color: colors.text },
  tPrev: { color: colors.textMuted },
  tSub: { backgroundColor: '#FDFAF4' },
  tTotal: { borderTopWidth: 1.5, borderTopColor: INK, backgroundColor: SOFT },
  kpiStrip: { flexDirection: 'row', gap: 8 },
  kpiSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    padding: 10,
    backgroundColor: colors.surface,
    gap: 1,
  },
  kpiSmallValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  kpiSmallLabel: { fontSize: 10.5, color: colors.textMuted },

  quarters: { flexDirection: 'row', gap: 6 },
  quarter: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    padding: 8,
    gap: 5,
    backgroundColor: colors.surface,
  },
  quarterOn: { borderColor: colors.primary, backgroundColor: '#FFF8F2' },
  quarterName: { fontSize: 12, fontWeight: '800', color: colors.text },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillText: { fontSize: 10, fontWeight: '700' },
  vFig: { width: 34, fontSize: 11, fontWeight: '700', color: colors.text },
  check: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  checkText: { flex: 1, fontSize: 11.5, color: colors.text },
  checksTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  due: { fontSize: 11.5, fontWeight: '700', color: colors.warning },

  yearHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: INK,
    borderRadius: 6,
    padding: 14,
  },
  resultLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D9B79A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: { fontSize: 19, fontWeight: '600', color: '#FFFFFF' },
  moveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moveDate: { fontSize: 10.5, color: '#BFAF9E' },
  moveText: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' },

  phone: {
    width: 290,
    alignSelf: 'center',
    borderRadius: 38,
    backgroundColor: INK,
    padding: 10,
    shadowColor: '#2B211A',
    shadowOpacity: 0.22,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
  },
  phoneNotch: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    left: 115,
    width: 60,
    height: 16,
    borderRadius: 8,
    backgroundColor: INK,
    zIndex: 2,
  },
  phoneScreen: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFDF9',
    paddingTop: 30,
  },
  pHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  pLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#2A3D66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pLogoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  pFirm: { flex: 1, fontSize: 12.5, fontWeight: '800', color: colors.text },
  pHello: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  pSection: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pCard: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    padding: 10,
    gap: 9,
    backgroundColor: colors.surface,
  },
  pCardTitle: { fontSize: 12, fontWeight: '700', color: colors.text },
  pCardMeta: { fontSize: 10.5, color: colors.textMuted, fontWeight: '600' },
  pUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2A3D66',
    borderRadius: 6,
    paddingVertical: 8,
  },
  pUploadText: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' },
  pad: {
    height: 70,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D9CBB5',
    borderRadius: 6,
    backgroundColor: SOFT,
  },
  padHint: {
    position: 'absolute',
    bottom: 5,
    right: 8,
    fontSize: 9.5,
    color: colors.textMuted,
  },
  pProof: { fontSize: 9.5, lineHeight: 13, color: colors.textMuted },

  firmRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  wWho: { width: 104, alignItems: 'flex-start' },
  wBarCol: { width: 120 },
  wCount: { fontSize: 10.5, color: colors.textMuted, width: 26 },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 9, fontWeight: '800', color: colors.primary },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1E8DA',
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
  },
  timeValue: { fontSize: 12, fontWeight: '600', color: colors.text },
  dDate: { width: 40, fontSize: 11, fontWeight: '600' },
  dWhat: { fontSize: 12, fontWeight: '700', color: colors.text },
});
