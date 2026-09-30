import { createElement, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { attachmentUrl, type MailAttachment } from '../../lib/api/salesEmails';
import { useTranslation } from '../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Body of a received e-mail. On the web the original HTML is shown in a
// sandboxed frame: no script can run (no allow-scripts), links open in a new
// tab. Elsewhere, and when there is no HTML, the plain text.

export function MailBody({ html, text }: { html: string | null; text: string | null }) {
  if (Platform.OS === 'web' && html) return <HtmlFrame html={html} />;
  return (
    <Text style={styles.text} selectable>
      {text || ''}
    </Text>
  );
}

function HtmlFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(200);
  const doc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#231A12;word-wrap:break-word}img{max-width:100%;height:auto}blockquote{margin:8px 0;padding-left:12px;border-left:3px solid #E6D8C2;color:#6E6151}</style></head><body>${html}</body></html>`;

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const measure = () => {
      try {
        const h = frame.contentDocument?.documentElement?.scrollHeight;
        if (h) setHeight(Math.min(Math.max(h + 8, 80), 6000));
      } catch {
        // Not readable: keep the default height, the frame scrolls.
      }
    };
    frame.addEventListener('load', measure);
    const timer = setTimeout(measure, 600);
    return () => {
      frame.removeEventListener('load', measure);
      clearTimeout(timer);
    };
  }, [html]);

  // allow-same-origin only lets this page measure the height; without
  // allow-scripts nothing inside the e-mail can run.
  return createElement('iframe', {
    ref,
    srcDoc: doc,
    sandbox: 'allow-same-origin allow-popups allow-popups-to-escape-sandbox',
    referrerPolicy: 'no-referrer',
    title: 'e-mail',
    style: { width: '100%', height, border: 0, display: 'block', background: 'transparent' },
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function Attachments({ items }: { items: MailAttachment[] }) {
  const { t } = useTranslation();
  if (!items.length) return null;
  async function open(a: MailAttachment) {
    const url = await attachmentUrl(a.path);
    if (url) Linking.openURL(url);
  }
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={styles.label}>
        {t('emailHub.attachmentsLabel')} · {items.length}
      </Text>
      <View style={styles.files}>
        {items.map((a) => (
          <Pressable key={a.path} onPress={() => open(a)} style={({ hovered }: any) => [styles.file, hovered && { borderColor: colors.primary }]}>
            <Feather name={a.content_type.startsWith('image/') ? 'image' : a.content_type.includes('pdf') ? 'file-text' : 'paperclip'} size={16} color={colors.primary} />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.fileName} numberOfLines={1}>
                {a.name}
              </Text>
              <Text style={styles.fileSize}>{formatSize(a.size)}</Text>
            </View>
            <Feather name="download" size={14} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, lineHeight: 23, color: colors.text },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  files: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 280, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: colors.bg },
  fileName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  fileSize: { fontSize: 11.5, color: colors.textMuted },
});
