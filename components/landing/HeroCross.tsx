import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// A hand-scribbled cross-out over "Pas votre administratif." — two quick,
// slightly wavy pen strokes (real handwriting never draws a perfectly
// straight line) that draw themselves on stroke-by-stroke, the way a hand
// actually moves a pen, rather than a shape wiped in behind a mask. This
// replaces the old approach entirely: no more CSS line-through underneath
// (see crossedText in app/index.tsx) and no more filled "paint blob" path —
// just two stroked lines revealed via the standard SVG
// stroke-dasharray/-dashoffset "line draws itself" technique. Each path's
// dash length is the sum of its straight segments (a safe upper bound on
// actual length for a polyline), so the reveal lands exactly at the
// stroke's end with no visible jump.
const STROKE_ONE = 'M14,30 L180,16 L360,34 L520,18 L588,32';
const STROKE_ONE_LENGTH = 585;
const STROKE_TWO = 'M20,86 L200,70 L380,92 L540,68 L582,88';
const STROKE_TWO_LENGTH = 578;

function Stroke({
  d,
  length,
  width,
  opacity,
  delayMs,
  durationMs,
}: {
  d: string;
  length: number;
  width: number;
  opacity: number;
  delayMs: number;
  durationMs: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      delay: delayMs,
      // A human hand starts a strike fast and eases off at the end —
      // ease-out reads as a wrist flick, not a machine wipe.
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, delayMs, durationMs]);

  const dashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [length, 0] });

  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke="#c33f32"
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      strokeDashoffset={dashoffset}
    />
  );
}

// Sits absolutely over the crossed text (a slightly inflated box) — the
// parent must be `position: relative` (RN default) and sized to the text
// it crosses out.
export function HeroCross() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 600 110" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Stroke d={STROKE_ONE} length={STROKE_ONE_LENGTH} width={7.5} opacity={0.85} delayMs={650} durationMs={360} />
        <Stroke d={STROKE_TWO} length={STROKE_TWO_LENGTH} width={6.5} opacity={0.72} delayMs={980} durationMs={320} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: '-4%', right: '-4%', top: '-14%', bottom: '-18%' },
});
