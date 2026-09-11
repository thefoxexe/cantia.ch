import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from './translations';

// Shared dirty-tracking for settings-style forms: call markDirty() from
// every field's onChange, render <UnsavedChangesBar> with the returned
// state, and wire confirmBeforeBack into <PageHeader onBeforeBack>. One
// hook replaces the old "buried Enregistrer button" pattern everywhere —
// see compte/entreprise.tsx and compte/apparence.tsx for the reference
// wiring.
export function useUnsavedChanges(onSave: () => Promise<boolean | void>) {
  const { t } = useTranslation();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const markDirty = useCallback(() => setDirty(true), []);

  const save = useCallback(async () => {
    setSaving(true);
    const result = await onSave();
    setSaving(false);
    // A save handler returning false explicitly means "didn't actually
    // save" (validation error, network failure) — stay dirty so the bar
    // keeps offering to retry instead of silently discarding the edits.
    if (result !== false) setDirty(false);
    return result;
  }, [onSave]);

  const discard = useCallback((onDiscard?: () => void) => {
    setDirty(false);
    onDiscard?.();
  }, []);

  // Returns true once it's safe to navigate away (nothing pending, or the
  // user chose to discard/save-and-leave), false to stay put.
  const confirmBeforeBack = useCallback(
    (onDiscard?: () => void): Promise<boolean> => {
      if (!dirty) return Promise.resolve(true);
      return new Promise((resolve) => {
        Alert.alert(t('unsavedChanges.title'), t('unsavedChanges.body'), [
          { text: t('unsavedChanges.discard'), style: 'destructive', onPress: () => { discard(onDiscard); resolve(true); } },
          { text: t('unsavedChanges.cancel'), style: 'cancel', onPress: () => resolve(false) },
          {
            text: t('unsavedChanges.saveAndLeave'),
            onPress: async () => {
              const result = await save();
              resolve(result !== false);
            },
          },
        ]);
      });
    },
    [dirty, t, save, discard],
  );

  return { dirty, saving, markDirty, save, discard, confirmBeforeBack };
}
