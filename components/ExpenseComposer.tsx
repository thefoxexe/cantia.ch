import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../lib/auth-context';
import { createProjectExpense } from '../lib/api/expenses';
import { scanReceipt } from '../lib/api/ai';
import { Button, Card, Field } from './ui';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// The material-expense form used in a chantier's Rentabilité tab: scan a
// receipt photo (fills fournisseur + montant automatically) or type it in by
// hand. Always tied to the chantier it's rendered from — general/overhead
// spend not linked to a chantier belongs in Trésorerie → Dépenses
// ponctuelles instead, which has its own scan entry point.
export function ExpenseComposer({
  organizationId,
  projectId,
  onSaved,
}: {
  organizationId: string;
  projectId: string;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  async function processReceiptImage(uri: string) {
    setScanningReceipt(true);
    setScanError(null);
    setScanSuccess(null);
    try {
      const manipulated = await ImageManipulator.ImageManipulator.manipulate(uri).resize({ width: 1400 }).renderAsync();
      const saved = await manipulated.saveAsync({ compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true });
      if (!saved.base64) {
        setScanError(t('projectProfitability.scanFailed'));
        return;
      }
      const { receipt, error: err } = await scanReceipt(organizationId, saved.base64, 'image/jpeg');
      if (err || !receipt) {
        setScanError(err ?? t('projectProfitability.scanFailed'));
        return;
      }
      setLabel(receipt.label);
      setAmount(receipt.amount > 0 ? String(receipt.amount) : '');
      setScanSuccess(
        receipt.label && receipt.amount > 0
          ? t('projectProfitability.scanSuccess', { label: receipt.label, amount: receipt.amount })
          : t('projectProfitability.scanPartial'),
      );
    } catch (e) {
      // Anything unexpected (image processing, network, a thrown error deep
      // in an SDK call) must still surface — silently swallowing it here is
      // exactly what made a failed scan look like "nothing happened".
      setScanError(e instanceof Error ? e.message : t('projectProfitability.scanFailed'));
    } finally {
      setScanningReceipt(false);
    }
  }

  async function scanFromCamera() {
    setScanError(null);
    setScanSuccess(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('projectProfitability.cameraPermissionTitle'), t('projectProfitability.cameraPermissionBody'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      await processReceiptImage(result.assets[0].uri);
    } catch (e) {
      setScanError(e instanceof Error ? e.message : t('projectProfitability.scanFailed'));
    }
  }

  async function scanFromGallery() {
    setScanError(null);
    setScanSuccess(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('projectProfitability.cameraPermissionTitle'), t('projectProfitability.galleryPermissionBody'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      await processReceiptImage(result.assets[0].uri);
    } catch (e) {
      setScanError(e instanceof Error ? e.message : t('projectProfitability.scanFailed'));
    }
  }

  async function handleSave() {
    if (!label.trim() || !amount.trim()) return;
    setSaving(true);
    const { error } = await createProjectExpense(organizationId, projectId, label.trim(), Number(amount) || 0, user?.id ?? null);
    setSaving(false);
    if (!error) {
      setLabel('');
      setAmount('');
      onSaved();
    }
  }

  return (
    <Card style={styles.addCard}>
      <View style={styles.scanRow}>
        <Pressable onPress={scanFromCamera} disabled={scanningReceipt} style={styles.scanButton}>
          {scanningReceipt ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="camera" size={16} color={colors.primary} />}
          <Text style={styles.scanButtonText}>{t('projectProfitability.scanCamera')}</Text>
        </Pressable>
        <Pressable onPress={scanFromGallery} disabled={scanningReceipt} style={styles.scanButton}>
          <Feather name="image" size={16} color={colors.primary} />
          <Text style={styles.scanButtonText}>{t('projectProfitability.scanGallery')}</Text>
        </Pressable>
      </View>

      {scanningReceipt ? (
        <View style={styles.scanStatusRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.scanStatusText}>{t('projectProfitability.scanInProgress')}</Text>
        </View>
      ) : scanError ? (
        <View style={[styles.scanStatusRow, styles.scanStatusRowError]}>
          <Feather name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.scanError}>{scanError}</Text>
        </View>
      ) : scanSuccess ? (
        <View style={[styles.scanStatusRow, styles.scanStatusRowSuccess]}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={styles.scanSuccessText}>{scanSuccess}</Text>
        </View>
      ) : (
        <Text style={styles.scanHint}>{t('projectProfitability.scanHint')}</Text>
      )}

      <Field label={t('projectProfitability.descriptionLabel')} value={label} onChangeText={setLabel} placeholder={t('projectProfitability.descriptionPlaceholder')} />
      <Field label={t('projectProfitability.amountLabel')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
      <Button title={t('projectProfitability.save')} icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
    </Card>
  );
}

const styles = StyleSheet.create({
  addCard: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  scanRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  scanButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  scanStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  scanStatusRowError: {
    backgroundColor: colors.dangerSoft,
  },
  scanStatusRowSuccess: {
    backgroundColor: colors.successSoft,
  },
  scanStatusText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  scanSuccessText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.success,
  },
  scanError: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  scanHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
