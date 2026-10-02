import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Field } from './ui';
import { formatIbanInput, ibanProblem } from '../lib/iban';
import { getAppLocale } from '../lib/translations';
import { colors, fontSize, spacing } from '../lib/theme';

// IBAN input used wherever the company's IBAN is entered: groups of four
// as you type (whatever is pasted), and a precise reason when it's refused.

const COPY = {
  fr: {
    ok: 'IBAN valide',
    country: 'Seuls les IBAN suisses (CH…) et liechtensteinois (LI…) fonctionnent avec la facture QR.',
    chars: 'Après CH, un IBAN suisse ne contient que des chiffres.',
    short: 'Il manque {{n}} caractère(s) : un IBAN suisse en compte 21 (CH + 19 chiffres).',
    long: '{{n}} caractère(s) en trop : un IBAN suisse en compte 21 (CH + 19 chiffres).',
    checksum: 'Les chiffres de contrôle (les 2 chiffres après CH) ne correspondent pas au reste : un chiffre est probablement mal tapé. Comparez avec votre carte bancaire ou votre e-banking.',
  },
  de: {
    ok: 'IBAN gültig',
    country: 'Nur Schweizer (CH…) und liechtensteinische (LI…) IBAN funktionieren mit der QR-Rechnung.',
    chars: 'Nach CH enthält eine Schweizer IBAN nur Ziffern.',
    short: 'Es fehlen {{n}} Zeichen: Eine Schweizer IBAN hat 21 (CH + 19 Ziffern).',
    long: '{{n}} Zeichen zu viel: Eine Schweizer IBAN hat 21 (CH + 19 Ziffern).',
    checksum: 'Die Prüfziffern (die 2 Ziffern nach CH) passen nicht zum Rest: Wahrscheinlich ist eine Ziffer vertippt. Vergleichen Sie mit Ihrer Bankkarte oder Ihrem E-Banking.',
  },
  it: {
    ok: 'IBAN valido',
    country: 'Solo gli IBAN svizzeri (CH…) e del Liechtenstein (LI…) funzionano con la fattura QR.',
    chars: 'Dopo CH, un IBAN svizzero contiene solo cifre.',
    short: 'Mancano {{n}} caratteri: un IBAN svizzero ne ha 21 (CH + 19 cifre).',
    long: '{{n}} caratteri di troppo: un IBAN svizzero ne ha 21 (CH + 19 cifre).',
    checksum: 'Le cifre di controllo (le 2 cifre dopo CH) non corrispondono al resto: probabilmente una cifra è sbagliata. Confrontate con la vostra carta bancaria o l’e-banking.',
  },
};

export function ibanMessage(raw: string): string | null {
  const l = getAppLocale();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  const p = ibanProblem(raw);
  if (!p) return null;
  if (p.kind === 'short') return c.short.replace('{{n}}', String(p.missing));
  if (p.kind === 'long') return c.long.replace('{{n}}', String(p.extra));
  return c[p.kind];
}

export function IbanField({ label, value, onChangeText, editable = true }: { label: string; value: string; onChangeText: (v: string) => void; editable?: boolean }) {
  const l = getAppLocale();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  const problem = value.trim() ? ibanMessage(value) : null;
  return (
    <View>
      <Field
        label={label}
        value={value}
        onChangeText={(v) => onChangeText(formatIbanInput(v))}
        editable={editable}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        placeholder="CH93 0076 2011 6238 5295 7"
      />
      {value.trim() ? (
        <View style={styles.row}>
          <Feather name={problem ? 'alert-circle' : 'check-circle'} size={14} color={problem ? colors.danger : colors.success} />
          <Text style={[styles.text, { color: problem ? colors.danger : colors.success }]}>{problem ?? c.ok}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: -spacing.xs },
  text: { flex: 1, fontSize: fontSize.xs, lineHeight: 17 },
});
