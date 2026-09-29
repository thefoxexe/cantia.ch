import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { deleteSalesEmail, getSalesInboxSettings, listSalesEmails, type SalesEmail } from '../lib/api/salesEmails';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { Card } from './ui';

// Emails filed through the organization's Cantia address (Commercial page):
// client replies, Bcc copies of emails written from Outlook/Gmail, forwards.
export function SalesEmailsList({ orgId }: { orgId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [emails, setEmails] = useState<SalesEmail[] | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [settings, list] = await Promise.all([getSalesInboxSettings(orgId), listSalesEmails(orgId, { limit: 20 })]);
    setEnabled(!!settings?.enabled);
    setEmails(list);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    const { error } = await deleteSalesEmail(id);
    if (!error) setEmails((list) => (list ?? []).filter((e) => e.id !== id));
  }

  if (emails === null) return null;

  return (
    <>
      <Text style={styles.sectionTitle}>{t('salesEmails.title')}</Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {emails.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{enabled ? t('salesEmails.empty') : t('salesEmails.setupHint')}</Text>
            {!enabled ? (
              <Pressable onPress={() => router.push('/(app)/compte/automatisations' as any)}>
                <Text style={styles.link}>{t('salesEmails.setup')} →</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          emails.map((e, i) => {
            const incoming = e.direction === 'incoming';
            const who = e.counterpart_email ? t(incoming ? 'salesEmails.from' : 'salesEmails.to', { email: e.counterpart_email }) : null;
            const expanded = open === e.id;
            return (
              <View key={e.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Pressable onPress={() => setOpen(expanded ? null : e.id)} style={styles.rowMain}>
                  <View style={[styles.badge, incoming ? styles.badgeIn : styles.badgeOut]}>
                    <Feather name={incoming ? 'arrow-down-left' : 'arrow-up-right'} size={13} color={incoming ? colors.success : colors.textMuted} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.subject} numberOfLines={1}>
                      {e.subject || t('salesEmails.noSubject')}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {[incoming ? t('salesEmails.incoming') : t('salesEmails.outgoing'), who, formatWhen(e.occurred_at)].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  {e.devis_id ? (
                    <Pressable onPress={() => router.push(`/(app)/devis/${e.devis_id}` as any)} style={styles.devisChip} hitSlop={6}>
                      <Text style={styles.devisChipText}>{t('salesEmails.devis', { number: e.devis?.number ?? '' })}</Text>
                    </Pressable>
                  ) : null}
                </Pressable>
                {expanded ? (
                  <View style={styles.body}>
                    {e.snippet ? <Text style={styles.snippet}>{e.snippet}</Text> : null}
                    <Pressable onPress={() => remove(e.id)} style={styles.remove}>
                      <Feather name="trash-2" size={13} color={colors.textMuted} />
                      <Text style={styles.removeText}>{t('salesEmails.remove')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </Card>
    </>
  );
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  empty: { padding: spacing.lg, gap: spacing.sm },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  link: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  row: {},
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  badge: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  badgeIn: { backgroundColor: colors.successSoft },
  badgeOut: { backgroundColor: colors.surfaceAlt },
  subject: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  devisChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 },
  devisChipText: { fontSize: 11, fontWeight: '700', color: colors.text },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingLeft: spacing.lg + 28 + spacing.md, gap: spacing.sm },
  snippet: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  removeText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
});
