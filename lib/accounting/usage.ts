import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '../supabase';

// What a firm uses on accounting.cantia.ch, for Super Admin › Fiduciaires:
// one counter per screen (or export) and day, plus a presence timestamp.
// Fire-and-forget: a failed call never blocks or shows anything.

const DEDUPE_MS = 30_000;
const lastSent = new Map<string, number>();

// area: "space:clients", "client:invoices", "export:banana"… (a-z, 0-9, _.:-)
export function trackFiduciary(area: string): void {
  const now = Date.now();
  if (now - (lastSent.get(area) ?? 0) < DEDUPE_MS) return;
  lastSent.set(area, now);
  supabase.rpc('fiduciary_track', { p_area: area }).then(
    () => {},
    () => {},
  );
}

// Re-tracks whenever the value changes (a tab, a sub-view).
export function useTrackFiduciary(area: string | null): void {
  useEffect(() => {
    if (area) trackFiduciary(area);
  }, [area]);
}

// "Last seen": a heartbeat every 2 minutes while the workspace is open,
// in front and (on web) touched in the last 5 minutes.
export function useFiduciaryPresence(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let lastInteraction = Date.now();
    const mark = () => {
      lastInteraction = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      events.forEach((e) => document.addEventListener(e, mark, { passive: true }));
    }
    const beat = () => {
      if (AppState.currentState !== 'active') return;
      if (Platform.OS === 'web' && Date.now() - lastInteraction > 5 * 60_000) return;
      supabase.rpc('fiduciary_track', { p_area: null }).then(
        () => {},
        () => {},
      );
    };
    beat();
    const interval = setInterval(beat, 120_000);
    return () => {
      clearInterval(interval);
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        events.forEach((e) => document.removeEventListener(e, mark));
      }
    };
  }, [enabled]);
}
