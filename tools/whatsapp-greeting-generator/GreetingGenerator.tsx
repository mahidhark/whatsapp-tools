// app/tools/whatsapp-greeting-generator/GreetingGenerator.tsx
// Client component — WhatsApp Greeting Generator tool
'use client';

import { useState, useMemo, useCallback } from 'react';
import CopyButton from '@/components/tools/CopyButton';
import SEOContent from '@/components/tools/SEOContent';
import ToolCTA from '@/components/tools/ToolCTA';
import RelatedTools from '@/components/tools/RelatedTools';
import PrivacyBadge from '@/components/tools/PrivacyBadge';
import greetingsData from './greetings.json';

// ============================================================
// Types
// ============================================================
type Tone = 'formal' | 'casual' | 'funny';

interface Occasion {
  id: string;
  label: string;
  emoji: string;
  templates: Record<Tone, string[]>;
}

interface Category {
  id: string;
  label: string;
  occasions: Occasion[];
}

interface GreetingsData {
  categories: Category[];
}

// ============================================================
// Constants
// ============================================================
const data = greetingsData as GreetingsData;

const TONES: { id: Tone; label: string; icon: string }[] = [
  { id: 'formal', label: 'Formal', icon: '👔' },
  { id: 'casual', label: 'Casual', icon: '😊' },
  { id: 'funny', label: 'Funny', icon: '😂' },
];

const MESSAGES_PER_PAGE = 3;
const NAME_MAX_LENGTH = 50;
const DEFAULT_NAME_FALLBACK = 'friend';

// ============================================================
// Helpers
// ============================================================

/** Strip emojis from text */
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Replace {name} placeholder with actual name or fallback */
function personalize(template: string, name: string): string {
  const displayName = name.trim() || DEFAULT_NAME_FALLBACK;
  return template.replace(/\{name\}/g, displayName);
}

/** Generate WhatsApp deep link with pre-filled message */
function getWhatsAppLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// ============================================================
// SEO Content
// ============================================================
const seoSections = [
  {
    heading: 'WhatsApp Greeting Messages for Every Occasion',
    content: 'Whether you need a heartfelt birthday wish, a festive Diwali greeting, or a professional farewell message, this generator creates ready-to-send WhatsApp messages instantly. Choose from 30 occasions across life events, Indian festivals, global celebrations, and professional milestones. Each message is crafted in three tones — formal, casual, and funny — so you always find the right words.',
  },
  {
    heading: 'Festival Greetings for WhatsApp',
    content: 'Send the perfect festival greeting on WhatsApp for Diwali, Holi, Eid, Christmas, New Year, Ganesh Chaturthi, Navratri, Ramadan, Easter, and more. Each greeting is written to feel personal and authentic, not generic. Add the recipient\'s name to make it even more special. One tap to copy, one tap to send via WhatsApp.',
  },
  {
    heading: 'Birthday Wishes for WhatsApp',
    content: 'Finding the right birthday message can be tricky. This tool gives you five unique messages in each tone — formal for elders and colleagues, casual for friends and family, and funny for close friends who appreciate humor. Personalize with the recipient\'s name and send directly via WhatsApp.',
  },
  {
    heading: 'Professional Messages for WhatsApp',
    content: 'Need to send a thank you, congratulations, farewell, or welcome message on WhatsApp? The professional category offers polished messages suitable for colleagues, clients, and business contacts. Choose formal tone for official communication or casual for friendly professional relationships.',
  },
];

const seoFaqs = [
  {
    question: 'How do I use the WhatsApp Greeting Generator?',
    answer: 'Select an occasion (like Birthday or Diwali), choose a tone (Formal, Casual, or Funny), optionally enter the recipient\'s name, and the tool generates three ready-to-send messages. Copy any message or send it directly via WhatsApp with one tap.',
  },
  {
    question: 'Is this tool free?',
    answer: 'Yes, completely free with no signup required. The tool runs entirely in your browser — your data is never sent to any server.',
  },
  {
    question: 'Can I personalize the greeting with a name?',
    answer: 'Yes. Enter the recipient\'s name in the name field and it will be inserted into every message. If you leave it blank, the messages use friendly generic phrasing like \"friend\" instead.',
  },
  {
    question: 'How many occasions are supported?',
    answer: 'The tool supports 30 occasions across four categories: Life Events (birthday, wedding, anniversary, etc.), Indian Festivals (Diwali, Holi, Eid, etc.), Global Festivals (Christmas, Easter, Chinese New Year, etc.), and Professional (thank you, congratulations, farewell, etc.).',
  },
  {
    question: 'Can I remove emojis from the messages?',
    answer: 'Yes. Toggle the \"Include emojis\" switch off to get clean messages without any emojis. This is useful for formal or professional contexts.',
  },
  {
    question: 'What tones are available?',
    answer: 'Three tones: Formal (respectful, suitable for elders and colleagues), Casual (warm and friendly, for friends and family), and Funny (witty and humorous, for close friends).',
  },
  {
    question: 'How does \"Send via WhatsApp\" work?',
    answer: 'Clicking \"Send via WhatsApp\" opens WhatsApp with the message pre-filled. You then choose the contact or group you want to send it to. Works on both mobile and desktop.',
  },
  {
    question: 'Can I see more message options?',
    answer: 'Yes. Click \"Show More\" to see the next set of messages. Each occasion has five messages per tone, giving you plenty of variety.',
  },
];

const relatedTools = [
  {
    name: 'WhatsApp Link Generator & QR Code',
    href: '/tools/whatsapp-link-generator',
    emoji: '🔗',
    description: 'Create click-to-chat links and downloadable QR codes.',
  },
  {
    name: 'WhatsApp Message Formatter',
    href: '/tools/whatsapp-message-formatter',
    emoji: '✏️',
    description: 'Format messages with bold, italic, and strikethrough.',
  },
  {
    name: 'Channel Growth Calculator',
    href: '/tools/channel-growth-calculator',
    emoji: '📈',
    description: 'Project your WhatsApp Channel growth and revenue.',
  },
  {
    name: 'WhatsApp vs Telegram',
    href: '/tools/whatsapp-vs-telegram',
    emoji: '⚔️',
    description: 'Interactive comparison for creators and business.',
  },
];

// ============================================================
// Component
// ============================================================
export default function GreetingGenerator() {
  // State
  const [activeCategoryId, setActiveCategoryId] = useState(data.categories[0].id);
  const [activeOccasionId, setActiveOccasionId] = useState(data.categories[0].occasions[0].id);
  const [tone, setTone] = useState<Tone>('casual');
  const [name, setName] = useState('');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);

  // Derived
  const activeCategory = useMemo(
    () => data.categories.find((c) => c.id === activeCategoryId) || data.categories[0],
    [activeCategoryId]
  );

  const activeOccasion = useMemo(() => {
    for (const cat of data.categories) {
      const found = cat.occasions.find((o) => o.id === activeOccasionId);
      if (found) return found;
    }
    return data.categories[0].occasions[0];
  }, [activeOccasionId]);

  const allTemplates = useMemo(
    () => activeOccasion.templates[tone] || [],
    [activeOccasion, tone]
  );

  const totalPages = Math.ceil(allTemplates.length / MESSAGES_PER_PAGE);

  const visibleMessages = useMemo(() => {
    const start = pageIndex * MESSAGES_PER_PAGE;
    return allTemplates.slice(start, start + MESSAGES_PER_PAGE).map((template) => {
      let msg = personalize(template, name);
      if (!includeEmojis) msg = stripEmojis(msg);
      return msg;
    });
  }, [allTemplates, pageIndex, name, includeEmojis]);

  const hasMore = pageIndex < totalPages - 1;
  const showingAll = totalPages <= 1;

  // Handlers
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    const cat = data.categories.find((c) => c.id === categoryId);
    if (cat && cat.occasions.length > 0) {
      setActiveOccasionId(cat.occasions[0].id);
    }
    setPageIndex(0);
  }, []);

  const handleOccasionChange = useCallback((occasionId: string) => {
    setActiveOccasionId(occasionId);
    setPageIndex(0);
  }, []);

  const handleToneChange = useCallback((newTone: Tone) => {
    setTone(newTone);
    setPageIndex(0);
  }, []);

  const handleShowMore = useCallback(() => {
    if (hasMore) {
      setPageIndex((prev) => prev + 1);
    }
  }, [hasMore]);

  const handleNameChange = useCallback((value: string) => {
    if (value.length <= NAME_MAX_LENGTH) {
      setName(value);
    }
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-light/10 via-white to-primary/5 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Free WhatsApp Greeting Generator
          </h1>
          <p className="text-lg text-gray-600">
            Ready-to-send messages for birthdays, festivals & more
          </p>
          <PrivacyBadge />
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

          {/* Category Tabs */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 text-sm rounded-lg border transition ${
                    activeCategoryId === cat.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                  }`}
                  aria-label={cat.label}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion Pills */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
            <div className="flex flex-wrap gap-2">
              {activeCategory.occasions.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => handleOccasionChange(occ.id)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition flex items-center gap-1.5 ${
                    activeOccasionId === occ.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                  }`}
                  aria-label={occ.label}
                >
                  <span>{occ.emoji}</span>
                  <span>{occ.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleToneChange(t.id)}
                  className={`px-4 py-2 text-sm rounded-lg border transition flex items-center gap-1.5 ${
                    tone === t.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                  }`}
                  aria-label={t.label}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Rahul, Sarah, Mom..."
              maxLength={NAME_MAX_LENGTH}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{name.length}/{NAME_MAX_LENGTH} characters</span>
            </div>
          </div>

          {/* Emoji Toggle */}
          <div className="mb-6 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmojis}
                onChange={(e) => setIncludeEmojis(e.target.checked)}
                className="sr-only peer"
                aria-label="Include emojis"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm text-gray-600">Include emojis</span>
          </div>
        </div>

        {/* Message Cards */}
        <div className="mt-6 space-y-4">
          {visibleMessages.map((msg, i) => (
            <div
              key={`${activeOccasionId}-${tone}-${pageIndex}-${i}`}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5"
            >
              {/* Message text in WhatsApp-style bubble */}
              <div className="bg-[#E7FFDB] rounded-2xl rounded-tr-sm p-4 mb-4 shadow-sm">
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {msg}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <CopyButton text={msg} label="Copy" />
                <a
                  href={getWhatsAppLink(msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-[#25D366] text-white hover:bg-[#1DA851] transition"
                >
                  Send via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Show More / Status */}
        <div className="mt-4 text-center">
          {hasMore ? (
            <button
              onClick={handleShowMore}
              className="px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
            >
              Show More Messages
            </button>
          ) : !showingAll ? (
            <p className="text-sm text-gray-400">
              Showing all {allTemplates.length} messages
            </p>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <ToolCTA
        heading="Need to automate WhatsApp greetings?"
        description="WhatsScale schedules birthday wishes, festival greetings, and broadcast messages automatically. Integrates with Make.com and Zapier."
      />

      {/* Related Tools */}
      <RelatedTools tools={relatedTools} />

      {/* SEO Content */}
      <SEOContent sections={seoSections} faqs={seoFaqs} />
    </div>
  );
}
