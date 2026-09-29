import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field } from '../ui';
import { useAccCopy } from '../../lib/accounting/locale';
import { MANDATES, SOFTWARE } from '../../lib/accounting/copy';
import { acc } from '../../lib/accounting/api';
import { displayType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// First visit of a signed-in user without a firm: creates the fiduciary
// (the user becomes its owner). Same account as the app and Partners.
export function AccountingOnboarding({ defaults, onDone }: { defaults: { firstName: string; lastName: string }; onDone: () => void }) {
  const { copy, locale } = useAccCopy();
  const t = copy.onboarding;
  const [form, setForm] = useState({
    name: '',
    firstName: defaults.firstName,
    lastName: defaults.lastName,
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'CH',
    ide: '',
    website: '',
  });
  const [mandates, setMandates] = useState<string | null>(null);
  const [software, setSoftware] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (!form.name.trim() || !form.firstName.trim() || !form.lastName.trim()) return setError(t.required);
    setBusy(true);
    setError(null);
    const { error: err } = await acc.createFirm({ ...form, mandates, software, locale });
    setBusy(false);
    if (err) return setError(err);
    onDone();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title} role="heading" aria-level={1}>
        {t.title}
      </Text>
      <Text style={styles.muted}>{t.intro}</Text>
      <Field label={t.firmName} value={form.name} onChangeText={set('name')} autoComplete="organization" />
      <View style={styles.row}>
        <View style={styles.half}>
          <Field label={t.firstName} value={form.firstName} onChangeText={set('firstName')} autoComplete="given-name" />
        </View>
        <View style={styles.half}>
          <Field label={t.lastName} value={form.lastName} onChangeText={set('lastName')} autoComplete="family-name" />
        </View>
      </View>
      <Field label={t.phone} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" autoComplete="tel" />
      <Field label={t.address} value={form.address} onChangeText={set('address')} autoComplete="street-address" />
      <View style={styles.row}>
        <View style={{ width: 120 }}>
          <Field label={t.postalCode} value={form.postalCode} onChangeText={set('postalCode')} autoComplete="postal-code" />
        </View>
        <View style={styles.half}>
          <Field label={t.city} value={form.city} onChangeText={set('city')} />
        </View>
        <View style={{ width: 90 }}>
          <Field label={t.country} value={form.country} onChangeText={set('country')} autoCapitalize="characters" />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}>
          <Field label={t.ide} value={form.ide} onChangeText={set('ide')} placeholder="CHE-123.456.789" />
        </View>
        <View style={styles.half}>
          <Field label={t.website} value={form.website} onChangeText={set('website')} autoCapitalize="none" keyboardType="url" />
        </View>
      </View>

      <Text style={styles.label}>{t.mandates}</Text>
      <View style={styles.chips}>
        {MANDATES.map((m) => (
          <Pressable key={m} onPress={() => setMandates(m)} style={[styles.chip, mandates === m && styles.chipOn]} accessibilityRole="radio" aria-checked={mandates === m}>
            <Text style={[styles.chipText, mandates === m && styles.chipTextOn]}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>{t.software}</Text>
      <View style={styles.chips}>
        {SOFTWARE.map((s) => {
          const on = software.includes(s);
          return (
            <Pressable
              key={s}
              onPress={() => setSoftware((list) => (on ? list.filter((x) => x !== s) : [...list, s]))}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="checkbox"
              aria-checked={on}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{t.softwareNames[s]}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={t.submit} onPress={submit} loading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { ...displayType, fontSize: 30, lineHeight: 34, fontWeight: '800', color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  half: { flex: 1, minWidth: 160 },
  label: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  chipTextOn: { color: colors.surface },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
