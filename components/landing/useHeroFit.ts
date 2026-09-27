import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

// Sizes a hero headline so the whole hero (kicker, headline, lede, CTAs,
// facts, title block) fits the visible viewport on any screen — a short
// laptop, a tall phone, a German headline that wraps to one more line.
// Measures the rendered hero and searches for the largest headline size
// (never above the designed one) whose real layout fits. A search rather
// than a single proportional step, because a smaller headline can wrap onto
// fewer lines and suddenly leave lots of room.
// `chrome` is the fixed vertical space around the measured parts (paddings,
// margins between them); parts are measured with onPartLayout(key).
export function useHeroFit({ designed, min, available, chrome = 0 }: { designed: number; min: number; available: number; chrome?: number }) {
  const [size, setSize] = useState(designed);
  const state = useRef({ size: designed, lo: min, hi: designed, passes: 0, done: false });
  const titleH = useRef(0);
  const parts = useRef<Record<string, number>>({});
  const frame = useRef<number | null>(null);

  const apply = (next: number) => {
    state.current.size = next;
    state.current.passes += 1;
    setSize(next);
  };

  const refit = useCallback(() => {
    if (frame.current != null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const s = state.current;
      const content = Object.values(parts.current).reduce((a, b) => a + b, 0);
      if (s.done || !titleH.current || !content || available <= 0) return;
      const fits = content + chrome <= available;
      if (fits) s.lo = s.size;
      else s.hi = s.size;
      if (fits && s.size >= designed) {
        s.done = true;
        return;
      }
      if (!fits && s.size <= min) {
        s.done = true;
        return;
      }
      if (s.hi - s.lo <= 2 || s.passes >= 8) {
        s.done = true;
        if (s.size !== s.lo) apply(s.lo);
        return;
      }
      // First step: proportional estimate of the headline size that fits;
      // then bisect between the largest size known to fit and the smallest
      // known not to.
      const next = s.passes === 0 && !fits
        ? Math.max(min, Math.min(s.hi - 1, (s.size * (available - (content + chrome - titleH.current))) / titleH.current))
        : (s.lo + s.hi) / 2;
      apply(Math.round(next));
    });
  }, [available, chrome, designed, min]);

  // A new screen size or nav height starts the search over from the designed
  // size, and re-measures even if that size is already on screen (no layout
  // event would fire to trigger it otherwise).
  useEffect(() => {
    state.current = { size: designed, lo: min, hi: designed, passes: 0, done: false };
    setSize(designed);
    refit();
  }, [designed, min, available, refit]);

  const onTitleLayout = useCallback((e: LayoutChangeEvent) => {
    titleH.current = e.nativeEvent.layout.height;
    refit();
  }, [refit]);
  const onPartLayout = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      parts.current[key] = e.nativeEvent.layout.height;
      refit();
    },
    [refit],
  );

  return { size, onTitleLayout, onPartLayout };
}
