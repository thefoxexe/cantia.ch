import { forwardRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions, type TextInputProps } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Eyebrow, Headline } from './Primitives';
import { PhoneShot } from './Sections';
import { EXPORTS } from './exports';
import { sans, serif, site } from '../../lib/siteTheme';
import { getAppLocale } from '../../lib/translations';
import { AUTH_COPY, type AuthProduct } from '../../lib/site/auth';

const LOGO = require('../../assets/brand/logo.png');

// Sign-in, sign-up and password screens of the three products (Cantia,
// Accounting, Partners): the form on the left, the product's own panel on
// the right; on a phone, the logo and the form only. Each product has its
// own screens, there is no product switcher.
export function AuthLayout({ product = 'cantia', backHref, children, visual, locale: forced }: { product?: AuthProduct; backHref: string; children: React.ReactNode; visual?: React.ReactNode; locale?: 'fr' | 'de' | 'it' }) {
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const locale = forced ?? getAppLocale();
  const c = AUTH_COPY[locale];
  const story = c.stories[product];

  return (
    <View style={[styles.root, wide && { flexDirection: 'row' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.panel, wide && { flex: 1 }]}>
        <ScrollView contentContainerStyle={[styles.panelInner, { paddingHorizontal: width <= 370 ? 18 : width <= 760 ? 22 : 45 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>
            <Link href={backHref as any} asChild>
              <Pressable accessibilityRole="link" style={styles.back}>
                <Feather name="arrow-left" size={13} color={site.muted} />
                <Text style={[sans, styles.backText]}>{c.back}</Text>
              </Pressable>
            </Link>
            {!wide ? <ProductMark product={product} small /> : null}
          </View>
          <View style={styles.formWrap}>{children}</View>
          <View style={styles.bottom}>
            <Text style={[sans, styles.bottomText]}>© {new Date().getFullYear()} Cantia</Text>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <Link href={c.privacyHref as any}>
                <Text style={[sans, styles.bottomText]}>{c.privacy}</Text>
              </Link>
              <Link href={c.helpHref as any}>
                <Text style={[sans, styles.bottomText]}>{c.help}</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {wide ? (
        <View style={[styles.story, { padding: width <= 1100 ? 35 : 58 }]}>
          <View>
            <ProductMark product={product} />
            <Text style={[sans, styles.storyLabel]}>{story.label.toUpperCase()}</Text>
          </View>
          <View style={styles.storyMain}>
            <Headline plain={story.plain} accent={story.accent} size={width <= 1100 ? 45 : 55} style={{ letterSpacing: -2, marginBottom: 25 }} />
            <Text style={[sans, styles.storyText]}>{story.text}</Text>
            {visual !== undefined ? visual : product === 'cantia' ? <View style={{ marginTop: 34 }}><DefaultVisual /></View> : null}
          </View>
          <Text style={[sans, styles.storyBottom]}>{c.madeIn}</Text>
        </View>
      ) : null}
    </View>
  );
}

// The real Cantia dashboard on a phone (sample data), cropped by the panel.
function DefaultVisual() {
  const app = EXPORTS[getAppLocale()].app;
  return (
    <View style={{ height: 300, overflow: 'hidden' }}>
      <PhoneShot source={app.dashMobile.source} ratio={app.dashMobile.ratio} width={210} alt="Cantia" />
    </View>
  );
}

function ProductMark({ product, small }: { product: AuthProduct; small?: boolean }) {
  const w = small ? 118 : 150;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Image source={LOGO} style={{ width: w, height: w * (192 / 1036) }} resizeMode="contain" accessibilityLabel="Cantia" />
      {product !== 'cantia' ? (
        <Text style={[sans, styles.productName, small && { fontSize: 9 }]}>{product === 'accounting' ? 'ACCOUNTING' : 'PARTNERS'}</Text>
      ) : null}
    </View>
  );
}

export function AuthHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text role="heading" aria-level={1} style={[sans, styles.h1]}>
        {title}
      </Text>
      {text ? <Text style={[sans, styles.lead]}>{text}</Text> : null}
    </View>
  );
}

type AuthFieldProps = TextInputProps & { label: string; aside?: React.ReactNode; password?: boolean; showLabel?: string; hideLabel?: string };

export const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField({ label, aside, password, showLabel = 'Afficher', hideLabel = 'Masquer', style, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={[sans, styles.fieldLabel]}>{label}</Text>
        {aside}
      </View>
      <View>
        <TextInput
          ref={ref}
          placeholderTextColor="#a1a697"
          secureTextEntry={password && !visible}
          onFocus={(e) => {
            setFocus(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            rest.onBlur?.(e);
          }}
          style={[sans, styles.input, password && { paddingRight: 76 }, focus && styles.inputFocus, style]}
          {...rest}
        />
        {password ? (
          <Pressable onPress={() => setVisible((v) => !v)} style={styles.reveal} accessibilityRole="button">
            <Text style={[sans, { fontSize: 10, color: site.muted }]}>{visible ? hideLabel : showLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

export function AuthSubmit({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={loading} accessibilityRole="button" style={({ hovered }: any) => [styles.submit, (hovered || loading) && { backgroundColor: site.rust }]}>
      <Text style={[sans, styles.submitText]}>{loading ? '…' : label}</Text>
      <Feather name="arrow-right" size={15} color="#ffffff" />
    </Pressable>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={[sans, styles.dividerText]}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function AuthSwitch({ text, link, href }: { text: string; link: string; href: string }) {
  return (
    <Text style={[sans, styles.switch]}>
      {text ? `${text} ` : ''}
      <Link href={href as any}>
        <Text style={{ color: site.copper, fontWeight: '600' }}>{link}</Text>
      </Link>
    </Text>
  );
}

export function AuthNote({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'error' }) {
  return (
    <View style={[styles.note, tone === 'error' && { backgroundColor: '#f8ebe6', borderColor: '#ebcfc3' }]}>
      <Text style={[sans, styles.noteText, tone === 'error' && { color: '#8d3b24' }]}>{children}</Text>
    </View>
  );
}

export const authStyles = StyleSheet.create({
  smallLink: { fontSize: 10, color: site.copper, fontWeight: '500' },
});

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100%' as any, backgroundColor: site.white },
  panel: { backgroundColor: site.white },
  panelInner: { flexGrow: 1, paddingTop: 30, paddingBottom: 25 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  backText: { fontSize: 11, color: site.muted },
  formWrap: { width: '100%', maxWidth: 360, marginHorizontal: 'auto', paddingVertical: 45, flexGrow: 1, justifyContent: 'center' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', gap: 18 },
  bottomText: { fontSize: 9, color: '#929983' },
  story: { flex: 1, backgroundColor: '#e7d8c5', borderLeftWidth: 1, borderLeftColor: '#d8c8b3', justifyContent: 'space-between', overflow: 'hidden' },
  productName: { fontSize: 10, letterSpacing: 1.4, color: site.copper, fontWeight: '600', borderLeftWidth: 1, borderLeftColor: '#cdb9a2', paddingLeft: 10 },
  storyLabel: { fontSize: 8, letterSpacing: 1.7, color: '#8d755c', marginTop: 29 },
  storyMain: { maxWidth: 460, paddingVertical: 40 },
  storyText: { fontSize: 13, color: '#8a7d6c', maxWidth: 340, lineHeight: 24 },
  storyBottom: { fontSize: 9, color: '#8b7d68' },
  h1: { fontSize: 34, lineHeight: 38, letterSpacing: -1.3, color: site.ink, marginTop: 16, marginBottom: 12 },
  lead: { fontSize: 12, color: site.muted, lineHeight: 21, marginBottom: 12 },
  field: { marginVertical: 10 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '500', color: site.ink },
  input: { height: 45, borderWidth: 1, borderColor: '#d7dacf', borderRadius: 5, backgroundColor: site.white, paddingHorizontal: 14, fontSize: 13, color: site.ink, outlineStyle: 'none' } as object,
  inputFocus: { borderColor: site.copper, boxShadow: '0 0 0 2px rgba(166,93,54,0.2)' } as object,
  reveal: { position: 'absolute', right: 12, top: 0, height: 45, justifyContent: 'center', paddingHorizontal: 2 },
  submit: { marginTop: 14, height: 46, borderRadius: 5, backgroundColor: site.copper, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  submitText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 15, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e4d9' },
  dividerText: { fontSize: 10, color: '#9ca28f' },
  switch: { fontSize: 11, textAlign: 'center', color: site.muted, marginTop: 24 },
  note: { padding: 14, backgroundColor: '#f0f2e8', borderWidth: 1, borderColor: '#dde1d1', borderRadius: 5, marginTop: 14 },
  noteText: { fontSize: 11, color: '#626b53', lineHeight: 19 },
});
