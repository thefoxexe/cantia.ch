import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { connectCalendar, disconnectCalendar, listMyCalendars, syncCalendars, type CalendarConnection, type CalendarProvider } from '../../lib/api/calendars';
import { getAppLocale } from '../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// « Mes agendas »: each person links their own Google and/or Outlook
// calendar to their planning, both ways.

const COPY = {
  fr: {
    title: 'Mes agendas',
    intro: 'Reliez votre agenda Google ou Outlook à votre planning Cantia : ce que vous planifiez ici y apparaît, et vos rendez-vous de l’agenda arrivent dans votre planning (en privé : vos collègues voient seulement « Rendez-vous privé »).',
    connect: 'Connecter',
    disconnect: 'Déconnecter',
    syncNow: 'Synchroniser',
    synced: 'Synchronisé',
    never: 'Pas encore synchronisé',
    error: 'Erreur',
    when: 'La synchronisation se fait à l’ouverture du planning et à chaque modification.',
    disconnectHint: 'En déconnectant, les rendez-vous importés de cet agenda disparaissent du planning ; ce que Cantia a écrit dans l’agenda y reste.',
  },
  de: {
    title: 'Meine Kalender',
    intro: 'Verbinden Sie Ihren Google- oder Outlook-Kalender mit Ihrer Cantia-Planung: Was Sie hier planen, erscheint dort, und Ihre Termine kommen in Ihre Planung (privat: Kollegen sehen nur « Privater Termin »).',
    connect: 'Verbinden',
    disconnect: 'Trennen',
    syncNow: 'Synchronisieren',
    synced: 'Synchronisiert',
    never: 'Noch nicht synchronisiert',
    error: 'Fehler',
    when: 'Die Synchronisierung erfolgt beim Öffnen der Planung und bei jeder Änderung.',
    disconnectHint: 'Beim Trennen verschwinden die importierten Termine aus der Planung; was Cantia in den Kalender geschrieben hat, bleibt dort.',
  },
  it: {
    title: 'I miei calendari',
    intro: 'Collegate il vostro calendario Google o Outlook alla pianificazione Cantia: ciò che pianificate qui vi appare, e i vostri appuntamenti arrivano nella pianificazione (in privato: i colleghi vedono solo « Appuntamento privato »).',
    connect: 'Collegare',
    disconnect: 'Scollegare',
    syncNow: 'Sincronizzare',
    synced: 'Sincronizzato',
    never: 'Non ancora sincronizzato',
    error: 'Errore',
    when: 'La sincronizzazione avviene all’apertura della pianificazione e a ogni modifica.',
    disconnectHint: 'Scollegando, gli appuntamenti importati spariscono dalla pianificazione; ciò che Cantia ha scritto nel calendario vi resta.',
  },
};

const PROVIDERS: { key: CalendarProvider; name: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'google', name: 'Google Agenda', icon: 'calendar' },
  { key: 'microsoft', name: 'Outlook / Microsoft 365', icon: 'calendar' },
];

export function CalendarSheet({ organizationId, userId, onClose, onSynced }: { organizationId: string; userId: string; onClose: () => void; onSynced: () => void }) {
  const c = COPY[getAppLocale()] ?? COPY.fr;
  const [list, setList] = useState<CalendarConnection[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => listMyCalendars(organizationId, userId).then(setList);
  useEffect(() => {
    reload();
  }, [organizationId, userId]);

  const day = (iso: string) => new Date(iso).toLocaleString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title}>{c.title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: spacing.md }}>
            <Text style={styles.intro}>{c.intro}</Text>
            {list === null ? <ActivityIndicator color={colors.primary} /> : null}
            {list !== null
              ? PROVIDERS.map((p) => {
                  const conn = list.find((x) => x.provider === p.key);
                  return (
                    <View key={p.key} style={styles.row}>
                      <View style={styles.icon}>
                        <Feather name={p.icon} size={18} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.name}>{p.name}</Text>
                        {conn ? (
                          <Text style={[styles.meta, conn.status === 'error' && { color: colors.danger }]} numberOfLines={2}>
                            {[conn.account_email, conn.status === 'error' ? `${c.error} : ${conn.last_error ?? ''}` : conn.last_synced_at ? `${c.synced} ${day(conn.last_synced_at)}` : c.never].filter(Boolean).join(' · ')}
                          </Text>
                        ) : null}
                      </View>
                      {busy === p.key ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : conn ? (
                        <Pressable
                          onPress={async () => {
                            setBusy(p.key);
                            setError(await disconnectCalendar(conn.id));
                            await reload();
                            setBusy(null);
                            onSynced();
                          }}
                          style={styles.ghost}
                        >
                          <Text style={styles.ghostText}>{c.disconnect}</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={async () => {
                            setBusy(p.key);
                            const err = await connectCalendar(organizationId, p.key);
                            if (err) {
                              setError(err);
                              setBusy(null);
                            }
                          }}
                          style={styles.primary}
                        >
                          <Text style={styles.primaryText}>{c.connect}</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })
              : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {list?.length ? (
              <Pressable
                onPress={async () => {
                  setBusy('sync');
                  await syncCalendars(organizationId);
                  await reload();
                  setBusy(null);
                  onSynced();
                }}
                style={[styles.ghost, { alignSelf: 'flex-start' }]}
              >
                <Text style={styles.ghostText}>{busy === 'sync' ? '…' : c.syncNow}</Text>
              </Pressable>
            ) : null}
            <Text style={styles.hint}>{c.when}</Text>
            <Text style={styles.hint}>{c.disconnectHint}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,20,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 520, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  intro: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  icon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  primary: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: fontSize.sm },
  ghost: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md },
  ghostText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
  error: { color: colors.danger, fontSize: fontSize.sm },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
});
