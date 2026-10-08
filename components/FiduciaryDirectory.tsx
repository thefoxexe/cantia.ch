import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { requestFiduciary, searchFiduciaries, STANDARD_PERMISSIONS, type DirectoryFirm } from '../lib/api/fiduciary';
import { Button, Card } from './ui';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Paramètres › Fiduciaire: the directory of fiduciaries on Cantia
// Accounting. Asking one creates a pending access the firm accepts.

const CANTONS = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

export function FiduciaryDirectory({ orgId, connectedIds, onAsked }: { orgId: string; connectedIds: string[]; onAsked: () => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [canton, setCanton] = useState<string | null>(null);
  const [rows, setRows] = useState<DirectoryFirm[] | null>(null);
  const [showCantons, setShowCantons] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => searchFiduciaries(query.trim() || null, canton).then(setRows), 250);
    return () => clearTimeout(id);
  }, [query, canton]);

  async function ask(firm: DirectoryFirm) {
    setError(null);
    const { error: e } = await requestFiduciary(orgId, firm.id, STANDARD_PERMISSIONS);
    if (e) return setError(e);
    setAsked((x) => [...x, firm.id]);
    onAsked();
  }

  return (
    <View style={styles.stack}>
      <Text style={styles.sectionTitle}>{t('fiduciary.dir.title')}</Text>
      <Text style={styles.muted}>{t('fiduciary.dir.intro')}</Text>
      <View style={styles.toolbar}>
        <TextInput value={query} onChangeText={setQuery} placeholder={t('fiduciary.dir.search')} placeholderTextColor={colors.textMuted} style={[styles.input, { flex: 1, minWidth: 180 }]} />
        <Pressable onPress={() => setShowCantons((v) => !v)} style={styles.select}>
          <Text style={styles.body}>{canton ?? `${t('fiduciary.dir.canton')} : ${t('fiduciary.dir.all')}`}</Text>
          <Feather name={showCantons ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
        </Pressable>
      </View>
      {showCantons ? (
        <View style={styles.cantons}>
          <Pressable onPress={() => (setCanton(null), setShowCantons(false))} style={[styles.canton, !canton && styles.cantonOn]}>
            <Text style={[styles.cantonText, !canton && styles.cantonTextOn]}>{t('fiduciary.dir.all')}</Text>
          </Pressable>
          {CANTONS.map((c) => (
            <Pressable key={c} onPress={() => (setCanton(c), setShowCantons(false))} style={[styles.canton, canton === c && styles.cantonOn]}>
              <Text style={[styles.cantonText, canton === c && styles.cantonTextOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {rows && rows.length === 0 ? <Text style={styles.muted}>{t('fiduciary.dir.empty')}</Text> : null}
      {(rows ?? []).map((f) => {
        const accent = f.brand_color && /^#[0-9a-f]{6}$/i.test(f.brand_color) ? f.brand_color : colors.primary;
        const connected = connectedIds.includes(f.id);
        return (
          <Card key={f.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: accent }]}>
            <View style={styles.head}>
              {f.logo_data ? (
                <Image source={{ uri: f.logo_data }} style={styles.logo} resizeMode="contain" />
              ) : (
                <View style={[styles.initial, { backgroundColor: `${accent}22` }]}>
                  <Text style={[styles.initialText, { color: accent }]}>{f.name.slice(0, 1)}</Text>
                </View>
              )}
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={styles.cardTitle}>
                  {f.name}
                  {f.verified ? <Text style={{ color: colors.success }}>{'  ✓'}</Text> : null}
                </Text>
                <Text style={styles.muted}>{[[f.postal_code, f.city].filter(Boolean).join(' '), f.cantons.join(', '), f.languages.map((l) => l.toUpperCase()).join(' · ')].filter(Boolean).join(' · ')}</Text>
              </View>
            </View>
            {f.description ? <Text style={styles.body}>{f.description}</Text> : null}
            {f.services.length ? (
              <View style={styles.tags}>
                {f.services.map((s) => (
                  <View key={s} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.toolbar}>
              {connected || asked.includes(f.id) ? (
                <Text style={[styles.body, { color: colors.success, fontWeight: '700' }]}>{t('fiduciary.dir.asked')}</Text>
              ) : f.accepts_new_clients ? (
                <Button title={t('fiduciary.dir.ask')} icon="send" onPress={() => ask(f)} />
              ) : (
                <Text style={styles.muted}>{t('fiduciary.dir.notAccepting')}</Text>
              )}
              {f.website ? (
                <Pressable onPress={() => Linking.openURL(f.website!.startsWith('http') ? f.website! : `https://${f.website}`)}>
                  <Text style={styles.link}>{f.website.replace(/^https?:\/\//, '')}</Text>
                </Pressable>
              ) : null}
              {f.phone ? <Text style={styles.muted}>{f.phone}</Text> : null}
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  select: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  cantons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  canton: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  cantonOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  cantonText: { fontSize: 12, fontWeight: '700', color: colors.text },
  cantonTextOn: { color: '#fff' },
  card: { gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  logo: { width: 110, height: 44 },
  initial: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  initialText: { fontSize: 20, fontWeight: '800' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.surfaceAlt, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  tagText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
