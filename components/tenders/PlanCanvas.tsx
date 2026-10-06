import { Text } from 'react-native';
import type { PlanCanvasProps } from './PlanCanvas.web';
import { colors, fontSize } from '../../lib/theme';

export type { Tool, PlanCanvasProps } from './PlanCanvas.web';
export const MEASURE_COLORS = ['#A95C30', '#3F5D7D', '#2E6B4F', '#6B4E8E', '#9C6510', '#AB3327'];

// Native fallback: plans are drawn in the browser (pdf.js + SVG) in V1.
export function PlanCanvas(_: PlanCanvasProps) {
  return <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, padding: 12 }}>Plan disponible sur ordinateur.</Text>;
}
