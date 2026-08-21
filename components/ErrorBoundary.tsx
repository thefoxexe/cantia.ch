import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './ui';
import { colors, fontSize, spacing } from '../lib/theme';

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

  render() {
    if (this.state.error) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Feather name="alert-triangle" size={28} color={colors.danger} />
          <Text style={styles.title}>Un problème est survenu</Text>
          <Text style={styles.text}>
            Cette page n'a pas pu s'afficher correctement. Réessayez, et si ça persiste, prévenez-nous.
          </Text>
          <Button title="Recharger" onPress={() => this.setState({ error: null })} style={{ marginTop: spacing.md }} />
        </View>
      );
    }
    return this.props.children;
  }
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
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
});
