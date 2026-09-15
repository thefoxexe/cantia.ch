import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// The two hand-drawn "paint strikethrough" strokes crossing out "Pas votre
// administratif." in the hero — exact path data from the validated
// Cantia_Landing reference (source/index.html's inline SVG), reproduced
// here rather than reinterpreted. Each stroke reveals left-to-right on
// mount (a left-clipped mask growing to full width), matching the
// reference's `clip-path: inset(0 100% 0 0) -> inset(0)` paint-draw
// animation, staggered the same way (first stroke at .65s, second at
// 1.04s after the hero enters).
const STROKE_ONE =
  'M9 14 L26 14 L19 11 L48 19 L86 25 L126 30 L175 37 L231 45 L286 51 L348 61 L403 67 L459 78 L507 84 L552 94 L588 99 L568 101 L579 104 L548 101 L506 93 L458 88 L405 77 L348 71 L285 61 L232 55 L177 46 L125 39 L85 32 L46 25 L17 20 L25 19 Z';
const STROKE_ONE_LINE_A = 'M37 13 Q259 43 560 94';
const STROKE_ONE_LINE_B = 'M24 27 Q274 60 546 104';
const STROKE_TWO =
  'M15 98 L31 94 L20 96 L60 83 L104 74 L159 65 L209 55 L265 47 L321 36 L376 30 L433 19 L482 14 L531 5 L578 3 L591 5 L572 9 L583 8 L552 14 L524 15 L484 24 L436 28 L379 39 L323 44 L268 55 L212 62 L164 73 L109 81 L65 92 L34 100 L10 104 Z';
const STROKE_TWO_LINE_A = 'M35 100 Q310 40 574 12';
const STROKE_TWO_LINE_B = 'M56 81 Q289 35 553 1';

function Stroke({ which, delayMs, durationMs }: { which: 'first' | 'second'; delayMs: number; durationMs: number }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: 100,
      duration: durationMs,
      delay: delayMs,
      easing: Easing.bezier(0.2, 0.7, 0.3, 1),
      useNativeDriver: false,
    }).start();
  }, [width, delayMs, durationMs]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), overflow: 'hidden' }]}>
      <Svg width="100%" height="100%" viewBox="0 0 600 110" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        {which === 'first' ? (
          <>
            <Path d={STROKE_ONE} fill="#c33f32" opacity={0.86} />
            <Path d={STROKE_ONE_LINE_A} fill="none" stroke="#c33f32" strokeWidth={1.3} opacity={0.48} />
            <Path d={STROKE_ONE_LINE_B} fill="none" stroke="#c33f32" strokeWidth={1} opacity={0.4} />
          </>
        ) : (
          <>
            <Path d={STROKE_TWO} fill="#c33f32" opacity={0.86} />
            <Path d={STROKE_TWO_LINE_A} fill="none" stroke="#c33f32" strokeWidth={1.5} opacity={0.48} />
            <Path d={STROKE_TWO_LINE_B} fill="none" stroke="#c33f32" strokeWidth={0.9} opacity={0.3} />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}

// Sits absolutely over the crossed text (a slightly inflated box, same
// `inset(-.13em -.1em)` idea as the reference) — the parent must be
// `position: relative` (RN default) and sized to the text it crosses out.
export function HeroCross() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Stroke which="first" delayMs={650} durationMs={480} />
      <Stroke which="second" delayMs={1040} durationMs={430} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: '-4%', right: '-4%', top: '-14%', bottom: '-18%' },
});
