import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { buildSmoothPath } from '../lib/chartPath';

// Fixed viewBox width — the actual pixel width comes from the surrounding
// layout (width="100%"), this is just the coordinate space the path math
// works in. Close enough to real rendered widths that the SVG's implicit
// non-uniform scale (preserveAspectRatio="none") never visibly distorts
// the stroke.
const VIEW_WIDTH = 200;

// A bare inline trend line for a stat tile — no axis, no tooltip, no legend.
// Per the dataviz stat-tile spec: a hero number's job is the number itself,
// the sparkline is just "is it going up." A smooth curve (not a jagged
// polyline or bars) reads as considered rather than raw, with a soft area
// fill and a single rounded dot at the latest point — one hue throughout,
// the tile's own accent.
export function StatSparkline({ values, color, height = 36 }: { values: number[]; color: string; height?: number }) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const padY = 4;
  const usableHeight = height - padY * 2;
  const stepX = VIEW_WIDTH / (values.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: padY + usableHeight - ((v - min) / range) * usableHeight,
  }));

  const linePath = buildSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
  const gradientId = `sparkline-${color.replace('#', '')}`;

  return (
    <View style={{ height }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_WIDTH} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.22} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last.x} cy={last.y} r={3} fill={color} />
      </Svg>
    </View>
  );
}
