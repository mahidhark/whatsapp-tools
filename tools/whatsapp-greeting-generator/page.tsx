// app/tools/whatsapp-greeting-generator/page.tsx
// Server component for SEO metadata
// URL: whatsscale.com/tools/whatsapp-greeting-generator

import { Metadata } from 'next';
import GreetingGenerator from './GreetingGenerator';

export const metadata: Metadata = {
  title: 'Free WhatsApp Greeting Generator — Birthday, Diwali, Eid & More | WhatsScale',
  description: 'Generate ready-to-send WhatsApp greetings for birthdays, festivals, weddings, and professional occasions. 30 occasions, 3 tones, personalized with names. Free, no signup.',
  keywords: 'whatsapp greeting generator, whatsapp birthday wishes, happy diwali whatsapp message, whatsapp festival greetings, whatsapp wishes generator, eid mubarak whatsapp, christmas whatsapp message',
  openGraph: {
    title: 'Free WhatsApp Greeting Generator — Birthday, Diwali, Eid & More | WhatsScale',
    description: 'Generate ready-to-send WhatsApp greetings for 30 occasions. Personalized, free, no signup.',
    url: 'https://www.whatsscale.com/tools/whatsapp-greeting-generator',
  },
};

export default function WhatsAppGreetingGeneratorPage() {
  return <GreetingGenerator />;
}
