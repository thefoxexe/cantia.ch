import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Field } from './ui';
import { formatIde, hasValidIde } from '../lib/vat/vatStatus';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// « Êtes-vous assujetti à la TVA ? » — onboarding and Mon entreprise.
// Yes → the IDE number becomes mandatory and VAT is added to devis and
// factures. No → documents are issued without VAT and the accounting VAT
// module stays locked (lib/vat/vatStatus.ts).

const COPY = {
  fr: {
    question: 'Votre entreprise est-elle assujettie à la TVA ?',
    yes: 'Oui',
    no: 'Non',
    ide: 'Numéro IDE / TVA',
    ideRequired: 'Obligatoire : il apparaît sur vos devis et factures (CHE-123.456.789 TVA).',
    ideOptional: 'Numéro IDE (facultatif)',
    ideInvalid: 'Format attendu : CHE-123.456.789 (9 chiffres).',
    yesInfo: 'La TVA ({{rate}} %) sera ajoutée à vos devis et factures, et le module TVA de la comptabilité sera actif.',
    noInfo: 'Vos devis et factures seront émis sans TVA. Vous pourrez l’activer plus tard dans Paramètres › Mon entreprise.',
  },
  de: {
    question: 'Ist Ihr Unternehmen mehrwertsteuerpflichtig?',
    yes: 'Ja',
    no: 'Nein',
    ide: 'UID / MWST-Nummer',
    ideRequired: 'Pflichtfeld: Sie erscheint auf Ihren Offerten und Rechnungen (CHE-123.456.789 MWST).',
    ideOptional: 'UID-Nummer (optional)',
    ideInvalid: 'Erwartetes Format: CHE-123.456.789 (9 Ziffern).',
    yesInfo: 'Die MWST ({{rate}} %) wird auf Ihre Offerten und Rechnungen gesetzt, und das MWST-Modul der Buchhaltung ist aktiv.',
    noInfo: 'Ihre Offerten und Rechnungen werden ohne MWST ausgestellt. Sie können sie später unter Einstellungen › Mein Unternehmen aktivieren.',
  },
  it: {
    question: 'La vostra impresa è assoggettata all’IVA?',
    yes: 'Sì',
    no: 'No',
    ide: 'Numero IDI / IVA',
    ideRequired: 'Obbligatorio: appare sui vostri preventivi e fatture (CHE-123.456.789 IVA).',
    ideOptional: 'Numero IDI (facoltativo)',
    ideInvalid: 'Formato atteso: CHE-123.456.789 (9 cifre).',
    yesInfo: 'L’IVA ({{rate}} %) sarà aggiunta ai vostri preventivi e fatture, e il modulo IVA della contabilità sarà attivo.',
    noInfo: 'I vostri preventivi e fatture saranno emessi senza IVA. Potrete attivarla più tardi in Impostazioni › La mia impresa.',
  },
};

export function useVatQuestionCopy() {
  const l = getAppLocale();
  return COPY[l === 'de' || l === 'it' ? l : 'fr'];
}

export function VatQuestion({
  liable,
  onLiableChange,
  ide,
  onIdeChange,
  rate = 8.1,
  editable = true,
}: {
  liable: boolean | null;
  onLiableChange: (v: boolean) => void;
  ide: string;
  onIdeChange: (v: string) => void;
  rate?: number;
  editable?: boolean;
}) {
  const c = useVatQuestionCopy();
  const ideBad = !!ide.trim() && !hasValidIde(ide);
  return (
    <View style={styles.wrap}>
      <Text style={styles.question}>{c.question}</Text>
      <View style={styles.choices}>
        {([true, false] as const).map((v) => {
          const active = liable === v;
          return (
            <Pressable key={String(v)} disabled={!editable} onPress={() => onLiableChange(v)} style={[styles.choice, active && styles.choiceActive]}>
              <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{v ? c.yes : c.no}</Text>
            </Pressable>
          );
        })}
      </View>

      {liable !== null ? (
        <>
          <Field
            label={liable ? c.ide : c.ideOptional}
            value={ide}
            onChangeText={(v) => onIdeChange(formatIde(v))}
            editable={editable}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="CHE-123.456.789"
          />
          {ideBad ? (
            <Text style={styles.error}>{c.ideInvalid}</Text>
          ) : liable && !ide.trim() ? (
            <Text style={styles.required}>{c.ideRequired}</Text>
          ) : null}
          <View style={[styles.info, liable ? styles.infoYes : null]}>
            <Feather name={liable ? 'check-circle' : 'info'} size={14} color={liable ? colors.success : colors.textMuted} />
            <Text style={styles.infoText}>{(liable ? c.yesInfo : c.noInfo).replace('{{rate}}', String(rate))}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  question: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  choices: { flexDirection: 'row', gap: spacing.sm },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, minWidth: 96 },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
  choiceText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  choiceTextActive: { color: colors.primary },
  error: { fontSize: fontSize.xs, color: colors.danger, marginTop: -spacing.xs },
  required: { fontSize: fontSize.xs, color: colors.warning, marginTop: -spacing.xs },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.bg },
  infoYes: { backgroundColor: colors.successSoft },
  infoText: { flex: 1, fontSize: fontSize.xs, color: colors.text, lineHeight: 17 },
});
