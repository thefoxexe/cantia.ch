import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { ContactForm } from '../components/ContactForm';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { useTranslation } from '../lib/translations';
import { openLiveChat } from '../lib/liveChat';

// Real, dedicated support entry point — previously the only trace of a
// way to reach Cantia was a small mailto link buried in the footer.
export default function ContactScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('contactPage.title')}</Text>
            <Text style={styles.lead}>{t('contactPage.lead')}</Text>
          </View>

          <View style={styles.layout}>
            <ContactForm />
            <View style={styles.sideCard}>
              <View style={styles.sideRow}>
                <Feather name="mail" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sideLabel}>{t('contactPage.emailLabel')}</Text>
                  <Text style={styles.sideValue}>info@cantia.ch</Text>
                </View>
              </View>
              <View style={styles.sideRow}>
                <Feather name="clock" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sideLabel}>{t('contactPage.responseTimeLabel')}</Text>
                  <Text style={styles.sideValue}>{t('contactPage.responseTimeValue')}</Text>
                </View>
              </View>
              <View style={styles.sideDivider} />
              <Pressable style={styles.chatButton} onPress={openLiveChat}>
                <Feather name="message-circle" size={16} color="#fff" />
                <Text style={styles.chatButtonText}>{t('contactPage.chatButton')}</Text>
              </Pressable>
            </View>
          </View>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  lead: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  sideCard: {
    width: 240,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    alignSelf: 'flex-start',
  },
  sideRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sideLabel: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sideValue: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  sideDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  chatButtonText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#fff',
  },
});
