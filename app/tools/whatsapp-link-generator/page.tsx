// app/tools/whatsapp-link-generator/page.tsx
// Server component for SEO metadata
// URL: whatsscale.com/tools/whatsapp-link-generator

import { Metadata } from 'next';
import LinkGenerator from './LinkGenerator';

export const metadata: Metadata = {
  title: 'Free WhatsApp Link Generator & QR Code | WhatsScale',
  description: 'Generate WhatsApp click-to-chat links and QR codes instantly. Enter phone number, add pre-filled message, get wa.me link + downloadable QR. Free, no signup.',
  keywords: 'whatsapp link generator, whatsapp qr code generator, wa.me link, whatsapp click to chat, whatsapp qr code',
  openGraph: {
    title: 'Free WhatsApp Link Generator & QR Code | WhatsScale',
    description: 'Generate WhatsApp click-to-chat links and QR codes instantly. Free, no signup.',
    url: 'https://www.whatsscale.com/tools/whatsapp-link-generator',
  },
};

export default function WhatsAppLinkGeneratorPage() {
  return <LinkGenerator />;
}
