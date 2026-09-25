import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

// gifted-charts needs a real pixel width (unlike react-native-svg's
// width="100%"). Measure the width of a plain, unpadded wrapper View placed
// directly around the chart — never the padded card around it — so there's
// no padding math to get wrong (see the trafic-chart-preview bug where
// subtracting the card's own padding by the wrong amount clipped a whole
// bar off the chart).
export function useMeasuredWidth(): [(e: LayoutChangeEvent) => void, number] {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);
  return [onLayout, width];
}
