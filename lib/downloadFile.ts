import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// "Ouvrir le PDF" was just handing the signed URL to Linking.openURL, which
// on Android opens Chrome's inline PDF viewer instead of actually saving
// the file — this makes it a real download/save on every platform instead.
export async function downloadFile(url: string, filename: string): Promise<{ error: string | null }> {
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  }

  try {
    const destination = new File(Paths.cache, filename);
    const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true });
    if (await Sharing.isAvailableAsync()) {
      // Presents the native share/save sheet — the closest native
      // equivalent to a browser "Downloads" folder, letting the user pick
      // Fichiers/Drive/a PDF reader/etc.
      await Sharing.shareAsync(downloaded.uri);
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

// Same "save this to the user's device" job as downloadFile, but for
// content generated in-app (a CSV export) rather than something already
// sitting behind a URL.
export async function downloadTextFile(filename: string, content: string, mimeType = 'text/csv'): Promise<{ error: string | null }> {
  if (Platform.OS === 'web') {
    try {
      const blob = new Blob([content], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  }

  try {
    const destination = new File(Paths.cache, filename);
    destination.create({ overwrite: true });
    destination.write(content);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(destination.uri);
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
