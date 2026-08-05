import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { StatusBadge } from './ui';

// Status badge + chevron trigger that opens a small anchored dropdown
// (measureInWindow, same technique as RowActionMenu/AccountMenu) listing every
// status as a tappable row. Used on the devis screen only — the facture
// screen has its own "Actions" panel (télécharger/finaliser/paiement/
// acompte/...) instead of a plain status picker.
export function StatusDropdown<S extends string>({
  status,
  options,
  labels,
  onChange,
}: {
  status: S;
  options: readonly S[];
  labels: Record<S, string>;
  onChange: (status: S) => void;
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
  rowText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowTextActive: {
    color: colors.primary,
  },
});
