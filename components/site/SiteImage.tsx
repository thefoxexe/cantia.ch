import { createElement } from 'react';
import { Image, Platform, StyleSheet, type ImageResizeMode, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';
import { Asset } from 'expo-asset';

// An image of the public site. On the web it is a real <img> with its alt
// text, present in the pre-rendered HTML (React Native Web's Image only draws
// a background once JavaScript runs, so crawlers that read the HTML and the
// first paint never had the picture). Lazy unless `priority`.
const FIT: Record<string, string> = { cover: 'cover', contain: 'contain', stretch: 'fill', center: 'none', repeat: 'none' };

export function imageUri(source: ImageSourcePropType): string | undefined {
  if (typeof source === 'number') {
    try {
      return Asset.fromModule(source).uri;
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(source)) return source[0]?.uri;
  return (source as { uri?: string })?.uri;
}

export function SiteImage({
  source,
  style,
  alt,
  resizeMode = 'cover',
  priority,
}: {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  alt: string;
  resizeMode?: ImageResizeMode;
  priority?: boolean;
}) {
  const uri = imageUri(source);
  if (Platform.OS !== 'web' || !uri) return <Image source={source} style={style} resizeMode={resizeMode} accessibilityLabel={alt || undefined} />;
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const { width, height } = flat;
  return createElement('img', {
    src: uri,
    alt,
    width: typeof width === 'number' ? Math.round(width) : undefined,
    height: typeof height === 'number' ? Math.round(height) : undefined,
    loading: priority ? 'eager' : 'lazy',
    fetchpriority: priority ? 'high' : undefined,
    decoding: 'async',
    draggable: false,
    style: { ...flat, display: 'block', objectFit: FIT[resizeMode] ?? 'cover', maxWidth: 'none' },
  });
}
