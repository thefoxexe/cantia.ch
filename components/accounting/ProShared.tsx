import { useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { acc, type Team } from '../../lib/accounting/api';
import { pro, refKey, type ClientRef } from '../../lib/accounting/pro';
import { useProCopy } from '../../lib/accounting/proCopy';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Building blocks of the fiduciary tools (work, time, approvals, external
// clients): a client picker covering Cantia and external clients, the
// team, small inputs.

export interface ClientOption {
  key: string; // org:… / ext:…
  ref: ClientRef;
  name: string;
  external: boolean;
}

let clientCache: { at: number; rows: ClientOption[] } | null = null;

export function useClientOptions(): ClientOption[] | null {
  const [rows, setRows] = useState<ClientOption[] | null>(clientCache && Date.now() - clientCache.at < 30_000 ? clientCache.rows : null);
  useEffect(() => {
    let alive = true;
    Promise.all([acc.mandants(), pro.externalClients()]).then(([m, e]) => {
      const list: ClientOption[] = [
        ...(m.data ?? []).filter((x) => x.status === 'ACTIVE').map((x) => ({ key: refKey({ organization_id: x.organization_id }), ref: { org: x.organization_id }, name: x.name, external: false })),
        ...(e.data ?? []).map((x) => ({ key: refKey({ external_client_id: x.id }), ref: { ext: x.id }, name: x.name, external: true })),
      ].sort((a, b) => a.name.localeCompare(b.name));
      clientCache = { at: Date.now(), rows: list };
      if (alive) setRows(list);
    });
    return () => {
      alive = false;
    };
  }, []);
  return rows;
}

export function invalidateClientOptions() {
  clientCache = null;
}

let teamCache: Team | null = null;
export function useTeam(): Team | null {
  const [team, setTeam] = useState<Team | null>(teamCache);
  useEffect(() => {
    acc.team().then(({ data }) => {
      teamCache = data;
      setTeam(data);
    });
  }, []);
  return team;
}

export const memberName = (m: { first_name: string | null; last_name: string | null; email: string }) => [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;

export function ClientPicker({ value, onChange, options }: { value: string | null; onChange: (key: string) => void; options: ClientOption[] | null }) {
  const p = useProCopy();
  const [q, setQ] = useState('');
  if (!options) return <Text style={ps.muted}>{p.common.loading}</Text>;
  const shown = options.filter((o) => !q.trim() || o.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 40);
  return (
    <View style={{ gap: 6 }}>
      <Text style={ps.label}>{p.common.client}</Text>
      {options.length > 8 ? (
        <TextInput value={q} onChangeText={setQ} placeholder={p.common.chooseClient} placeholderTextColor={colors.textMuted} style={ps.input} />
      ) : null}
      <View style={ps.pickList}>
        {shown.map((o) => {
          const on = value === o.key;
          return (
            <Pressable key={o.key} onPress={() => onChange(o.key)} style={[ps.pick, on && ps.pickOn]}>
              {o.external ? <Feather name="external-link" size={11} color={on ? colors.primaryDark : colors.textMuted} /> : null}
              <Text style={[ps.pickText, on && ps.pickTextOn]}>{o.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Picks<T extends string>({ value, options, onChange, label }: { value: T | null; options: { key: T; label: string }[]; onChange: (v: T) => void; label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={ps.label}>{label}</Text> : null}
      <View style={ps.pickList}>
        {options.map((o) => (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[ps.pick, value === o.key && ps.pickOn]}>
            <Text style={[ps.pickText, value === o.key && ps.pickTextOn]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function Input({ label, hint, style, ...rest }: React.ComponentProps<typeof TextInput> & { label: string; hint?: string }) {
  return (
    <View style={[{ gap: 6 }, style as any]}>
      <Text style={ps.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} {...rest} style={[ps.input, rest.multiline && ps.textarea]} />
      {hint ? <Text style={ps.small}>{hint}</Text> : null}
    </View>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={ps.toggle} accessibilityRole="checkbox" aria-checked={value}>
      <View style={[ps.check, value && ps.checkOn]}>{value ? <Feather name="check" size={12} color="#fff" /> : null}</View>
      <Text style={ps.body}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }) {
  const map = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primaryDark },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View style={[ps.pill, { backgroundColor: map.bg }]}>
      <Text style={[ps.pillText, { color: map.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function LinkButton({ label, onPress, icon, tone = 'primary', disabled }: { label: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap; tone?: 'primary' | 'muted' | 'danger'; disabled?: boolean }) {
  const color = tone === 'danger' ? colors.danger : tone === 'muted' ? colors.textMuted : colors.primary;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[ps.linkBtn, disabled && { opacity: 0.5 }]} hitSlop={6}>
      {icon ? <Feather name={icon} size={13} color={color} /> : null}
      <Text style={[ps.linkText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Message({ value }: { value: { text: string; error: boolean } | null }) {
  if (!value) return null;
  return <Text style={value.error ? ps.error : ps.success}>{value.text}</Text>;
}

export function Empty({ icon, text, children }: { icon: keyof typeof Feather.glyphMap; text: string; children?: ReactNode }) {
  return (
    <View style={ps.empty}>
      <Feather name={icon} size={22} color={colors.border} />
      <Text style={[ps.muted, { textAlign: 'center' }]}>{text}</Text>
      {children}
    </View>
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  return false;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isoToSwiss(iso: string | null | undefined): string {
  return iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '';
}

export const ps = StyleSheet.create({
  label: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  bodyStrong: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text, fontWeight: '700' },
  small: { fontSize: 12, lineHeight: 17, color: colors.textMuted },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  error: { fontSize: fontSize.sm, color: colors.danger },
  success: { fontSize: fontSize.sm, color: colors.success },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 12, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface },
  textarea: { minHeight: 76, textAlignVertical: 'top' },
  pickList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pickOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pickText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  pickTextOn: { color: colors.primaryDark, fontWeight: '800' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 4 },
  check: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  pill: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '700' },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: fontSize.sm, fontWeight: '700' },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  cardAccent: { borderColor: colors.primary, borderWidth: 1.5 },
  h2: { ...displayType, fontSize: 20, fontWeight: '800', color: colors.text },
  mono: { ...monoType, fontSize: 12, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
