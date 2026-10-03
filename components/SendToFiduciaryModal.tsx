import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from './ui';
import { listActiveFirms, shareWithFiduciary, type ActiveFirm, type ShareFile, type SharedDocKind } from '../lib/api/fiduciaryShare';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// « Envoyer au fiduciaire » dialog. Works only when the company has a
// fiduciary with ACTIVE access on Cantia; otherwise it explains how to
// connect one (Paramètres › Fiduciaire).

const COPY = {
  fr: {
    title: 'Envoyer au fiduciaire',
    loading: 'Recherche de votre fiduciaire…',
    noneTitle: 'Aucun fiduciaire connecté',
    noneText: 'Invitez votre fiduciaire sur Cantia : il recevra vos documents directement, sans e-mail ni pièce jointe. C’est gratuit pour lui.',
    connect: 'Connecter mon fiduciaire',
    to: 'Destinataire',
    docTitle: 'Titre du document',
    message: 'Message (facultatif)',
    messagePh: 'Ex. : facture payée en espèces, à comptabiliser en septembre',
    file: 'Fichier',
    pick: 'Choisir un fichier',
    change: 'Changer',
    preparing: 'Préparation du document…',
    cancel: 'Annuler',
    send: 'Envoyer',
    sent: (firm: string) => `Envoyé à ${firm}. Votre fiduciaire est prévenu par e-mail.`,
    close: 'Fermer',
    unavailable: 'L’envoi au fiduciaire sera disponible dans quelques instants (mise à jour en cours).',
    adminOnly: 'Seuls les propriétaires et administrateurs de l’entreprise peuvent envoyer des documents au fiduciaire.',
    needFile: 'Ajoutez un fichier.',
    receipt: 'Envoyer un justificatif au fiduciaire',
    sentTitle: 'Documents envoyés au fiduciaire',
    sendDoc: 'Envoyer un document',
    sentNone: 'Aucun document envoyé pour l’instant.',
    seen: 'Consulté',
    notSeen: 'Pas encore consulté',
    withdraw: 'Retirer',
  },
  de: {
    title: 'An die Treuhand senden',
    loading: 'Ihre Treuhand wird gesucht…',
    noneTitle: 'Keine Treuhand verbunden',
    noneText: 'Laden Sie Ihre Treuhand zu Cantia ein: Sie erhält Ihre Dokumente direkt, ohne E-Mail oder Anhang. Für sie kostenlos.',
    connect: 'Meine Treuhand verbinden',
    to: 'Empfänger',
    docTitle: 'Titel des Dokuments',
    message: 'Nachricht (optional)',
    messagePh: 'z. B.: Rechnung bar bezahlt, im September zu verbuchen',
    file: 'Datei',
    pick: 'Datei wählen',
    change: 'Ändern',
    preparing: 'Dokument wird vorbereitet…',
    cancel: 'Abbrechen',
    send: 'Senden',
    sent: (firm: string) => `An ${firm} gesendet. Ihre Treuhand wird per E-Mail informiert.`,
    close: 'Schliessen',
    unavailable: 'Das Senden an die Treuhand ist in Kürze verfügbar (Aktualisierung läuft).',
    adminOnly: 'Nur Inhaber und Administratoren des Unternehmens können Dokumente an die Treuhand senden.',
    needFile: 'Fügen Sie eine Datei hinzu.',
    receipt: 'Beleg an die Treuhand senden',
    sentTitle: 'An die Treuhand gesendete Dokumente',
    sendDoc: 'Dokument senden',
    sentNone: 'Noch keine Dokumente gesendet.',
    seen: 'Angesehen',
    notSeen: 'Noch nicht angesehen',
    withdraw: 'Zurückziehen',
  },
  it: {
    title: 'Inviare al fiduciario',
    loading: 'Ricerca del suo fiduciario…',
    noneTitle: 'Nessun fiduciario collegato',
    noneText: 'Inviti il suo fiduciario su Cantia: riceverà i documenti direttamente, senza e-mail né allegati. Per lui è gratuito.',
    connect: 'Collegare il mio fiduciario',
    to: 'Destinatario',
    docTitle: 'Titolo del documento',
    message: 'Messaggio (facoltativo)',
    messagePh: 'Es.: fattura pagata in contanti, da registrare a settembre',
    file: 'File',
    pick: 'Scegliere un file',
    change: 'Cambiare',
    preparing: 'Preparazione del documento…',
    cancel: 'Annullare',
    send: 'Inviare',
    sent: (firm: string) => `Inviato a ${firm}. Il suo fiduciario è avvisato per e-mail.`,
    close: 'Chiudere',
    unavailable: 'L’invio al fiduciario sarà disponibile tra poco (aggiornamento in corso).',
    adminOnly: 'Solo i proprietari e gli amministratori dell’impresa possono inviare documenti al fiduciario.',
    needFile: 'Aggiunga un file.',
    receipt: 'Inviare un giustificativo al fiduciario',
    sentTitle: 'Documenti inviati al fiduciario',
    sendDoc: 'Inviare un documento',
    sentNone: 'Nessun documento inviato per ora.',
    seen: 'Consultato',
    notSeen: 'Non ancora consultato',
    withdraw: 'Ritirare',
  },
};

export function fiduciaryShareCopy() {
  return COPY[getAppLocale()] ?? COPY.fr;
}

export function sendToFiduciaryLabel(): string {
  return fiduciaryShareCopy().title;
}

export function SendToFiduciaryModal({
  visible,
  onClose,
  onSent,
  orgId,
  kind,
  title: initialTitle,
  amountChf,
  docDate,
  sourceTable,
  sourceId,
  getFile,
  pickFile,
}: {
  visible: boolean;
  onClose: () => void;
  onSent?: () => void;
  orgId: string;
  kind: SharedDocKind;
  title: string;
  amountChf?: number | null;
  docDate?: string | null;
  sourceTable?: string | null;
  sourceId?: string | null;
  // Produces the file to attach (e.g. generates the invoice PDF). Called on send.
  getFile?: () => Promise<{ file: ShareFile | null; error: string | null }>;
  // The user picks the file in the dialog (free upload).
  pickFile?: boolean;
}) {
  const router = useRouter();
  const c = COPY[getAppLocale()] ?? COPY.fr;
  const [firms, setFirms] = useState<ActiveFirm[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [firmId, setFirmId] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState('');
  const [picked, setPicked] = useState<ShareFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(initialTitle);
    setMessage('');
    setPicked(null);
    setError(null);
    setDone(null);
    setFirms(null);
    setLoadError(null);
    listActiveFirms(orgId).then(({ firms: list, error: e }) => {
      setFirms(list);
      setLoadError(e);
      setFirmId(list[0]?.id ?? null);
    });
  }, [visible, orgId, initialTitle]);

  async function choose() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const a = result.assets[0];
    setPicked({ uri: a.uri, name: a.name, mimeType: a.mimeType ?? null });
    if (!title.trim()) setTitle(a.name.replace(/\.[^.]+$/, ''));
  }

  async function send() {
    if (!firmId || !title.trim()) return;
    if (pickFile && !picked) return setError(c.needFile);
    setBusy(true);
    setError(null);
    let file: ShareFile | null = picked;
    if (getFile) {
      const res = await getFile();
      if (res.error) {
        setBusy(false);
        return setError(res.error);
      }
      file = res.file;
    }
    const { error: e } = await shareWithFiduciary({ orgId, firmId, kind, title, file, amountChf, docDate, message, sourceTable, sourceId });
    setBusy(false);
    if (e) return setError(e === 'unavailable' ? c.unavailable : e);
    setDone(c.sent(firms?.find((f) => f.id === firmId)?.name ?? ''));
    onSent?.();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.head}>
            <Feather name="send" size={18} color={colors.primary} />
            <Text style={styles.title}>{c.title}</Text>
          </View>

          {firms === null ? (
            <View style={styles.row}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.muted}>{c.loading}</Text>
            </View>
          ) : done ? (
            <>
              <View style={styles.success}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={[styles.body, { flex: 1 }]}>{done}</Text>
              </View>
              <View style={styles.actions}>
                <Button title={c.close} onPress={onClose} style={{ flex: 1 }} />
              </View>
            </>
          ) : !firms.length ? (
            <>
              <Text style={styles.subtitle}>{c.noneTitle}</Text>
              <Text style={styles.muted}>{loadError ? c.adminOnly : c.noneText}</Text>
              <View style={styles.actions}>
                <Button title={c.cancel} variant="secondary" onPress={onClose} style={{ flex: 1 }} />
                {!loadError ? (
                  <Button
                    title={c.connect}
                    onPress={() => {
                      onClose();
                      router.push('/(app)/compte/fiduciaire' as any);
                    }}
                    style={{ flex: 1 }}
                  />
                ) : null}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>{c.to}</Text>
              <View style={styles.chips}>
                {firms.map((f) => (
                  <Pressable key={f.id} onPress={() => setFirmId(f.id)} style={[styles.chip, firmId === f.id && styles.chipOn]}>
                    <Feather name="briefcase" size={13} color={firmId === f.id ? '#fff' : colors.text} />
                    <Text style={[styles.chipText, firmId === f.id && styles.chipTextOn]}>{f.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>{c.docTitle}</Text>
              <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor={colors.textMuted} maxLength={300} />

              {pickFile ? (
                <>
                  <Text style={styles.label}>{c.file}</Text>
                  <Pressable onPress={choose} style={styles.pick}>
                    <Feather name={picked ? 'paperclip' : 'upload'} size={15} color={colors.primary} />
                    <Text style={[styles.body, { flex: 1 }]} numberOfLines={1}>
                      {picked ? picked.name : c.pick}
                    </Text>
                    {picked ? <Text style={styles.link}>{c.change}</Text> : null}
                  </Pressable>
                </>
              ) : null}

              <Text style={styles.label}>{c.message}</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={c.messagePh}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textarea]}
                multiline
                maxLength={2000}
              />

              {busy && getFile ? <Text style={styles.muted}>{c.preparing}</Text> : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.actions}>
                <Button title={c.cancel} variant="secondary" onPress={onClose} style={{ flex: 1 }} />
                <Button title={c.send} icon="send" onPress={send} loading={busy} disabled={!firmId || !title.trim() || (pickFile && !picked)} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted, marginTop: spacing.xs },
  body: { fontSize: fontSize.md, color: colors.text },
  muted: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  error: { fontSize: fontSize.sm, color: colors.danger },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  success: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  pick: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.md, padding: 12 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
