import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { createTrame } from '../../../../lib/api/trames';
import { Button, Field, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

interface TrameLine {
  description: string;
  unit: string;
  unitPrice: string;
}

function emptyLine(): TrameLine {
  return { description: '', unit: 'pce', unitPrice: '0' };
}

export default function NewTrameScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const [name, setName] = useState('');
  const [lines, setLines] = useState<TrameLine[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateLine(index: number, patch: Partial<TrameLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    if (!organization) return;
    if (!name.trim()) {
      setError(t('newTrame.nameRequired'));
      return;
    }
    const validLines = lines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      setError(t('newTrame.lineRequired'));
      return;
    }
    setError(null);
    setLoading(true);
    const { id, error: createError } = await createTrame(
      organization.id,
      name.trim(),
      validLines.map((l) => ({ description: l.description.trim(), unit: l.unit.trim() || 'pce', unitPrice: Number(l.unitPrice) || 0 })),
    );
    setLoading(false);
    if (createError || !id) {
      setError(createError ?? t('newTrame.createFailed'));
      return;
    }
    router.replace(`/(app)/devis/trames/${id}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('newTrame.title')}</Text>
          <Field label={t('newTrame.nameLabel')} value={name} onChangeText={setName} placeholder={t('newTrame.namePlaceholder')} />

          <Text style={styles.sectionTitle}>{t('newTrame.positionsTitle')}</Text>
          {lines.map((line, i) => (
            <View key={i} style={styles.lineCard}>
              <View style={styles.lineCardHeader}>
                <Text style={styles.lineIndex}>{t('newTrame.positionIndex', { index: i + 1 })}</Text>
                {lines.length > 1 ? (
                  <Pressable onPress={() => removeLine(i)} hitSlop={8}>
                    <Feather name="trash-2" size={16} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
              <TextInput
                style={styles.lineDesc}
                value={line.description}
                onChangeText={(v) => updateLine(i, { description: v })}
                placeholder={t('newTrame.descriptionPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <View style={styles.lineFields}>
                <View style={styles.lineFieldUnit}>
                  <Text style={styles.lineFieldLabel}>{t('newTrame.unitLabel')}</Text>
                  <TextInput
                    style={styles.lineInput}
                    value={line.unit}
                    onChangeText={(v) => updateLine(i, { unit: v })}
                    placeholder={t('newTrame.unitPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.lineFieldPrice}>
                  <Text style={styles.lineFieldLabel}>{t('newTrame.unitPriceLabel')}</Text>
                  <TextInput
                    style={styles.lineInput}
                    value={line.unitPrice}
                    onChangeText={(v) => updateLine(i, { unitPrice: v })}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>
          ))}

          <Pressable style={styles.addLine} onPress={addLine}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addLineText}>{t('newTrame.addPosition')}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title={t('newTrame.save')} onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  lineCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  lineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lineIndex: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lineDesc: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    minHeight: 44,
  },
  lineFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  lineFieldUnit: {
    flexBasis: 100,
    flexGrow: 1,
  },
  lineFieldPrice: {
    flexBasis: 130,
    flexGrow: 1.4,
  },
  lineFieldLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  lineInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  addLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  addLineText: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
});
