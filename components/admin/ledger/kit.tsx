import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { proofStatus, PROOFS, type LedgerEntry } from '../../../lib/admin/ledgerCalc';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { displayType, monoType } from '../../../lib/marketingTheme';

// Shared pieces of Admin › Comptabilité (page, dialogs, tabs).

export const MONTHS_SHORT = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
export const MONTHS_LONG = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export const PAYMENT_METHODS: { key: string; label: string }[] = [
  { key: 'banque', label: 'Virement' },
  { key: 'carte', label: 'Carte' },
  { key: 'twint', label: 'TWINT' },
  { key: 'especes', label: 'Espèces' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'autre', label: 'Autre' },
];
export const VAT_RATES = [0, 8.1, 2.6, 3.8];

export const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  ventes: 'shopping-bag',
  prestations: 'briefcase',
  commissions: 'percent',
  autres_produits: 'plus-circle',
  logiciels: 'cloud',
  marketing: 'trending-up',
  materiel: 'monitor',
  telecom: 'smartphone',
  deplacements: 'navigation',
  repas: 'coffee',
  bureau: 'home',
  assurances: 'shield',
  formation: 'book-open',
  honoraires: 'file-text',
  sous_traitance: 'users',
  frais_financiers: 'credit-card',
  remboursements: 'rotate-ccw',
  taxes: 'flag',
  autres_charges: 'more-horizontal',
};

export function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}
export const swiss = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const parseAmount = (t: string) => Number(t.replace(/[’'\s]/g, '').replace(',', '.'));

export function usePhone() {
  const { width } = useWindowDimensions();
  return { phone: width < 640, wide: width >= 1024, width };
}

export function Chip({ label, active, onPress, small, icon, tone }: { label: string; active: boolean; onPress: () => void; small?: boolean; icon?: keyof typeof Feather.glyphMap; tone?: 'ok' | 'bad' }) {
  const on = tone === 'ok' ? { borderColor: colors.success, backgroundColor: colors.successSoft } : tone === 'bad' ? { borderColor: colors.danger, backgroundColor: colors.dangerSoft } : null;
  const onText = tone === 'ok' ? colors.success : tone === 'bad' ? colors.danger : colors.primaryDark;
  return (
    <Pressable onPress={onPress} style={[kit.chip, small && kit.chipSmall, active && (on ?? kit.chipOn)]}>
      {icon ? <Feather name={icon} size={small ? 12 : 13} color={active ? onText : colors.textMuted} /> : null}
      <Text style={[kit.chipText, small && { fontSize: 12.5 }, active && { color: onText }]}>{label}</Text>
    </Pressable>
  );
}

export function Btn({
  icon,
  label,
  onPress,
  variant = 'secondary',
  disabled,
  grow,
}: {
  icon?: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ok' | 'bad' | 'ghost';
  disabled?: boolean;
  grow?: boolean;
}) {
  const v = {
    primary: { bg: colors.primary, border: colors.primary, fg: '#fff' },
    secondary: { bg: colors.surface, border: colors.border, fg: colors.text },
    ok: { bg: colors.successSoft, border: colors.successSoft, fg: colors.success },
    bad: { bg: colors.dangerSoft, border: colors.dangerSoft, fg: colors.danger },
    ghost: { bg: 'transparent', border: 'transparent', fg: colors.primary },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [kit.btn, { backgroundColor: v.bg, borderColor: v.border }, grow && { flexGrow: 1, flexBasis: 0 }, pressed && { opacity: 0.85 }, disabled && { opacity: 0.45 }]}
    >
      {icon ? <Feather name={icon} size={15} color={v.fg} /> : null}
      <Text style={[kit.btnText, { color: v.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({ label, children, half, hint }: { label: string; children: React.ReactNode; half?: boolean; hint?: string }) {
  return (
    <View style={half ? { gap: 6, flexGrow: 1, flexBasis: 200, minWidth: 0 } : { gap: 6 }}>
      <Text style={kit.fieldLabel}>{label}</Text>
      {children}
      {hint ? <Text style={kit.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string; badge?: number }[]; onChange: (v: T) => void }) {
  return (
    <View style={kit.seg}>
      {options.map((o) => (
        <Pressable key={o.key} onPress={() => onChange(o.key)} style={[kit.segItem, value === o.key && kit.segOn]}>
          <Text style={[kit.segText, value === o.key && kit.segTextOn]} numberOfLines={1}>
            {o.label}
          </Text>
          {o.badge ? (
            <View style={kit.segBadge}>
              <Text style={kit.segBadgeText}>{o.badge}</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

// Dialog: centred card on wide screens, bottom sheet on phones.
export function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  const { phone } = usePhone();
  return (
    <Modal transparent animationType={phone ? 'slide' : 'fade'} visible onRequestClose={onClose}>
      <View style={[kit.backdrop, phone && kit.backdropPhone]}>
        <View style={[kit.sheet, phone && kit.sheetPhone]}>
          <View style={kit.sheetHead}>
            <Text style={kit.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={kit.close}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: spacing.lg, padding: phone ? spacing.lg : spacing.xl, paddingTop: spacing.md }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={[kit.sheetFoot, phone && { paddingHorizontal: spacing.lg }]}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

export function ProofBadge({ entry }: { entry: Pick<LedgerEntry, 'kind' | 'receipt_path' | 'source' | 'proof'> }) {
  const st = proofStatus(entry);
  if (st === 'na') return null;
  const p = PROOFS.find((x) => x.key === entry.proof);
  const conf = {
    file: { label: 'Pièce jointe', fg: colors.success, bg: colors.successSoft, icon: 'paperclip' as const },
    stripe: { label: 'Stripe', fg: colors.success, bg: colors.successSoft, icon: 'check' as const },
    declared: { label: p?.short ?? 'Justifié', fg: colors.slate, bg: colors.slateSoft, icon: 'check' as const },
    weak: { label: p?.short ?? 'Faible', fg: colors.warning, bg: colors.warningSoft, icon: 'alert-triangle' as const },
    missing: { label: 'À justifier', fg: colors.danger, bg: colors.dangerSoft, icon: 'alert-circle' as const },
  }[st];
  return (
    <View style={[kit.badge, { backgroundColor: conf.bg }]}>
      <Feather name={conf.icon} size={10} color={conf.fg} />
      <Text style={[kit.badgeText, { color: conf.fg }]} numberOfLines={1}>
        {conf.label}
      </Text>
    </View>
  );
}

export function CategoryIcon({ kind, category, size = 34 }: { kind: 'recette' | 'depense'; category: string; size?: number }) {
  return (
    <View style={[kit.catIcon, { width: size, height: size, backgroundColor: kind === 'recette' ? colors.successSoft : colors.surfaceAlt }]}>
      <Feather name={CATEGORY_ICONS[category] ?? 'circle'} size={size * 0.44} color={kind === 'recette' ? colors.success : colors.primaryDark} />
    </View>
  );
}

export function MonthChart({ months }: { months: { month: string; income: number; expenses: number }[] }) {
  const [w, setW] = useState(0);
  const H = 180;
  const pad = { l: 38, r: 4, t: 8, b: 22 };
  const max = Math.max(1, ...months.map((m) => Math.max(m.income, m.expenses)));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const plotW = Math.max(10, w - pad.l - pad.r);
  const plotH = H - pad.t - pad.b;
  const slot = plotW / Math.max(1, months.length);
  const y = (v: number) => pad.t + plotH - (v / top) * plotH;
  const every = Math.max(1, Math.ceil((months.length * 34) / Math.max(1, plotW)));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
      {w > 0 ? (
        <Svg width={w} height={H}>
          {[0, 0.5, 1].map((f) => (
            <G key={f}>
              <Line x1={pad.l} x2={w - pad.r} y1={y(top * f)} y2={y(top * f)} stroke={colors.border} strokeWidth={1} />
              <SvgText x={pad.l - 6} y={y(top * f) + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
                {top * f >= 1000 ? `${Math.round((top * f) / 100) / 10}k` : Math.round(top * f)}
              </SvgText>
            </G>
          ))}
          {months.map((m, i) => {
            const bw = Math.max(2, Math.min(14, slot * 0.3));
            const cx = pad.l + i * slot + slot / 2;
            return (
              <G key={m.month}>
                <Rect x={cx - bw - 1} y={y(m.income)} width={bw} height={Math.max(0, pad.t + plotH - y(m.income))} fill={colors.success} rx={2} />
                <Rect x={cx + 1} y={y(m.expenses)} width={bw} height={Math.max(0, pad.t + plotH - y(m.expenses))} fill={colors.danger} rx={2} />
                {i % every === 0 ? (
                  <SvgText x={cx} y={H - 6} fontSize={10} fill={colors.textMuted} textAnchor="middle">
                    {MONTHS_SHORT[Number(m.month.slice(5, 7)) - 1] ?? m.month}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

export const kit = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  eyebrow: { ...monoType, fontSize: 10.5, letterSpacing: 1.2, color: colors.textMuted, textTransform: 'uppercase' },
  display: { ...displayType, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  muted: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  body: { fontSize: fontSize.sm, color: colors.text, lineHeight: 21 },
  link: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 6 },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 14, minHeight: 42, borderRadius: radius.lg, borderWidth: 1 },
  btnText: { fontSize: fontSize.sm, fontWeight: '700' },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.2 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.bg, minWidth: 0 },
  seg: { flexDirection: 'row', padding: 4, borderRadius: radius.xl, backgroundColor: colors.surfaceAlt, gap: 4 },
  segItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 6, borderRadius: radius.lg },
  segOn: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  segText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  segTextOn: { color: colors.text },
  segBadge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
  segBadgeText: { fontSize: 10.5, fontWeight: '800', color: '#fff' },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,14,10,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  backdropPhone: { justifyContent: 'flex-end', padding: 0 },
  sheet: { width: '100%', maxWidth: 620, maxHeight: '92%', backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden' },
  sheetPhone: { maxWidth: '100%', maxHeight: '94%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, flex: 1 },
  close: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  sheetFoot: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-end' },
  badgeText: { fontSize: 10.5, fontWeight: '700' },
  catIcon: { borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.xl, flexWrap: 'wrap' },
});
