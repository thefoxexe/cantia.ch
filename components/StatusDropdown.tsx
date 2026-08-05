import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { StatusBadge } from './ui';

export interface StatusDropdownExtraAction {
  key: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

// Status badge + chevron trigger that opens a small anchored dropdown
// (measureInWindow, same technique as RowActionMenu/AccountMenu) listing every
// status as a tappable row, plus optional extra actions below a divider.
// Replaces the old always-visible row of status chips, which pushed anything
// below it (e.g. "Facturer un acompte") down past however many line items a
// document has — this stays pinned next to the badge in the header instead.
export function StatusDropdown<S extends string>({
  status,
  options,
  labels,
  onChange,
  extraActions,
}: {
  status: S;
  options: readonly S[];
  labels: Record<S, string>;
  onChange: (status: S) => void;
  extraActions?: StatusDropdownExtraAction[];
}) {
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

  function onClose() {
    setVisible(false);
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable onPress={open} hitSlop={6} style={styles.trigger}>
          <StatusBadge status={status} />
          <Feather name="chevron-down" size={14} color={colors.textMuted} />
        </Pressable>
      </View>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          {pos ? (
            <View style={[styles.card, { top: pos.top, right: pos.right }]}>
              {options.map((s, i) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    onClose();
                    if (s !== status) onChange(s);
                  }}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                >
                  <Text style={[styles.rowText, s === status && styles.rowTextActive]}>{labels[s]}</Text>
                  {s === status ? <Feather name="check" size={15} color={colors.primary} /> : null}
                </Pressable>
              ))}
              {extraActions?.length ? (
                <>
                  <View style={styles.divider} />
                  {extraActions.map((action) => (
                    <Pressable
                      key={action.key}
                      disabled={action.disabled}
                      onPress={() => {
                        onClose();
                        action.onPress();
                      }}
                      style={[styles.row, action.disabled && styles.rowDisabled]}
                    >
                      <Feather name={action.icon} size={15} color={colors.text} />
                      <Text style={styles.rowText}>{action.label}</Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  card: {
    position: 'absolute',
    width: 220,
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
    justifyContent: 'space-between',
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
  rowTextActive: {
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
