import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import {
  DEFAULT_DEVIS_EMAIL_MESSAGE,
  DEFAULT_FACTURE_EMAIL_MESSAGE,
  DEFAULT_EXTRA_WORK_EMAIL_MESSAGE,
  DEFAULT_FACTURE_REMINDER_MESSAGE_UPCOMING,
  DEFAULT_FACTURE_REMINDER_MESSAGE_OVERDUE,
  defaultEmailSignature,
} from '../../../lib/emailDefaults';

// One place to edit every piece of text Cantia sends by e-mail on the org's
// behalf — devis, facture, relance (2 variants), travaux supplémentaires,
// signature. Was previously split (devis/facture/signature lived in
// Entreprise, relance and TS had no editable default at all) — consolidated
// here so "everything is customizable" is actually true from one screen,
// with the one deliberate exception (the client-portal link) called out
// explicitly instead of just being absent.
export default function EmailsSettingsScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';

  const [devisMessage, setDevisMessage] = useState('');
  const [factureMessage, setFactureMessage] = useState('');
  const [extraWorkMessage, setExtraWorkMessage] = useState('');
  const [reminderUpcoming, setReminderUpcoming] = useState('');
  const [reminderOverdue, setReminderOverdue] = useState('');
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!organization) return;
    setDevisMessage(organization.devis_email_message ?? DEFAULT_DEVIS_EMAIL_MESSAGE);
    setFactureMessage(organization.facture_email_message ?? DEFAULT_FACTURE_EMAIL_MESSAGE);
    setExtraWorkMessage(organization.extra_work_email_message ?? DEFAULT_EXTRA_WORK_EMAIL_MESSAGE);
    setReminderUpcoming(organization.facture_reminder_message_upcoming ?? DEFAULT_FACTURE_REMINDER_MESSAGE_UPCOMING);
    setReminderOverdue(organization.facture_reminder_message_overdue ?? DEFAULT_FACTURE_REMINDER_MESSAGE_OVERDUE);
    setSignature(organization.email_signature ?? defaultEmailSignature(organization.name));
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return;
    setSaving(true);
    await supabase
      .from('organizations')
      .update({
        devis_email_message: devisMessage.trim() || null,
        facture_email_message: factureMessage.trim() || null,
        extra_work_email_message: extraWorkMessage.trim() || null,
        facture_reminder_message_upcoming: reminderUpcoming.trim() || null,
        facture_reminder_message_overdue: reminderOverdue.trim() || null,
        email_signature: signature.trim() || null,
      })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
    showSavedCheckmark();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="E-mails" backTo="/(app)/compte" />
          <Text style={styles.intro}>
            Le texte de chaque e-mail envoyé à vos clients (devis, factures, relances, travaux supplémentaires) est
            entièrement à vous. Rien n'est imposé à part le lien de consultation en ligne, toujours ajouté à la fin —
            voir la note en bas de page.
          </Text>
          {!isAdmin ? (
            <Text style={styles.readOnlyHint}>Seul un propriétaire ou administrateur peut modifier ces textes.</Text>
          ) : null}

          <Card style={styles.section}>
            <Field
              label="Devis"
              value={devisMessage}
              onChangeText={setDevisMessage}
              editable={isAdmin}
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          </Card>

          <Card style={styles.section}>
            <Field
              label="Facture"
              value={factureMessage}
              onChangeText={setFactureMessage}
              editable={isAdmin}
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          </Card>

          <Card style={styles.section}>
            <Field
              label="Relance — avant échéance"
              value={reminderUpcoming}
              onChangeText={setReminderUpcoming}
              editable={isAdmin}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />
          </Card>

          <Card style={styles.section}>
            <Field
              label="Relance — facture en retard"
              value={reminderOverdue}
              onChangeText={setReminderOverdue}
              editable={isAdmin}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />
          </Card>

          <Card style={styles.section}>
            <Field
              label="Travaux supplémentaires"
              value={extraWorkMessage}
              onChangeText={setExtraWorkMessage}
              editable={isAdmin}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />
          </Card>

          <Card style={styles.section}>
            <Field
              label="Signature"
              value={signature}
              onChangeText={setSignature}
              editable={isAdmin}
              multiline
              numberOfLines={3}
              style={styles.textarea}
              placeholder={'Cordialement,\nJean Dupont\nDirecteur'}
            />
          </Card>

          <View style={styles.lockedNotice}>
            <Feather name="lock" size={14} color={colors.textMuted} />
            <Text style={styles.lockedNoticeText}>
              Le lien sécurisé de consultation en ligne reste toujours ajouté automatiquement en fin d'e-mail — c'est
              aussi ce qui permet à votre client de retrouver et signer le document sans créer de compte.
            </Text>
          </View>

          {isAdmin ? (
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  readOnlyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  lockedNoticeText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
