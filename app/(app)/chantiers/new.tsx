import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Field, PageHeader, Screen } from '../../../components/ui';
import { spacing } from '../../../lib/theme';
import { Text } from 'react-native';
import { colors, fontSize } from '../../../lib/theme';

export default function NewChantierScreen() {
  const { organization, user } = useAuth();
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!organization) return;
    if (!name.trim()) {
      setError('Le nom du chantier est requis.');
      return;
    }
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .insert({
        organization_id: organization.id,
        name: name.trim(),
        client_name: clientName.trim() || null,
        address: address.trim() || null,
        created_by: user?.id,
      })
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(`/(app)/chantiers/${data.id}`);
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <ScrollView>
        <PageHeader title="Nouveau chantier" backTo="/(app)/chantiers" />

        <Field label="Nom du chantier" value={name} onChangeText={setName} placeholder="Ex : Villa Dupont - Rue du Lac 12" />
        <Field label="Client" value={clientName} onChangeText={setClientName} placeholder="Nom du client" />
        <Field label="Adresse" value={address} onChangeText={setAddress} placeholder="Adresse du chantier" />
        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.md }}>{error}</Text> : null}
        <Button title="Créer le chantier" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
