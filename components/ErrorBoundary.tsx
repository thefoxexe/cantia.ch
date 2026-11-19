import { Component, useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './ui';
import { colors, fontSize, spacing } from '../lib/theme';
import { i18next } from '../lib/translations';

interface Props {
  children: ReactNode;
  // Pass null for a chrome element (e.g. a header icon) where a visible
  // error card would be worse than the element just quietly disappearing.
  // Omitted entirely, this renders the full "something broke" card.
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

// Nothing in this app caught render-time errors before this — a crash
// anywhere in the tree (a bad screen, a bug in a new feature) unmounted
// everything above it, which on web/RNW looks like a totally blank white
// page with nothing clickable, not even navigation. This puts a floor
// under that: whatever broke, the user gets a legible message and a way
// back instead of silence. It only catches render/lifecycle errors (React's
// own limitation) — promise rejections and event-handler throws still need
// their own try/catch where they happen.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  // A React state reset alone re-renders the same tree with whatever
  // stale/bad state caused the crash still in memory — on web a real
  // reload actually clears it; on native, falling back to a state reset
  // is the closest equivalent (there's no page to reload).
  reload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    } else {
      this.setState({ error: null });
    }
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return <ErrorScreen onReload={this.reload} />;
    }
    return this.props.children;
  }
}

const BACK_AFTER_S = 6;

// Where to go: the page before this one, else the home page. The tree that
// crashed is still in memory, so on web the page is loaded fresh there
// (a client-side navigation would show this same screen again).
function goBack() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const sameSiteReferrer = (() => {
    try {
      return document.referrer && new URL(document.referrer).origin === window.location.origin && document.referrer !== window.location.href;
    } catch {
      return false;
    }
  })();
  if (window.history.length > 1) {
    const before = window.location.href;
    window.addEventListener('popstate', () => window.location.reload(), { once: true });
    window.history.back();
    // Nothing to go back to inside the site (opened from a link): home.
    setTimeout(() => {
      if (window.location.href === before) window.location.assign(sameSiteReferrer ? document.referrer : '/');
    }, 600);
  } else {
    window.location.assign(sameSiteReferrer ? document.referrer : '/');
  }
}

// No technical message for visitors: a short apology, then back to where
// they were after a few seconds. The error itself stays in the console.
function ErrorScreen({ onReload }: { onReload: () => void }) {
  const [left, setLeft] = useState(BACK_AFTER_S);
  const web = Platform.OS === 'web';
  useEffect(() => {
    if (!web) return;
    const t = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [web]);
  useEffect(() => {
    if (web && left === 0) goBack();
  }, [left, web]);
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Feather name="compass" size={26} color={colors.primary} />
      </View>
      <Text style={styles.title}>{i18next.t('errorBoundary.title')}</Text>
      <Text style={styles.text}>{i18next.t('errorBoundary.text')}</Text>
      {web ? <Text style={styles.countdown}>{i18next.t('errorBoundary.countdown', { s: left })}</Text> : null}
      <View style={styles.actions}>
        {web ? (
          <Button title={i18next.t('errorBoundary.back')} onPress={goBack} />
        ) : (
          <Button title={i18next.t('errorBoundary.reload')} onPress={onReload} />
        )}
        {web ? (
          <Pressable onPress={() => window.location.assign('/')} hitSlop={8}>
            <Text style={styles.link}>{i18next.t('errorBoundary.home')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginTop: spacing.sm,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 360,
  },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  countdown: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.md },
  link: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
});
