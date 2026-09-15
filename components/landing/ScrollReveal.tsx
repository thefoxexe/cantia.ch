import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

// Fades + lifts a section in the moment it scrolls into view, web only
// (IntersectionObserver — native platforms never render the marketing
// site, see LandingScreen's redirect). Plays once per element: the
// observer disconnects itself the first time it fires, so re-scrolling
// past an already-revealed section never replays the animation. The
// outer plain View carries the ref (a real DOM node on web, same
// assumption the nav's storiesRef/teamRef/pricingRef already rely on for
// .measure()) and the passed-in layout style; the inner Animated.View
// only ever carries opacity/transform so it can't disturb that layout.
export function ScrollReveal({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const sentinelRef = useRef<View>(null);
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
    <View ref={sentinelRef} style={style}>
      <Animated.View
        style={{
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
