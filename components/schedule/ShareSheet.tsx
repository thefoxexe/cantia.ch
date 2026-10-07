import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Chip, Field, Sheet, kit } from '../admin/ledger/kit';
import { fill, shortDate, type ScheduleCopy } from '../../lib/schedule/copy';
import { createShare, listShares, revokeShare, shareUrl, type ScheduleShare } from '../../lib/schedule/shares';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const DURATIONS = [7, 30, 90, null] as const;

// Read-only links to the planning for the client, the architect or the
// other companies: create, copy, revoke. Editors only.
export function ShareSheet({ c, scheduleId, organizationId, editable, onClose }: { c: ScheduleCopy; scheduleId: string; organizationId: string; editable: boolean; onClose: () => void }) {
  const [shares, setShares] = useState<ScheduleShare[] | null>(null);
  const [label, setLabel] = useState('');
  const [days, setDays] = useState<number | null>(30);
  const [brand, setBrand] = useState(true);
  const [companies, setCompanies] = useState(true);
  const [notes, setNotes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => listShares(scheduleId).then(setShares);
  useEffect(() => {
    reload();
  }, [scheduleId]);

  const copy = async (s: ScheduleShare) => {
    const url = shareUrl(s.token);
    try {
      if (Platform.OS === 'web') await navigator.clipboard.writeText(url);
      setCopied(s.id);
      setTimeout(() => setCopied((v) => (v === s.id ? null : v)), 2500);
    } catch {
      setError(url);
    }
  };

  const now = new Date().toISOString();
  const active = (shares ?? []).filter((s) => !s.expires_at || s.expires_at > now);

  return (
    <Sheet title={c.shareTitle} onClose={onClose} footer={<Btn label={c.cancel} onPress={onClose} grow />}>
      <Text style={kit.hint}>{c.shareIntro}</Text>

      {editable ? (
        <View style={styles.box}>
          <Field label={c.shareLabel}>
            <TextInput value={label} onChangeText={setLabel} placeholder={c.shareLabelPh} placeholderTextColor={colors.textMuted} style={kit.input} maxLength={120} />
          </Field>
          <Text style={kit.fieldLabel}>{c.shareExpiry}</Text>
          <View style={styles.row}>
            {DURATIONS.map((d) => (
              <Chip key={String(d)} small label={d ? fill(c.shareDays, { n: d }) : c.shareNever} active={days === d} onPress={() => setDays(d)} />
            ))}
          </View>
          {(
            [
              [c.shareBrand, brand, setBrand],
              [c.shareCompanies, companies, setCompanies],
              [c.shareNotes, notes, setNotes],
            ] as const
          ).map(([text, value, set]) => (
            <View key={text} style={styles.toggle}>
              <Text style={[kit.body, { flex: 1 }]}>{text}</Text>
              <Switch value={value} onValueChange={set} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
            </View>
          ))}
          <Btn
            label={busy ? '…' : c.shareNew}
            icon="link"
            variant="primary"
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              setError(null);
              const { share, error: e } = await createShare(scheduleId, organizationId, { label: label.trim() || null, days, with_brand: brand, show_notes: notes, show_companies: companies });
              setBusy(false);
              if (e || !share) return setError(e ?? '—');
              setLabel('');
              await reload();
              copy(share);
            }}
          />
        </View>
      ) : null}

      <Text style={kit.eyebrow}>{c.shareActive}</Text>
      {shares && !active.length ? <Text style={kit.hint}>{c.shareNone}</Text> : null}
      {active.map((s) => (
        <View key={s.id} style={styles.share}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Feather name="link" size={15} color={colors.primary} />
            <Text style={[kit.body, { flex: 1, fontWeight: '700' }]} numberOfLines={1}>
              {s.label || c.shareTitle}
            </Text>
            <Btn label={copied === s.id ? c.shareCopied : c.shareCopy} icon={copied === s.id ? 'check' : 'copy'} onPress={() => copy(s)} />
            {editable ? (
              <Pressable
                onPress={async () => {
                  const e = await revokeShare(s.id);
                  if (e) setError(e);
                  reload();
                }}
                style={styles.revoke}
                accessibilityLabel={c.shareRevoke}
              >
                <Text style={styles.revokeText}>{c.shareRevoke}</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.url} numberOfLines={1} selectable>
            {shareUrl(s.token)}
          </Text>
          <Text style={kit.hint}>
            {s.expires_at ? fill(c.shareUntil, { date: shortDate(s.expires_at.slice(0, 10)) }) : c.shareNoLimit}
            {s.view_count ? ` · ${fill(c.shareViews, { n: s.view_count })}` : ''}
          </Text>
        </View>
      ))}
      {error ? <Text style={{ color: colors.danger }} selectable>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  share: { gap: 4, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  url: { fontSize: fontSize.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  revoke: { paddingHorizontal: 10, paddingVertical: 8 },
  revokeText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.danger },
});
