import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { generateEmail, translateEmail, type AiEmail } from '../lib/api/newsletterAi';
import { useAuth } from '../lib/auth-context';
import { useDictation } from '../lib/useDictation';
import { extractPreheader } from './AdminEmailPreview';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Super Admin › E-mails: « Rédiger avec Claude ». A brief becomes the FR
// e-mail in Cantia's colours, then DE/IT versions if asked; a second box
// revises the current e-mail. The result fills the composer fields, so the
// admin can still edit the HTML by hand before sending. Brief and revision
// can be dictated (lib/useDictation: recording + server transcription,
// counted on the admin's own company AI quota).

const KINDS: { id: string; label: string }[] = [
  { id: 'nouveaute', label: 'Nouveauté' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'relance', label: 'Relance' },
  { id: 'conseil', label: 'Conseil métier' },
  { id: 'annonce', label: 'Annonce' },
  { id: 'bienvenue', label: 'Bienvenue' },
];
const TONES: { id: string; label: string }[] = [
  { id: 'chaleureux', label: 'Chaleureux' },
  { id: 'pro', label: 'Professionnel' },
  { id: 'direct', label: 'Direct' },
  { id: 'enthousiaste', label: 'Enthousiaste' },
];

export interface StudioResult {
  lang: 'fr' | 'de' | 'it';
  subject: string;
  html: string;
}

export function AdminEmailStudio({
  audience,
  current,
  onResult,
}: {
  audience: string | null;
  current: { subject: string; html: string };
  onResult: (r: StudioResult) => void;
}) {
  const [open, setOpen] = useState(true);
  const [brief, setBrief] = useState('');
  const [kind, setKind] = useState('nouveaute');
  const [tone, setTone] = useState('chaleureux');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [langs, setLangs] = useState<{ de: boolean; it: boolean }>({ de: false, it: false });
  const [revision, setRevision] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const { organization } = useAuth();
  // Which field the current recording fills.
  const [dictTarget, setDictTarget] = useState<'brief' | 'revision' | null>(null);
  const dictation = useDictation((text) => {
    const t = text.trim();
    if (!t) return;
    if (dictTarget === 'revision') setRevision((prev) => (prev.trim() ? `${prev.trim()} ${t}` : t));
    else setBrief((prev) => (prev.trim() ? `${prev.trim()}\n${t}` : t));
  });

  async function toggleDictation(target: 'brief' | 'revision') {
    setError(null);
    if (dictation.listening) {
      await dictation.stop();
      setDictTarget(null);
      return;
    }
    if (!organization) {
      setError('La dictée a besoin d’une entreprise liée à votre compte.');
      return;
    }
    setDictTarget(target);
    const ok = await dictation.start('fr-FR');
    if (!ok) {
      setDictTarget(null);
      setError('Micro refusé : autorisez le micro dans le navigateur.');
    }
  }

  async function translateAll(fr: AiEmail) {
    const wanted = (['de', 'it'] as const).filter((l) => langs[l]);
    if (!wanted.length) return;
    setBusy(`Traduction ${wanted.map((l) => l.toUpperCase()).join(' et ')}…`);
    const results = await Promise.all(wanted.map((lang) => translateEmail({ lang, subject: fr.subject, preheader: fr.preheader, html: fr.html }).then((r) => ({ lang, ...r }))));
    const failed: string[] = [];
    for (const r of results) {
      if (r.email) onResult({ lang: r.lang, subject: r.email.subject, html: r.email.html });
      else failed.push(`${r.lang.toUpperCase()} : ${r.error}`);
    }
    if (failed.length) setError(`Traduction incomplète. ${failed.join(' · ')}`);
  }

  async function generate() {
    setError(null);
    setNotes(null);
    setBusy('Claude écrit l’e-mail… (environ une minute)');
    const { email, error: err } = await generateEmail({ brief, kind, tone, audience, ctaLabel, ctaUrl });
    if (!email) {
      setBusy(null);
      setError(err ?? 'Échec de la génération.');
      return;
    }
    onResult({ lang: 'fr', subject: email.subject, html: email.html });
    setNotes(email.notes ?? null);
    await translateAll(email);
    setBusy(null);
  }

  async function revise() {
    if (!current.html.trim() || !revision.trim()) return;
    setError(null);
    setBusy('Claude modifie l’e-mail…');
    const { email, error: err } = await generateEmail({
      brief,
      kind,
      tone,
      audience,
      ctaLabel,
      ctaUrl,
      previousHtml: current.html,
      subject: current.subject,
      preheader: extractPreheader(current.html),
      revision,
    });
    if (!email) {
      setBusy(null);
      setError(err ?? 'Échec de la modification.');
      return;
    }
    onResult({ lang: 'fr', subject: email.subject, html: email.html });
    setNotes(email.notes ?? null);
    setRevision('');
    await translateAll(email);
    setBusy(null);
  }

  async function translateCurrent() {
    if (!current.html.trim()) return;
    setError(null);
    await translateAll({ subject: current.subject, preheader: extractPreheader(current.html), html: current.html });
    setBusy(null);
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.head}>
        <View style={styles.spark}>
          <Feather name="zap" size={14} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Rédiger avec Claude</Text>
          <Text style={styles.hint}>Décrivez le message : Claude écrit l’e-mail aux couleurs de Cantia, avec les variables, et le traduit si besoin.</Text>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </Pressable>

      {open ? (
        <>
          <View style={styles.briefHead}>
            <Text style={styles.label}>Brief</Text>
            <MicButton
              listening={dictation.listening && dictTarget === 'brief'}
              transcribing={dictation.transcribing && dictTarget === 'brief'}
              disabled={!!busy || (dictation.listening && dictTarget !== 'brief')}
              onPress={() => toggleDictation('brief')}
            />
          </View>
          <TextInput
            value={brief}
            onChangeText={setBrief}
            multiline
            placeholder="Écrivez ou dictez. Ex. : annoncer « Remplir une soumission » (bêta) aux entreprises du bâtiment : importer le PDF de l’architecte, mettre ses prix, ressortir le PDF rempli. 1 à l’essai avec Essentiel, 3 par mois avec Équipe, illimité avec Entreprise."
            placeholderTextColor={colors.textMuted}
            style={styles.brief}
          />
          {audience ? (
            <Text style={styles.hint}>
              Claude écrira pour : <Text style={{ fontWeight: '700', color: colors.text }}>{audience}</Text>
            </Text>
          ) : (
            <Text style={styles.hint}>Astuce : choisissez d’abord les destinataires dans « Ciblage », Claude adaptera le message à leur métier.</Text>
          )}

          <Row label="Type">
            {KINDS.map((k) => (
              <Chip key={k.id} label={k.label} on={kind === k.id} onPress={() => setKind(k.id)} />
            ))}
          </Row>
          <Row label="Ton">
            {TONES.map((t) => (
              <Chip key={t.id} label={t.label} on={tone === t.id} onPress={() => setTone(t.id)} />
            ))}
          </Row>
          <View style={styles.ctaRow}>
            <TextInput value={ctaLabel} onChangeText={setCtaLabel} placeholder="Texte du bouton (optionnel)" placeholderTextColor={colors.textMuted} style={[styles.input, { flex: 1, minWidth: 180 }]} />
            <TextInput
              value={ctaUrl}
              onChangeText={setCtaUrl}
              autoCapitalize="none"
              placeholder="Lien du bouton (par défaut app.cantia.ch)"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { flex: 2, minWidth: 220 }]}
            />
          </View>
          <Row label="Traduire aussi">
            <Chip label="Deutsch" on={langs.de} onPress={() => setLangs((p) => ({ ...p, de: !p.de }))} />
            <Chip label="Italiano" on={langs.it} onPress={() => setLangs((p) => ({ ...p, it: !p.it }))} />
          </Row>

          <View style={styles.actions}>
            <Pressable onPress={generate} disabled={!!busy || !brief.trim()} style={[styles.btn, (!!busy || !brief.trim()) && { opacity: 0.5 }]}>
              <Feather name="zap" size={14} color="#fff" />
              <Text style={styles.btnText}>{current.html.trim() ? 'Générer un nouvel e-mail' : 'Générer l’e-mail'}</Text>
            </Pressable>
            {current.html.trim() && (langs.de || langs.it) ? (
              <Pressable onPress={translateCurrent} disabled={!!busy} style={[styles.btnGhost, !!busy && { opacity: 0.5 }]}>
                <Text style={styles.btnGhostText}>Traduire l’e-mail actuel</Text>
              </Pressable>
            ) : null}
          </View>

          {current.html.trim() ? (
            <View style={styles.reviseBox}>
              <Text style={styles.label}>Modifier l’e-mail actuel</Text>
              <View style={styles.ctaRow}>
                <TextInput
                  value={revision}
                  onChangeText={setRevision}
                  placeholder="Ex. : plus court, ajoute un paragraphe sur le prix, bouton « Essayer la soumission »…"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { flex: 1, minWidth: 240 }]}
                  onSubmitEditing={revise}
                />
                <MicButton
                  compact
                  listening={dictation.listening && dictTarget === 'revision'}
                  transcribing={dictation.transcribing && dictTarget === 'revision'}
                  disabled={!!busy || (dictation.listening && dictTarget !== 'revision')}
                  onPress={() => toggleDictation('revision')}
                />
                <Pressable onPress={revise} disabled={!!busy || !revision.trim()} style={[styles.btnGhost, (!!busy || !revision.trim()) && { opacity: 0.5 }]}>
                  <Text style={styles.btnGhostText}>Appliquer</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {busy ? (
            <View style={styles.status}>
              <Feather name="loader" size={14} color={colors.primary} />
              <Text style={styles.statusText}>{busy}</Text>
            </View>
          ) : null}
          {error ? <Text style={[styles.hint, { color: colors.danger }]}>{error}</Text> : null}
          {notes && !busy ? (
            <View style={styles.notes}>
              <Feather name="info" size={13} color={colors.textMuted} />
              <Text style={[styles.hint, { flex: 1 }]}>{notes}</Text>
            </View>
          ) : null}
          <Text style={styles.hint}>Relisez toujours avant d’envoyer : Claude ne connaît que le brief et la fiche produit de cantia.ch.</Text>
        </>
      ) : null}
    </View>
  );
}

function MicButton({
  listening,
  transcribing,
  disabled,
  onPress,
  compact,
}: {
  listening: boolean;
  transcribing: boolean;
  disabled?: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const label = listening ? 'Arrêter et transcrire' : transcribing ? 'Transcription…' : 'Dicter';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || transcribing}
      accessibilityLabel={label}
      style={[styles.mic, listening && styles.micOn, (disabled || transcribing) && !listening && { opacity: 0.5 }]}
    >
      <Feather name={listening ? 'square' : transcribing ? 'loader' : 'mic'} size={14} color={listening ? '#fff' : colors.primary} />
      {compact ? null : <Text style={[styles.micText, listening && { color: '#fff' }]}>{label}</Text>}
    </Pressable>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && { color: colors.primary, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spark: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  label: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  brief: { minHeight: 96, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.bg, textAlignVertical: 'top' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 9, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.xs, color: colors.text },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '800', fontSize: fontSize.sm },
  btnGhost: { paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary },
  btnGhostText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.xs },
  reviseBox: { gap: 6, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  statusText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  notes: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  briefHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: -4 },
  mic: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  micOn: { backgroundColor: colors.danger, borderColor: colors.danger },
  micText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.primary },
});
