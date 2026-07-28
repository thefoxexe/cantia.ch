import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { Button, Card, Field, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { OrganizationMember, Plan } from '../../../lib/types';

export default function CompteScreen() {
  const { organization, role, refreshOrganization, signOut } = useAuth();
  const [name, setName] = useState(organization?.name ?? '');
  const [address, setAddress] = useState(organization?.address ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setName(organization.name);
    setAddress(organization.address ?? '');
    setIdeNumber(organization.ide_number ?? '');

    const [{ data: memberRows }, { data: planRows }] = await Promise.all([
      supabase.from('organization_members').select('*').eq('organization_id', organization.id),
      supabase.from('plans').select('*').order('price_chf_monthly', { ascending: true }),
    ]);
    setMembers(memberRows ?? []);
    setPlans(planRows ?? []);

    if (organization.logo_url) setLogoUrl(await getSignedUrl(organization.logo_url));
    if (organization.signature_url) setSignatureUrl(await getSignedUrl(organization.signature_url));
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
      .update({ name: name.trim(), address: address.trim() || null, ide_number: ideNumber.trim() || null })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
  }

  async function pickBranding(kind: 'logo' | 'signature') {
    if (!organization) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const ext = (asset.uri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const subPath = `branding/${kind}-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, asset.uri, contentType);
    if (path) {
      const column = kind === 'logo' ? 'logo_url' : 'signature_url';
      await supabase.from('organizations').update({ [column]: path }).eq('id', organization.id);
      await refreshOrganization();
      const url = await getSignedUrl(path);
      if (kind === 'logo') setLogoUrl(url);
      else setSignatureUrl(url);
    }
  }

  async function changePlan(planId: string) {
    if (!organization || !isAdmin) return;
    await supabase.from('organizations').update({ plan_id: planId }).eq('id', organization.id);
    refreshOrganization();
    load();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Entreprise</Text>
        <Field label="Nom" value={name} onChangeText={setName} editable={isAdmin} />
        <Field label="Adresse" value={address} onChangeText={setAddress} editable={isAdmin} />
        <Field label="Numéro IDE" value={ideNumber} onChangeText={setIdeNumber} editable={isAdmin} />
        {isAdmin ? <Button title="Enregistrer" onPress={handleSave} loading={saving} /> : null}

        <Text style={styles.sectionTitle}>Identité visuelle</Text>
        <View style={styles.brandingRow}>
          <View style={styles.brandingItem}>
            <Text style={styles.brandingLabel}>Logo</Text>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.logoPreview} /> : null}
            <Pressable style={styles.brandingButton} onPress={() => pickBranding('logo')}>
              <Text style={styles.brandingButtonText}>Choisir un logo</Text>
            </Pressable>
          </View>
          <View style={styles.brandingItem}>
            <Text style={styles.brandingLabel}>Signature</Text>
            {signatureUrl ? <Image source={{ uri: signatureUrl }} style={styles.signaturePreview} /> : null}
            <Pressable style={styles.brandingButton} onPress={() => pickBranding('signature')}>
              <Text style={styles.brandingButtonText}>Choisir une signature</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.hint}>Utilisés automatiquement sur vos rapports et devis PDF.</Text>

        <Text style={styles.sectionTitle}>Plan & abonnement</Text>
        {plans.map((p) => (
          <Pressable key={p.id} onPress={() => changePlan(p.id)} disabled={!isAdmin}>
            <Card style={[styles.planCard, organization?.plan_id === p.id && styles.planCardActive]}>
              <View style={styles.planRow}>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planPrice}>CHF {p.price_chf_monthly}/mois</Text>
              </View>
              <Text style={styles.meta}>
                {(p.storage_quota_mb / 1024).toFixed(0)} Go de stockage · {p.max_members} membre(s)
              </Text>
            </Card>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Équipe</Text>
        {members.map((m) => (
          <Card key={m.id} style={styles.memberRow}>
            <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
            <Text style={styles.memberRole}>{m.role}</Text>
          </Card>
        ))}

        <Button title="Se déconnecter" variant="secondary" onPress={signOut} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  brandingRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  brandingItem: {
    flex: 1,
    alignItems: 'center',
  },
  brandingLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  signaturePreview: {
    width: 120,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  brandingButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brandingButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  planPrice: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  memberName: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  memberRole: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});
