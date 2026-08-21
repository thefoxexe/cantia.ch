import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  EMAIL_VARIABLES,
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
          <Text style={styles.varHint}>Insérer :</Text>
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
            Le texte de chaque e-mail envoyé à vos clients est entièrement à vous — formule d'appel comprise. Utilisez
            les chips sous chaque champ pour insérer le nom du client, le chantier ou le numéro du document : Cantia
            remplace automatiquement la variable par la bonne valeur à l'envoi.
          </Text>
          {!isAdmin ? (
            <Text style={styles.readOnlyHint}>Seul un propriétaire ou administrateur peut modifier ces textes.</Text>
          ) : null}

          <Card style={styles.section}>
            <EmailTemplateField
              label="Devis"
              value={devisMessage}
              onChangeText={setDevisMessage}
              editable={isAdmin}
              numberOfLines={4}
              variables={EMAIL_VARIABLES.devis}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label="Facture"
              value={factureMessage}
              onChangeText={setFactureMessage}
              editable={isAdmin}
              numberOfLines={4}
              variables={EMAIL_VARIABLES.facture}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label="Relance — avant échéance"
              value={reminderUpcoming}
              onChangeText={setReminderUpcoming}
              editable={isAdmin}
              numberOfLines={3}
              variables={EMAIL_VARIABLES.reminder}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label="Relance — facture en retard"
              value={reminderOverdue}
              onChangeText={setReminderOverdue}
              editable={isAdmin}
              numberOfLines={3}
              variables={EMAIL_VARIABLES.reminder}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label="Travaux supplémentaires"
              value={extraWorkMessage}
              onChangeText={setExtraWorkMessage}
              editable={isAdmin}
              numberOfLines={3}
              variables={EMAIL_VARIABLES.extraWork}
            />
          </Card>

          <Card style={styles.section}>
            <EmailTemplateField
              label="Signature"
              value={signature}
              onChangeText={setSignature}
              editable={isAdmin}
              numberOfLines={3}
              variables={EMAIL_VARIABLES.signature}
              placeholder={'Cordialement,\nJean Dupont\nDirecteur'}
            />
          </Card>

          <View style={styles.lockedNotice}>
            <Feather name="lock" size={14} color={colors.textMuted} />
            <Text style={styles.lockedNoticeText}>
              Le lien sécurisé de consultation en ligne reste toujours ajouté automatiquement en fin d'e-mail — c'est
              aussi ce qui permet à votre client de retrouver et signer le document sans créer de compte. Tout le
              reste, y compris "Bonjour", est à vous.
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
