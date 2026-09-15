import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { uploadToOrgBucket } from '../../../lib/api/storage';
import { assetFileInfo, normalizeImageOrientation } from '../../../lib/imageAsset';
import { suggestBrandColorFromImage } from '../../../lib/colorFromImage';
import { suggestBrandColorsFromWebsite } from '../../../lib/api/brandColors';
import { Button, Field, Screen } from '../../../components/ui';
import { BRAND_COLOR_PRESETS, HEX_COLOR_RE } from '../../../components/PdfTemplatePicker';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { localityForNpa } from '../../../lib/swissPostalCodes';
import { SwissAddressField } from '../../../components/SwissAddressField';
import { ORG_MODULES, isModuleEnabled, type ModuleKey } from '../../../lib/modules';
import type { Plan } from '../../../lib/types';

const DEFAULT_BRAND_COLOR = '#1F3D3A';
const DEFAULT_ACTIVE_MODULES: ModuleKey[] = ['devis', 'planning'];
// Modules whose availability also depends on the org's plan — same mapping
// as compte/modules.tsx, kept local since it's only ever consulted here and
// there at present.
const PLAN_GATED: Partial<Record<ModuleKey, keyof Plan>> = {
  planning: 'has_planning',
  payroll: 'has_payroll',
  treasury: 'has_treasury',
};

const STEP_COUNT = 3;

export default function OnboardingSetupScreen() {
  const { t } = useTranslation();
  const { organization, refreshOrganization } = useAuth();
  const [step, setStep] = useState(1);
  const [finishing, setFinishing] = useState(false);

  // Step 1 — company profile
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [street, setStreet] = useState(organization?.street ?? '');
  const [postalCode, setPostalCode] = useState(organization?.postal_code ?? '');
  const [locality, setLocality] = useState(organization?.locality ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [logoAsset, setLogoAsset] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  const [brandColor, setBrandColor] = useState(organization?.brand_color ?? DEFAULT_BRAND_COLOR);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);

  // Step 2 — modules
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>(DEFAULT_ACTIVE_MODULES);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  function loadPlanOnce() {
    if (modulesLoaded || !organization?.plan_id) return;
    setModulesLoaded(true);
    supabase
      .from('plans')
      .select('*')
      .eq('id', organization.plan_id)
      .single()
      .then(({ data }) => setPlan((data as Plan) ?? null));
  }

  function isPlanGated(key: ModuleKey): boolean {
    const field = PLAN_GATED[key];
    if (!field || !plan) return false;
    return !plan[field];
  }

  function toggleModule(key: ModuleKey) {
    if (isPlanGated(key)) return;
    setEnabledModules((prev) => (isModuleEnabled(prev, key) ? prev.filter((m) => m !== key) : [...prev, key]));
  }

  function handlePostalCodeChange(value: string) {
    setPostalCode(value);
    const match = localityForNpa(value);
    if (match && !locality.trim()) setLocality(match);
  }

  function addSuggestions(hexList: string[]) {
    if (!hexList.length) return;
    setSuggestedColors((prev) => [...new Set([...hexList, ...prev])].slice(0, 4));
    setBrandColor(hexList[0]);
  }

  async function pickLogo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setLogoAsset({ uri: asset.uri, mimeType: asset.mimeType });
    const suggested = await suggestBrandColorFromImage(asset.uri);
    if (suggested) addSuggestions([suggested]);
  }

  async function analyzeWebsite() {
    if (!website.trim() || analyzingWebsite) return;
    setAnalyzingWebsite(true);
    const found = await suggestBrandColorsFromWebsite(website.trim());
    setAnalyzingWebsite(false);
    addSuggestions(found);
  }

  async function persistProfile() {
    if (!organization) return;
    const updates: Record<string, string | null> = {};
    if (website.trim()) updates.website = website.trim();
    if (street.trim()) updates.street = street.trim();
    if (postalCode.trim()) updates.postal_code = postalCode.trim();
    if (locality.trim()) updates.locality = locality.trim();
    if (phone.trim()) updates.phone = phone.trim();
    if (email.trim()) updates.email = email.trim();
    if (ideNumber.trim()) updates.ide_number = ideNumber.trim();
    if (HEX_COLOR_RE.test(brandColor) && brandColor.toLowerCase() !== DEFAULT_BRAND_COLOR.toLowerCase()) {
      updates.brand_color = brandColor;
    }
    if (logoAsset) {
      const raw = assetFileInfo(logoAsset);
      const { uri, ext, contentType } = await normalizeImageOrientation(logoAsset.uri, raw.contentType);
      const { path, error } = await uploadToOrgBucket(organization.id, `branding/logo-${Date.now()}.${ext}`, uri, contentType);
      if (path) updates.logo_url = path;
      else if (error) console.error('Logo upload failed:', error);
    }
    if (Object.keys(updates).length) {
      await supabase.from('organizations').update(updates).eq('id', organization.id);
    }
  }

  async function handleNext() {
    if (step === 1) {
      await persistProfile();
      setStep(2);
      loadPlanOnce();
      return;
    }
    if (step === 2) {
      if (!organization) return;
      await supabase.from('organizations').update({ enabled_modules: enabledModules }).eq('id', organization.id);
      setStep(3);
      return;
    }
    await handleFinish();
  }

  async function handleFinish() {
    if (!organization || finishing) return;
    setFinishing(true);
    await supabase.from('organizations').update({ onboarding_completed: true }).eq('id', organization.id);
    await refreshOrganization();
    // The root layout takes it from here — organization.onboarding_completed
    // being true is what lets it through into /(app).
  }

  async function handleSkip() {
    if (!organization || finishing) return;
    setFinishing(true);
    if (step === 1) {
      // Keep whatever was already filled in on this step even when skipping
      // the rest — no reason to throw away a logo/address someone just set.
      await persistProfile();
      await supabase.from('organizations').update({ enabled_modules: DEFAULT_ACTIVE_MODULES }).eq('id', organization.id);
    } else if (step === 2) {
      await supabase.from('organizations').update({ enabled_modules: enabledModules }).eq('id', organization.id);
    }
    await supabase.from('organizations').update({ onboarding_completed: true }).eq('id', organization.id);
    await refreshOrganization();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressRow}>
          {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((n) => (
            <View key={n} style={[styles.progressDot, n <= step && styles.progressDotActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>{t('authOnboardingSetup.stepLabel', { current: step, total: STEP_COUNT })}</Text>

        {step === 1 ? (
          <StepProfile
            organization={organization}
            website={website}
            setWebsite={setWebsite}
            street={street}
            setStreet={setStreet}
            postalCode={postalCode}
            onPostalCodeChange={handlePostalCodeChange}
            locality={locality}
            setLocality={setLocality}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            ideNumber={ideNumber}
            setIdeNumber={setIdeNumber}
            logoAsset={logoAsset}
            onPickLogo={pickLogo}
            brandColor={brandColor}
            setBrandColor={setBrandColor}
            suggestedColors={suggestedColors}
            analyzingWebsite={analyzingWebsite}
            onAnalyzeWebsite={analyzeWebsite}
          />
        ) : null}

        {step === 2 ? (
          <StepModules
            plan={plan}
            enabledModules={enabledModules}
            isPlanGated={isPlanGated}
            onToggle={toggleModule}
            onReachStep={loadPlanOnce}
          />
        ) : null}

        {step === 3 ? (
          <StepRecap
            organization={organization}
            website={website}
            street={street}
            postalCode={postalCode}
            locality={locality}
            enabledModules={enabledModules}
            onEditProfile={() => setStep(1)}
            onEditModules={() => setStep(2)}
          />
        ) : null}

        <View style={styles.footer}>
          {step > 1 ? (
            <Pressable onPress={() => setStep((s) => s - 1)} style={styles.backBtn} hitSlop={8}>
              <Feather name="arrow-left" size={15} color={colors.textMuted} />
              <Text style={styles.backBtnText}>{t('authOnboardingSetup.previous')}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable onPress={handleSkip} hitSlop={8} disabled={finishing}>
            <Text style={styles.skipText}>{t('authOnboardingSetup.skip')}</Text>
          </Pressable>
        </View>

        <Button
          title={step === STEP_COUNT ? t('authOnboardingSetup.finish') : t('authOnboardingSetup.next')}
          onPress={handleNext}
          loading={finishing}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </Screen>
  );
}

function StepProfile({
  organization,
  website,
  setWebsite,
  street,
  setStreet,
  postalCode,
  onPostalCodeChange,
  locality,
  setLocality,
  phone,
  setPhone,
  email,
  setEmail,
  ideNumber,
  setIdeNumber,
  logoAsset,
  onPickLogo,
  brandColor,
  setBrandColor,
  suggestedColors,
  analyzingWebsite,
  onAnalyzeWebsite,
}: {
  organization: { name: string; logo_url: string | null } | null;
  website: string;
  setWebsite: (v: string) => void;
  street: string;
  setStreet: (v: string) => void;
  postalCode: string;
  onPostalCodeChange: (v: string) => void;
  locality: string;
  setLocality: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  ideNumber: string;
  setIdeNumber: (v: string) => void;
  logoAsset: { uri: string } | null;
  onPickLogo: () => void;
  brandColor: string;
  setBrandColor: (v: string) => void;
  suggestedColors: string[];
  analyzingWebsite: boolean;
  onAnalyzeWebsite: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.title}>{t('authOnboardingSetup.profileTitle', { name: organization?.name ?? '' })}</Text>
      <Text style={styles.subtitle}>{t('authOnboardingSetup.profileSubtitle')}</Text>

      <Text style={styles.fieldLabel}>{t('authOnboardingSetup.logoLabel')}</Text>
      <View style={styles.logoRow}>
        {logoAsset ? (
          <Image source={{ uri: logoAsset.uri }} style={styles.logoPreview} />
        ) : (
          <View style={[styles.logoPreview, styles.logoPlaceholder]}>
            <Feather name="image" size={20} color={colors.textMuted} />
          </View>
        )}
        <Pressable style={styles.logoButton} onPress={onPickLogo}>
          <Text style={styles.logoButtonText}>{logoAsset ? t('authOnboardingSetup.changeLogo') : t('authOnboardingSetup.chooseLogo')}</Text>
        </Pressable>
      </View>

      <Text style={styles.fieldLabel}>{t('authOnboardingSetup.brandColorLabel')}</Text>
      {suggestedColors.length ? (
        <Text style={styles.hint}>{t('authOnboardingSetup.colorSuggestedHint')}</Text>
      ) : (
        <Text style={styles.hint}>{t('authOnboardingSetup.colorDefaultHint')}</Text>
      )}
      <View style={styles.colorRow}>
        {[...new Set([...suggestedColors, ...BRAND_COLOR_PRESETS])].map((hex) => (
          <Pressable
            key={hex}
            onPress={() => setBrandColor(hex)}
            style={[styles.colorSwatch, { backgroundColor: hex }, brandColor.toLowerCase() === hex.toLowerCase() && styles.colorSwatchActive]}
          >
            {brandColor.toLowerCase() === hex.toLowerCase() ? <Feather name="check" size={14} color={colors.surface} /> : null}
          </Pressable>
        ))}
      </View>

      <Field label={t('authOnboardingSetup.websiteLabel')} value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder={t('authOnboardingSetup.websitePlaceholder')} />
      {website.trim() ? (
        <Pressable onPress={onAnalyzeWebsite} style={styles.analyzeLink} disabled={analyzingWebsite}>
          <Feather name="globe" size={13} color={colors.primary} />
          <Text style={styles.analyzeLinkText}>
            {analyzingWebsite ? t('authOnboardingSetup.analyzingWebsite') : t('authOnboardingSetup.analyzeWebsite')}
          </Text>
        </Pressable>
      ) : null}

      <SwissAddressField
        label={t('authOnboardingSetup.streetLabel')}
        value={street}
        onChangeText={setStreet}
        onSelectAddress={(addr) => {
          setStreet(addr.street);
          onPostalCodeChange(addr.postalCode);
          setLocality(addr.locality);
        }}
        placeholder={t('authOnboardingSetup.streetPlaceholder')}
      />
      <View style={styles.row2}>
        <View style={[styles.row2Item, { flexBasis: 100, flexGrow: 0 }]}>
          <Field label={t('authOnboardingSetup.npaLabel')} value={postalCode} onChangeText={onPostalCodeChange} keyboardType="number-pad" placeholder="1000" />
        </View>
        <View style={styles.row2Item}>
          <Field label={t('authOnboardingSetup.localityLabel')} value={locality} onChangeText={setLocality} placeholder={t('authOnboardingSetup.localityPlaceholder')} />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={styles.row2Item}>
          <Field label={t('authOnboardingSetup.phoneLabel')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="022 000 00 00" />
        </View>
        <View style={styles.row2Item}>
          <Field label={t('authOnboardingSetup.emailLabel')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="contact@entreprise.ch" />
        </View>
      </View>

      <Field label={t('authOnboardingSetup.ideLabel')} value={ideNumber} onChangeText={setIdeNumber} placeholder="CHE-123.456.789" />
      <Text style={styles.hint}>{t('authOnboardingSetup.allOptionalHint')}</Text>
    </View>
  );
}

function StepModules({
  plan,
  enabledModules,
  isPlanGated,
  onToggle,
  onReachStep,
}: {
  plan: Plan | null | undefined;
  enabledModules: ModuleKey[];
  isPlanGated: (key: ModuleKey) => boolean;
  onToggle: (key: ModuleKey) => void;
  onReachStep: () => void;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    onReachStep();
  }, [onReachStep]);
  return (
    <View>
      <Text style={styles.title}>{t('authOnboardingSetup.modulesTitle')}</Text>
      <Text style={styles.subtitle}>{t('authOnboardingSetup.modulesSubtitle')}</Text>

      <View style={{ gap: spacing.md }}>
        {ORG_MODULES.map((m) => {
          const gated = plan !== undefined && isPlanGated(m.key);
          const active = !gated && isModuleEnabled(enabledModules, m.key);
          return (
            <Pressable
              key={m.key}
              onPress={() => onToggle(m.key)}
              disabled={gated}
              style={[styles.moduleCard, active && styles.moduleCardActive, gated && styles.moduleCardGated]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.moduleLabel}>{t(`modules.${m.key}.label` as any)}</Text>
                <Text style={styles.moduleDesc}>{t(`modules.${m.key}.description` as any)}</Text>
                {gated ? <Text style={styles.moduleGatedHint}>{t('authOnboardingSetup.moduleUpgradeHint')}</Text> : null}
              </View>
              <View style={[styles.moduleCheck, active && styles.moduleCheckActive]}>
                {active ? <Feather name="check" size={13} color="#fff" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>{t('authOnboardingSetup.modulesChangeLaterHint')}</Text>
    </View>
  );
}

function StepRecap({
  organization,
  website,
  street,
  postalCode,
  locality,
  enabledModules,
  onEditProfile,
  onEditModules,
}: {
  organization: { name: string; trade: string | null } | null;
  website: string;
  street: string;
  postalCode: string;
  locality: string;
  enabledModules: ModuleKey[];
  onEditProfile: () => void;
  onEditModules: () => void;
}) {
  const { t } = useTranslation();
  const activeModuleLabels = ORG_MODULES.filter((m) => isModuleEnabled(enabledModules, m.key)).map((m) => t(`modules.${m.key}.label` as any));
  const addressLine = [street, [postalCode, locality].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return (
    <View>
      <Feather name="check-circle" size={32} color={colors.success} style={styles.recapIcon} />
      <Text style={[styles.title, { textAlign: 'center' }]}>{t('authOnboardingSetup.recapTitle')}</Text>
      <Text style={[styles.subtitle, { textAlign: 'center' }]}>{t('authOnboardingSetup.recapSubtitle')}</Text>

      <View style={styles.recapCard}>
        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>{t('authOnboardingSetup.recapCompany')}</Text>
          <Pressable onPress={onEditProfile} hitSlop={6}>
            <Text style={styles.recapEdit}>{t('authOnboardingSetup.recapEdit')}</Text>
          </Pressable>
        </View>
        <Text style={styles.recapValue}>{organization?.name}</Text>
        {addressLine ? <Text style={styles.recapValueMuted}>{addressLine}</Text> : null}
        {website.trim() ? <Text style={styles.recapValueMuted}>{website.trim()}</Text> : null}
      </View>

      <View style={styles.recapCard}>
        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>{t('authOnboardingSetup.recapModules')}</Text>
          <Pressable onPress={onEditModules} hitSlop={6}>
            <Text style={styles.recapEdit}>{t('authOnboardingSetup.recapEdit')}</Text>
          </Pressable>
        </View>
        {activeModuleLabels.length ? (
          <Text style={styles.recapValue}>{activeModuleLabels.join(' · ')}</Text>
        ) : (
          <Text style={styles.recapValueMuted}>{t('authOnboardingSetup.recapNoModules')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  progressDot: {
    width: 28,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 160,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logoPreview: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  logoButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: colors.text,
  },
  analyzeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  analyzeLinkText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  moduleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  moduleCardGated: {
    opacity: 0.55,
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
    lineHeight: 17,
  },
  moduleGatedHint: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  moduleCheck: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  recapIcon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  recapCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  recapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  recapLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recapEdit: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  recapValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  recapValueMuted: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backBtnText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  skipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
