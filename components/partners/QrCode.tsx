import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import QRCode from 'qrcode';

// The partner's link as a QR code, drawn as one SVG path (crisp at any size,
// printable). Error correction M: still reads when slightly damaged.
export function QrCode({ value, size = 160, color = '#231A12' }: { value: string; size?: number; color?: string }) {
  const { path, count } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const n = qr.modules.size;
    let d = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (qr.modules.get(x, y)) d += `M${x + 2} ${y + 2}h1v1h-1z`;
      }
    }
    return { path: d, count: n + 4 };
  }, [value]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${count} ${count}`} accessibilityLabel={value}>
      <Rect x={0} y={0} width={count} height={count} fill="#FFFFFF" />
      <Path d={path} fill={color} />
    </Svg>
  );
}
