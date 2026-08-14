import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { createSubcontractor } from '../../../lib/api/subcontractors';
import { Button, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function NewSubcontractorScreen() {
  const { organization, user } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [trade, setTrade] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!organization || !user) return;
    if (!companyName.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const { subcontractor, error: createError } = await createSubcontractor(organization.id, user.id, {
      companyName,
      trade,
      contactName,
      phone,
      email,
    });
    setSaving(false);
    if (createError || !subcontractor) {
      setError(createError ?? 'Échec de la création.');
      return;
    }
    router.replace(`/(app)/sous-traitants/${subcontractor.id}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Nouvelle entreprise" backTo="/(app)/sous-traitants" />

          <Field label="Nom de l'entreprise" value={companyName} onChangeText={setCompanyName} placeholder="Ex. Électricité Progin SA" />
          <Field label="Métier" value={trade} onChangeText={setTrade} placeholder="Électricité, plâtrerie…" />
          <Field label="Contact" value={contactName} onChangeText={setContactName} placeholder="Nom du contact" />
          <Field label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.sm }}>{error}</Text> : null}
          <Button title="Créer l'entreprise" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
        </Container>
      </ScrollView>
    </Screen>
  );
}
