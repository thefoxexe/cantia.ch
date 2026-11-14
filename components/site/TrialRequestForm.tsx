import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Card, Field } from '../ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { sans, site } from '../../lib/siteTheme';
import { supabase } from '../../lib/supabase';
import { NEW_COMPANY_COPY } from '../../lib/site/newCompany';

// cantia.ch/nouvelle-entreprise: asks for the 3 months. The request is kept
// in trial_requests by the registry-outreach function, which e-mails the
// admin; the admin sends the personal code from Super Admin.
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

export function TrialRequestForm({ locale }: { locale: 'fr' | 'de' | 'it' }) {
  const c = NEW_COMPANY_COPY[locale].form;
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const canSubmit = !!name.trim() && !!company.trim() && EMAIL_RE.test(email.trim());

  async function submit() {
    if (!canSubmit || status === 'sending') return;
    if (botField.trim()) {
      setStatus('sent');
      return;
    }
    setStatus('sending');
    const { data, error } = await supabase.functions.invoke('registry-outreach', {
      body: { action: 'request', name: name.trim(), company: company.trim(), email: email.trim(), phone: phone.trim(), message: message.trim(), locale },
    });
    setStatus(!error && data?.ok ? 'sent' : 'error');
  }

  if (status === 'sent') {
    return (
      <Card style={styles.card}>
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Feather name="check" size={22} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>{c.successTitle}</Text>
          <Text style={styles.successText}>{c.successText}</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.row2}>
        <View style={styles.row2Item}>
          <Field label={c.name} value={name} onChangeText={setName} autoComplete="name" />
        </View>
        <View style={styles.row2Item}>
          <Field label={c.company} value={company} onChangeText={setCompany} autoComplete="organization" />
        </View>
      </View>
      <View style={styles.row2}>
        <View style={styles.row2Item}>
          <Field label={c.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        </View>
        <View style={styles.row2Item}>
          <Field label={c.phone} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+41 79 000 00 00" />
        </View>
      </View>
      <Field label={c.message} value={message} onChangeText={setMessage} placeholder={c.messagePlaceholder} multiline numberOfLines={3} style={styles.textarea} />
      <View style={styles.honeypot} accessible={false} importantForAccessibility="no-hide-descendants">
        <Field label="Ne pas remplir" value={botField} onChangeText={setBotField} tabIndex={-1} />
      </View>
      {status === 'error' ? <Text style={styles.error}>{c.error}</Text> : null}
      <Button title={c.submit} onPress={submit} loading={status === 'sending'} disabled={!canSubmit} style={{ marginTop: spacing.sm }} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { maxWidth: 620, width: '100%', alignSelf: 'center', padding: spacing.xl, gap: spacing.md, borderRadius: 10, borderColor: site.line, backgroundColor: site.white, shadowOpacity: 0 },
  row2: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  row2Item: { flexGrow: 1, flexBasis: 220 },
  textarea: { minHeight: 80, textAlignVertical: 'top', paddingTop: spacing.sm },
  honeypot: { position: 'absolute', width: 1, height: 1, opacity: 0, left: -9999 },
  error: { fontSize: fontSize.sm, color: colors.danger },
  success: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  successIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  successTitle: { ...sans, fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  successText: { ...sans, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
