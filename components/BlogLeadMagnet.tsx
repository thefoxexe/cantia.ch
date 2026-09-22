import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { supabase } from '../lib/supabase';
import { isMarketingHost } from '../lib/appHost';
import { trackBlogCtaClick } from '../lib/blogAnalytics';
import { BlogPost } from '../lib/blog/types';

type LeadMagnetBlock = Extract<BlogPost['blocks'][number], { type: 'leadmagnet' }>;

export function BlogLeadMagnet({ block, sourceSlug, category }: { block: LeadMagnetBlock; sourceSlug: string; category: string }) {
  const [email, setEmail] = useState('');
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'delivered' | 'error'>('idle');

  const canSubmit = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit() {
    if (!canSubmit || status === 'sending') return;
    if (botField.trim()) {
      setStatus('delivered');
      return;
    }
    setStatus('sending');
    const { error } = await supabase.from('blog_leads').insert({ email: email.trim(), source_slug: sourceSlug });
    if (error) {
      console.error('[blog-leads] insert failed:', error.message);
      setStatus('error');
      return;
    }
    if (isMarketingHost()) trackBlogCtaClick(sourceSlug, category, 'leadmagnet');
    setStatus('delivered');
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(block.fileUrl, '_blank');
    } else {
      Linking.openURL(block.fileUrl).catch(() => {});
    }
  }

  if (status === 'delivered') {
    return (
      <View style={styles.card}>
        <View style={styles.deliveredIcon}>
          <Feather name="check" size={18} color={colors.success} />
        </View>
        <Text style={styles.deliveredTitle}>Votre modèle est prêt</Text>
        <Text style={styles.deliveredText}>Le téléchargement a démarré. Si rien ne s’ouvre, utilisez le lien ci-dessous.</Text>
        <Button title={block.fileLabel} variant="secondary" onPress={() => Linking.openURL(block.fileUrl)} style={styles.deliveredButton} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Feather name="download" size={16} color={colors.primaryDark} />
      </View>
      <Text style={styles.title}>{block.title}</Text>
      <Text style={styles.text}>{block.text}</Text>
      <View style={styles.formRow}>
        <View style={styles.fieldWrap}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.ch"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <Button title={block.buttonLabel} onPress={handleSubmit} loading={status === 'sending'} disabled={!canSubmit} style={styles.submitButton} />
      </View>
      <View style={styles.honeypot} accessible={false} importantForAccessibility="no-hide-descendants">
        <Field label="Ne pas remplir" value={botField} onChangeText={setBotField} tabIndex={-1} />
      </View>
      {status === 'error' ? <Text style={styles.errorText}>Un problème est survenu, réessayez dans un instant.</Text> : null}
      <Text style={styles.disclaimer}>Un seul email, aucun spam. Utilisé uniquement pour vous envoyer ce modèle et, occasionnellement, du contenu utile de ce type.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  text: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  fieldWrap: {
    flex: 1,
    minWidth: 200,
  },
  submitButton: {
    marginTop: 0,
  },
  honeypot: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -9999,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  disclaimer: {
    fontFamily: marketingFonts.body,
    fontSize: 11,
    color: colors.primaryDark,
    opacity: 0.7,
    marginTop: spacing.sm,
    lineHeight: 15,
  },
  deliveredIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  deliveredTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  deliveredText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    opacity: 0.9,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  deliveredButton: {
    alignSelf: 'flex-start',
  },
});
