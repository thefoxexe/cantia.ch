import { invokeFunction } from './functions';

export async function suggestBrandColorsFromWebsite(website: string): Promise<string[]> {
  const { data } = await invokeFunction<{ suggestions: string[] }>('extract-brand-colors', { website });
  return data?.suggestions ?? [];
}
