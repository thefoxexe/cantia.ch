import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Section, useSiteLayout } from '../site/Sections';
import { Eyebrow, Headline } from '../site/Primitives';
import { sans, site } from '../../lib/siteTheme';

export interface ProblemBandItem {
  icon: keyof typeof Feather.glyphMap;
  problem: string;
  consequence: string;
}

// "What a slow quote costs you": the problems a module removes, then what
// changes with Cantia. Site identity (components/site).
export function ProblemBand({
  eyebrow,
  headline,
  problems,
  reliefLabel,
  reliefItems,
}: {
  eyebrow: string;
  headline: string;
  problems: ProblemBandItem[];
  reliefLabel: string;
  reliefItems: string[];
}) {
  const { phone, h2Size } = useSiteLayout();
  return (
    <Section>
      <View style={[styles.row, phone && { flexDirection: 'column', gap: 30 }]}>
        <View style={phone ? undefined : { flex: 1 }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Headline plain={headline} size={h2Size} style={{ marginTop: 15 }} />
          <View style={styles.relief}>
            <Text style={[sans, styles.reliefLabel]}>{reliefLabel.toUpperCase()}</Text>
            {reliefItems.map((r) => (
              <View key={r} style={styles.reliefRow}>
                <Feather name="check" size={14} color={site.copper} style={{ marginTop: 3 }} />
                <Text style={[sans, styles.reliefText]}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={phone ? undefined : { flex: 1 }}>
          {problems.map((p, i) => (
            <View key={p.problem} style={[styles.item, i === problems.length - 1 && { borderBottomWidth: 1 }]}>
              <Feather name={p.icon} size={17} color={site.copper} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[sans, styles.problem]}>{p.problem}</Text>
                <Text style={[sans, styles.consequence]}>{p.consequence}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 70, alignItems: 'flex-start' },
  relief: { marginTop: 30, gap: 12 },
  reliefLabel: { fontSize: 9, letterSpacing: 1.5, color: site.muted, fontWeight: '600', marginBottom: 4 },
  reliefRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  reliefText: { flex: 1, fontSize: 13, color: site.ink, lineHeight: 21 },
  item: { flexDirection: 'row', gap: 16, paddingVertical: 22, borderTopWidth: 1, borderColor: site.line },
  problem: { fontSize: 15, color: site.ink, fontWeight: '500', letterSpacing: -0.2 },
  consequence: { fontSize: 12, color: site.muted, lineHeight: 21, marginTop: 6 },
});
