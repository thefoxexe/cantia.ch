import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../ui';
import { MarketingHead } from '../MarketingHead';
import { MarketingFooter, MarketingNav } from '../MarketingChrome';
import { PageHero, pageWrap } from '../landing/PageHero';
import { CtaButton } from '../landing/CtaButton';
import { bodyInk, ink, rule } from '../landing/brand';
import { Heading } from '../Heading';
import { authHref } from '../../lib/appHost';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { displayType, marketingFonts, monoType } from '../../lib/marketingTheme';
import { TOOLS } from '../../lib/tools/registry';

// Shared frame of the free tools on cantia.ch/outils (lead magnets): hero,
// form on the left, result on the right, the Cantia call to action, an FAQ
// (also in scripts/seo-routes.mjs for the FAQ rich result) and the other
// tools. Every tool runs in the browser; nothing is stored except the
// email a visitor leaves to download the PDF (components/tools/LeadGate).

export function ToolPage({
  slug,
  metaTitle,
  metaDescription,
  kicker,
  title,
  lede,
  form,
  result,
  cta,
  faq,
  extra,
}: {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lede: string;
  form: ReactNode;
  result: ReactNode;
  cta: { title: string; points: string[] };
  faq: { q: string; a: string }[];
  extra?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={metaTitle} description={metaDescription} />
      <MarketingNav />
      <ScrollView>
        <PageHero kicker={kicker} title={title} lede={lede} />
        <View style={[pageWrap, styles.body]}>
          <View style={[styles.columns, wide && styles.columnsWide]}>
            <View style={wide ? { flex: 1 } : null}>{form}</View>
            <View style={wide ? { flex: 1 } : null}>{result}</View>
          </View>

          {extra}

          <View style={styles.cta}>
            <Text style={styles.ctaKicker}>DANS CANTIA, TOUT EST AUTOMATIQUE</Text>
            <Heading level={2} style={styles.ctaTitle}>
              {cta.title}
            </Heading>
            <View style={{ gap: spacing.sm }}>
              {cta.points.map((p) => (
                <View key={p} style={styles.ctaItem}>
                  <Text style={styles.ctaCheck}>✓</Text>
                  <Text style={styles.ctaText}>{p}</Text>
                </View>
              ))}
            </View>
            <View style={styles.ctaButtons}>
              <Link href={authHref('signup') as any} asChild>
                <CtaButton title="Essayer 14 jours" tone="light" />
              </Link>
              <Text style={styles.ctaNote}>Sans engagement · Données hébergées en Suisse</Text>
            </View>
          </View>

          <View style={{ gap: spacing.md }}>
            <Heading level={2} style={styles.h2}>
              Questions fréquentes
            </Heading>
            {faq.map((f) => (
              <Faq key={f.q} q={f.q} a={f.a} />
            ))}
          </View>

          <View style={{ gap: spacing.md }}>
            <Heading level={2} style={styles.h2}>
              Les autres outils gratuits
            </Heading>
            <View style={styles.toolGrid}>
              {TOOLS.filter((t) => t.slug !== slug).map((t) => (
                <Link key={t.slug} href={t.href as any} asChild>
                  <Pressable style={StyleSheet.flatten([styles.toolCard, { flexBasis: wide ? '31%' : '100%' }])}>
                    <Feather name={t.icon as any} size={18} color={colors.primary} />
                    <Text style={styles.toolTitle}>{t.title}</Text>
                    <Text style={styles.toolText}>{t.text}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        </View>
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((v) => !v)} style={styles.faq}>
      <View style={styles.faqHead}>
        <Text style={styles.faqQ}>{q}</Text>
        <Feather name={open ? 'minus' : 'plus'} size={16} color={colors.primary} />
      </View>
      {open ? <Text style={styles.faqA}>{a}</Text> : null}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Form and result pieces shared by every tool

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

export function Input({ value, onChange, placeholder, suffix, wide }: { value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string; wide?: boolean }) {
  return (
    <View style={[styles.inputWrap, wide && { flex: 1, minWidth: 160 }]}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" inputMode="decimal" style={styles.input} />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Label>{label}</Label>
      {children}
      {hint ? <Hint>{hint}</Hint> : null}
    </View>
  );
}

export function Chips<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <Pressable key={String(o.value)} onPress={() => onChange(o.value)} style={[styles.chip, value === o.value && styles.chipOn]}>
          <Text style={[styles.chipText, value === o.value && styles.chipTextOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function BigResult({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.big}>
      <Text style={styles.bigLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.bigValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub ? <Text style={styles.bigSub}>{sub}</Text> : null}
    </View>
  );
}

export function Lines({ title, rows }: { title?: string; rows: { label: string; value: string; strong?: boolean; meta?: string }[] }) {
  return (
    <View style={styles.table}>
      {title ? <Text style={styles.tableTitle}>{title}</Text> : null}
      {rows.map((r) => (
        <View key={r.label} style={[styles.line, r.strong && styles.lineStrong]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lineLabel, r.strong && { fontWeight: '700' }]}>{r.label}</Text>
            {r.meta ? <Text style={styles.lineMeta}>{r.meta}</Text> : null}
          </View>
          <Text style={[styles.lineValue, r.strong && { fontWeight: '800' }]}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function Note({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'ok' | 'warn' }) {
  const bg = tone === 'ok' ? colors.successSoft : tone === 'warn' ? colors.warningSoft : colors.surfaceAlt;
  return (
    <View style={[styles.note, { backgroundColor: bg }]}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: spacing.xxxl, gap: spacing.xxxl },
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  group: { gap: spacing.sm, padding: spacing.lg, borderWidth: 1, borderColor: rule, backgroundColor: colors.surface, borderRadius: 4 },
  groupTitle: { ...monoType, fontSize: 11, letterSpacing: 1.2, color: colors.primary, marginBottom: spacing.xs },
  label: { fontFamily: marketingFonts.body, fontSize: 13, fontWeight: '600', color: ink, marginTop: spacing.xs },
  hint: { fontFamily: marketingFonts.body, fontSize: 12, color: bodyInk, lineHeight: 17 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.bg, paddingHorizontal: spacing.md, minHeight: 44 },
  input: { flex: 1, minWidth: 60, fontFamily: marketingFonts.body, fontSize: 16, fontWeight: '600', color: ink, paddingVertical: 10, outlineStyle: 'none' } as any,
  suffix: { fontFamily: marketingFonts.body, fontSize: 13, color: bodyInk, marginLeft: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontFamily: marketingFonts.body, fontSize: 13, fontWeight: '600', color: ink },
  chipTextOn: { color: colors.primaryDark },
  big: { padding: spacing.xl, backgroundColor: ink, borderRadius: 4, gap: 6 },
  bigLabel: { ...monoType, fontSize: 11, letterSpacing: 1.2, color: '#E8C9A8' },
  bigValue: { ...displayType, fontSize: 48, lineHeight: 52, fontWeight: '800', color: '#FBF6EE', fontVariant: ['tabular-nums'] },
  bigSub: { fontFamily: marketingFonts.body, fontSize: 13, color: '#D9CBB8' },
  table: { borderWidth: 1, borderColor: rule, backgroundColor: colors.surface, borderRadius: 4, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  tableTitle: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: ink, paddingVertical: spacing.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border },
  lineStrong: { borderTopColor: ink },
  lineLabel: { fontFamily: marketingFonts.body, fontSize: 14, color: ink },
  lineMeta: { ...monoType, fontSize: 10.5, color: bodyInk, marginTop: 2 },
  lineValue: { fontFamily: marketingFonts.body, fontSize: 14, fontWeight: '600', color: ink, fontVariant: ['tabular-nums'] },
  note: { padding: spacing.lg, borderRadius: 4 },
  noteText: { fontFamily: marketingFonts.body, fontSize: 14, lineHeight: 21, color: ink },
  cta: { padding: spacing.xxl, backgroundColor: colors.primaryDark, borderRadius: 4, gap: spacing.md },
  ctaKicker: { ...monoType, fontSize: 11, letterSpacing: 1.4, color: '#F5DECB' },
  ctaTitle: { ...displayType, fontSize: 36, lineHeight: 38, fontWeight: '800', color: '#FBF6EE' },
  ctaItem: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  ctaCheck: { fontSize: 15, fontWeight: '800', color: '#F5DECB', lineHeight: 22 },
  ctaText: { flex: 1, fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 22, color: '#FBF6EE' },
  ctaButtons: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  ctaNote: { fontFamily: marketingFonts.body, fontSize: 13, color: '#F5DECB' },
  h2: { ...displayType, fontSize: 32, lineHeight: 34, fontWeight: '800', color: ink },
  faq: { borderTopWidth: 1, borderTopColor: rule, paddingVertical: spacing.md, gap: spacing.sm },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  faqQ: { flex: 1, fontFamily: marketingFonts.body, fontSize: 16, fontWeight: '700', color: ink },
  faqA: { fontFamily: marketingFonts.body, fontSize: 15, lineHeight: 23, color: bodyInk, maxWidth: 820 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  toolCard: { flexGrow: 1, gap: 6, padding: spacing.lg, borderWidth: 1, borderColor: rule, borderRadius: 4, backgroundColor: colors.surface },
  toolTitle: { fontFamily: marketingFonts.body, fontSize: 16, fontWeight: '700', color: ink },
  toolText: { fontFamily: marketingFonts.body, fontSize: 13, lineHeight: 19, color: bodyInk },
});
