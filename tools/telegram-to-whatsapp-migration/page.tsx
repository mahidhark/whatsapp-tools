// app/tools/telegram-to-whatsapp-migration/page.tsx
// Server component: SEO metadata + FAQ schema + renders client component
// URL: whatsscale.com/tools/telegram-to-whatsapp-migration

import { Metadata } from 'next';
import MigrationCalculator from './MigrationCalculator';

export const metadata: Metadata = {
  title: 'Telegram to WhatsApp Migration Calculator | Free Planning Tool',
  description:
    'Plan your Telegram to WhatsApp Channel migration. Calculate timeline, projected growth, and best strategy based on your audience size. Free calculator.',
  keywords:
    'telegram to whatsapp, switch telegram to whatsapp, migrate telegram whatsapp, telegram whatsapp migration, move telegram to whatsapp channel',
  openGraph: {
    title: 'Telegram to WhatsApp Migration Calculator | Free Planning Tool',
    description:
      'Plan your Telegram to WhatsApp Channel migration. Calculate timeline, projected growth, and best strategy based on your audience size.',
    url: 'https://www.whatsscale.com/tools/telegram-to-whatsapp-migration',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.whatsscale.com/tools/telegram-to-whatsapp-migration',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I move my Telegram subscribers to WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There is no direct migration tool to export Telegram subscribers to WhatsApp. However, 85% of Telegram users outside China already use WhatsApp. You can migrate your audience by cross-posting content to both platforms and periodically nudging your Telegram followers to join your WhatsApp Channel.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to migrate from Telegram to WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Migration timeline depends on your audience size, overlap percentage, and how often you post. A creator with 10,000 Telegram subscribers posting 2-3 times per week can expect to reach 50% migration within 4 weeks and 90% within 12-20 weeks using a gradual cross-posting strategy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I delete my Telegram channel after migrating to WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Keep your Telegram channel active during and after migration. Some of your audience may not be on WhatsApp, and Telegram still serves as a backup distribution channel. The recommended approach is to run both platforms in parallel, gradually shifting your primary focus to WhatsApp.',
      },
    },
  ],
};

export default function TelegramToWhatsAppMigrationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MigrationCalculator />
    </>
  );
}
