import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Card, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { getAppLocale, useTranslation } from '../lib/translations';

// Netlify's spam-filtered form-submission service only ever sees a
// submission if the form's name+fields were discovered in the STATIC build
// output at deploy time — it never executes this SPA's JS, so it can't see
// this component. public/sur-mesure-form.html is a hidden, unvisited page
// that exists purely to give Netlify's build-time HTML parser something to
// find; its field names must stay in sync with FIELDS below. Once Netlify
// knows the form exists, this plain fetch() POST (matching form-name) is
// enough to actually deliver a real submission — no backend of our own
// needed for what's essentially a "call me" lead form.
const FORM_NAME = 'sur-mesure';

function encodeFormData(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function SurMesureContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  // Honeypot: a real visitor never sees or fills this field (it's off-screen,
  // not just hidden — a screen reader would otherwise still announce it),
  // but a form-filling bot that blindly populates every input trips it.
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const canSubmit = name.trim() && email.trim() && message.trim();

  async function handleSubmit() {
    if (!canSubmit || status === 'sending') return;
    if (botField.trim()) {
      // Silently pretend success to a bot — no point telling it what tripped
      // the trap.
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
            company: company.trim(),
            phone: phone.trim(),
            locale: getAppLocale(),
            message: message.trim(),
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
      }
      setStatus('sent');
    } catch (err) {
      console.error('sur-mesure form submission failed:', err);
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
          <Text style={styles.successTitle}>{t('surMesureForm.successTitle')}</Text>
          <Text style={styles.successText}>{t('surMesureForm.successText')}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.formTitle}>{t('surMesureForm.title')}</Text>
      <Text style={styles.formSubtitle}>{t('surMesureForm.subtitle')}</Text>

      <View style={styles.row2}>
        <View style={styles.row2Item}>
          <Field label={t('surMesureForm.nameLabel')} value={name} onChangeText={setName} placeholder={t('surMesureForm.namePlaceholder')} />
        </View>
        <View style={styles.row2Item}>
          <Field label={t('surMesureForm.companyLabel')} value={company} onChangeText={setCompany} placeholder={t('surMesureForm.companyPlaceholder')} />
        </View>
      </View>
      <View style={styles.row2}>
        <View style={styles.row2Item}>
          <Field
            label={t('surMesureForm.emailLabel')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t('surMesureForm.emailPlaceholder')}
          />
        </View>
        <View style={styles.row2Item}>
          <Field label={t('surMesureForm.phoneLabel')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+41 79 000 00 00" />
        </View>
      </View>
      <Field
        label={t('surMesureForm.messageLabel')}
        value={message}
        onChangeText={setMessage}
        placeholder={t('surMesureForm.messagePlaceholder')}
        multiline
        numberOfLines={4}
        style={styles.textarea}
      />
      {/* Off-screen (not display:none — some bots skip those), never
          reachable by a real visitor's tab order or screen reader. */}
      <View style={styles.honeypot} accessible={false} importantForAccessibility="no-hide-descendants">
        <Field label="Ne pas remplir" value={botField} onChangeText={setBotField} tabIndex={-1} />
      </View>

      {status === 'error' ? <Text style={styles.errorText}>{t('surMesureForm.errorText')}</Text> : null}

      <Button
        title={t('surMesureForm.submit')}
        onPress={handleSubmit}
        loading={status === 'sending'}
        disabled={!canSubmit}
        style={styles.submitButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 620,
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
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 220,
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
