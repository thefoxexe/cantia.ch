import { createElement, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { loadPdfJs } from '../../lib/tenders/pdfjs';
import type { SourceBox } from '../../lib/tenders/types';
import { colors, fontSize, radius } from '../../lib/theme';

// One page of a PDF drawn with pdf.js, with the source boxes of the
// selected line highlighted. Boxes are normalized 0..1 on the page, so they
// stay right at any zoom or screen size.

const docs = new Map<string, Promise<any>>();
function openDoc(url: string) {
  if (!docs.has(url)) {
    docs.set(
      url,
      loadPdfJs().then(async (pdfjs: any) => {
        const res = await fetch(url);
        const data = new Uint8Array(await res.arrayBuffer());
        return pdfjs.getDocument({ data }).promise;
      }),
    );
  }
  return docs.get(url)!;
}

export function PdfPage({ url, page, width, highlights = [], onPageCount }: { url: string; page: number; width: number; highlights?: SourceBox[]; onPageCount?: (n: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let task: any = null;
    setBusy(true);
    openDoc(url)
      .then(async (doc) => {
        onPageCount?.(doc.numPages);
        const p = await doc.getPage(Math.min(Math.max(1, page), doc.numPages));
        if (cancelled) return;
        const base = p.getViewport({ scale: 1 });
        const scale = width / base.width;
        const ratio = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
        const vp = p.getViewport({ scale: scale * ratio });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = `${Math.floor(vp.width / ratio)}px`;
        canvas.style.height = `${Math.floor(vp.height / ratio)}px`;
        setSize({ w: vp.width / ratio, h: vp.height / ratio });
        task = p.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
        await task.promise;
        if (!cancelled) setBusy(false);
      })
      .catch((e) => {
        if (!cancelled && e?.name !== 'RenderingCancelledException') setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
      task?.cancel?.();
    };
  }, [url, page, width, onPageCount]);

  if (error) return <Text style={styles.error}>{error}</Text>;
  return (
    <View style={[styles.wrap, size && { width: size.w, height: size.h }]}>
      {createElement('canvas', { ref: canvasRef, style: { display: 'block', borderRadius: 4 } })}
      {size
        ? highlights.map((b, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={[styles.box, { left: b.x * size.w - 4, top: b.y * size.h - 3, width: Math.max(12, b.w * size.w + 8), height: Math.max(10, b.h * size.h + 6) }]}
            />
          ))
        : null}
      {busy ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', backgroundColor: '#fff', borderRadius: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, minHeight: 200 },
  box: { position: 'absolute', borderWidth: 2, borderColor: colors.primary, backgroundColor: 'rgba(196, 98, 45, 0.12)', borderRadius: radius.sm },
  loading: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: fontSize.sm, color: colors.danger, padding: 12 },
});
