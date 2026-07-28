import { useCallback, useState, type ReactNode } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { openBillingPortal, startCheckout } from '../../../lib/api/billing';
import { Button, Card, Container, Field, Screen } from '../../../components/ui';
import { DevisTemplatePicker } from '../../../components/DevisTemplatePicker';
import { TOGGLEABLE_MODULES, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { OrgRole, OrganizationMember, Plan } from '../../../lib/types';

type IconName = keyof typeof Feather.glyphMap;

function Section({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Feather name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

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
  const [billingBusy, setBillingBusy] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>(organization?.enabled_modules ?? []);
  const [savingModules, setSavingModules] = useState(false);
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
    setEnabledModules(organization.enabled_modules ?? []);

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

  async function toggleModule(key: ModuleKey) {
    if (!organization || !isAdmin || savingModules) return;
    const next = isModuleEnabled(enabledModules, key)
      ? enabledModules.filter((m) => m !== key)
      : [...enabledModules, key];
    setEnabledModules(next);
    setSavingModules(true);
    await supabase.from('organizations').update({ enabled_modules: next }).eq('id', organization.id);
    setSavingModules(false);
    refreshOrganization();
  }

  const hasActiveSubscription = !!organization?.stripe_subscription_id;

  async function selectPlan(plan: Plan) {
    if (!organization || !isAdmin || billingBusy) return;
    setBillingError(null);

    if (hasActiveSubscription) {
      // Any change while a Stripe subscription exists goes through the portal,
      // so billing state never drifts out of sync with what Stripe is charging.
      return openManageBilling();
    }

    if (plan.price_chf_monthly === 0) {
      await supabase.from('organizations').update({ plan_id: plan.id }).eq('id', organization.id);
      refreshOrganization();
      load();
      return;
    }

    setBillingBusy(plan.id);
    const { url, error } = await startCheckout(plan.id);
    setBillingBusy(null);
    if (error || !url) {
      setBillingError(error ?? "Impossible de démarrer le paiement.");
      return;
    }
    Linking.openURL(url);
  }

  async function openManageBilling() {
    if (!organization || !isAdmin || billingBusy) return;
    setBillingError(null);
    setBillingBusy('portal');
    const { url, error } = await openBillingPortal();
    setBillingBusy(null);
    if (error || !url) {
      setBillingError(error ?? "Impossible d'ouvrir la gestion de l'abonnement.");
      return;
    }
    Linking.openURL(url);
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <Section icon="briefcase" title="Entreprise">
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
            {isAdmin ? (
              <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
            ) : null}
          </Section>

          <Section icon="file-text" title="Réglages des devis">
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
          </Section>

          <Section icon="layout" title="Modèle de devis PDF">
            <Text style={styles.hint}>
              Choisissez la mise en page utilisée pour générer vos devis. Elle s’applique automatiquement à tous vos
              prochains devis (vous pourrez toujours en changer ici).
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <DevisTemplatePicker
                value={devisTemplate}
                onChange={selectDevisTemplate}
                disabled={!isAdmin}
                hasLogo={!!organization?.logo_url}
              />
            </View>
            {savingTemplate ? <Text style={styles.hint}>Enregistrement du modèle…</Text> : null}
          </Section>

          <Section icon="image" title="Identité visuelle">
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
          </Section>

          <Section icon="sliders" title="Outils & modules">
            <Text style={styles.hint}>
              Désactivez ce que vous n’utilisez pas pour garder une application simple. Rapports reste toujours
              actif.
            </Text>
            <View style={{ marginTop: spacing.md, gap: spacing.md }}>
              {TOGGLEABLE_MODULES.map((m) => (
                <View key={m.key} style={styles.moduleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleLabel}>{m.label}</Text>
                    <Text style={styles.moduleDesc}>{m.description}</Text>
                  </View>
                  <Switch
                    value={isModuleEnabled(enabledModules, m.key)}
                    onValueChange={() => toggleModule(m.key)}
                    disabled={!isAdmin}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
            </View>
          </Section>

          <Section icon="credit-card" title="Plan & abonnement">
            {hasActiveSubscription ? (
              <View style={styles.subscriptionBanner}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={styles.subscriptionBannerText}>
                  Abonnement {organization?.subscription_status === 'active' ? 'actif' : organization?.subscription_status}.
                  Gérez votre moyen de paiement, changez de plan ou résiliez depuis le portail Stripe.
                </Text>
              </View>
            ) : null}
            {plans.map((p) => (
              <Pressable key={p.id} onPress={() => selectPlan(p)} disabled={!isAdmin || !!billingBusy}>
                <Card style={[styles.planCard, organization?.plan_id === p.id && styles.planCardActive]}>
                  <View style={styles.planRow}>
                    <Text style={styles.planName}>{p.name}</Text>
                    <Text style={styles.planPrice}>CHF {p.price_chf_monthly}/mois</Text>
                  </View>
                  <Text style={styles.meta}>
                    {(p.storage_quota_mb / 1024).toFixed(0)} Go de stockage · {p.max_members} membre(s)
                  </Text>
                  {p.price_chf_monthly > 0 && !p.stripe_price_id ? (
                    <Text style={styles.planNotice}>Paiement en ligne pas encore configuré pour ce plan.</Text>
                  ) : null}
                  {billingBusy === p.id ? <Text style={styles.planNotice}>Ouverture du paiement…</Text> : null}
                </Card>
              </Pressable>
            ))}
            {billingError ? <Text style={styles.billingError}>{billingError}</Text> : null}
            {hasActiveSubscription ? (
              <Button
                title="Gérer mon abonnement"
                icon="external-link"
                variant="secondary"
                onPress={openManageBilling}
                loading={billingBusy === 'portal'}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
          </Section>

          <Section icon="users" title="Équipe">
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
          </Section>

          <Button title="Se déconnecter" icon="log-out" variant="secondary" onPress={signOut} style={{ marginTop: spacing.md }} />
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
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
  terms: {
    minHeight: 70,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  brandingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  brandingItem: {
    flexGrow: 1,
    flexBasis: 120,
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
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moduleLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  moduleDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  subscriptionBannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  planNotice: {
    fontSize: 11,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  billingError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
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
