import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listUsers } from '../../../lib/api/admin';
import { getSubscribedCount, getUnsubscribedUserIds } from '../../../lib/api/newsletter';
import { sendNewsletterCampaign, sendNewsletterTest } from '../../../lib/api/newsletterCampaign';
import { Button, Container, Field } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { AdminUserSummary } from '../../../lib/types';

type Mode = 'all_subscribed' | 'manual';

// Paste-in HTML composer for the newsletter/announcement emails the user
// wants to send to their own customers — trial-ended nudges, big feature
// announcements, requests for feedback. Deliberately doesn't wrap or
// re-render the pasted HTML (see send-newsletter-campaign's own comment):
// "Envoyer un test" is the preview, since RN has no built-in HTML renderer
// to show one live. Every send — whichever mode picked the recipients —
// is re-filtered server-side against newsletter_subscriptions, so this
// screen can't accidentally mail someone who opted out.
export default function AdminNewsletterScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [mode, setMode] = useState<Mode>('all_subscribed');
  const [subscribedCount, setSubscribedCount] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [unsubscribedIds, setUnsubscribedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; skipped: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubscribedCount().then(setSubscribedCount);
    if (user?.email) setTestEmail(user.email);
  }, [user?.email]);

  const loadUsers = useCallback(async (query: string) => {
    setLoadingUsers(true);
    const { rows: r, error: err } = await listUsers(query, 50, 0);
    setRows(r);
    if (!err) {
      const ids = r.map((u) => u.user_id);
      setUnsubscribedIds(await getUnsubscribedUserIds(ids));
    }
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    if (mode !== 'manual') return;
    const timer = setTimeout(() => loadUsers(search), 250);
    return () => clearTimeout(timer);
  }, [mode, search, loadUsers]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSendTest() {
    if (!subject.trim() || !html.trim() || !testEmail.trim()) return;
    setSendingTest(true);
    setError(null);
    const { error: err } = await sendNewsletterTest(subject.trim(), html, testEmail.trim());
    setSendingTest(false);
    if (err) setError(err);
  }

  async function handleSend() {
    if (!subject.trim() || !html.trim()) return;
    if (mode === 'manual' && selectedIds.size === 0) {
      setError('Sélectionnez au moins un destinataire.');
      return;
    }
    setSending(true);
    setError(null);
    setResult(null);
    const { sent, skipped, total, error: err } = await sendNewsletterCampaign({
      subject: subject.trim(),
      html,
      mode,
      userIds: mode === 'manual' ? Array.from(selectedIds) : undefined,
    });
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setResult({ sent, skipped, total });
  }

  const canSend = subject.trim().length > 0 && html.trim().length > 0 && (mode === 'all_subscribed' || selectedIds.size > 0);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Newsletter</Text>
        </View>
        <Text style={styles.hint}>
          Envoyez un e-mail à vos clients — grandes nouveautés, demande de retours, etc. Le HTML collé ci-dessous est envoyé tel quel. Les
          personnes désabonnées de la newsletter ne reçoivent jamais rien, quel que soit le ciblage choisi.
        </Text>

        {error ? <AdminErrorBanner message={error} /> : null}

        <Field label="Sujet" value={subject} onChangeText={setSubject} placeholder="Quoi de neuf chez Cantia ?" />

        <Field
          label="Contenu HTML"
          value={html}
          onChangeText={setHtml}
          placeholder="Collez votre HTML ici…"
          multiline
          numberOfLines={14}
          style={styles.htmlInput}
        />

        <Text style={styles.sectionTitle}>Destinataires</Text>
        <View style={styles.modeRow}>
          <Pressable onPress={() => setMode('all_subscribed')} style={[styles.modeChip, mode === 'all_subscribed' && styles.modeChipActive]}>
            <Text style={[styles.modeChipText, mode === 'all_subscribed' && styles.modeChipTextActive]}>
              Tous les abonnés{subscribedCount != null ? ` (${subscribedCount})` : ''}
            </Text>
          </Pressable>
          <Pressable onPress={() => setMode('manual')} style={[styles.modeChip, mode === 'manual' && styles.modeChipActive]}>
            <Text style={[styles.modeChipText, mode === 'manual' && styles.modeChipTextActive]}>
              Sélection manuelle{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
            </Text>
          </Pressable>
        </View>

        {mode === 'manual' ? (
          <View style={styles.pickerBox}>
            <Field label="Rechercher" placeholder="Nom, e-mail ou entreprise…" value={search} onChangeText={setSearch} />
            {loadingUsers ? (
              <Text style={styles.hint}>Chargement…</Text>
            ) : (
              <View style={styles.userList}>
                {rows.map((u) => {
                  const isUnsub = unsubscribedIds.has(u.user_id);
                  const isSelected = selectedIds.has(u.user_id);
                  return (
                    <Pressable
                      key={`${u.user_id}-${u.organization_id}`}
                      onPress={() => !isUnsub && toggleSelected(u.user_id)}
                      disabled={isUnsub}
                      style={[styles.userRow, isSelected && styles.userRowSelected, isUnsub && styles.userRowDisabled]}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected ? <Feather name="check" size={12} color="#fff" /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {u.full_name || u.email}
                        </Text>
                        <Text style={styles.userMeta} numberOfLines={1}>
                          {u.email} · {u.organization_name}
                        </Text>
                      </View>
                      {isUnsub ? <Text style={styles.unsubTag}>désabonné</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.testRow}>
          <View style={{ flex: 1 }}>
            <Field label="Envoyer un test à" value={testEmail} onChangeText={setTestEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>
          <Button title="Test" variant="secondary" onPress={handleSendTest} loading={sendingTest} disabled={!subject.trim() || !html.trim()} />
        </View>

        {result ? (
          <View style={styles.resultBanner}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={styles.resultText}>
              {result.sent} e-mail{result.sent > 1 ? 's' : ''} envoyé{result.sent > 1 ? 's' : ''}
              {result.skipped > 0 ? `, ${result.skipped} ignoré${result.skipped > 1 ? 's' : ''} (désabonnés)` : ''}.
            </Text>
          </View>
        ) : null}

        <Button title="Envoyer à tous les destinataires ciblés" onPress={handleSend} loading={sending} disabled={!canSend} style={{ marginTop: spacing.md }} />
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    maxWidth: 720,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.lg,
  },
  htmlInput: {
    minHeight: 220,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  modeChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  pickerBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  userList: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    maxHeight: 340,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userRowSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  userRowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  userMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  unsubTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.lg,
  },
  resultText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
});
