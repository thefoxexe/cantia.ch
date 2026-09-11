import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { listUsers } from '../../../lib/api/admin';
import { getSubscribedCount, getUnsubscribedUserIds, filterUserIds, filterOwnerIds, listCampaigns, type NewsletterCampaign } from '../../../lib/api/newsletter';
import { sendNewsletterCampaign, sendNewsletterTest, type SenderPersona } from '../../../lib/api/newsletterCampaign';
import { Button, Container, Field } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { AdminUserSummary } from '../../../lib/types';

const PLAN_FILTERS: { id: string; label: string }[] = [
  { id: 'solo', label: 'Essentiel' },
  { id: 'equipe', label: 'Équipe' },
  { id: 'pro', label: 'Entreprise' },
];

// Account-lifecycle segments — resolve to the org OWNER only (see
// lib/api/newsletter.ts's filterOwnerIds), not every member: these are
// about the account's billing state, not a per-member newsletter
// preference. "Toujours abonnés" (subscribed:true) still applies, same
// default-safe rule as every other quick filter.
const ORG_STATUS_FILTERS: { status: string; label: string }[] = [
  { status: 'canceled', label: 'Résiliés' },
  { status: 'trialing', label: 'En essai' },
  { status: 'decouverte', label: 'Plan découverte (sans carte)' },
  { status: 'incomplete', label: 'Inscription incomplète' },
];

const PERSONAS: { key: SenderPersona; label: string; from: string }[] = [
  { key: 'newsletter', label: 'Newsletter', from: 'newsletter@cantia.ch' },
  { key: 'info', label: 'Info (support)', from: 'info@cantia.ch' },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// General-purpose targeted e-mail composer — not strictly "newsletters":
// trial-ended follow-ups, one-off outreach to a handful of cancelled
// accounts, big feature announcements, requests for feedback. Deliberately
// doesn't wrap or re-render the pasted HTML (see send-newsletter-campaign's
// own comment): "Envoyer un test" is the preview, since RN has no built-in
// HTML renderer to show one live.
//
// Targeting is a single running selection (selectedIds) built up by quick
// filters and/or the manual search picker, rather than a single mode —
// each quick filter is just a button that adds matching ids to it. Plan/
// newsletter-preference filters add every consenting member; account-
// lifecycle filters (résiliés, essai, découverte, incomplet) add only the
// org owner. Every quick filter defaults to subscribed-only; the one
// exception is the explicit "+ Non-abonnés" button, the only path that can
// add someone who opted out, and doing so requires checking a confirmation
// box before sending — this screen can't accidentally mail someone who
// opted out.
export default function AdminNewsletterScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [fromPersona, setFromPersona] = useState<SenderPersona>('newsletter');
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

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<NewsletterCampaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  async function loadHistory() {
    setHistoryLoading(true);
    setHistory(await listCampaigns());
    setHistoryLoading(false);
  }

  function toggleHistory() {
    const next = !showHistory;
    setShowHistory(next);
    if (next && history.length === 0) loadHistory();
  }

  function addIds(ids: string[], unsubscribed: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    if (unsubscribed && ids.length > 0) setIncludesUnsubscribed(true);
  }

  async function handlePlanFilter(key: string, planIds: string[] | undefined, subscribed: boolean | undefined) {
    setFilterBusy(key);
    const ids = await filterUserIds({ planIds, subscribed });
    addIds(ids, subscribed === false);
    setFilterBusy(null);
  }

  async function handleOrgStatusFilter(status: string) {
    setFilterBusy(status);
    const ids = await filterOwnerIds({ orgStatus: status, subscribed: true });
    addIds(ids, false);
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
    const { error: err } = await sendNewsletterTest(subject.trim(), html, testEmail.trim(), fromPersona);
    setSendingTest(false);
    if (err) setError(err);
  }

  async function handleSend() {
    if (!subject.trim() || !html.trim() || selectedIds.size === 0) return;
    // The "confirm before mailing someone who opted out" friction only
    // makes sense for the newsletter persona — a one-off "info" message
    // (e.g. reaching out to a churned account) isn't the newsletter the
    // person unsubscribed from, so it always goes out regardless.
    const requiresConfirmation = fromPersona === 'newsletter';
    if (requiresConfirmation && includesUnsubscribed && !confirmUnsubscribed) {
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
      includeUnsubscribed: fromPersona === 'info' || (includesUnsubscribed && confirmUnsubscribed),
      fromPersona,
    });
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setResult({ sent, skipped, total });
    if (showHistory) loadHistory();
  }

  const canSend =
    subject.trim().length > 0 &&
    html.trim().length > 0 &&
    selectedIds.size > 0 &&
    (fromPersona === 'info' || !includesUnsubscribed || confirmUnsubscribed);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>E-mails</Text>
        </View>
        <Text style={styles.hint}>
          Envoyez un e-mail ciblé à vos clients — newsletter, grandes nouveautés, ou un mot ponctuel à quelques comptes précis (ex. ceux qui ont
          résilié). Le HTML collé ci-dessous est envoyé tel quel.
        </Text>

        {error ? <AdminErrorBanner message={error} /> : null}

        <Text style={styles.filterLabel}>Envoyer depuis</Text>
        <View style={styles.personaRow}>
          {PERSONAS.map((p) => {
            const active = fromPersona === p.key;
            return (
              <Pressable key={p.key} onPress={() => setFromPersona(p.key)} style={[styles.personaChip, active && styles.personaChipActive]}>
                <Text style={[styles.personaChipText, active && styles.personaChipTextActive]}>{p.label}</Text>
                <Text style={[styles.personaChipSub, active && styles.personaChipSubActive]}>{p.from}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>Les réponses arrivent toujours sur info@cantia.ch.</Text>

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

        <Text style={styles.filterLabel}>Par abonnement newsletter / plan</Text>
        <View style={styles.filterRow}>
          <FilterChip
            label={`Tous les abonnés${subscribedCount != null ? ` (${subscribedCount})` : ''}`}
            busy={filterBusy === 'all'}
            onPress={() => handlePlanFilter('all', undefined, true)}
          />
          {PLAN_FILTERS.map((p) => (
            <FilterChip key={p.id} label={p.label} busy={filterBusy === p.id} onPress={() => handlePlanFilter(p.id, [p.id], true)} />
          ))}
          <FilterChip
            label="Non-abonnés"
            warning
            busy={filterBusy === 'unsub'}
            onPress={() => handlePlanFilter('unsub', undefined, false)}
          />
        </View>

        <Text style={styles.filterLabel}>Par situation d'abonnement (au propriétaire de l'entreprise)</Text>
        <View style={styles.filterRow}>
          {ORG_STATUS_FILTERS.map((f) => (
            <FilterChip key={f.status} label={f.label} busy={filterBusy === f.status} onPress={() => handleOrgStatusFilter(f.status)} />
          ))}
        </View>

        <View style={styles.pickerBox}>
          <Field label="Rechercher pour ajouter individuellement" placeholder="Nom, e-mail ou entreprise…" value={search} onChangeText={setSearch} />
          {loadingUsers ? (
            <Text style={styles.hint}>Chargement…</Text>
          ) : (
            <ScrollView style={styles.userList} contentContainerStyle={styles.userListContent} nestedScrollEnabled>
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
            </ScrollView>
          )}
        </View>

        {includesUnsubscribed && fromPersona === 'newsletter' ? (
          <Pressable style={styles.confirmRow} onPress={() => setConfirmUnsubscribed((v) => !v)}>
            <View style={[styles.checkbox, confirmUnsubscribed && styles.checkboxCheckedWarning]}>
              {confirmUnsubscribed ? <Feather name="check" size={12} color="#fff" /> : null}
            </View>
            <Text style={styles.confirmText}>
              La sélection inclut des personnes désabonnées de la newsletter — je confirme vouloir quand même leur envoyer cet e-mail (cas
              exceptionnel, ex. fermeture de la plateforme).
            </Text>
          </Pressable>
        ) : includesUnsubscribed && fromPersona === 'info' ? (
          <View style={styles.infoUnsubNote}>
            <Feather name="info" size={13} color={colors.textMuted} />
            <Text style={styles.infoUnsubNoteText}>
              La sélection inclut des personnes désabonnées de la newsletter — ça n'a pas d'importance pour un envoi Info, elles le recevront quand
              même.
            </Text>
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

        <Button
          title={`Envoyer à ${selectedIds.size} destinataire${selectedIds.size > 1 ? 's' : ''}`}
          onPress={handleSend}
          loading={sending}
          disabled={!canSend}
          style={{ marginTop: spacing.md }}
        />

        <Pressable style={styles.historyToggle} onPress={toggleHistory}>
          <Text style={styles.historyToggleText}>{showHistory ? 'Masquer l’historique' : 'Voir l’historique des envois'}</Text>
          <Feather name={showHistory ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
        </Pressable>

        {showHistory ? (
          historyLoading ? (
            <Text style={styles.hint}>Chargement…</Text>
          ) : history.length === 0 ? (
            <Text style={styles.hint}>Aucun envoi pour le moment.</Text>
          ) : (
            <View style={styles.historyList}>
              {history.map((c) => (
                <View key={c.id} style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historySubject} numberOfLines={1}>
                      {c.subject}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {formatDateTime(c.created_at)} · depuis {c.from_persona === 'info' ? 'info@cantia.ch' : 'newsletter@cantia.ch'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.historyCount}>{c.sent_count} envoyé{c.sent_count > 1 ? 's' : ''}</Text>
                    {c.skipped_count > 0 ? <Text style={styles.historyMeta}>{c.skipped_count} ignoré{c.skipped_count > 1 ? 's' : ''}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )
        ) : null}
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
  personaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  personaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 160,
  },
  personaChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  personaChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  personaChipTextActive: {
    color: colors.primary,
  },
  personaChipSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  personaChipSubActive: {
    color: colors.primary,
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
    marginTop: spacing.sm,
    maxHeight: 340,
  },
  userListContent: {
    gap: spacing.xs,
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
  infoUnsubNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoUnsubNoteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
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
  historyToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  historyToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  historyList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  historySubject: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  historyMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  historyCount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.success,
  },
});
