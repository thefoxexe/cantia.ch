import { Dimensions, Platform } from 'react-native';

// The marketing pages are pre-rendered at build time with a desktop
// viewport (1440×900, see app/_layout.tsx). Hydrating that HTML in a
// phone-sized browser makes every useWindowDimensions() layout differ from
// the markup, and React throws the whole page away (error #418). So while
// the page hydrates, Dimensions reports the build viewport; once the page
// itself has mounted (Screen calls releaseHydrationViewport in an effect —
// routes hydrate lazily, after the root layout), the real size is restored
// and a resize event makes every useWindowDimensions() re-read it.

const BUILD_VIEWPORT = { width: 1440, height: 900, scale: 1, fontScale: 1 };
let release: (() => void) | null = null;

export function holdHydrationViewport(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || release) return;
  if (!document.getElementById('root')?.hasChildNodes()) return; // client-only render: nothing to match
  const realGet = Dimensions.get.bind(Dimensions);
  (Dimensions as unknown as { get: typeof Dimensions.get }).get = (() => BUILD_VIEWPORT) as typeof Dimensions.get;
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
