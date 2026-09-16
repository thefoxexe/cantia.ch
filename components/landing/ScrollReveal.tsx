import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';

// Fades + lifts a section in the moment it scrolls into view, web only
// (IntersectionObserver — native platforms never render the marketing
// site, see LandingScreen's redirect). Plays once per element: the
// observer disconnects itself the first time it fires, so re-scrolling
// past an already-revealed section never replays the animation. Style and
// the opacity/transform animation live on the same Animated.View (not a
// plain View wrapping an inner animated one) so a caller can pass a
// row/gap layout style — like the hero's flexDirection: 'row' groups —
// and still have its real children (not a single animated wrapper) be the
// ones that layout applies to.
export function ScrollReveal({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  // Animated.createAnimatedComponent's return type isn't a valid generic
  // arg for useRef/createRef — cast to the real DOM node below instead.
  const sentinelRef = useRef<React.ComponentRef<typeof Animated.View> | null>(null);
  const [revealed, setRevealed] = useState(Platform.OS !== 'web');
  const progress = useRef(new Animated.Value(Platform.OS !== 'web' ? 1 : 0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || revealed) return;
    const node = sentinelRef.current as unknown as HTMLElement | null;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!revealed) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: 640,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealed, progress, delay]);

  return (
    <Animated.View
      ref={sentinelRef}
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
