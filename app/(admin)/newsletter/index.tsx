import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listUsers } from '../../../lib/api/admin';
import { getSubscribedCount, getUnsubscribedUserIds, filterUserIds } from '../../../lib/api/newsletter';
import { sendNewsletterCampaign, sendNewsletterTest } from '../../../lib/api/newsletterCampaign';
import { Button, Container, Field } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { AdminUserSummary } from '../../../lib/types';

const PLAN_FILTERS: { id: string; label: string }[] = [
  { id: 'solo', label: 'Essentiel' },
  { id: 'equipe', label: 'Équipe' },
  { id: 'pro', label: 'Entreprise' },
];

// Paste-in HTML composer for the newsletter/announcement emails the user
// wants to send to their own customers — trial-ended nudges, big feature
// announcements, requests for feedback. Deliberately doesn't wrap or
// re-render the pasted HTML (see send-newsletter-campaign's own comment):
// "Envoyer un test" is the preview, since RN has no built-in HTML renderer
// to show one live.
//
// Targeting is a single running selection (selectedIds) built up by quick
// filters and/or the manual search picker, rather than a single mode —
// "tous les abonnés" and "plan Essentiel" are just buttons that add
// matching ids to it. Every quick filter defaults to subscribed-only;
// the one exception is the explicit "+ Non-abonnés" button, the only path
// that can add someone who opted out, and doing so requires checking a
// confirmation box before sending (includeUnsubscribedConfirmed) — this
// screen can't accidentally mail someone who opted out.
export default function AdminNewsletterScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [subscribedCount, setSubscribedCount] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [unsubscribedIds, setUnsubscribedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterBusy, setFilterBusy] = useState<string | null>(null);

  // True once a selected id is known (from the manual list or the
  // "+ Non-abonnés" filter) to be unsubscribed — gates the confirmation
  // checkbox required to send to it.
  const [includesUnsubscribed, setIncludesUnsubscribed] = useState(false);
  const [confirmUnsubscribed, setConfirmUnsubscribed] = useState(false);

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
    const timer = setTimeout(() => loadUsers(search), 250);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  function addIds(ids: string[], unsubscribed: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    if (unsubscribed && ids.length > 0) setIncludesUnsubscribed(true);
  }

  async function handleQuickFilter(key: string, planIds: string[] | undefined, subscribed: boolean | undefined) {
    setFilterBusy(key);
    const ids = await filterUserIds({ planIds, subscribed });
    addIds(ids, subscribed === false);
    setFilterBusy(null);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (unsubscribedIds.has(id)) setIncludesUnsubscribed(true);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setIncludesUnsubscribed(false);
    setConfirmUnsubscribed(false);
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
    if (!subject.trim() || !html.trim() || selectedIds.size === 0) return;
    if (includesUnsubscribed && !confirmUnsubscribed) {
      setError('Cochez la confirmation pour envoyer à des personnes désabonnées.');
      return;
    }
    setSending(true);
    setError(null);
    setResult(null);
    const { sent, skipped, total, error: err } = await sendNewsletterCampaign({
      subject: subject.trim(),
      html,
      userIds: Array.from(selectedIds),
      includeUnsubscribed: includesUnsubscribed && confirmUnsubscribed,
    });
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setResult({ sent, skipped, total });
  }

  const canSend = subject.trim().length > 0 && html.trim().length > 0 && selectedIds.size > 0 && (!includesUnsubscribed || confirmUnsubscribed);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Newsletter</Text>
        </View>
        <Text style={styles.hint}>
          Envoyez un e-mail à vos clients — grandes nouveautés, demande de retours, etc. Le HTML collé ci-dessous est envoyé tel quel. Répondu
          depuis newsletter@cantia.ch, les réponses arrivent sur info@cantia.ch.
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

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          {selectedIds.size > 0 ? (
            <Pressable onPress={clearSelection} hitSlop={6}>
              <Text style={styles.clearLink}>Tout désélectionner ({selectedIds.size})</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.filterLabel}>Ajouter à la sélection</Text>
        <View style={styles.filterRow}>
          <FilterChip
            label={`Tous les abonnés${subscribedCount != null ? ` (${subscribedCount})` : ''}`}
            busy={filterBusy === 'all'}
            onPress={() => handleQuickFilter('all', undefined, true)}
          />
          {PLAN_FILTERS.map((p) => (
            <FilterChip key={p.id} label={p.label} busy={filterBusy === p.id} onPress={() => handleQuickFilter(p.id, [p.id], true)} />
          ))}
          <FilterChip
            label="Non-abonnés"
            warning
            busy={filterBusy === 'unsub'}
            onPress={() => handleQuickFilter('unsub', undefined, false)}
          />
        </View>

        <View style={styles.pickerBox}>
          <Field label="Rechercher pour ajouter individuellement" placeholder="Nom, e-mail ou entreprise…" value={search} onChangeText={setSearch} />
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
                    onPress={() => toggleSelected(u.user_id)}
                    style={[styles.userRow, isSelected && styles.userRowSelected]}
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

        {includesUnsubscribed ? (
          <Pressable style={styles.confirmRow} onPress={() => setConfirmUnsubscribed((v) => !v)}>
            <View style={[styles.checkbox, confirmUnsubscribed && styles.checkboxCheckedWarning]}>
              {confirmUnsubscribed ? <Feather name="check" size={12} color="#fff" /> : null}
            </View>
            <Text style={styles.confirmText}>
              La sélection inclut des personnes désabonnées de la newsletter — je confirme vouloir quand même leur envoyer cet e-mail (cas
              exceptionnel, ex. fermeture de la plateforme).
            </Text>
          </Pressable>
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

        <Button
          title={`Envoyer à ${selectedIds.size} destinataire${selectedIds.size > 1 ? 's' : ''}`}
          onPress={handleSend}
          loading={sending}
          disabled={!canSend}
          style={{ marginTop: spacing.md }}
        />
      </Container>
    </ScrollView>
  );
}

function FilterChip({ label, onPress, busy, warning }: { label: string; onPress: () => void; busy?: boolean; warning?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} style={[styles.filterChip, warning && styles.filterChipWarning]}>
      <Feather name="plus" size={12} color={warning ? colors.danger : colors.primary} />
      <Text style={[styles.filterChipText, warning && styles.filterChipTextWarning]}>{busy ? '…' : label}</Text>
    </Pressable>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  clearLink: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  filterLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterChipWarning: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  filterChipTextWarning: {
    color: colors.danger,
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
  checkboxCheckedWarning: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
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
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  confirmText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
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
