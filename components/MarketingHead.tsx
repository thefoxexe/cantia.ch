import Head from 'expo-router/head';

export function MarketingHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}
