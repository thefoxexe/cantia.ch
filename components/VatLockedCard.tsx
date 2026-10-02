import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Shown instead of the VAT module (Comptabilité › TVA, Décompte TVA) while
// the company isn't VAT-registered with a valid IDE number.

const COPY = {
  fr: {
    title: 'Module TVA désactivé',
    noLiable: 'Votre entreprise n’est pas déclarée assujettie à la TVA : vos devis et factures sont émis sans TVA et il n’y a pas de décompte à faire.',
    noIde: 'Votre entreprise est déclarée assujettie, mais il manque un numéro IDE valide (CHE-123.456.789). Sans lui, la TVA n’est pas appliquée.',
    cta: 'Activer la TVA dans Mon entreprise',
  },
  de: {
    title: 'MWST-Modul deaktiviert',
    noLiable: 'Ihr Unternehmen ist nicht als mehrwertsteuerpflichtig erfasst: Offerten und Rechnungen werden ohne MWST ausgestellt, keine Abrechnung nötig.',
    noIde: 'Ihr Unternehmen ist als steuerpflichtig erfasst, aber es fehlt eine gültige UID-Nummer (CHE-123.456.789). Ohne sie wird keine MWST angewendet.',
    cta: 'MWST unter Mein Unternehmen aktivieren',
  },
  it: {
    title: 'Modulo IVA disattivato',
    noLiable: 'La vostra impresa non è dichiarata assoggettata all’IVA: preventivi e fatture sono emessi senza IVA e non c’è rendiconto da fare.',
    noIde: 'La vostra impresa è dichiarata assoggettata, ma manca un numero IDI valido (CHE-123.456.789). Senza di esso l’IVA non è applicata.',
    cta: 'Attivare l’IVA in La mia impresa',
  },
};

export function VatLockedCard({ liable }: { liable: boolean }) {
  const router = useRouter();
  const l = getAppLocale();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Feather name="lock" size={18} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.text}>{liable ? c.noIde : c.noLiable}</Text>
        <Pressable onPress={() => router.push('/(app)/compte/entreprise' as any)} style={styles.cta}>
          <Text style={styles.ctaText}>{c.cta}</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  text: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  cta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.sm, backgroundColor: colors.text },
  ctaText: { fontSize: fontSize.sm, fontWeight: '700', color: '#fff' },
});
