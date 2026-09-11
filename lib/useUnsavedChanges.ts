import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type LeaveIntent =
  | null
  | { kind: 'programmatic'; resolve: (canLeave: boolean) => void; onDiscard?: () => void }
  | { kind: 'browser-back' };

// Shared dirty-tracking for settings-style forms: call markDirty() from
// every field's onChange, render <UnsavedChangesBar> with the returned
// state, wire confirmBeforeBack into <PageHeader onBeforeBack>, and render
// <UnsavedChangesModal> with the leaveModal* props — see
// compte/entreprise.tsx / compte/apparence.tsx for the reference wiring.
//
// On web this also intercepts the browser's own back button/gesture (not
// just the in-app back arrow): a real popstate can't be "cancelled" outright,
// so while the form is dirty a duplicate history entry is kept pushed on
// top of the current page. When the browser pops it, the handler below
// immediately re-pushes it (neutralizing the navigation, the URL never
// visibly changes) and opens the same confirmation modal. Choosing to
// leave from there replays the *real* navigation with history.go(-2) —
// one step for the guard entry, one for the actual back the user asked for.
export function useUnsavedChanges(onSave: () => Promise<boolean | void>) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaveIntent, setLeaveIntent] = useState<LeaveIntent>(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const guardingRef = useRef(false);

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

  // Push/pop the guard history entry in lockstep with `dirty` — pushed once
  // when edits start, silently popped (no visible navigation, since it's a
  // duplicate of the current URL) once they're saved or discarded through
  // the normal in-page bar rather than through a leave attempt.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (dirty && !guardingRef.current) {
      guardingRef.current = true;
      window.history.pushState({ __unsavedGuard: true }, '', window.location.href);
    } else if (!dirty && guardingRef.current) {
      guardingRef.current = false;
      window.history.back();
    }
  }, [dirty]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    function onPopState() {
      if (dirtyRef.current) {
        window.history.pushState({ __unsavedGuard: true }, '', window.location.href);
        setLeaveIntent({ kind: 'browser-back' });
      }
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Returns true once it's safe to navigate away (nothing pending, or the
  // user chose to discard/save-and-leave), false to stay put. Used by
  // PageHeader's in-app back arrow.
  const confirmBeforeBack = useCallback(
    (onDiscard?: () => void): Promise<boolean> => {
      if (!dirty) return Promise.resolve(true);
      return new Promise((resolve) => {
        setLeaveIntent({ kind: 'programmatic', resolve, onDiscard });
      });
    },
    [dirty],
  );

  const onLeaveSave = useCallback(async () => {
    const intent = leaveIntent;
    setLeaveIntent(null);
    const result = await save();
    const ok = result !== false;
    if (intent?.kind === 'programmatic') {
      intent.resolve(ok);
    } else if (intent?.kind === 'browser-back' && ok) {
      guardingRef.current = false;
      window.history.go(-2);
    }
  }, [leaveIntent, save]);

  const onLeaveDiscard = useCallback(() => {
    const intent = leaveIntent;
    setLeaveIntent(null);
    discard(intent?.kind === 'programmatic' ? intent.onDiscard : undefined);
    if (intent?.kind === 'programmatic') {
      intent.resolve(true);
    } else if (intent?.kind === 'browser-back') {
      guardingRef.current = false;
      window.history.go(-2);
    }
  }, [leaveIntent, discard]);

  const onLeaveCancel = useCallback(() => {
    const intent = leaveIntent;
    setLeaveIntent(null);
    if (intent?.kind === 'programmatic') intent.resolve(false);
    // browser-back: nothing to do — the pop was already neutralized by
    // re-pushing the guard entry, so the visible URL never moved.
  }, [leaveIntent]);

  return {
    dirty,
    saving,
    markDirty,
    save,
    discard,
    confirmBeforeBack,
    leaveModalVisible: leaveIntent !== null,
    onLeaveSave,
    onLeaveDiscard,
    onLeaveCancel,
  };
}
