import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import type { AppLocale } from '../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { marketingFonts } from '../../lib/marketingTheme';

// Email gate in front of a free tool's PDF (lead magnet). The address goes
// to public.blog_leads (anonymous insert-only, read in the admin under
// « Blog & leads ») with source « outil:<slug> ». Remembered in this
// browser: a visitor who already left an address downloads directly, and
// each tool is logged once per browser.

const STORE_EMAIL = 'cantia.lead.email';
const STORE_TOOLS = 'cantia.lead.tools';

const COPY = {
  fr: {
    button: 'Télécharger mon calcul (PDF)',
    title: 'Recevez votre calcul en PDF',
    text: 'Indiquez votre e-mail pour télécharger le récapitulatif.',
    placeholder: 'votre@email.ch',
    submit: 'Télécharger',
    consent: 'Gratuit. Nous vous enverrons à l’occasion des conseils utiles pour gérer votre entreprise ; désinscription en un clic.',
    error: 'Un problème est survenu, réessayez dans un instant.',
    invalid: 'Adresse e-mail invalide.',
  },
  de: {
    button: 'Meine Berechnung herunterladen (PDF)',
    title: 'Erhalten Sie Ihre Berechnung als PDF',
    text: 'Geben Sie Ihre E-Mail-Adresse ein, um die Zusammenfassung herunterzuladen.',
    placeholder: 'ihre@email.ch',
    submit: 'Herunterladen',
    consent: 'Kostenlos. Wir senden Ihnen gelegentlich nützliche Tipps zur Führung Ihres Unternehmens; Abmeldung mit einem Klick.',
    error: 'Ein Problem ist aufgetreten, bitte versuchen Sie es gleich nochmals.',
    invalid: 'Ungültige E-Mail-Adresse.',
  },
  it: {
    button: 'Scaricare il mio calcolo (PDF)',
    title: 'Ricevete il vostro calcolo in PDF',
    text: 'Indicate la vostra e-mail per scaricare il riepilogo.',
    placeholder: 'vostra@email.ch',
    submit: 'Scaricare',
    consent: 'Gratuito. Vi invieremo di tanto in tanto consigli utili per gestire la vostra impresa; disiscrizione con un clic.',
    error: 'Si è verificato un problema, riprovate tra un istante.',
    invalid: 'Indirizzo e-mail non valido.',
  },
};

function read(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  } catch {
    // private mode: the gate simply shows again next time
  }
}

async function logLead(email: string, source: string): Promise<boolean> {
  const tools = (read(STORE_TOOLS) ?? '').split(',').filter(Boolean);
  if (tools.includes(source)) return true;
  const { error } = await supabase.from('blog_leads').insert({ email, source_slug: source });
  if (error) {
    console.error('[lead-gate] insert failed:', error.message);
    return false;
  }
  write(STORE_TOOLS, [...tools, source].join(','));
  return true;
}

export function LeadGate({ source, locale, onUnlock, label }: { source: string; locale: AppLocale; onUnlock: () => void; label?: string }) {
  const c = COPY[locale] ?? COPY.fr;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [bot, setBot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'invalid'>('idle');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  async function start() {
    const known = read(STORE_EMAIL);
    if (known) {
      logLead(known, source); // fire and forget: never blocks a known visitor
      onUnlock();
      return;
    }
    setOpen(true);
  }

  async function submit() {
    if (bot.trim()) {
      onUnlock();
      return;
    }
    if (!valid) {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    const ok = await logLead(email.trim().toLowerCase(), source);
    if (!ok) {
      setStatus('error');
      return;
    }
    write(STORE_EMAIL, email.trim().toLowerCase());
    setStatus('idle');
    setOpen(false);
    onUnlock();
  }

  if (!open) {
    return (
      <Pressable onPress={start} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]} accessibilityRole="button">
        <Feather name="download" size={16} color={colors.primary} />
        <Text style={styles.buttonText}>{label ?? c.button}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{c.title}</Text>
      <Text style={styles.text}>{c.text}</Text>
      <View style={styles.row}>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (status !== 'sending') setStatus('idle');
          }}
          onSubmitEditing={submit}
          placeholder={c.placeholder}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          inputMode="email"
          autoComplete="email"
          autoFocus
          style={styles.input}
          accessibilityLabel="E-mail"
        />
        <Pressable onPress={submit} disabled={status === 'sending'} style={({ pressed }) => [styles.submit, (pressed || status === 'sending') && { opacity: 0.8 }]}>
          <Text style={styles.submitText}>{status === 'sending' ? '…' : c.submit}</Text>
        </Pressable>
      </View>
      <View style={styles.honeypot} accessible={false} importantForAccessibility="no-hide-descendants">
        <TextInput value={bot} onChangeText={setBot} tabIndex={-1 as any} />
      </View>
      {status === 'invalid' ? <Text style={styles.error}>{c.invalid}</Text> : status === 'error' ? <Text style={styles.error}>{c.error}</Text> : null}
      <Text style={styles.consent}>{c.consent}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 3, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
  buttonText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: colors.primary },
  card: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  title: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '800', color: colors.primaryDark },
  text: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.primaryDark },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: { flex: 1, minWidth: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 16, color: colors.text, outlineStyle: 'none' } as any,
  submit: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 3, backgroundColor: colors.primary, justifyContent: 'center' },
  submitText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: '#FBF6EE' },
  honeypot: { position: 'absolute', width: 1, height: 1, opacity: 0, left: -9999 },
  error: { fontSize: fontSize.xs, color: colors.danger },
  consent: { fontFamily: marketingFonts.body, fontSize: 11.5, color: colors.primaryDark, opacity: 0.85, lineHeight: 16 },
});
