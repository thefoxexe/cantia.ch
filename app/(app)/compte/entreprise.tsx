import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { isValidSwissIban } from '../../../lib/iban';
import { Button, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { TRADES, TRADE_KEYS } from '../../../lib/trades';
import { localityForNpa } from '../../../lib/swissPostalCodes';
import { SwissAddressField } from '../../../components/SwissAddressField';

export default function EntrepriseScreen() {
  const { t } = useTranslation();
  const { organization, role, refreshOrganization } = useAuth();
  const [name, setName] = useState(organization?.name ?? '');
  const [trade, setTrade] = useState(organization?.trade ?? null);
  const [street, setStreet] = useState(organization?.street ?? '');
  const [postalCode, setPostalCode] = useState(organization?.postal_code ?? '');
  const [locality, setLocality] = useState(organization?.locality ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [iban, setIban] = useState(organization?.iban ?? '');
  const [docLocale, setDocLocale] = useState<'fr' | 'de'>(organization?.locale ?? 'fr');
  const [saving, setSaving] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';
  const router = useRouter();

  // Best-effort autofill: only kicks in while the locality field is still
  // empty, so it never overwrites something the user already typed.
  function handlePostalCodeChange(value: string) {
    setPostalCode(value);
    const match = localityForNpa(value);
    if (match && !locality.trim()) setLocality(match);
  }

  const load = useCallback(async () => {
    if (!organization) return;
    setName(organization.name);
    setTrade(organization.trade ?? null);
    setStreet(organization.street ?? '');
    setPostalCode(organization.postal_code ?? '');
    setLocality(organization.locality ?? '');
    setIdeNumber(organization.ide_number ?? '');
    setPhone(organization.phone ?? '');
    setEmail(organization.email ?? '');
    setWebsite(organization.website ?? '');
    setIban(organization.iban ?? '');
    setDocLocale(organization.locale ?? 'fr');
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return;
    setSaving(true);
    const ibanTrimmed = iban.trim();
    const validIban = !ibanTrimmed || isValidSwissIban(ibanTrimmed);
    await supabase
      .from('organizations')
      .update({
        name: name.trim(),
        trade,
        street: street.trim() || null,
        postal_code: postalCode.trim() || null,
        locality: locality.trim() || null,
        ide_number: ideNumber.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        iban: validIban ? ibanTrimmed.replace(/\s+/g, '').toUpperCase() || null : organization.iban,
        locale: docLocale,
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
          <PageHeader title={t('entreprise.title')} backTo="/(app)/compte" />

          <Field label={t('entreprise.nameLabel')} value={name} onChangeText={setName} editable={isAdmin} />

          <Text style={styles.fieldLabel}>{t('entreprise.tradeLabel')}</Text>
          <View style={styles.chips}>
            {TRADES.map((tr) => (
              <Pressable
                key={tr}
                onPress={() => isAdmin && setTrade(tr)}
                disabled={!isAdmin}
                style={[styles.chip, trade === tr && styles.chipActive, !isAdmin && styles.chipDisabled]}
              >
                <Text style={[styles.chipText, trade === tr && styles.chipTextActive]}>{t(`trades.${TRADE_KEYS[tr]}` as any)}</Text>
              </Pressable>
            ))}
          </View>
          {!isAdmin ? (
            <Text style={styles.readOnlyHint}>{t('entreprise.readOnlyHint')}</Text>
          ) : null}

          <SwissAddressField
            label={t('entreprise.streetLabel')}
            value={street}
            onChangeText={setStreet}
            onSelectAddress={(addr) => {
              setStreet(addr.street);
              setPostalCode(addr.postalCode);
              setLocality(addr.locality);
            }}
            editable={isAdmin}
            placeholder={t('entreprise.streetPlaceholder')}
          />
          <View style={styles.row2}>
            <View style={[styles.row2Item, { flexBasis: 100, flexGrow: 0 }]}>
              <Field label={t('entreprise.npaLabel')} value={postalCode} onChangeText={handlePostalCodeChange} editable={isAdmin} keyboardType="number-pad" placeholder="1000" />
            </View>
            <View style={styles.row2Item}>
              <Field label={t('entreprise.localityLabel')} value={locality} onChangeText={setLocality} editable={isAdmin} placeholder="Lausanne" />
            </View>
          </View>
          {organization?.address && !street.trim() ? (
            <Text style={styles.hint}>{t('entreprise.oldAddressHint', { address: organization.address })}</Text>
          ) : null}
          {iban.trim() && (!postalCode.trim() || !locality.trim()) ? (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={14} color={colors.accent} />
              <Text style={styles.warningText}>{t('entreprise.qrAddressWarning')}</Text>
            </View>
          ) : null}
          <Field label={t('entreprise.ideLabel')} value={ideNumber} onChangeText={setIdeNumber} editable={isAdmin} />
          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Field
                label={t('entreprise.phoneLabel')}
                value={phone}
                onChangeText={setPhone}
                editable={isAdmin}
                keyboardType="phone-pad"
                placeholder="+41 79 000 00 00"
              />
            </View>
            <View style={styles.row2Item}>
              <Field
                label={t('entreprise.companyEmailLabel')}
                value={email}
                onChangeText={setEmail}
                editable={isAdmin}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="contact@entreprise.ch"
              />
            </View>
          </View>
          <Field
            label={t('entreprise.websiteLabel')}
            value={website}
            onChangeText={setWebsite}
            editable={isAdmin}
            autoCapitalize="none"
            placeholder="www.entreprise.ch"
          />
          <Field
            label={t('entreprise.ibanLabel')}
            value={iban}
            onChangeText={setIban}
            editable={isAdmin}
            autoCapitalize="characters"
            placeholder="CH00 0000 0000 0000 0000 0"
          />
          {iban.trim() && !isValidSwissIban(iban.trim()) ? (
            <Text style={styles.errorHint}>{t('entreprise.ibanInvalid')}</Text>
          ) : (
            <Text style={styles.hint}>{t('entreprise.ibanHint')}</Text>
          )}
          <Text style={styles.sectionTitle}>{t('entreprise.documentLocaleTitle')}</Text>
          <Text style={styles.hint}>{t('entreprise.documentLocaleHint')}</Text>
          <View style={styles.chips}>
            {(['fr', 'de'] as const).map((loc) => (
              <Pressable
                key={loc}
                onPress={() => isAdmin && setDocLocale(loc)}
                disabled={!isAdmin}
                style={[styles.chip, docLocale === loc && styles.chipActive, !isAdmin && styles.chipDisabled]}
              >
                <Text style={[styles.chipText, docLocale === loc && styles.chipTextActive]}>
                  {loc === 'fr' ? t('entreprise.localeFr') : t('entreprise.localeDe')}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('entreprise.emailsSectionTitle')}</Text>
          <Pressable onPress={() => router.push('/(app)/compte/emails')} style={styles.emailsLink}>
            <Feather name="mail" size={16} color={colors.primary} />
            <Text style={styles.emailsLinkText}>{t('entreprise.emailsLinkText')}</Text>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          {isAdmin ? (
            <Button title={t('common.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  emailsLinkText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  chipDisabled: {
    opacity: 0.6,
  },
  readOnlyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 160,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  errorHint: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
});
