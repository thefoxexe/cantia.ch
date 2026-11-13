import { Dimensions, Platform } from 'react-native';

// The marketing pages are pre-rendered at build time with a fixed
// viewport (desktop 1440×900 or phone 390×844, see app/_layout.tsx). Hydrating that HTML in a
// phone-sized browser makes every useWindowDimensions() layout differ from
// the markup, and React throws the whole page away (error #418). So while
// the page hydrates, Dimensions reports the build viewport; once the page
// itself has mounted (Screen calls releaseHydrationViewport in an effect —
// routes hydrate lazily, after the root layout), the real size is restored
// and a resize event makes every useWindowDimensions() re-read it.

// Two build viewports: desktop (dist/, every visitor by default) and phone
// (dist/_m/, served to phones). The page says which one it was rendered at
// in <html data-ssr-viewport>.
const DESKTOP_VIEWPORT = { width: 1440, height: 900, scale: 1, fontScale: 1 };
const PHONE_VIEWPORT = { width: 390, height: 844, scale: 1, fontScale: 1 };
let release: (() => void) | null = null;

export function ssrViewport(kind: string | null | undefined) {
  return kind === 'phone' ? PHONE_VIEWPORT : DESKTOP_VIEWPORT;
}

export function holdHydrationViewport(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || release) return;
  if (!document.getElementById('root')?.hasChildNodes()) return; // client-only render: nothing to match
  const buildViewport = ssrViewport(document.documentElement.getAttribute('data-ssr-viewport'));
  const realGet = Dimensions.get.bind(Dimensions);
  (Dimensions as unknown as { get: typeof Dimensions.get }).get = (() => buildViewport) as typeof Dimensions.get;
  release = () => {
    (Dimensions as unknown as { get: typeof Dimensions.get }).get = realGet;
    // react-native-web listens on visualViewport when it exists, else window.
    (window.visualViewport ?? window).dispatchEvent(new Event('resize'));
  };
  // Pages that don't use <Screen> still get their real size.
  setTimeout(releaseHydrationViewport, 1500);
}

export function releaseHydrationViewport(): void {
  if (!release) return;
  const r = release;
  release = null;
  // After the current commit's effects (other useWindowDimensions() hooks
  // read Dimensions in their own effects).
  setTimeout(r, 0);
}

// Blocks sized from onLayout (laptop and phone frames, document pages…)
// render nothing until they are measured, so the pre-rendered page had an
// empty gap where they go. When the width such a block will have in the
// build viewport is known, it starts from that width: the build renders the
// block, hydration renders the same, and the first onLayout corrects it to
// the real size. 0 (unknown) keeps the old behaviour.
export const PHONE_COLUMN = PHONE_VIEWPORT.width - 44; // full width minus the 22 px page gutters

export function buildWidth(hint: { phone?: number; desktop?: number }): number {
  if (Platform.OS !== 'web') return 0;
  const { width } = Dimensions.get('window');
  if (width === PHONE_VIEWPORT.width) return hint.phone ?? 0;
  if (width === DESKTOP_VIEWPORT.width) return hint.desktop ?? 0;
  return 0;
}
