import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { Button, Card, Container, Field, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { OrgRole, OrganizationMember, Plan } from '../../../lib/types';

const DEVIS_TEMPLATES: { id: string; name: string; description: string }[] = [
  { id: 'classic', name: 'Classique', description: 'Sobre, en-tête discret, lignes fines.' },
  { id: 'moderne', name: 'Moderne', description: 'Bandeau de couleur, titre marqué, total mis en avant.' },
  { id: 'minimal', name: 'Minimal', description: 'Beaucoup de blanc, typographie épurée.' },
  { id: 'structure', name: 'Structuré', description: 'Tableau quadrillé, lignes alternées, idéal si beaucoup de postes.' },
];

export default function CompteScreen() {
  const { organization, role, user, refreshOrganization, signOut } = useAuth();
  const [name, setName] = useState(organization?.name ?? '');
  const [address, setAddress] = useState(organization?.address ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [vatRate, setVatRate] = useState(String(organization?.default_vat_rate ?? 8.1));
  const [validityDays, setValidityDays] = useState(String(organization?.devis_validity_days ?? 30));
  const [devisTerms, setDevisTerms] = useState(organization?.devis_terms ?? '');
  const [devisTemplate, setDevisTemplate] = useState(organization?.devis_template ?? 'classic');
  const [savingTemplate, setSavingTemplate] = useState(false);
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
    setPhone(organization.phone ?? '');
    setEmail(organization.email ?? '');
    setWebsite(organization.website ?? '');
    setVatRate(String(organization.default_vat_rate ?? 8.1));
    setValidityDays(String(organization.devis_validity_days ?? 30));
    setDevisTerms(organization.devis_terms ?? '');
    setDevisTemplate(organization.devis_template ?? 'classic');

    const [{ data: memberRows }, { data: planRows }] = await Promise.all([
      supabase.from('organization_members').select('*').eq('organization_id', organization.id).order('created_at'),
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
      .update({
        name: name.trim(),
        address: address.trim() || null,
        ide_number: ideNumber.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        default_vat_rate: Number(vatRate) || 0,
        devis_validity_days: Number(validityDays) || 30,
        devis_terms: devisTerms.trim() || null,
      })
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

  async function selectDevisTemplate(templateId: string) {
    if (!organization || !isAdmin || templateId === devisTemplate) return;
    setDevisTemplate(templateId);
    setSavingTemplate(true);
    await supabase.from('organizations').update({ devis_template: templateId }).eq('id', organization.id);
    setSavingTemplate(false);
    refreshOrganization();
  }

  async function changePlan(planId: string) {
    if (!organization || !isAdmin) return;
    await supabase.from('organizations').update({ plan_id: planId }).eq('id', organization.id);
    refreshOrganization();
    load();
  }

  async function toggleMemberRole(member: OrganizationMember) {
    if (!isAdmin || member.role === 'owner') return;
    const nextRole: OrgRole = member.role === 'admin' ? 'member' : 'admin';
    await supabase.from('organization_members').update({ role: nextRole }).eq('id', member.id);
    load();
  }

  async function removeMember(member: OrganizationMember) {
    if (!isAdmin || member.role === 'owner' || member.user_id === user?.id) return;
    await supabase.from('organization_members').delete().eq('id', member.id);
    load();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <Text style={styles.sectionTitle}>Entreprise</Text>
          <Field label="Nom" value={name} onChangeText={setName} editable={isAdmin} />
          <Field label="Adresse" value={address} onChangeText={setAddress} editable={isAdmin} />
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

          <Text style={styles.sectionTitle}>Réglages des devis</Text>
          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Field label="TVA par défaut (%)" value={vatRate} onChangeText={setVatRate} editable={isAdmin} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row2Item}>
              <Field
                label="Validité (jours)"
                value={validityDays}
                onChangeText={setValidityDays}
                editable={isAdmin}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Field
            label="Mentions / conditions (pied de page PDF)"
            value={devisTerms}
            onChangeText={setDevisTerms}
            editable={isAdmin}
            placeholder="Ex : Paiement à 30 jours net. TVA non incluse dans les acomptes."
            multiline
            style={styles.terms}
          />

          {isAdmin ? (
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          ) : null}

          <Text style={styles.sectionTitle}>Modèle de devis PDF</Text>
          <Text style={styles.hint}>
            Choisissez la mise en page utilisée pour générer vos devis. Le modèle sélectionné s’applique
            automatiquement à tous vos prochains devis.
          </Text>
          {!organization?.logo_url ? (
            <View style={styles.templateWarning}>
              <Feather name="alert-triangle" size={14} color={colors.accent} />
              <Text style={styles.templateWarningText}>
                Aucun logo chargé — vos devis PDF partiront sans logo. Ajoutez-en un dans « Identité visuelle »
                ci-dessous.
              </Text>
            </View>
          ) : null}
          <View style={styles.templateGrid}>
            {DEVIS_TEMPLATES.map((t) => {
              const active = devisTemplate === t.id;
              return (
                <Pressable key={t.id} onPress={() => selectDevisTemplate(t.id)} disabled={!isAdmin}>
                  <Card style={[styles.templateCard, active && styles.templateCardActive]}>
                    <View style={styles.templatePreview}>
                      <TemplateSwatch kind={t.id} />
                      {active ? (
                        <View style={styles.templateCheck}>
                          <Feather name="check" size={12} color={colors.surface} />
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateDesc}>{t.description}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
          {savingTemplate ? <Text style={styles.hint}>Enregistrement du modèle…</Text> : null}

          <Text style={styles.sectionTitle}>Identité visuelle</Text>
          <View style={styles.brandingRow}>
            <View style={styles.brandingItem}>
              <Text style={styles.brandingLabel}>Logo</Text>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
              ) : (
                <View style={[styles.logoPreview, styles.brandPlaceholder]}>
                  <Feather name="image" size={20} color={colors.textMuted} />
                </View>
              )}
              <Pressable style={styles.brandingButton} onPress={() => pickBranding('logo')}>
                <Text style={styles.brandingButtonText}>Choisir un logo</Text>
              </Pressable>
            </View>
            <View style={styles.brandingItem}>
              <Text style={styles.brandingLabel}>Signature</Text>
              {signatureUrl ? (
                <Image source={{ uri: signatureUrl }} style={styles.signaturePreview} />
              ) : (
                <View style={[styles.signaturePreview, styles.brandPlaceholder]}>
                  <Feather name="edit-3" size={20} color={colors.textMuted} />
                </View>
              )}
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
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
                <Text style={styles.memberRole}>
                  {m.role === 'owner' ? 'Propriétaire' : m.role === 'admin' ? 'Administrateur' : 'Membre'}
                </Text>
              </View>
              {isAdmin && m.role !== 'owner' ? (
                <View style={styles.memberActions}>
                  <Pressable style={styles.memberActionButton} onPress={() => toggleMemberRole(m)}>
                    <Text style={styles.memberActionText}>{m.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}</Text>
                  </Pressable>
                  {m.user_id !== user?.id ? (
                    <Pressable hitSlop={8} onPress={() => removeMember(m)}>
                      <Feather name="user-x" size={16} color={colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </Card>
          ))}

          <Button title="Se déconnecter" icon="log-out" variant="secondary" onPress={signOut} style={{ marginTop: spacing.xl }} />
        </Container>
      </ScrollView>
    </Screen>
  );
}

function TemplateSwatch({ kind }: { kind: string }) {
  if (kind === 'moderne') {
    return (
      <View style={swatch.base}>
        <View style={[swatch.band, { backgroundColor: colors.primary }]} />
        <View style={swatch.bodyPad}>
          <View style={[swatch.line, { width: '60%' }]} />
          <View style={[swatch.line, { width: '40%' }]} />
        </View>
      </View>
    );
  }
  if (kind === 'minimal') {
    return (
      <View style={swatch.base}>
        <View style={swatch.bodyPadLarge}>
          <View style={[swatch.line, { width: '35%', height: 6, backgroundColor: colors.text }]} />
          <View style={{ height: 8 }} />
          <View style={[swatch.line, { width: '55%' }]} />
          <View style={[swatch.line, { width: '30%' }]} />
        </View>
      </View>
    );
  }
  if (kind === 'structure') {
    return (
      <View style={swatch.base}>
        <View style={swatch.bodyPad}>
          <View style={[swatch.gridHeader, { backgroundColor: colors.primary }]} />
          <View style={[swatch.gridRow, { backgroundColor: colors.surfaceAlt }]} />
          <View style={swatch.gridRow} />
          <View style={[swatch.gridRow, { backgroundColor: colors.surfaceAlt }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={swatch.base}>
      <View style={swatch.bodyPad}>
        <View style={[swatch.line, { width: '45%' }]} />
        <View style={{ height: 6 }} />
        <View style={[swatch.line, { width: '70%' }]} />
        <View style={[swatch.line, { width: '50%' }]} />
      </View>
    </View>
  );
}

const swatch = StyleSheet.create({
  base: {
    width: '100%',
    aspectRatio: 1.3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  band: {
    height: '32%',
    width: '100%',
  },
  bodyPad: {
    padding: 10,
    gap: 5,
  },
  bodyPadLarge: {
    padding: 14,
  },
  line: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  gridHeader: {
    height: 8,
    borderRadius: 2,
  },
  gridRow: {
    height: 8,
    borderRadius: 1,
    marginTop: 3,
  },
});

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  row2: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  row2Item: {
    flex: 1,
  },
  terms: {
    minHeight: 70,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
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
  brandPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  signaturePreview: {
    width: 120,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
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
  templateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  templateWarningText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  templateCard: {
    width: 168,
  },
  templateCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  templatePreview: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  templateCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  templateDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
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
    fontWeight: '600',
  },
  memberRole: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  memberActionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
});
