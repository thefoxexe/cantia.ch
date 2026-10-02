import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// VAT rate of one devis / facture, for a VAT-registered company: the
// default rate, the reduced / accommodation rates, or none — for services
// excluded or exempt from VAT (insurance brokerage, art. 21 LTVA; exports…)
// even when the company itself is registered.

const RATES = [8.1, 2.6, 3.8, 0] as const;

const COPY = {
  fr: { title: 'TVA de ce document', none: 'Sans TVA', noneHint: 'Pour les prestations exclues ou exonérées de la TVA (p. ex. courtage d’assurance, art. 21 LTVA). Le document indique « Total » sans ligne TVA.' },
  de: { title: 'MWST dieses Dokuments', none: 'Ohne MWST', noneHint: 'Für von der MWST ausgenommene oder befreite Leistungen (z. B. Versicherungsvermittlung, Art. 21 MWSTG). Das Dokument zeigt «Total» ohne MWST-Zeile.' },
  it: { title: 'IVA di questo documento', none: 'Senza IVA', noneHint: 'Per le prestazioni escluse o esenti dall’IVA (p. es. mediazione assicurativa, art. 21 LIVA). Il documento indica «Totale» senza riga IVA.' },
};

export function VatRateChips({ value, onChange }: { value: number; onChange: (rate: number) => void }) {
  const l = getAppLocale();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{c.title}</Text>
      <View style={styles.row}>
        {RATES.map((r) => {
          const active = Number(value) === r;
          return (
            <Pressable key={r} onPress={() => onChange(r)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{r === 0 ? c.none : `${r} %`}</Text>
            </Pressable>
          );
        })}
      </View>
      {Number(value) === 0 ? <Text style={styles.hint}>{c.noneHint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginTop: spacing.lg },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.primary },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
});
