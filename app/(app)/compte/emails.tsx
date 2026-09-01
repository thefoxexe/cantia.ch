import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import {
  defaultDevisEmailMessage,
  defaultFactureEmailMessage,
  defaultExtraWorkEmailMessage,
  defaultFactureReminderMessageUpcoming,
  defaultFactureReminderMessageOverdue,
  defaultEmailSignature,
  emailVariablesFor,
  type EmailVariable,
} from '../../../lib/emailDefaults';

// A text field for an e-mail template: on top of the usual textarea, it
// tracks the cursor (onSelectionChange) so the "Insérer" chips below can
// splice a {{variable}} token in at the exact point the user last clicked,
// rather than just appending it to the end. The chips are the concrete
// answer to "je veux une intégration intelligente genre si je sélectionne
// client ça mets la variable du nom" — server-side substitution happens in
// supabase/functions/_shared/resend.ts::applyEmailVariables.
function EmailTemplateField({
  label,
  value,
  onChangeText,
  editable,
  numberOfLines,
  variables,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  editable: boolean;
  numberOfLines: number;
  variables: EmailVariable[];
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const selectionRef = useRef({ start: value.length, end: value.length });
  const [forcedSelection, setForcedSelection] = useState<{ start: number; end: number } | null>(null);

  function insertVariable(key: string) {
    const token = `{{${key}}}`;
    const { start, end } = selectionRef.current;
    const next = value.slice(0, start) + token + value.slice(end);
    onChangeText(next);
    const cursor = start + token.length;
    selectionRef.current = { start: cursor, end: cursor };
    setForcedSelection({ start: cursor, end: cursor });
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Field
        label={label}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline
        numberOfLines={numberOfLines}
        style={styles.textarea}
        placeholder={placeholder}
        selection={forcedSelection ?? undefined}
        onSelectionChange={(e) => {
          selectionRef.current = e.nativeEvent.selection;
          if (forcedSelection) setForcedSelection(null);
        }}
      />
      {editable && variables.length > 0 ? (
        <View style={styles.varRow}>
          <Text style={styles.varHint}>{t('emailsSettings.insert')}</Text>
          {variables.map((v) => (
            <Pressable key={v.key} onPress={() => insertVariable(v.key)} style={styles.varChip}>
              <Text style={styles.varChipText}>{v.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// One place to edit every piece of text Cantia sends by e-mail on the org's
// behalf — devis, facture, relance (2 variants), travaux supplémentaires,
// signature. The greeting is now part of the editable text itself (drop a
// {{client}} chip wherever it should go) rather than a fixed "Bonjour X,"
// line — the only thing still generated automatically is the "consultez en
// ligne" portal link, called out explicitly below instead of just being
// absent.
export default function EmailsSettingsScreen() {
  const { t } = useTranslation();
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
    setDevisMessage(organization.devis_email_message ?? defaultDevisEmailMessage());
    setFactureMessage(organization.facture_email_message ?? defaultFactureEmailMessage());
    setExtraWorkMessage(organization.extra_work_email_message ?? defaultExtraWorkEmailMessage());
    setReminderUpcoming(organization.facture_reminder_message_upcoming ?? defaultFactureReminderMessageUpcoming());
    setReminderOverdue(organization.facture_reminder_message_overdue ?? defaultFactureReminderMessageOverdue());
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
          <PageHeader title={t('emailsSettings.title')} backTo="/(app)/compte" />
          <Text style={styles.intro}>{t('emailsSettings.intro')}</Text>
          {!isAdmin ? (
            <Text style={styles.readOnlyHint}>{t('emailsSettings.readOnlyHint')}</Text>
          ) : null}

          <Card style={styles.section}>
            <EmailTemplateField
              label={t('emailsSettings.devisLabel')}
              value={devisMessage}
              onChangeText={setDevisMessage}
              editable={isAdmin}
              numberOfLines={4}
              variables={emailVariablesFor('devis')}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label={t('emailsSettings.factureLabel')}
              value={factureMessage}
              onChangeText={setFactureMessage}
              editable={isAdmin}
              numberOfLines={4}
              variables={emailVariablesFor('facture')}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label={t('emailsSettings.reminderUpcomingLabel')}
              value={reminderUpcoming}
              onChangeText={setReminderUpcoming}
              editable={isAdmin}
              numberOfLines={3}
              variables={emailVariablesFor('reminder')}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label={t('emailsSettings.reminderOverdueLabel')}
              value={reminderOverdue}
              onChangeText={setReminderOverdue}
              editable={isAdmin}
              numberOfLines={3}
              variables={emailVariablesFor('reminder')}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label={t('emailsSettings.extraWorkLabel')}
              value={extraWorkMessage}
              onChangeText={setExtraWorkMessage}
              editable={isAdmin}
              numberOfLines={3}
              variables={emailVariablesFor('extraWork')}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label={t('emailsSettings.signatureLabel')}
              value={signature}
              onChangeText={setSignature}
              editable={isAdmin}
              numberOfLines={3}
              variables={emailVariablesFor('signature')}
              placeholder={t('emailsSettings.signaturePlaceholder')}
            />
          </Card>

          <View style={styles.lockedNotice}>
            <Feather name="lock" size={14} color={colors.textMuted} />
            <Text style={styles.lockedNoticeText}>{t('emailsSettings.lockedNotice')}</Text>
          </View>

          {isAdmin ? (
            <Button title={t('common.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
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
  varRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  varHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginRight: 2,
  },
  varChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  varChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
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
