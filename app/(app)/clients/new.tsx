import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { createClient } from '../../../lib/api/clients';
import { createSubcontractor } from '../../../lib/api/subcontractors';
import { Button, Container, Field, PageHeader, AppScreen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { ClientType } from '../../../lib/types';

type ContactType = ClientType | 'sous-traitant';

export default function NewClientScreen() {
  const { t } = useTranslation();
  const { organization, user, permissions, canManageDevis } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const types: ContactType[] = [...(canManageDevis ? (['particulier', 'entreprise'] as const) : []), ...(permissions.subcontractors ? (['sous-traitant'] as const) : [])];
  const [type, setType] = useState<ContactType>(() => (types.includes(params.type as ContactType) ? (params.type as ContactType) : types[0] ?? 'particulier'));
  const [trade, setTrade] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!organization) return;
    if (type === 'sous-traitant') {
      if (!user) return;
      if (!companyName.trim()) {
        setError(t('projectSubcontractors.companyNameRequired'));
        return;
      }
      setSaving(true);
      setError(null);
      const { subcontractor, error: subError } = await createSubcontractor(organization.id, user.id, {
        companyName,
        trade,
        contactName: name,
        phone,
        email,
        notes,
      });
      setSaving(false);
      if (subError || !subcontractor) {
        setError(subError ?? t('projectSubcontractors.createError'));
        return;
      }
      router.replace(`/(app)/sous-traitants/${subcontractor.id}`);
      return;
    }
    if (!name.trim()) {
      setError(t('newClient.nameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    const { id, error: createError } = await createClient(organization.id, {
      type: type as ClientType,
      name: name.trim(),
      company_name: companyName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (createError || !id) {
      setError(createError ?? t('newClient.createFailed'));
      return;
    }
    router.replace(`/(app)/clients/${id}`);
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('newClient.title')} backTo="/(app)/clients" />

          <Text style={styles.fieldLabel}>{t('newClient.typeLabel')}</Text>
          <View style={styles.typeRow}>
            {types.map((ct) => (
              <Pressable key={ct} onPress={() => setType(ct)} style={[styles.typeChip, type === ct && styles.typeChipActive]}>
                <Text style={[styles.typeChipText, type === ct && styles.typeChipTextActive]}>
                  {ct === 'particulier' ? t('newClient.typeParticulier') : ct === 'entreprise' ? t('newClient.typeEntreprise') : t('newClient.typeSubcontractor')}
                </Text>
              </Pressable>
            ))}
          </View>

          {type === 'sous-traitant' ? (
            <>
              <Field label={t('projectSubcontractors.companyNameLabel')} value={companyName} onChangeText={setCompanyName} placeholder={t('projectSubcontractors.companyNamePlaceholder')} />
              <Field label={t('projectSubcontractors.tradeLabel')} value={trade} onChangeText={setTrade} placeholder={t('projectSubcontractors.tradePlaceholder')} />
              <Field label={t('projectSubcontractors.contactLabel')} value={name} onChangeText={setName} placeholder={t('projectSubcontractors.contactPlaceholder')} />
            </>
          ) : (
            <>
              <Field label={t('newClient.nameLabel')} value={name} onChangeText={setName} placeholder={t('newClient.namePlaceholder')} />
              {type === 'entreprise' ? (
                <Field label={t('newClient.companyLabel')} value={companyName} onChangeText={setCompanyName} placeholder={t('newClient.companyPlaceholder')} />
              ) : null}
            </>
          )}
          <Field label={t('newClient.emailLabel')} value={email} onChangeText={setEmail} placeholder={t('newClient.emailPlaceholder')} keyboardType="email-address" autoCapitalize="none" />
          <Field label={t('newClient.phoneLabel')} value={phone} onChangeText={setPhone} placeholder="+41 79 000 00 00" keyboardType="phone-pad" />
          {type !== 'sous-traitant' ? <Field label={t('newClient.addressLabel')} value={address} onChangeText={setAddress} placeholder={t('newClient.addressPlaceholder')} /> : null}
          <Field label={t('newClient.notesLabel')} value={notes} onChangeText={setNotes} placeholder={t('newClient.notesPlaceholder')} multiline style={styles.notes} />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title={t('newClient.create')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
        </Container>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  typeChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  notes: {
    minHeight: 70,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
