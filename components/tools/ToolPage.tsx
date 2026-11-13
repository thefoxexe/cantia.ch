import { createContext, useContext, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Eyebrow, Headline, Hover, Wrap } from '../site/Primitives';
import { Breadcrumbs, Section, SitePage, useSiteLayout } from '../site/Sections';
import { FaqItem } from '../site/FamilyPage';
import { authHref } from '../../lib/appHost';
import { sans, site } from '../../lib/siteTheme';
import { toolsFor } from '../../lib/tools/registry';
import { toolLocale, toolPrefix, toolsChrome } from '../../lib/tools/copy';

// Shared frame of the free tools on cantia.ch/outils (lead magnets): hero,
// form on the left, result on the right, the Cantia call to action, an FAQ
// (also in scripts/seo-routes.mjs for the FAQ rich result; answers stay in
// the page) and the other tools. Every tool runs in the browser; nothing is
// stored except the email a visitor leaves to download the PDF
// (components/tools/LeadGate).

const INK = '#293128';

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
  const { phone, tablet, width, h2Size } = useSiteLayout();
  const locale = toolLocale();
  const prefix = toolPrefix(locale);
  const C = toolsChrome(locale);
  const tools = toolsFor(locale);
  const wide = width >= 980;
  const h1 = phone ? 38 : tablet ? 44 : 52;
  return (
    <SitePage title={metaTitle} description={metaDescription} cta={false}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 30 : 44 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: C.home, href: prefix || '/' }, { label: C.tools, href: `${prefix}/outils` }, { label: kicker }]} />
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{kicker}</Eyebrow>
          <Headline level={1} plain={title} size={h1} style={{ marginTop: 16, marginBottom: 20, maxWidth: 900, letterSpacing: phone ? -1.6 : -2.4, lineHeight: h1 * 1.08 }} />
          <Text style={[sans, styles.lede, phone && { fontSize: 13, lineHeight: 24 }]}>{lede}</Text>
        </Wrap>
      </View>

      <View style={{ paddingBottom: phone ? 50 : 80 }}>
        <Wrap>
          <View style={[styles.columns, wide && styles.columnsWide]}>
            <View style={wide ? { flex: 1 } : null}>{form}</View>
            <View style={wide ? { flex: 1 } : null}>{result}</View>
          </View>
          {extra ? <View style={{ marginTop: 40 }}>{extra}</View> : null}
        </Wrap>
      </View>

      {/* Cantia does it for you */}
      <View style={[styles.cta, { paddingVertical: phone ? 40 : 60 }]}>
        <Wrap style={wide ? { flexDirection: 'row', gap: 60, alignItems: 'center' } : { gap: 24 }}>
          <View style={wide ? { flex: 1 } : undefined}>
            <Text style={[sans, styles.ctaKicker]}>{C.ctaKicker}</Text>
            <Headline plain={cta.title} size={phone ? 30 : 36} color="#f4f3e9" style={{ marginTop: 14 }} />
            <View style={{ marginTop: 26, alignSelf: 'flex-start' }}>
              <Btn label={C.ctaButton} href={authHref('signup')} tone="sand" />
            </View>
            <Text style={[sans, styles.ctaNote]}>{C.ctaNote}</Text>
          </View>
          <View style={[wide ? { flex: 1 } : undefined, { gap: 12 }]}>
            {cta.points.map((p) => (
              <View key={p} style={styles.ctaItem}>
                <Feather name="check" size={15} color="#d9aa85" style={{ marginTop: 3 }} />
                <Text style={[sans, styles.ctaText]}>{p}</Text>
              </View>
            ))}
          </View>
        </Wrap>
      </View>

      <Section>
        <View style={styles.faq}>
          <Eyebrow>{C.faqEyebrow}</Eyebrow>
          <Headline plain={C.faqTitle} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
          {faq.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} last={i === faq.length - 1} />
          ))}
        </View>
      </Section>

      <Section white>
        <Eyebrow>{C.othersEyebrow}</Eyebrow>
        <Headline plain={C.othersTitle} size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
        <View style={styles.toolGrid}>
          {tools.filter((t) => t.slug !== slug).map((t) => (
            <Link key={t.slug} href={t.href as any} asChild>
              <Hover accessibilityRole="link" base={[styles.toolCard, { width: phone ? '100%' : width <= 900 ? '47.5%' : '31.5%' }]} hover={{ borderColor: site.copper }}>
                <Feather name={t.icon as any} size={18} color={site.copper} />
                <Text style={[sans, styles.toolTitle]}>{t.title}</Text>
                <Text style={[sans, styles.toolText]}>{t.text}</Text>
              </Hover>
            </Link>
          ))}
        </View>
      </Section>
    </SitePage>
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

// The label of the Field an Input sits in, read by the field itself
// (aria-label), so screen readers announce what to type.
const FieldLabel = createContext<string | undefined>(undefined);

export function Input({ value, onChange, placeholder, suffix, wide }: { value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string; wide?: boolean }) {
  const label = useContext(FieldLabel);
  return (
    <View style={[styles.inputWrap, wide && { flex: 1, minWidth: 160 }]}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#a1a697" keyboardType="decimal-pad" inputMode="decimal" style={styles.input} accessibilityLabel={label} />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Label>{label}</Label>
      <FieldLabel.Provider value={label}>{children}</FieldLabel.Provider>
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
  const bg = tone === 'ok' ? '#e9efe2' : tone === 'warn' ? '#f6e9dc' : '#efede5';
  return (
    <View style={[styles.note, { backgroundColor: bg }]}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

const T = sans;
const styles = StyleSheet.create({
  lede: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 680 },
  columns: { gap: 24 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  group: { gap: 10, padding: 22, borderWidth: 1, borderColor: site.line, backgroundColor: site.white, borderRadius: 8 },
  groupTitle: { ...T, fontSize: 9, letterSpacing: 1.5, color: site.copper, fontWeight: '600', marginBottom: 4 },
  label: { ...T, fontSize: 12, fontWeight: '500', color: site.ink, marginTop: 4 },
  hint: { ...T, fontSize: 11, color: site.muted, lineHeight: 17 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d7dacf', borderRadius: 5, backgroundColor: site.white, paddingHorizontal: 14, minHeight: 45 },
  input: { ...T, flex: 1, minWidth: 60, fontSize: 15, fontWeight: '500', color: site.ink, paddingVertical: 10, outlineStyle: 'none' } as any,
  suffix: { ...T, fontSize: 12, color: site.muted, marginLeft: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderWidth: 1, borderColor: site.line, borderRadius: 5, backgroundColor: site.white },
  chipOn: { borderColor: site.copper, backgroundColor: '#f6ebe1' },
  chipText: { ...T, fontSize: 12, fontWeight: '500', color: site.ink },
  chipTextOn: { color: '#8f4f2c' }, // 4.8:1 on the selected chip
  big: { padding: 28, backgroundColor: INK, borderRadius: 8, gap: 6 },
  bigLabel: { ...T, fontSize: 9, letterSpacing: 1.5, color: '#d9aa85', fontWeight: '600' },
  bigValue: { ...T, fontSize: 46, lineHeight: 52, fontWeight: '500', letterSpacing: -1.5, color: '#f4f3e9', fontVariant: ['tabular-nums'] },
  bigSub: { ...T, fontSize: 12, color: '#b2b9a7' },
  table: { borderWidth: 1, borderColor: site.line, backgroundColor: site.white, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 8 },
  tableTitle: { ...T, fontSize: 14, fontWeight: '600', color: site.ink, paddingVertical: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: site.line },
  lineStrong: { borderTopColor: site.ink },
  lineLabel: { ...T, fontSize: 13, color: site.ink },
  lineMeta: { ...T, fontSize: 10, color: site.muted, marginTop: 2 },
  lineValue: { ...T, fontSize: 13, fontWeight: '600', color: site.ink, fontVariant: ['tabular-nums'] },
  note: { padding: 18, borderRadius: 6 },
  noteText: { ...T, fontSize: 13, lineHeight: 21, color: site.ink },
  cta: { backgroundColor: INK },
  ctaKicker: { ...T, fontSize: 9, letterSpacing: 1.5, color: '#d9aa85', fontWeight: '600' },
  ctaItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ctaText: { ...T, flex: 1, fontSize: 14, lineHeight: 22, color: '#f4f3e9' },
  ctaNote: { ...T, fontSize: 10, color: '#a4ae97', marginTop: 12 },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  toolCard: { gap: 8, padding: 24, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white },
  toolTitle: { ...T, fontSize: 16, fontWeight: '500', color: site.ink, marginTop: 6 },
  toolText: { ...T, fontSize: 12, lineHeight: 20, color: site.muted },
});
