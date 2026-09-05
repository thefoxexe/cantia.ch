import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Card, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { getAppLocale, useTranslation } from '../lib/translations';

// Same Netlify-Forms mechanism as SurMesureContactForm — see that file's
// comment for the full explanation. public/contact-form.html is this
// form's hidden static twin; its field names must stay in sync with
// FIELDS below.
const FORM_NAME = 'contact';

function encodeFormData(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function ContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  // Honeypot: off-screen, never seen or filled by a real visitor — a bot
  // that blindly fills every input trips it.
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const canSubmit = name.trim() && email.trim() && message.trim();

  async function handleSubmit() {
    if (!canSubmit || status === 'sending') return;
    if (botField.trim()) {
      setStatus('sent');
      return;
    }
    setStatus('sending');
    try {
      if (Platform.OS === 'web') {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeFormData({
            'form-name': FORM_NAME,
            name: name.trim(),
            email: email.trim(),
            locale: getAppLocale(),
            message: message.trim(),
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
      }
      setStatus('sent');
    } catch (err) {
      console.error('contact form submission failed:', err);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <Card style={styles.card}>
        <View style={styles.successState}>
          <View style={styles.successIcon}>
            <Feather name="check" size={22} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>{t('contactForm.successTitle')}</Text>
          <Text style={styles.successText}>{t('contactForm.successText')}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.formTitle}>{t('contactForm.title')}</Text>
      <Text style={styles.formSubtitle}>{t('contactForm.subtitle')}</Text>

      <Field label={t('contactForm.nameLabel')} value={name} onChangeText={setName} placeholder={t('contactForm.namePlaceholder')} />
      <Field
        label={t('contactForm.emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t('contactForm.emailPlaceholder')}
      />
      <Field
        label={t('contactForm.messageLabel')}
        value={message}
        onChangeText={setMessage}
        placeholder={t('contactForm.messagePlaceholder')}
        multiline
        numberOfLines={4}
        style={styles.textarea}
      />
      {/* Off-screen (not display:none — some bots skip those), never
          reachable by a real visitor's tab order or screen reader. */}
      <View style={styles.honeypot} accessible={false} importantForAccessibility="no-hide-descendants">
        <Field label="Ne pas remplir" value={botField} onChangeText={setBotField} tabIndex={-1} />
      </View>

      {status === 'error' ? <Text style={styles.errorText}>{t('contactForm.errorText')}</Text> : null}

      <Button title={t('contactForm.submit')} onPress={handleSubmit} loading={status === 'sending'} disabled={!canSubmit} style={styles.submitButton} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  formTitle: {
    fontFamily: marketingFonts.display,
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  formSubtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  honeypot: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -9999,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  successState: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  successTitle: {
    fontFamily: marketingFonts.display,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  successText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 380,
    lineHeight: 20,
  },
});
