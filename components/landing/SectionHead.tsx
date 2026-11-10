import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Eyebrow, Headline } from '../site/Primitives';
import { sans, site } from '../../lib/siteTheme';

// Section heading of the older marketing pages, in the site identity:
// eyebrow, title and intro (components/site/Sections SectionHead look).
export function SectionHead({ label, title, intro }: { label?: string; title: string; intro?: string }) {
  const { width } = useWindowDimensions();
  const size = width <= 760 ? 32 : width <= 900 ? 36 : 42;
  return (
    <View style={styles.wrap}>
      {label ? <Eyebrow>{label}</Eyebrow> : null}
      <Headline plain={title} size={size} style={{ marginTop: label ? 15 : 0, maxWidth: 900 }} />
      {intro ? <Text style={[sans, styles.intro]}>{intro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 40 },
  intro: { fontSize: 14, lineHeight: 26, color: site.muted, marginTop: 16, maxWidth: 640 },
});
