import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
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
import { isValidSwissIban, formatIban } from '../../../lib/iban';
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
const MODULE_ICONS: Record<ModuleKey, keyof typeof Feather.glyphMap> = {
  devis: 'file-text',
  planning: 'calendar',
  payroll: 'users',
  treasury: 'trending-up',
  accounting: 'book-open',
  documents: 'folder',
  photos: 'camera',
  metre: 'list',
  subcontractors: 'briefcase',
  profitability: 'bar-chart-2',
};

const STEP_COUNT = 3;
const STEP_ICONS: (keyof typeof Feather.glyphMap)[] = ['briefcase', 'sliders', 'check-circle'];

export default function OnboardingSetupScreen() {
  const { t } = useTranslation();
  const { organization, refreshOrganization } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(1);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  // Step 1 — company profile
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [street, setStreet] = useState(organization?.street ?? '');
  const [postalCode, setPostalCode] = useState(organization?.postal_code ?? '');
  const [locality, setLocality] = useState(organization?.locality ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [iban, setIban] = useState(organization?.iban ?? '');
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
    if (plan === undefined || isPlanGated(key)) return;
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

  function validateProfile(): string | null {
    if (!street.trim() || !postalCode.trim() || !locality.trim()) return t('authOnboardingSetup.addressRequired');
    if (!phone.trim()) return t('authOnboardingSetup.phoneRequired');
    if (!email.trim()) return t('authOnboardingSetup.emailRequired');
    if (iban.trim() && !isValidSwissIban(iban.trim())) return t('authOnboardingSetup.ibanInvalid');
    return null;
  }

  // Returns false (and sets `error`) on failure so callers can stop the
  // wizard from silently moving on past a write that never actually landed.
  async function persistProfile(): Promise<boolean> {
    if (!organization) return false;
    const updates: Record<string, string | null> = {
      street: street.trim(),
      postal_code: postalCode.trim(),
      locality: locality.trim(),
      phone: phone.trim(),
      email: email.trim(),
      ide_number: ideNumber.trim(),
    };
    if (website.trim()) updates.website = website.trim();
    if (iban.trim()) updates.iban = iban.trim().replace(/\s+/g, '').toUpperCase();
    if (HEX_COLOR_RE.test(brandColor) && brandColor.toLowerCase() !== DEFAULT_BRAND_COLOR.toLowerCase()) {
      updates.brand_color = brandColor;
    }
    if (logoAsset) {
      const raw = assetFileInfo(logoAsset);
      const { uri, ext, contentType } = await normalizeImageOrientation(logoAsset.uri, raw.contentType);
      const { path, error: uploadError } = await uploadToOrgBucket(organization.id, `branding/logo-${Date.now()}.${ext}`, uri, contentType);
      if (path) updates.logo_url = path;
      else if (uploadError) console.error('Logo upload failed:', uploadError);
    }
    const { error: dbError } = await supabase.from('organizations').update(updates).eq('id', organization.id);
    if (dbError) {
      setError(dbError.message);
      return false;
    }
    return true;
  }

  async function handleNext() {
    setError(null);
    if (step === 1) {
      const validationError = validateProfile();
      if (validationError) {
        setError(validationError);
        return;
      }
      setFinishing(true);
      const ok = await persistProfile();
      setFinishing(false);
      if (!ok) return;
      setStep(2);
      loadPlanOnce();
      return;
    }
    if (step === 2) {
      if (!organization) return;
      setFinishing(true);
      const { error: dbError } = await supabase.from('organizations').update({ enabled_modules: enabledModules }).eq('id', organization.id);
      setFinishing(false);
      if (dbError) {
        setError(dbError.message);
        return;
      }
      setStep(3);
      return;
    }
    await handleFinish();
  }

  async function handleFinish() {
    if (!organization || finishing) return;
    setError(null);
    setFinishing(true);
    const { error: dbError } = await supabase.from('organizations').update({ onboarding_completed: true }).eq('id', organization.id);
    if (dbError) {
      setFinishing(false);
      setError(dbError.message);
      return;
    }
    await refreshOrganization();
    setFinishing(false);
    // Belt-and-suspenders: the root layout's own redirect effect also
    // reacts to organization.onboarding_completed flipping true, but
    // navigating explicitly here means this screen never sits there doing
    // nothing if that effect is ever slow to re-fire.
    router.replace('/(app)');
  }

  async function handleSkipModules() {
    if (!organization || finishing) return;
    setError(null);
    setFinishing(true);
    const { error: dbError } = await supabase.from('organizations').update({ enabled_modules: DEFAULT_ACTIVE_MODULES, onboarding_completed: true }).eq('id', organization.id);
    if (dbError) {
      setFinishing(false);
      setError(dbError.message);
      return;
    }
    await refreshOrganization();
    setFinishing(false);
    router.replace('/(app)');
  }

  return (
    <Screen background="mountain">
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <View style={styles.stepIconWrap}>
          <Feather name={STEP_ICONS[step - 1]} size={22} color={colors.primary} />
        </View>
        <View style={styles.progressRow}>
          {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((n) => (
            <View key={n} style={styles.progressSegment}>
              <View style={[styles.progressDot, n < step && styles.progressDotDone, n === step && styles.progressDotActive]}>
                {n < step ? <Feather name="check" size={11} color="#fff" /> : <Text style={[styles.progressDotText, n === step && styles.progressDotTextActive]}>{n}</Text>}
              </View>
              {n < STEP_COUNT ? <View style={[styles.progressLine, n < step && styles.progressLineDone]} /> : null}
            </View>
          ))}
        </View>

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
            iban={iban}
            setIban={setIban}
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
            iban={iban}
            enabledModules={enabledModules}
            onEditProfile={() => setStep(1)}
            onEditModules={() => setStep(2)}
          />
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.footer}>
          {step > 1 ? (
            <Pressable onPress={() => { setError(null); setStep((s) => s - 1); }} style={styles.backBtn} hitSlop={8}>
              <Feather name="arrow-left" size={15} color={colors.textMuted} />
              <Text style={styles.backBtnText}>{t('authOnboardingSetup.previous')}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {step === 2 ? (
            <Pressable onPress={handleSkipModules} hitSlop={8} disabled={finishing}>
              <Text style={styles.skipText}>{t('authOnboardingSetup.skip')}</Text>
            </Pressable>
          ) : null}
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
  iban,
  setIban,
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
  iban: string;
  setIban: (v: string) => void;
  logoAsset: { uri: string } | null;
  onPickLogo: () => void;
  brandColor: string;
  setBrandColor: (v: string) => void;
  suggestedColors: string[];
  analyzingWebsite: boolean;
  onAnalyzeWebsite: () => void;
}) {
  const { t } = useTranslation();
  const validIban = !iban.trim() || isValidSwissIban(iban.trim());
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

      <View style={styles.sectionDivider}>
        <Text style={styles.sectionDividerText}>{t('authOnboardingSetup.requiredSectionTitle')}</Text>
      </View>

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

      <View style={styles.sectionDivider}>
        <Text style={styles.sectionDividerText}>{t('authOnboardingSetup.optionalSectionTitle')}</Text>
      </View>
      <Field label={t('authOnboardingSetup.ideLabel')} value={ideNumber} onChangeText={setIdeNumber} placeholder="CHE-123.456.789" />
      <Field
        label={t('authOnboardingSetup.ibanLabel')}
        value={iban}
        onChangeText={setIban}
        autoCapitalize="characters"
        placeholder="CH93 0076 2011 6238 5295 7"
      />
      {iban.trim() && !validIban ? (
        <Text style={styles.errorHint}>{t('authOnboardingSetup.ibanInvalid')}</Text>
      ) : (
        <Text style={styles.hint}>{t('authOnboardingSetup.ibanHint')}</Text>
      )}
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
              <View style={[styles.moduleIcon, active && styles.moduleIconActive]}>
                <Feather name={MODULE_ICONS[m.key]} size={18} color={active ? '#fff' : colors.primary} />
              </View>
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
  iban,
  enabledModules,
  onEditProfile,
  onEditModules,
}: {
  organization: { name: string; trade: string | null } | null;
  website: string;
  street: string;
  postalCode: string;
  locality: string;
  iban: string;
  enabledModules: ModuleKey[];
  onEditProfile: () => void;
  onEditModules: () => void;
}) {
  const { t } = useTranslation();
  const activeModuleLabels = ORG_MODULES.filter((m) => isModuleEnabled(enabledModules, m.key)).map((m) => t(`modules.${m.key}.label` as any));
  const addressLine = [street, [postalCode, locality].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return (
    <View>
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
        {iban.trim() ? <Text style={styles.recapValueMuted}>{formatIban(iban.trim())}</Text> : null}
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
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  progressDotDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  progressDotTextActive: {
    color: colors.primary,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  progressLineDone: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 21,
    textAlign: 'center',
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
  errorHint: {
    fontSize: fontSize.xs,
    color: colors.danger,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionDividerText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  moduleIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconActive: {
    backgroundColor: colors.primary,
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
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.md,
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
