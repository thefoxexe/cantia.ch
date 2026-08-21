import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { isValidSwissIban } from '../../../lib/iban';
import { Button, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { TRADES } from '../../../lib/trades';
import { localityForNpa } from '../../../lib/swissPostalCodes';
import { SwissAddressField } from '../../../components/SwissAddressField';

export default function EntrepriseScreen() {
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
          <PageHeader title="Entreprise" backTo="/(app)/compte" />

          <Field label="Nom" value={name} onChangeText={setName} editable={isAdmin} />

          <Text style={styles.fieldLabel}>Métier</Text>
          <View style={styles.chips}>
            {TRADES.map((t) => (
              <Pressable
                key={t}
                onPress={() => isAdmin && setTrade(t)}
                disabled={!isAdmin}
                style={[styles.chip, trade === t && styles.chipActive, !isAdmin && styles.chipDisabled]}
              >
                <Text style={[styles.chipText, trade === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
          {!isAdmin ? (
            <Text style={styles.readOnlyHint}>
              Seul un propriétaire ou administrateur peut modifier le profil de l'entreprise.
            </Text>
          ) : null}

          <SwissAddressField
            label="Rue et numéro"
            value={street}
            onChangeText={setStreet}
            onSelectAddress={(addr) => {
              setStreet(addr.street);
              setPostalCode(addr.postalCode);
              setLocality(addr.locality);
            }}
            editable={isAdmin}
            placeholder="Rue de l'Exemple 1"
          />
          <View style={styles.row2}>
            <View style={[styles.row2Item, { flexBasis: 100, flexGrow: 0 }]}>
              <Field label="NPA" value={postalCode} onChangeText={handlePostalCodeChange} editable={isAdmin} keyboardType="number-pad" placeholder="1000" />
            </View>
            <View style={styles.row2Item}>
              <Field label="Localité" value={locality} onChangeText={setLocality} editable={isAdmin} placeholder="Lausanne" />
            </View>
          </View>
          {organization?.address && !street.trim() ? (
            <Text style={styles.hint}>
              Ancienne adresse enregistrée : « {organization.address} ». Merci de la ressaisir ci-dessus au format structuré.
            </Text>
          ) : null}
          {iban.trim() && (!postalCode.trim() || !locality.trim()) ? (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={14} color={colors.accent} />
              <Text style={styles.warningText}>
                NPA et localité sont requis pour générer une QR-facture conforme à la norme suisse (adresse structurée).
              </Text>
            </View>
          ) : null}
          <Field label="Numéro IDE" value={ideNumber} onChangeText={setIdeNumber} editable={isAdmin} />
          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Field
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                editable={isAdmin}
                keyboardType="phone-pad"
                placeholder="+41 79 000 00 00"
              />
            </View>
            <View style={styles.row2Item}>
              <Field
                label="E-mail entreprise"
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
            label="Site web"
            value={website}
            onChangeText={setWebsite}
            editable={isAdmin}
            autoCapitalize="none"
            placeholder="www.entreprise.ch"
          />
          <Field
            label="IBAN (pour la QR-facture)"
            value={iban}
            onChangeText={setIban}
            editable={isAdmin}
            autoCapitalize="characters"
            placeholder="CH00 0000 0000 0000 0000 0"
          />
          {iban.trim() && !isValidSwissIban(iban.trim()) ? (
            <Text style={styles.errorHint}>IBAN suisse ou liechtensteinois invalide (format CHxx.../LIxx...).</Text>
          ) : (
            <Text style={styles.hint}>
              Renseigné, un bulletin de paiement QR suisse conforme est ajouté automatiquement à vos factures.
            </Text>
          )}
          <Text style={styles.sectionTitle}>E-mails</Text>
          <Pressable onPress={() => router.push('/(app)/compte/emails')} style={styles.emailsLink}>
            <Feather name="mail" size={16} color={colors.primary} />
            <Text style={styles.emailsLinkText}>
              Les textes des e-mails (devis, factures, relances, travaux supplémentaires, signature) se gèrent dans
              Compte → E-mails.
            </Text>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>

          {isAdmin ? (
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
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
