import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { uploadToOrgBucket } from '../lib/api/storage';
import { SignaturePad } from './SignaturePad';
import { Button } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Shown when a member without a saved signature reaches devis/new.tsx —
// closes the loop the client asked for: every devis should come out
// electronically signed automatically, which only works once the signer's
// personal signature (organization_members.signature_url, otherwise set by
// hand in Compte → Mon profil) actually exists. "Plus tard" only skips this
// visit — as long as no signature is saved, the prompt returns next time a
// devis is created rather than being silenced forever after one dismissal.
export function SignaturePromptModal({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const { organization, user } = useAuth();
  const [drawn, setDrawn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!organization || !user || !drawn) return;
    setSaving(true);
    const subPath = `signatures/${user.id}-${Date.now()}.png`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, drawn, 'image/png');
    if (path) {
      await supabase
        .from('organization_members')
        .update({ signature_url: path })
        .eq('organization_id', organization.id)
        .eq('user_id', user.id);
    }
    setSaving(false);
    setDrawn(null);
    onDone();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Ajoutez votre signature</Text>
          <Text style={styles.hint}>
            Dessinez-la une fois : elle sera posée automatiquement sur tous vos devis, à côté de celle du client.
            Modifiable ensuite dans Compte → Mon profil.
          </Text>
          <SignaturePad onChange={setDrawn} />
          <Button
            title={saving ? 'Enregistrement…' : 'Enregistrer ma signature'}
            icon="check"
            onPress={save}
            loading={saving}
            disabled={!drawn}
            style={{ marginTop: spacing.md }}
          />
          <Pressable onPress={onDone} style={styles.later}>
            <Text style={styles.laterText}>Plus tard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  later: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  laterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
