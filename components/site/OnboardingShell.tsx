import { forwardRef, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { getAppLocale } from '../../lib/translations';
import { sans, site } from '../../lib/siteTheme';
import { useSiteFontScope } from './Primitives';

const LOGO = require('../../assets/brand/logo.png');

// The three steps between the account and the app: the company, the plan
// (with the 14-day trial), then the company profile.
const STEPS = {
  fr: ['Entreprise', 'Formule', 'Profil'],
  de: ['Unternehmen', 'Abo', 'Profil'],
  it: ['Azienda', 'Piano', 'Profilo'],
} as const;
const OUT = { fr: 'Se déconnecter', de: 'Abmelden', it: 'Esci' } as const;
const STEP_OF = { fr: 'Étape {n} sur 3', de: 'Schritt {n} von 3', it: 'Passo {n} di 3' } as const;

// Frame of every screen a new member goes through before the app
// (app/(auth)/onboarding/*, choose-plan): the site's ground and typeface, the
// logo, where they are in the steps, and a way out.
export const OnboardingShell = forwardRef<ScrollView, { step?: 1 | 2 | 3; children: ReactNode; contentContainerStyle?: StyleProp<ViewStyle> }>(function OnboardingShell({ step, children, contentContainerStyle }, ref) {
  useSiteFontScope();
  const { session, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const phone = width <= 640;
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const steps = STEPS[locale] ?? STEPS.fr;
  return (
    <View style={styles.root}>
      <View style={[styles.bar, { paddingHorizontal: phone ? 18 : 32 }]}>
        <Image source={LOGO} style={{ width: phone ? 104 : 124, height: phone ? 19 : 23 }} resizeMode="contain" accessibilityLabel="Cantia" />
        {step && !phone ? (
          <View style={styles.steps}>
            {steps.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const on = n === step;
              return (
                <View key={label} style={styles.stepItem}>
                  {i > 0 ? <View style={[styles.stepLine, n <= step && { backgroundColor: site.copper }]} /> : null}
                  <View style={[styles.stepDot, (done || on) && { backgroundColor: site.copper, borderColor: site.copper }]}>
                    {done ? <Feather name="check" size={11} color="#fff" /> : <Text style={[sans, styles.stepNum, on && { color: '#fff' }]}>{n}</Text>}
                  </View>
                  <Text style={[sans, styles.stepLabel, on && { color: site.ink, fontWeight: '600' }]}>{label}</Text>
                </View>
              );
            })}
          </View>
        ) : step ? (
          <Text style={[sans, styles.stepOf]}>{STEP_OF[locale].replace('{n}', String(step))}</Text>
        ) : (
          <View />
        )}
        {session ? (
        <Pressable onPress={signOut} accessibilityRole="button" style={({ hovered }: any) => [styles.out, hovered && { borderColor: site.copper }]}>
          <Feather name="log-out" size={13} color={site.ink} />
          {!phone ? <Text style={[sans, styles.outText]}>{OUT[locale]}</Text> : null}
        </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <ScrollView ref={ref} style={{ flex: 1 }} contentContainerStyle={[{ flexGrow: 1, paddingTop: phone ? 26 : 48, paddingBottom: 60, paddingHorizontal: phone ? 18 : 32 }, contentContainerStyle]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
});

// Title and lead of an onboarding screen, in the site's type.
export const onboardingType = StyleSheet.create({
  title: { fontFamily: 'DM Sans, "DM Sans Fallback", Arial, sans-serif', fontSize: 34, lineHeight: 40, fontWeight: '400', letterSpacing: -1.2, color: site.ink },
  subtitle: { fontFamily: 'DM Sans, "DM Sans Fallback", Arial, sans-serif', fontSize: 14, lineHeight: 23, color: site.muted },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: site.bg },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderBottomColor: site.line, backgroundColor: site.bg },
  steps: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepLine: { width: 38, height: 1, backgroundColor: '#d8d9cd', marginHorizontal: 10 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#cfd1c4', alignItems: 'center', justifyContent: 'center', backgroundColor: site.white },
  stepNum: { fontSize: 10, color: site.muted, fontWeight: '600' },
  stepLabel: { fontSize: 12, color: site.muted },
  stepOf: { fontSize: 11, color: site.muted },
  out: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: site.line, backgroundColor: site.white },
  outText: { fontSize: 12, color: site.ink },
});
