import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const STROKE_ONE = 'M14,20 L200,28 L380,46 L588,86';
const STROKE_ONE_LENGTH = 582;
const STROKE_TWO = 'M20,92 L220,66 L400,40 L582,18';
const STROKE_TWO_LENGTH = 570;

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
