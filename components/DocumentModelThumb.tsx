import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// A small A4 drawing of a document model (Compte → Apparence), in the
// company's own colours and with its logo, so the four models can be
// compared before choosing. Same shapes as the PDF renderers
// (supabase/functions/_shared/pdf-document-renderers.ts).
export type DocumentModelId = 'classic' | 'moderne' | 'structure' | 'minimal';

const INK = '#1C201E';
const LINE = '#E3E1DA';
const MUTED = '#B9BCB7';

function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * amount));
  return `rgb(${c.join(',')})`;
}

interface Props {
  model: DocumentModelId;
  brand: string;
  accent: string;
  logoUri?: string | null;
  width?: number;
}

export function DocumentModelThumb({ model, brand, accent, logoUri, width = 132 }: Props) {
  const W = width;
  const H = Math.round(width * 1.414);
  const u = W / 210; // 1 mm
  const bar = (w: number, color = MUTED, h = 1.6 * u) => <View style={{ width: w * u, height: h, backgroundColor: color, borderRadius: h }} />;
  const logo = logoUri ? (
    <Image source={{ uri: logoUri }} style={{ width: 34 * u, height: 12 * u }} resizeMode="contain" />
  ) : (
    <View style={{ width: 28 * u, height: 8 * u, backgroundColor: brand, borderRadius: u }} />
  );
  const rows = (n: number, left = 18, color = LINE) =>
    Array.from({ length: n }, (_, i) => (
      <View key={i} style={{ position: 'absolute', left: left * u, right: 18 * u, top: (128 + i * 9) * u, height: 9 * u, borderBottomWidth: Math.max(0.5, 0.35 * u), borderColor: color, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {bar(70)}
        {bar(18, '#9DA19B')}
      </View>
    ));
  const address = (
    <View style={{ position: 'absolute', left: 120 * u, top: 61 * u, gap: 1.6 * u }}>
      {bar(34, INK, 1.8 * u)}
      {bar(28)}
      {bar(30)}
    </View>
  );

  let body: ReactNode = null;
  if (model === 'classic') {
    body = (
      <>
        <View style={{ position: 'absolute', left: 14 * u, top: 14 * u, flexDirection: 'row', alignItems: 'center', gap: 4 * u }}>
          {logo}
          <View style={{ gap: 1.6 * u }}>
            {bar(40, brand, 2.6 * u)}
            {bar(60)}
          </View>
        </View>
        <View style={{ position: 'absolute', left: 14 * u, right: 14 * u, top: 36 * u, height: 0.6 * u, backgroundColor: LINE }} />
        <View style={{ position: 'absolute', left: 14 * u, top: 44 * u }}>{bar(26, brand, 4 * u)}</View>
        <View style={{ position: 'absolute', left: 14 * u, top: 61 * u, width: 70 * u, height: 26 * u, backgroundColor: tint(brand, 0.92), borderLeftWidth: 1.2 * u, borderColor: brand, padding: 4 * u, gap: 2.2 * u }}>
          {bar(36)}
          {bar(30)}
          {bar(40)}
        </View>
        {address}
        <View style={{ position: 'absolute', left: 14 * u, right: 14 * u, top: 118 * u, height: 8 * u, backgroundColor: brand }} />
        {rows(5, 14)}
        <View style={{ position: 'absolute', right: 14 * u, top: 178 * u, width: 66 * u, height: 9 * u, borderWidth: Math.max(0.6, 0.4 * u), borderColor: brand, backgroundColor: tint(brand, 0.9) }} />
      </>
    );
  } else if (model === 'moderne') {
    body = (
      <>
        <View style={{ position: 'absolute', right: 0, top: 0, width: 0, height: 0, borderTopWidth: 68 * u, borderLeftWidth: 68 * u, borderTopColor: brand, borderLeftColor: 'transparent' }} />
        <View style={{ position: 'absolute', right: 0, top: 0, width: 0, height: 0, borderTopWidth: 44 * u, borderLeftWidth: 44 * u, borderTopColor: accent, borderLeftColor: 'transparent' }} />
        <View style={{ position: 'absolute', left: 0, bottom: 0, width: 0, height: 0, borderBottomWidth: 16 * u, borderRightWidth: 16 * u, borderBottomColor: brand, borderRightColor: 'transparent' }} />
        <View style={{ position: 'absolute', left: 18 * u, top: 16 * u, gap: 3 * u }}>
          {logo}
          {bar(48)}
          {bar(40)}
        </View>
        <Text style={{ position: 'absolute', left: 18 * u, top: 60 * u, fontSize: 11 * u, letterSpacing: 2 * u, color: brand, fontWeight: '300' }}>DEVIS</Text>
        <View style={{ position: 'absolute', left: 18 * u, top: 76 * u, width: 20 * u, height: 2.2 * u, backgroundColor: brand, transform: [{ skewX: '-30deg' }] }} />
        {address}
        <View style={{ position: 'absolute', left: 18 * u, right: 18 * u, top: 98 * u, flexDirection: 'row', gap: 5 * u }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flex: 1, borderTopWidth: Math.max(0.6, 0.5 * u), borderColor: brand, paddingTop: 2 * u, gap: 1.5 * u }}>
              {bar(14)}
              {bar(20, INK)}
            </View>
          ))}
        </View>
        <View style={{ position: 'absolute', left: 18 * u, right: 18 * u, top: 125 * u, height: Math.max(1, 0.7 * u), backgroundColor: brand }} />
        {rows(5)}
        <View style={{ position: 'absolute', right: 18 * u, top: 180 * u, width: 66 * u, height: 10 * u, backgroundColor: brand, transform: [{ skewX: '-20deg' }] }} />
      </>
    );
  } else if (model === 'structure') {
    const grid = [];
    for (let x = 15; x < 200; x += 5) grid.push(<View key={`x${x}`} style={{ position: 'absolute', left: x * u, top: 10 * u, width: 0.25 * u, height: 42 * u, backgroundColor: tint(brand, 0.86) }} />);
    for (let y = 15; y < 52; y += 5) grid.push(<View key={`y${y}`} style={{ position: 'absolute', left: 10 * u, right: 10 * u, top: y * u, height: 0.25 * u, backgroundColor: tint(brand, 0.86) }} />);
    const mark = (x: number, y: number, k: string) => (
      <View key={k} style={{ position: 'absolute', left: (x - 4) * u, top: (y - 4) * u, width: 8 * u, height: 8 * u }}>
        <View style={{ position: 'absolute', left: 3.7 * u, top: 0, width: 0.6 * u, height: 8 * u, backgroundColor: accent }} />
        <View style={{ position: 'absolute', top: 3.7 * u, left: 0, height: 0.6 * u, width: 8 * u, backgroundColor: accent }} />
      </View>
    );
    body = (
      <>
        {grid}
        <View style={{ position: 'absolute', left: 10 * u, right: 10 * u, top: 10 * u, bottom: 12 * u, borderWidth: Math.max(0.7, 0.45 * u), borderColor: brand }} />
        <View style={{ position: 'absolute', left: 10 * u, right: 10 * u, top: 52 * u, height: Math.max(0.7, 0.45 * u), backgroundColor: brand }} />
        {mark(10, 10, 'a')}
        {mark(200, 10, 'b')}
        {mark(10, 285, 'c')}
        {mark(200, 285, 'd')}
        <View style={{ position: 'absolute', left: 16 * u, top: 16 * u, backgroundColor: '#fff', padding: 1.5 * u }}>{logo}</View>
        <View style={{ position: 'absolute', right: 16 * u, top: 16 * u, width: 70 * u, height: 26 * u, backgroundColor: '#fff', borderWidth: Math.max(0.7, 0.45 * u), borderColor: brand }}>
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ width: '50%', height: '50%', padding: 1.6 * u, borderColor: brand, borderLeftWidth: i % 2 ? 0.4 * u : 0, borderTopWidth: i > 1 ? 0.4 * u : 0, gap: u }}>
                {bar(10, brand, 1.2 * u)}
                {bar(18, INK, 1.6 * u)}
              </View>
            ))}
          </View>
          <View style={{ height: 6 * u, backgroundColor: brand }} />
        </View>
        <View style={{ position: 'absolute', left: 18 * u, top: 61 * u, gap: 1.8 * u }}>
          {bar(30, INK, 1.8 * u)}
          {bar(42)}
          {bar(36)}
        </View>
        {address}
        <View style={{ position: 'absolute', left: 18 * u, right: 18 * u, top: 118 * u, height: 8 * u, backgroundColor: brand }} />
        <View style={{ position: 'absolute', left: 18 * u, right: 18 * u, top: 118 * u, height: 54 * u, borderWidth: Math.max(0.7, 0.45 * u), borderColor: brand }} />
        {rows(5, 18, tint(brand, 0.6))}
        <View style={{ position: 'absolute', right: 18 * u, top: 178 * u, width: 66 * u, height: 16 * u, borderWidth: Math.max(0.7, 0.45 * u), borderColor: brand, justifyContent: 'flex-end' }}>
          <View style={{ height: 7 * u, backgroundColor: brand }} />
        </View>
      </>
    );
  } else {
    body = (
      <>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2.2 * u, backgroundColor: brand }} />
        <View style={{ position: 'absolute', left: 18 * u, top: 16 * u }}>{logo}</View>
        <View style={{ position: 'absolute', left: 108 * u, top: 17 * u, flexDirection: 'row', gap: 6 * u }}>
          <View style={{ gap: 1.6 * u }}>
            {bar(26, INK)}
            {bar(22)}
            {bar(26)}
          </View>
          <View style={{ gap: 1.6 * u }}>
            {bar(20)}
            {bar(24)}
            {bar(22)}
          </View>
        </View>
        <Text style={{ position: 'absolute', left: 18 * u, top: 57 * u, fontSize: 13 * u, color: INK, fontWeight: '300' }}>Devis</Text>
        <View style={{ position: 'absolute', left: 18 * u, top: 76 * u }}>{bar(22)}</View>
        {address}
        {[96, 116, 176].map((t) => (
          <View key={t} style={{ position: 'absolute', left: 18 * u, right: 18 * u, top: t * u, height: Math.max(0.6, 0.35 * u), backgroundColor: INK }} />
        ))}
        <View style={{ position: 'absolute', left: 18 * u, top: 99 * u }}>{bar(12)}</View>
        <View style={{ position: 'absolute', left: 52 * u, top: 99 * u, flexDirection: 'row', gap: 12 * u }}>
          {bar(22)}
          {bar(22)}
          {bar(22)}
        </View>
        <View style={{ position: 'absolute', left: 18 * u, top: 120 * u }}>{bar(14)}</View>
        {rows(5, 52)}
        <View style={{ position: 'absolute', right: 18 * u, top: 184 * u, width: 60 * u, borderTopWidth: Math.max(0.8, 0.45 * u), borderColor: brand, paddingTop: 2 * u, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {bar(14, brand, 2 * u)}
          {bar(26, brand, 3.4 * u)}
        </View>
      </>
    );
  }

  return <View style={[styles.page, { width: W, height: H }]}>{body}</View>;
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#fff', overflow: 'hidden', position: 'relative', borderWidth: StyleSheet.hairlineWidth, borderColor: '#D9D6CE' },
});
