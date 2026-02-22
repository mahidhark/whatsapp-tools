// app/tools/whatsapp-link-generator/LinkGenerator.tsx
// Client component — WhatsApp Link Generator + QR Code tool
'use client';

import { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import CopyButton from '@/components/tools/CopyButton';
import SEOContent from '@/components/tools/SEOContent';
import ToolCTA from '@/components/tools/ToolCTA';
import RelatedTools from '@/components/tools/RelatedTools';
import PrivacyBadge from '@/components/tools/PrivacyBadge';
import countryCodes from '@/lib/data/country-codes.json';

// ============================================================
// Types
// ============================================================
interface CountryCode {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

// ============================================================
// Constants
// ============================================================
const TOP_MARKETS = ['IN', 'BR', 'ID', 'NG', 'GB', 'US'];

const QR_SIZES = [
  { label: 'Screen (300px)', value: 300 },
  { label: 'Print (600px)', value: 600 },
  { label: 'Banner (1000px)', value: 1000 },
];

const QR_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'WhatsApp Green', value: '#25D366' },
];

// ============================================================
// Smart sort: user locale first, then top markets, then alpha
// ============================================================
function getSortedCountries(): CountryCode[] {
  const all = countryCodes as CountryCode[];
  let detectedCode = '';

  if (typeof navigator !== 'undefined' && navigator.language) {
    const parts = navigator.language.split('-');
    if (parts.length > 1) {
      detectedCode = parts[1].toUpperCase();
    }
  }

  const detected: CountryCode[] = [];
  const pinned: CountryCode[] = [];
  const rest: CountryCode[] = [];

  for (const c of all) {
    if (c.code === detectedCode && !TOP_MARKETS.includes(c.code)) {
      detected.push(c);
    } else if (TOP_MARKETS.includes(c.code)) {
      pinned.push(c);
    } else {
      rest.push(c);
    }
  }

  // Sort pinned by TOP_MARKETS order
  pinned.sort((a, b) => TOP_MARKETS.indexOf(a.code) - TOP_MARKETS.indexOf(b.code));
  // Sort rest alphabetically
  rest.sort((a, b) => a.name.localeCompare(b.name));

  return [...detected, ...pinned, ...rest];
}

// ============================================================
// SEO Content
// ============================================================
const seoSections = [
  {
    heading: 'What Is a wa.me Link?',
    content: 'A wa.me link is a short URL format provided by WhatsApp that lets anyone start a chat with you by clicking a single link. The format is https://wa.me/[phone] where [phone] is the full international number without + or spaces. You can optionally add a pre-filled message using ?text=your+message. These links work on mobile and desktop, opening WhatsApp directly.',
  },
  {
    heading: 'How to Create a WhatsApp Link for Your Website',
    content: 'Enter your phone number with country code in the generator above, optionally add a pre-filled message, and click Generate. Copy the wa.me link and add it as a button or hyperlink on your website. Visitors who click it will be taken directly to a WhatsApp chat with you, with the pre-filled message ready to send.',
  },
  {
    heading: 'WhatsApp QR Code Generator',
    content: 'QR codes are perfect for printed materials like business cards, restaurant menus, event flyers, and product packaging. Generate your WhatsApp link, then download the QR code at the size you need: 300px for screens, 600px for standard print, or 1000px for large banners. You can customize the QR color to match your brand or use the classic WhatsApp green.',
  },
  {
    heading: 'How to Add a WhatsApp Button to Your Website',
    content: 'Once you have your wa.me link, create an HTML anchor tag or button that links to it. For example: <a href="https://wa.me/919876543210">Chat on WhatsApp</a>. You can style this as a floating button, a CTA in your header, or an inline link. The link works on both mobile (opens WhatsApp app) and desktop (opens WhatsApp Web).',
  },
];

const seoFaqs = [
  {
    question: 'What is a wa.me link?',
    answer: 'A wa.me link is an official WhatsApp short URL that opens a direct chat with a specific phone number. Format: https://wa.me/[country code][number]. No need for the recipient to save your number first.',
  },
  {
    question: 'How do I create a WhatsApp link with a pre-filled message?',
    answer: 'Add ?text= followed by your URL-encoded message to the wa.me link. For example: https://wa.me/919876543210?text=Hi%20I%20am%20interested. Our generator handles the encoding automatically.',
  },
  {
    question: 'Can I create a QR code for WhatsApp?',
    answer: 'Yes. Generate your wa.me link using this tool, and a QR code is automatically created. Download it as a PNG at 300px (screen), 600px (print), or 1000px (large format). You can choose black or WhatsApp green color.',
  },
  {
    question: 'Is this tool free?',
    answer: 'Yes, completely free with no signup required. The tool runs entirely in your browser — your phone number and messages are never sent to any server.',
  },
  {
    question: 'What is the best QR code size for print?',
    answer: '600px works well for standard print materials like business cards and flyers. For large banners or posters, use 1000px. For digital use on websites or apps, 300px is sufficient.',
  },
  {
    question: 'Can I customize the QR code color?',
    answer: 'Yes. Choose between black (classic) and WhatsApp green (#25D366). The preview updates in real-time so you can see the result before downloading.',
  },
];

const relatedTools = [
  {
    name: 'WhatsApp Message Formatter',
    href: '/tools/whatsapp-message-formatter',
    emoji: '✏️',
    description: 'Format messages with bold, italic, and strikethrough.',
  },
  {
    name: 'WhatsApp Greeting Generator',
    href: '/tools/whatsapp-greeting-generator',
    emoji: '👋',
    description: 'Generate professional greeting and away messages.',
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
export default function LinkGenerator() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSize, setQrSize] = useState(300);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrLoading, setQrLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const sortedCountries = useMemo(() => getSortedCountries(), []);

  // Set default country code from locale
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const parts = navigator.language.split('-');
      if (parts.length > 1) {
        const localeCode = parts[1].toUpperCase();
        const match = (countryCodes as CountryCode[]).find((c) => c.code === localeCode);
        if (match) {
          setCountryCode(match.dial);
        }
      }
    }
  }, []);

  // Filter countries for dropdown search
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return sortedCountries;
    const q = searchQuery.toLowerCase();
    return sortedCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery, sortedCountries]);

  // Clean phone input
  const cleanPhone = (raw: string): string => {
    return raw.replace(/[^0-9]/g, '').replace(/^0+/, '');
  };

  // Validate phone
  const validatePhone = (cleaned: string): string => {
    if (!cleaned) return 'Please enter a phone number';
    if (cleaned.length < 7) return 'Phone number too short (minimum 7 digits)';
    if (cleaned.length > 15) return 'Phone number too long (maximum 15 digits)';
    return '';
  };

  // Auto-detect pasted number with country code
  const handlePhoneChange = (value: string) => {
    // Detect if user pastes full number with +
    if (value.startsWith('+')) {
      const digits = value.replace(/[^0-9]/g, '');
      // Try to match a country code from the start
      for (const c of countryCodes as CountryCode[]) {
        if (digits.startsWith(c.dial)) {
          setCountryCode(c.dial);
          setPhone(digits.slice(c.dial.length));
          setPhoneError('');
          return;
        }
      }
    }
    setPhone(value.replace(/[^0-9\s\-]/g, ''));
    setPhoneError('');
  };

  // Generate link + QR
  const handleGenerate = async () => {
    const cleaned = cleanPhone(phone);
    const error = validatePhone(cleaned);
    if (error) {
      setPhoneError(error);
      return;
    }

    const link = message
      ? `https://wa.me/${countryCode}${cleaned}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${countryCode}${cleaned}`;

    setGeneratedLink(link);
    setPhoneError('');

    // Generate QR
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(link, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
    } catch {
      console.error('QR generation failed');
    }
    setQrLoading(false);
  };

  // Regenerate QR when size or color changes (if link exists)
  useEffect(() => {
    if (!generatedLink) return;
    let cancelled = false;
    setQrLoading(true);

    QRCode.toDataURL(generatedLink, {
      width: qrSize,
      margin: 2,
      color: { dark: qrColor, light: '#FFFFFF' },
    }).then((dataUrl) => {
      if (!cancelled) {
        setQrDataUrl(dataUrl);
        setQrLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setQrLoading(false);
    });

    return () => { cancelled = true; };
  }, [qrSize, qrColor, generatedLink]);

  // Download QR
  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `whatsapp-qr-${countryCode}${cleanPhone(phone)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Selected country display
  const selectedCountry = (countryCodes as CountryCode[]).find((c) => c.dial === countryCode);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-light/10 via-white to-primary/5 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Free WhatsApp Link Generator
          </h1>
          <p className="text-lg text-gray-600">
            Create click-to-chat links & QR codes instantly
          </p>
          <PrivacyBadge />
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* Country Code + Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              {/* Country dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowDropdown(!showDropdown); setSearchQuery(''); }}
                  className="flex items-center gap-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm min-w-[120px]"
                >
                  <span>{selectedCountry?.flag || '🌍'}</span>
                  <span>+{countryCode}</span>
                  <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-48">
                      {filteredCountries.map((c) => (
                        <button
                          key={`${c.code}-${c.dial}`}
                          onClick={() => {
                            setCountryCode(c.dial);
                            setShowDropdown(false);
                            setSearchQuery('');
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-light/10 flex items-center gap-2 ${
                            c.dial === countryCode ? 'bg-primary-light/10 font-medium' : ''
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span className="flex-1">{c.name}</span>
                          <span className="text-gray-400">+{c.dial}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone input */}
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9876543210"
                className={`flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-primary ${
                  phoneError ? 'border-red-400' : 'border-gray-300'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>

          {/* Pre-filled Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pre-filled Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I saw your product and I'm interested..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{message.length} characters</span>
              {message.length > 500 && (
                <span className="text-amber-500">Some phones truncate long pre-filled messages</span>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Generate Link & QR Code
          </button>
        </div>

        {/* Output */}
        {generatedLink && (
          <div className="mt-6 space-y-6">
            {/* Generated Link */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Your WhatsApp Link</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-mono"
                />
                <CopyButton text={generatedLink} label="Copy" />
              </div>
              <div className="mt-3">
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  Test Link {'\u2192'}
                </a>
              </div>










            </div>

            {/* QR Code */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp QR Code Generator</h2>

              {/* QR Options */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                  <div className="flex gap-1">
                    {QR_SIZES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setQrSize(s.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                          qrSize === s.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                  <div className="flex gap-1">
                    {QR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setQrColor(c.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition flex items-center gap-1.5 ${
                          qrColor === c.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: c.value }}
                        />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Preview */}
              <div className="flex flex-col items-center">
                {qrLoading ? (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-white rounded-lg border">
                    <span className="text-gray-400 text-sm">Generating...</span>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="WhatsApp QR Code"
                    className="max-w-[200px] rounded-lg border border-gray-200"
                  />
                ) : null}

                <button
                  onClick={handleDownloadQR}
                  disabled={!qrDataUrl || qrLoading}
                  className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download QR as PNG
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <ToolCTA
        heading="Need to automate WhatsApp messages at scale?"
        description="WhatsScale schedules broadcasts, auto-replies, and manages contacts from one dashboard. Integrates with Make.com and Zapier."
      />

      {/* Related Tools */}
      <RelatedTools tools={relatedTools} />

      {/* SEO Content */}
      <SEOContent sections={seoSections} faqs={seoFaqs} />
    </div>
  );
}
