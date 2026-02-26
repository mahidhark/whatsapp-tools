// app/tools/page.tsx
// Tools index page — grid of tool cards
// URL: whatsscale.com/tools

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free WhatsApp Tools | WhatsScale',
  description: 'Free WhatsApp tools for creators and businesses. Link generator, QR codes, message formatter, growth calculator, and more. No signup required.',
  keywords: 'whatsapp tools, whatsapp link generator, whatsapp qr code, whatsapp formatter, whatsapp calculator',
  openGraph: {
    title: 'Free WhatsApp Tools | WhatsScale',
    description: 'Free WhatsApp tools for creators and businesses. No signup required.',
    url: 'https://www.whatsscale.com/tools',
  },
};

interface Tool {
  name: string;
  description: string;
  href: string;
  emoji: string;
  keyword: string;
  available: boolean;
}

const tools: Tool[] = [
  {
    name: 'WhatsApp Link Generator & QR Code',
    description: 'Create click-to-chat wa.me links and downloadable QR codes with pre-filled messages.',
    href: '/tools/whatsapp-link-generator',
    emoji: '🔗',
    keyword: '80K+ searches/mo',
    available: true,
  },
  {
    name: 'Check WhatsApp Number',
    description: 'Verify if a phone number is registered on WhatsApp. Free, instant lookup.',
    href: '/check-whatsapp',
    emoji: '✅',
    keyword: '10K+ searches/mo',
    available: true,
  },
  {
    name: 'WhatsApp Message Formatter',
    description: 'Format messages with bold, italic, strikethrough, and monospace. Live preview.',
    href: '/tools/whatsapp-message-formatter',
    emoji: '✏️',
    keyword: '20K+ searches/mo',
    available: true,
  },
  {
    name: 'WhatsApp Greeting Generator',
    description: 'Generate ready-to-send greetings for birthdays, festivals, weddings & more. 30 occasions, 3 tones.',
    href: '/tools/whatsapp-greeting-generator',
    emoji: '👋',
    keyword: '15K+ searches/mo',
    available: true,
  },
  {
    name: 'Channel Growth Calculator',
    description: 'Project your WhatsApp Channel growth, monetization timeline, and benchmarks.',
    href: '/tools/channel-growth-calculator',
    emoji: '📈',
    keyword: '5K+ searches/mo',
    available: true,
  },
  {
    name: 'WhatsApp vs Telegram',
    description: 'Interactive side-by-side comparison for creators, business, and personal use.',
    href: '/tools/whatsapp-vs-telegram',
    emoji: '⚔️',
    keyword: '40K+ searches/mo',
    available: false,
  },
];

export default function ToolsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-light/10 via-white to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Free WhatsApp Tools
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, free tools for WhatsApp creators and businesses. No signup required. Your data stays on your device.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.available ? tool.href : '#'}
              className={`block p-6 rounded-xl border transition ${
                tool.available
                  ? 'border-gray-200 hover:border-primary hover:shadow-md'
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{tool.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {tool.name}
                    {!tool.available && (
                      <span className="ml-2 text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                  <span className="text-xs text-primary font-medium">{tool.keyword}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
