import { Text } from 'react-native';
import type { SourceBox } from '../../lib/tenders/types';
import { colors, fontSize } from '../../lib/theme';

// Native fallback: the PDF view is a desktop (browser) feature in V1.
export function PdfPage(_: { url: string; page: number; width: number; highlights?: SourceBox[]; onPageCount?: (n: number) => void }) {
  return <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, padding: 12 }}>Aperçu du PDF disponible sur ordinateur.</Text>;
}
