// app/tools/whatsapp-vs-telegram/page.tsx
// Server component: SEO metadata + FAQ schema + renders client component
import type { Metadata } from 'next';
import ComparisonTool from './ComparisonTool';

export const metadata: Metadata = {
  title: 'WhatsApp vs Telegram 2026: Interactive Comparison | Creators, Business, Personal',
  description:
    'Compare WhatsApp and Telegram side-by-side for creators, business, and personal use. Interactive tool with feature scores, pros/cons, and recommendations. Updated Feb 2026.',
  alternates: {
    canonical: 'https://www.whatsscale.com/tools/whatsapp-vs-telegram',
  },
  openGraph: {
    title: 'WhatsApp vs Telegram 2026: Interactive Comparison',
    description:
      'Compare WhatsApp and Telegram side-by-side. Interactive tool with feature scores and recommendations for creators, business, and personal use.',
    url: 'https://www.whatsscale.com/tools/whatsapp-vs-telegram',
    type: 'website',
  },
};

export default function WhatsAppVsTelegramPage() {
  return (
    <>
      {/* FAQ Schema.org — additional structured data for search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'WhatsApp vs Telegram Interactive Comparison',
            url: 'https://www.whatsscale.com/tools/whatsapp-vs-telegram',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description:
              'Compare WhatsApp and Telegram side-by-side for creators, business, and personal use. 29 features across 8 categories with interactive scoring.',
          }),
        }}
      />
      <ComparisonTool />
    </>
  );
}
