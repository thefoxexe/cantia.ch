import { createElement, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { suggestBrandColorsFromWebsite } from '../lib/api/brandColors';
import { BRAND_COLOR_PRESETS, HEX_COLOR_RE } from './PdfTemplatePicker';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// The brand colour of devis, factures and rapports, chosen three ways:
// ready-made colours, the colours of the company's website (analysed only
// when asked — nothing happens just by typing the address), or any colour
// at all with a picker and its HEX code. Used in the onboarding and in
// Compte › Apparence.

type Mode = 'presets' | 'website' | 'custom';

const COPY = {
  fr: {
    presets: 'Couleurs prêtes',
    website: 'Depuis mon site',
    custom: 'Sur mesure',
    analyze: 'Analyser mon site',
    analyzing: 'Analyse du site…',
    analyzeHint: 'Cantia ouvre votre site et en extrait les couleurs principales. Cliquez sur « Analyser mon site » pour lancer la recherche.',
    noWebsite: 'Indiquez d’abord l’adresse de votre site web.',
    found: 'Couleurs trouvées sur {{site}} : choisissez la vôtre.',
    noneFound: 'Aucune couleur trouvée sur ce site. Essayez une couleur prête ou sur mesure.',
    fromLogo: 'Tirée de votre logo',
    pickerHint: 'Choisissez la nuance exacte, ou collez le code HEX de votre charte graphique.',
    hex: 'Code HEX',
    hexError: 'Format attendu : # suivi de 6 caractères, ex. #1F3D3A',
    preview: 'Aperçu sur vos documents',
    quote: 'DEVIS',
    total: 'Total TTC',
  },
  de: {
    presets: 'Fertige Farben',
    website: 'Von meiner Website',
    custom: 'Individuell',
    analyze: 'Meine Website analysieren',
    analyzing: 'Website wird analysiert…',
    analyzeHint: 'Cantia öffnet Ihre Website und liest die Hauptfarben aus. Klicken Sie auf «Meine Website analysieren», um die Suche zu starten.',
    noWebsite: 'Geben Sie zuerst die Adresse Ihrer Website an.',
    found: 'Auf {{site}} gefundene Farben: Wählen Sie Ihre.',
    noneFound: 'Keine Farbe auf dieser Website gefunden. Wählen Sie eine fertige oder individuelle Farbe.',
    fromLogo: 'Aus Ihrem Logo',
    pickerHint: 'Wählen Sie den genauen Farbton oder fügen Sie den HEX-Code Ihres Corporate Designs ein.',
    hex: 'HEX-Code',
    hexError: 'Erwartetes Format: # und 6 Zeichen, z. B. #1F3D3A',
    preview: 'Vorschau auf Ihren Dokumenten',
    quote: 'OFFERTE',
    total: 'Total inkl. MWST',
  },
  it: {
    presets: 'Colori pronti',
    website: 'Dal mio sito',
    custom: 'Su misura',
    analyze: 'Analizza il mio sito',
    analyzing: 'Analisi del sito…',
    analyzeHint: 'Cantia apre il vostro sito e ne estrae i colori principali. Cliccate su «Analizza il mio sito» per avviare la ricerca.',
    noWebsite: 'Indicate prima l’indirizzo del vostro sito.',
    found: 'Colori trovati su {{site}}: scegliete il vostro.',
    noneFound: 'Nessun colore trovato su questo sito. Provate un colore pronto o su misura.',
    fromLogo: 'Dal vostro logo',
    pickerHint: 'Scegliete la tonalità esatta o incollate il codice HEX della vostra identità grafica.',
    hex: 'Codice HEX',
    hexError: 'Formato atteso: # seguito da 6 caratteri, es. #1F3D3A',
    preview: 'Anteprima sui vostri documenti',
    quote: 'PREVENTIVO',
    total: 'Totale IVA incl.',
  },
};

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// 12 hues × 5 tones + greys: enough to land on any shade quickly, on every
// platform (the web also gets the system colour picker).
const HUES = [0, 20, 35, 50, 95, 140, 165, 190, 210, 230, 260, 300];
const TONES: [number, number][] = [
  [0.55, 0.22],
  [0.5, 0.32],
  [0.55, 0.42],
  [0.6, 0.55],
  [0.65, 0.7],
];
const GRID = TONES.map(([s, l]) => HUES.map((h) => hslToHex(h, s, l)));
const GREYS = ['#111111', '#2B2B2B', '#444444', '#5E5E5E', '#7A7A7A', '#999999', '#22333B', '#2F3E46', '#354F52', '#3D405B', '#4A4E69', '#6E4B2A'];

export function normalizeHex(raw: string): string {
  let v = raw.trim().replace(/^#*/, '');
  if (/^[0-9a-f]{3}$/i.test(v)) v = v.split('').map((ch) => ch + ch).join('');
  return `#${v}`.toUpperCase();
}

// Readable text on top of a colour.
function textOn(hex: string): string {
  if (!HEX_COLOR_RE.test(hex)) return '#fff';
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? '#111' : '#fff';
}

export function BrandColorPicker({
  value,
  onChange,
  website,
  logoColors = [],
  companyName,
  disabled,
}: {
  value: string;
  onChange: (hex: string) => void;
  website: string;
  logoColors?: string[];
  companyName?: string;
  disabled?: boolean;
}) {
  const l = getAppLocale();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  const [mode, setMode] = useState<Mode>(() => (value && !BRAND_COLOR_PRESETS.some((p) => p.toLowerCase() === value.toLowerCase()) ? 'custom' : 'presets'));
  const [analyzing, setAnalyzing] = useState(false);
  const [siteColors, setSiteColors] = useState<string[] | null>(null);
  const [analyzedSite, setAnalyzedSite] = useState('');
  const [hexText, setHexText] = useState(value);
  const [hexFocused, setHexFocused] = useState(false);
  // Follow outside changes (swatch, picker) but never rewrite what is being typed.
  useEffect(() => {
    if (!hexFocused) setHexText(value);
  }, [value, hexFocused]);

  const valid = HEX_COLOR_RE.test(value);
  const site = website.trim();

  async function analyze() {
    if (!site || analyzing) return;
    setAnalyzing(true);
    setSiteColors(null);
    const found = await suggestBrandColorsFromWebsite(site);
    setAnalyzing(false);
    setAnalyzedSite(site.replace(/^https?:\/\//, '').replace(/\/$/, ''));
    setSiteColors(found);
    if (found.length) onChange(found[0].toUpperCase());
  }

  const pick = (hex: string) => !disabled && onChange(hex.toUpperCase());

  const swatch = (hex: string, size = 34) => {
    const active = value.toLowerCase() === hex.toLowerCase();
    return (
      <Pressable
        key={hex}
        onPress={() => pick(hex)}
        disabled={disabled}
        accessibilityLabel={hex}
        style={[styles.swatch, { width: size, height: size, borderRadius: size / 2, backgroundColor: hex }, active && styles.swatchActive]}
      >
        {active ? <Feather name="check" size={size > 24 ? 15 : 11} color={textOn(hex)} /> : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.tabs}>
        {(
          [
            ['presets', 'grid', c.presets],
            ['website', 'globe', c.website],
            ['custom', 'droplet', c.custom],
          ] as const
        ).map(([m, icon, label]) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.tab, mode === m && styles.tabActive]}>
            <Feather name={icon} size={16} color={mode === m ? colors.text : colors.textMuted} />
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.panel}>
        {mode === 'presets' ? (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.swatchRow}>{BRAND_COLOR_PRESETS.map((h) => swatch(h))}</View>
            {logoColors.length ? (
              <View style={styles.logoRow}>
                <Text style={styles.small}>{c.fromLogo}</Text>
                {logoColors.map((h) => swatch(h, 26))}
              </View>
            ) : null}
          </View>
        ) : mode === 'website' ? (
          <View style={{ gap: spacing.sm }}>
            {!site ? (
              <View style={styles.infoRow}>
                <Feather name="info" size={14} color={colors.textMuted} />
                <Text style={styles.small}>{c.noWebsite}</Text>
              </View>
            ) : (
              <>
                <View style={styles.siteRow}>
                  <View style={styles.siteChip}>
                    <Feather name="globe" size={13} color={colors.textMuted} />
                    <Text style={styles.siteText} numberOfLines={1}>
                      {site.replace(/^https?:\/\//, '')}
                    </Text>
                  </View>
                  <Pressable onPress={analyze} disabled={analyzing || disabled} style={styles.analyzeBtn}>
                    {analyzing ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="search" size={14} color="#fff" />}
                    <Text style={styles.analyzeText}>{analyzing ? c.analyzing : c.analyze}</Text>
                  </Pressable>
                </View>
                {siteColors === null ? (
                  <Text style={styles.small}>{c.analyzeHint}</Text>
                ) : siteColors.length ? (
                  <>
                    <Text style={styles.small}>{c.found.replace('{{site}}', analyzedSite)}</Text>
                    <View style={styles.swatchRow}>{siteColors.map((h) => swatch(h))}</View>
                  </>
                ) : (
                  <Text style={[styles.small, { color: colors.warning }]}>{c.noneFound}</Text>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.small}>{c.pickerHint}</Text>
            <View style={styles.customRow}>
              {Platform.OS === 'web' ? (
                <View style={[styles.bigSwatch, { backgroundColor: valid ? value : colors.border }]}>
                  {createElement('input', {
                    type: 'color',
                    value: valid ? value.toLowerCase() : '#1f3d3a',
                    disabled,
                    onChange: (e: { target: { value: string } }) => pick(e.target.value),
                    'aria-label': c.custom,
                    style: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 },
                  })}
                  <Feather name="droplet" size={18} color={textOn(valid ? value : '#ffffff')} />
                </View>
              ) : (
                <View style={[styles.bigSwatch, { backgroundColor: valid ? value : colors.border }]} />
              )}
              <View style={{ flex: 1, minWidth: 160, gap: 4 }}>
                <Text style={styles.hexLabel}>{c.hex}</Text>
                <TextInput
                  value={hexText}
                  editable={!disabled}
                  onFocus={() => setHexFocused(true)}
                  onChangeText={(v) => {
                    setHexText(v);
                    // Full 6-character codes apply as they are typed; the
                    // short form (#C24) only once the field is left.
                    const n = `#${v.trim().replace(/^#*/, '')}`.toUpperCase();
                    if (HEX_COLOR_RE.test(n)) onChange(n);
                  }}
                  onBlur={() => {
                    setHexFocused(false);
                    const n = normalizeHex(hexText);
                    if (HEX_COLOR_RE.test(n)) onChange(n);
                    else setHexText(value);
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={7}
                  placeholder="#1F3D3A"
                  placeholderTextColor={colors.textMuted}
                  style={styles.hexInput}
                />
                {hexText && !hexFocused && !HEX_COLOR_RE.test(normalizeHex(hexText)) ? <Text style={styles.error}>{c.hexError}</Text> : null}
              </View>
            </View>
            <View style={styles.grid}>
              {[...GRID, GREYS].map((row, i) => (
                <View key={i} style={styles.gridRow}>
                  {row.map((hex) => {
                    const active = value.toLowerCase() === hex.toLowerCase();
                    return (
                      <Pressable
                        key={hex}
                        onPress={() => pick(hex)}
                        disabled={disabled}
                        accessibilityLabel={hex}
                        style={[styles.cell, { backgroundColor: hex }, active && styles.cellActive]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* What it looks like on a quote */}
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>{c.preview}</Text>
        <View style={styles.doc}>
          <View style={[styles.docBand, { backgroundColor: valid ? value : colors.border }]}>
            <Text style={[styles.docCompany, { color: textOn(valid ? value : '#ffffff') }]} numberOfLines={1}>
              {companyName || 'Votre entreprise'}
            </Text>
            <Text style={[styles.docTitle, { color: textOn(valid ? value : '#ffffff') }]}>{c.quote} 2026-014</Text>
          </View>
          <View style={styles.docBody}>
            <View style={[styles.docLine, { width: '70%' }]} />
            <View style={[styles.docLine, { width: '55%' }]} />
            <View style={[styles.docLine, { width: '62%' }]} />
            <View style={styles.docTotal}>
              <Text style={styles.docTotalLabel}>{c.total}</Text>
              <Text style={[styles.docTotalValue, { color: valid ? value : colors.text }]}>CHF 12’480.00</Text>
            </View>
          </View>
        </View>
        <Text style={styles.hexBadge}>{valid ? value.toUpperCase() : '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', padding: 3, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, gap: 3 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, paddingHorizontal: 4, borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surface, ...(Platform.OS === 'web' ? ({ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } as any) : {}) },
  tabText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textAlign: 'center' },
  tabTextActive: { color: colors.text },
  panel: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.surface },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.text, transform: [{ scale: 1.08 }] },
  logoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  small: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17, flexShrink: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  siteRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  siteChip: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.bg, maxWidth: '100%' },
  siteText: { fontSize: fontSize.sm, color: colors.text, flexShrink: 1 },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.sm, backgroundColor: colors.text },
  analyzeText: { fontSize: fontSize.sm, fontWeight: '700', color: '#fff' },
  customRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  bigSwatch: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  hexLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  hexInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 9, fontSize: fontSize.md, fontWeight: '700', letterSpacing: 1, color: colors.text, fontFamily: Platform.select({ web: 'ui-monospace, Menlo, monospace', default: undefined }) },
  error: { fontSize: fontSize.xs, color: colors.danger },
  grid: { gap: 3 },
  gridRow: { flexDirection: 'row', gap: 3 },
  cell: { flex: 1, height: 22, borderRadius: 4, borderWidth: 2, borderColor: 'transparent' },
  cellActive: { borderColor: colors.text },
  previewCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.bg },
  previewLabel: { width: '100%', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  doc: { flex: 1, minWidth: 220, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  docBand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 10 },
  docCompany: { flexShrink: 1, fontSize: fontSize.sm, fontWeight: '800' },
  docTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  docBody: { padding: spacing.md, gap: 6 },
  docLine: { height: 6, borderRadius: 3, backgroundColor: '#ECE7DD' },
  docTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderColor: '#ECE7DD' },
  docTotalLabel: { fontSize: fontSize.xs, color: '#555' },
  docTotalValue: { fontSize: fontSize.sm, fontWeight: '800' },
  hexBadge: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
});
