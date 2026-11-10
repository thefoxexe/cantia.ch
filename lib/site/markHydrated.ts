import { useEffect } from 'react';

// Adds <html class="hydrated">, which shows the page (#root stays hidden until
// then) and lets the arrival loader (components/site/Splash) go. Two
// conditions, each capped so the page always appears:
// - the brand fonts are loaded (0.8 s at most), so text never jumps;
// - the layout fits the window (2.5 s at most). The static HTML is rendered
//   at desktop width; on a phone the page re-renders at its real width a
//   moment after hydration, and until then it is wider than the screen.
export function useMarkHydrated() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    let done = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reveal = () => {
      if (done) return;
      done = true;
      root.classList.add('hydrated');
    };
    const fits = () => root.scrollWidth <= window.innerWidth + 1;
    const whenLaidOut = () => {
      const start = Date.now();
      const tick = () => {
        if (done) return;
        if (fits() || Date.now() - start > 2500) reveal();
        else raf = requestAnimationFrame(tick);
      };
      tick();
    };
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts?.load) whenLaidOut();
    else {
      let fontsDone = false;
      const next = () => {
        if (fontsDone) return;
        fontsDone = true;
        whenLaidOut();
      };
      timers.push(setTimeout(next, 800));
      Promise.all([fonts.load('400 16px "DM Sans"'), fonts.load('italic 400 16px "DM Serif Display"')])
        .catch(() => undefined)
        .then(next);
    }
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);
}
