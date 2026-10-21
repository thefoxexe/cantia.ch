import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Field } from '../ui';
import { useAccCopy } from '../../lib/accounting/locale';
import { MANDATES, SOFTWARE, fill } from '../../lib/accounting/copy';
import { acc, type FirmMatch, type MyJoinRequest } from '../../lib/accounting/api';
import { displayType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

type Defaults = { firstName: string; lastName: string };

// First visit of a signed-in user without a fiduciary: create one (the user
// becomes its owner) or ask to join an existing one, which an owner or
// administrator accepts from Équipe. Same account as the app and Partners.
export function AccountingStart({ defaults, onDone }: { defaults: Defaults; onDone: () => void }) {
  const { copy, locale } = useAccCopy();
  const t = copy.start;
  const [mode, setMode] = useState<'loading' | 'choose' | 'create' | 'join' | 'pending'>('loading');
  const [pending, setPending] = useState<MyJoinRequest | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    const { data } = await acc.myJoinRequest();
    setPending(data ?? null);
    if (data) setMode('pending');
    else setMode((m) => (m === 'loading' || m === 'pending' ? 'choose' : m));
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (mode === 'loading') return <Text style={[styles.muted, { textAlign: 'center' }]}>{copy.common.loading}</Text>;

  if (mode === 'create') return <AccountingOnboarding defaults={defaults} onDone={onDone} onBack={() => setMode('choose')} />;

  if (mode === 'join') {
    return (
      <JoinFirm
        defaults={defaults}
        onBack={() => setMode('choose')}
        onSent={() => {
          setMode('loading');
          check();
        }}
      />
    );
  }

  if (mode === 'pending' && pending) {
    return (
      <View style={styles.card}>
        <View style={styles.pendingIcon}>
          <Feather name="clock" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title} role="heading" aria-level={1}>
          {t.pendingTitle}
        </Text>
        <Text style={styles.body}>{fill(t.pendingText, { firm: pending.firm_name })}</Text>
        <Text style={styles.muted}>{fill(t.pendingSince, { date: new Date(pending.created_at).toLocaleDateString(`${locale}-CH`) })}</Text>
        <View style={styles.row}>
          <Button
            title={t.refresh}
            icon="refresh-cw"
            loading={busy}
            onPress={async () => {
              setBusy(true);
              const me = await acc.me();
              setBusy(false);
              if (me.data) onDone();
              else check();
            }}
          />
          <Button
            title={t.cancel}
            variant="secondary"
            onPress={async () => {
              setBusy(true);
              await acc.cancelJoinRequest();
              setBusy(false);
              setPending(null);
              setMode('choose');
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title} role="heading" aria-level={1}>
        {t.title}
      </Text>
      <Text style={styles.muted}>{t.intro}</Text>
      <View style={styles.choices}>
        <Pressable onPress={() => setMode('create')} style={({ hovered }: any) => [styles.choice, hovered && styles.choiceHover]} accessibilityRole="button">
          <View style={styles.choiceIcon}>
            <Feather name="plus" size={20} color={colors.primary} />
          </View>
          <Text style={styles.choiceTitle}>{t.createTitle}</Text>
          <Text style={styles.muted}>{t.createText}</Text>
        </Pressable>
        <Pressable onPress={() => setMode('join')} style={({ hovered }: any) => [styles.choice, hovered && styles.choiceHover]} accessibilityRole="button">
          <View style={styles.choiceIcon}>
            <Feather name="users" size={20} color={colors.primary} />
          </View>
          <Text style={styles.choiceTitle}>{t.joinTitle}</Text>
          <Text style={styles.muted}>{t.joinText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function JoinFirm({ defaults, onBack, onSent }: { defaults: Defaults; onBack: () => void; onSent: () => void }) {
  const { copy } = useAccCopy();
  const t = copy.start;
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FirmMatch[] | null>(null);
  const [chosen, setChosen] = useState<FirmMatch | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let live = true;
    const timer = setTimeout(async () => {
      const { data } = await acc.findFirms(q);
      if (live) setResults(data ?? []);
    }, 250);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  async function submit() {
    if (busy) return;
    if (!chosen || !firstName.trim() || !lastName.trim()) return setError(t.required);
    setBusy(true);
    setError(null);
    const { error: err } = await acc.requestJoin(chosen.id, firstName.trim(), lastName.trim(), message.trim());
    setBusy(false);
    if (err) return setError(err);
    onSent();
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Feather name="arrow-left" size={14} color={colors.textMuted} />
        <Text style={styles.backText}>{t.back}</Text>
      </Pressable>
      <Text style={styles.title} role="heading" aria-level={1}>
        {t.joinTitle}
      </Text>
      <Text style={styles.muted}>{t.joinText}</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <Field label={copy.onboarding.firstName} value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
        </View>
        <View style={styles.half}>
          <Field label={copy.onboarding.lastName} value={lastName} onChangeText={setLastName} autoComplete="family-name" />
        </View>
      </View>

      {chosen ? (
        <View style={styles.chosen}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.chosen}</Text>
            <Text style={styles.choiceTitle}>{chosen.name}</Text>
            {chosen.city ? <Text style={styles.muted}>{chosen.city}</Text> : null}
          </View>
          <Pressable onPress={() => setChosen(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t.back}>
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Field label={t.searchLabel} value={query} onChangeText={setQuery} placeholder={t.searchPlaceholder} autoCapitalize="none" />
          {results === null ? <Text style={styles.muted}>{t.searchHint}</Text> : null}
          {results && results.length === 0 ? <Text style={styles.muted}>{t.noResult}</Text> : null}
          {results?.map((f) => (
            <Pressable key={f.id} onPress={() => setChosen(f)} style={({ hovered }: any) => [styles.result, hovered && styles.choiceHover]} accessibilityRole="button">
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{f.name}</Text>
                {f.city ? <Text style={styles.muted}>{f.city}</Text> : null}
              </View>
              <Text style={styles.link}>{t.choose}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Field label={t.message} value={message} onChangeText={setMessage} placeholder={t.messagePlaceholder} multiline style={{ minHeight: 72, textAlignVertical: 'top' }} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={t.send} icon="send" onPress={submit} loading={busy} disabled={!chosen} />
    </View>
  );
}

function AccountingOnboarding({ defaults, onDone, onBack }: { defaults: Defaults; onDone: () => void; onBack: () => void }) {
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
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Feather name="arrow-left" size={14} color={colors.textMuted} />
        <Text style={styles.backText}>{copy.start.back}</Text>
      </Pressable>
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
  body: { fontSize: fontSize.md, lineHeight: 23, color: colors.text },
  link: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  choice: {
    flex: 1,
    minWidth: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  choiceHover: { borderColor: colors.primary },
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  choiceTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resultName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  chosen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
  },
  pendingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
});
