import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

const STORAGE_PREFIX = 'opus:hint:';

export function useFirstVisitHint(id: string) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_PREFIX + id).then((seen) => {
      if (!mounted) return;
      setVisible(!seen);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const dismiss = useCallback(() => {
    setVisible(false);
    AsyncStorage.setItem(STORAGE_PREFIX + id, '1');
  }, [id]);

  return { visible: ready && visible, dismiss };
}

export function FeatureHint({
  id,
  icon = 'info',
  title,
  text,
}: {
  id: string;
  icon?: IconName;
  title: string;
  text: string;
}) {
  const { visible, dismiss } = useFirstVisitHint(id);
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Pressable hitSlop={10} onPress={dismiss} style={styles.close}>
        <Feather name="x" size={15} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  iconWrap: {
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  close: {
    marginTop: 1,
  },
});
