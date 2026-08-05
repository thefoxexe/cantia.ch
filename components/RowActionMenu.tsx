import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface RowAction {
  key: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}

// Kebab "..." trigger that opens a small dropdown anchored under itself —
// used as a sibling of (never nested inside) any row-level Pressable, so a
// tap on the menu never also triggers the row's own onPress on web.
export function RowActionMenu({ actions }: { actions: RowAction[] }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<View>(null);

  function open() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      setPos({ top: y + height + 4, right: Math.max(spacing.md, windowWidth - (x + width)) });
      setVisible(true);
    });
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable onPress={open} hitSlop={10} style={styles.trigger}>
          <Feather name="more-vertical" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)}>
          {pos ? (
            <View style={[styles.card, { top: pos.top, right: pos.right }]}>
              {actions.map((action, i) => (
                <Pressable
                  key={action.key}
                  disabled={action.disabled}
                  onPress={() => {
                    setVisible(false);
                    action.onPress();
                  }}
                  style={[styles.row, i > 0 && styles.rowBorder, action.disabled && styles.rowDisabled]}
                >
                  <Feather name={action.icon} size={15} color={action.danger ? colors.danger : colors.text} />
                  <Text style={[styles.rowText, action.danger && styles.rowTextDanger]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowTextDanger: {
    color: colors.danger,
  },
});
