import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../lib/theme';
import { landingFonts } from '../../lib/landingTheme';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;
type CommandKey = 'site' | 'quote' | 'invoice';

const BARS: { height: number; delay: number }[] = [
  { height: 0.2, delay: 0 }, { height: 0.35, delay: 130 }, { height: 0.65, delay: 260 }, { height: 0.4, delay: 390 }, { height: 0.85, delay: 520 },
  { height: 0.55, delay: 650 }, { height: 1, delay: 780 }, { height: 0.72, delay: 910 }, { height: 0.35, delay: 1040 }, { height: 0.6, delay: 0 },
  { height: 0.95, delay: 130 }, { height: 0.4, delay: 260 }, { height: 0.7, delay: 390 }, { height: 0.3, delay: 520 }, { height: 0.5, delay: 650 },
  { height: 0.8, delay: 780 }, { height: 1, delay: 910 }, { height: 0.55, delay: 1040 }, { height: 0.25, delay: 0 }, { height: 0.6, delay: 130 },
  { height: 0.85, delay: 260 }, { height: 0.4, delay: 390 }, { height: 0.7, delay: 520 }, { height: 0.95, delay: 650 }, { height: 0.5, delay: 780 },
  { height: 0.25, delay: 910 }, { height: 0.6, delay: 1040 }, { height: 0.8, delay: 0 }, { height: 0.4, delay: 130 },
];

function Bar({ height, delay, speaking }: { height: number; delay: number; speaking: boolean }) {
  const scale = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (speaking) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: height, duration: 420, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.25, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      loop.start();
    } else {
      Animated.timing(scale, { toValue: 0.15, duration: 200, useNativeDriver: true }).start();
    }
    return () => loop?.stop();
  }, [speaking, height, delay, scale]);
  return <Animated.View style={[styles.bar, { transform: [{ scaleY: scale }] }]} />;
}

export function VoiceDemo({ dict }: { dict: Dict['automation'] }) {
  const [command, setCommand] = useState<CommandKey>('site');
  const [speaking, setSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function speak() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSpeaking(true);
    timerRef.current = setTimeout(() => setSpeaking(false), 4500);
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const example = dict.examples[command];

  return (
    <View style={styles.wrap}>
      <Text style={styles.tryLabel}>{dict.tryLabel}</Text>
      <View style={styles.choices}>
        {(['site', 'quote', 'invoice'] as CommandKey[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => {
              setCommand(key);
              speak();
            }}
            style={[styles.choice, command === key && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, command === key && styles.choiceTextActive]}>{dict.choices[key]}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.messageCard}>
        <Text style={styles.transcript}>{example.text}</Text>
        <View style={styles.audioLine}>
          <Pressable onPress={speak} accessibilityLabel={speaking ? dict.animatingLabel : dict.animateLabel} style={styles.voiceToggle}>
            <Feather name="mic" size={16} color="#fff" />
          </Pressable>
          <View style={styles.waveform}>
            {BARS.map((b, i) => (
              <Bar key={i} height={b.height} delay={b.delay} speaking={speaking} />
            ))}
          </View>
          <Text style={styles.voiceStatus}>{speaking ? dict.animatingLabel : dict.animateLabel}</Text>
        </View>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultArrow}>↳</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultLabel}>{dict.resultLabel}</Text>
          <Text style={styles.resultStrong}>{example.result}</Text>
          <Text style={styles.resultNote}>{dict.resultNote}</Text>
        </View>
      </View>
      <Text style={styles.note}>{dict.note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  tryLabel: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: '#e9c9b3', marginBottom: spacing.sm },
  choices: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  choice: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: '#ffffff26' },
  choiceActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: '#cbbfb0' },
  choiceTextActive: { color: '#fff' },
  messageCard: { backgroundColor: '#ffffff0a', borderWidth: 1, borderColor: '#ffffff1a', borderRadius: radius.md, padding: spacing.lg, gap: spacing.md },
  transcript: { fontFamily: landingFonts.body, fontSize: 14, color: '#f2ece3', lineHeight: 21, fontStyle: 'italic' },
  audioLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  voiceToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 28, minWidth: 0, overflow: 'hidden' },
  bar: { flex: 1, minWidth: 1.5, maxWidth: 3, height: 28, borderRadius: 2, backgroundColor: '#e9a27c' },
  voiceStatus: { fontFamily: landingFonts.body, fontSize: 11, color: '#bfb1a0', width: 60, flexShrink: 0, textAlign: 'right' },
  resultRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'flex-start' },
  resultArrow: { fontFamily: landingFonts.body, fontSize: 16, color: '#e9c9b3' },
  resultLabel: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', color: '#cbbfb0', letterSpacing: 0.8, marginBottom: 4 },
  resultStrong: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: '#fff' },
  resultNote: { fontFamily: landingFonts.body, fontSize: 12, color: '#bfb1a0', marginTop: 2 },
  note: { fontFamily: landingFonts.body, fontSize: 11, color: '#8f8474', marginTop: spacing.md },
});
