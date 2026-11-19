import { createElement, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AdminCard, AdminEmpty, AdminSection, Badge, type Tone } from './kit';
import { getOrgEmail, getOrgEmails, type OrgEmail, type OrgEmails } from '../../lib/api/admin';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Super Admin › fiche entreprise › E-mails: every e-mail Cantia sent to the
// company's members (from Resend) and what is still scheduled for it
// (supabase/functions/admin-org-emails).

const STATUS: Record<string, { label: string; tone: Tone }> = {
  delivered: { label: 'Délivré', tone: 'success' },
  opened: { label: 'Ouvert', tone: 'success' },
  clicked: { label: 'Cliqué', tone: 'success' },
  sent: { label: 'Envoyé', tone: 'neutral' },
  queued: { label: 'En file', tone: 'neutral' },
  scheduled: { label: 'Programmé', tone: 'info' },
  delivery_delayed: { label: 'Retardé', tone: 'warning' },
  bounced: { label: 'Rejeté', tone: 'danger' },
  complained: { label: 'Signalé spam', tone: 'danger' },
  failed: { label: 'Échec', tone: 'danger' },
  canceled: { label: 'Annulé', tone: 'neutral' },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });

function relative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const h = Math.round(abs / 3600000);
  const d = Math.round(abs / 86400000);
  const span = h < 1 ? 'moins d’une heure' : h < 36 ? `${h} h` : `${d} jours`;
  return diff >= 0 ? `dans ${span}` : `il y a ${span}`;
}

const senderName = (from: string) => (from.match(/^\s*"?([^"<]+?)"?\s*</)?.[1] ?? from).trim();

export function OrgEmailsPanel({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState<OrgEmails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<OrgEmail | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getOrgEmails(organizationId).then(({ data: d, error: e }) => {
      if (!alive) return;
      setData(d);
      setError(e);
    });
    return () => {
      alive = false;
    };
  }, [organizationId]);

  async function show(id: string) {
    setOpenId(id);
    setOpen(null);
    const { data: e } = await getOrgEmail(id);
    setOpen(e);
  }

  if (!data && !error) {
    return (
      <AdminCard>
        <View style={{ alignItems: 'center', padding: spacing.xl, gap: spacing.sm }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}>Lecture de l’historique Resend…</Text>
        </View>
      </AdminCard>
    );
  }
  if (!data) {
    return (
      <AdminCard>
        <AdminEmpty icon="mail" title="Historique indisponible" text={error ?? undefined} />
      </AdminCard>
    );
  }

  // Sends recorded in the database but no longer listed by Resend.
  const missing = data.markers.filter((m) => !data.sent.some((s) => Math.abs(new Date(s.created_at).getTime() - new Date(m.at).getTime()) < 10 * 60000));

  return (
    <View style={{ gap: spacing.lg }}>
      <AdminSection title="Programmé" subtitle="Ce qui partira automatiquement, d’après les règles des envois automatiques.">
        <AdminCard padded={false}>
          {data.scheduled.length === 0 ? (
            <AdminEmpty icon="clock" title="Rien de programmé pour cette entreprise" />
          ) : (
            data.scheduled.map((s, i) => (
              <View key={`${s.kind}-${s.at}`} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={[styles.icon, { backgroundColor: colors.slateSoft }]}>
                  <Feather name="clock" size={15} color={colors.slate} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={styles.title}>{s.label}</Text>
                  {s.detail ? <Text style={styles.muted}>{s.detail}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={styles.when}>{relative(s.at)}</Text>
                  <Text style={styles.muted}>{fmt(s.at)}</Text>
                </View>
              </View>
            ))
          )}
        </AdminCard>
      </AdminSection>

      <AdminSection title="Envoyé" subtitle={`Tous les e-mails envoyés par Cantia à ${data.addresses.length > 1 ? 'ses membres' : 'cette entreprise'}, via Resend.`}>
        {data.resend_error ? <Text style={[styles.muted, { color: colors.danger }]}>Resend : {data.resend_error}</Text> : null}
        <AdminCard padded={false}>
          {data.sent.length === 0 && missing.length === 0 ? (
            <AdminEmpty icon="mail" title="Aucun e-mail envoyé pour l’instant" />
          ) : (
            <>
              {data.sent.map((e, i) => {
                const st = STATUS[e.last_event ?? 'sent'] ?? { label: e.last_event ?? 'Envoyé', tone: 'neutral' as Tone };
                return (
                  <Pressable key={e.id} onPress={() => show(e.id)} style={({ hovered }: any) => [styles.row, i > 0 && styles.rowBorder, hovered && { backgroundColor: colors.surfaceAlt }]}>
                    <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                      <Feather name="send" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text style={styles.title} numberOfLines={1}>
                        {e.subject}
                      </Text>
                      <Text style={styles.muted} numberOfLines={1}>
                        {senderName(e.from)} → {e.to.join(', ')}
                      </Text>
                    </View>
                    <Badge label={st.label} tone={st.tone} />
                    <Text style={[styles.muted, { width: 120, textAlign: 'right' }]}>{fmt(e.created_at)}</Text>
                    <Feather name="chevron-right" size={15} color={colors.textMuted} />
                  </Pressable>
                );
              })}
              {missing.map((m) => (
                <View key={`${m.kind}-${m.at}`} style={[styles.row, styles.rowBorder]}>
                  <View style={[styles.icon, { backgroundColor: colors.surfaceAlt }]}>
                    <Feather name="check" size={14} color={colors.textMuted} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.title}>{m.label}</Text>
                    <Text style={styles.muted}>Enregistré par Cantia, plus listé par Resend.</Text>
                  </View>
                  <Text style={[styles.muted, { width: 120, textAlign: 'right' }]}>{fmt(m.at)}</Text>
                </View>
              ))}
            </>
          )}
        </AdminCard>
      </AdminSection>

      <Modal visible={!!openId} transparent animationType="fade" onRequestClose={() => setOpenId(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpenId(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHead}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {open?.subject ?? 'Chargement…'}
                </Text>
                {open ? (
                  <Text style={styles.muted} numberOfLines={1}>
                    {open.from} → {(Array.isArray(open.to) ? open.to : [open.to]).join(', ')} · {fmt(open.created_at)}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={() => setOpenId(null)} hitSlop={8} style={styles.close}>
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>
            {!open ? (
              <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} />
            ) : open.html && Platform.OS === 'web' ? (
              createElement('iframe', { srcDoc: open.html, sandbox: '', title: open.subject, style: { border: 0, width: '100%', flex: 1, minHeight: 420, background: '#fff', borderRadius: 8 } })
            ) : (
              <ScrollView style={{ flex: 1 }}>
                <Text style={styles.body}>{open.text ?? '—'}</Text>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  when: { fontSize: fontSize.sm, fontWeight: '700', color: colors.slate },
  muted: { fontSize: fontSize.xs, color: colors.textMuted },
  body: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,22,18,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 760, height: '86%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  close: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
});
