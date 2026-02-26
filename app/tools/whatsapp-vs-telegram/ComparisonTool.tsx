// app/tools/whatsapp-vs-telegram/ComparisonTool.tsx
// Client component: interactive WhatsApp vs Telegram comparison tool
'use client';

import { useState, useMemo, useCallback, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import comparisonData from '@/lib/data/wa-vs-tg-comparison.json';
import SEOContent from '@/components/tools/SEOContent';
import ToolCTA from '@/components/tools/ToolCTA';
import RelatedTools from '@/components/tools/RelatedTools';
import PrivacyBadge from '@/components/tools/PrivacyBadge';

// ─── Types ───
type UseCase = 'creator' | 'business' | 'personal';
type Winner = 'whatsapp' | 'telegram' | 'tie' | 'depends';

interface Feature {
  id: number;
  feature: string;
  category: string;
  whatsapp: { score: number; summary: string; detail: string };
  telegram: { score: number; summary: string; detail: string };
  winner: Winner;
  creatorRelevant: boolean;
  businessRelevant: boolean;
  personalRelevant: boolean;
}

// ─── Constants ───
const USE_CASES: { key: UseCase; label: string }[] = [
  { key: 'creator', label: 'For Creators' },
  { key: 'business', label: 'For Business' },
  { key: 'personal', label: 'For Personal' },
];

const RELEVANCE_MAP: Record<UseCase, keyof Feature> = {
  creator: 'creatorRelevant',
  business: 'businessRelevant',
  personal: 'personalRelevant',
};

const CATEGORY_ORDER = [
  'reach', 'channels', 'content_tools', 'monetization',
  'automation', 'privacy', 'groups', 'growth',
];

const categories = comparisonData.categories as Record<string, string>;

// ─── Stars Component ───
function Stars({ score, color }: { score: number; color: 'green' | 'blue' }) {
  const fillColor = color === 'green' ? '#22c55e' : '#3b82f6';
  return (
    <span className="inline-flex gap-0.5" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fill={i <= score ? fillColor : '#e5e7eb'}
          />
        </svg>
      ))}
    </span>
  );
}

// ─── Winner Badge ───
function WinnerBadge({ winner }: { winner: Winner }) {
  const config: Record<Winner, { label: string; className: string }> = {
    whatsapp: { label: 'WhatsApp', className: 'bg-green-100 text-green-800' },
    telegram: { label: 'Telegram', className: 'bg-blue-100 text-blue-800' },
    tie: { label: 'Tie', className: 'bg-gray-100 text-gray-600' },
    depends: { label: 'It depends', className: 'bg-amber-100 text-amber-800' },
  };
  const { label, className } = config[winner];
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

// ─── Score Summary Bar ───
function ScoreSummary({
  waWins,
  tgWins,
  ties,
}: {
  waWins: number;
  tgWins: number;
  ties: number;
}) {
  const total = waWins + tgWins + ties;
  if (total === 0) return null;
  const waPct = Math.round((waWins / total) * 100);
  const tgPct = Math.round((tgWins / total) * 100);
  const tiePct = 100 - waPct - tgPct;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-green-700 font-medium">WhatsApp: {waWins}</span>
        <span className="text-gray-500 font-medium">Ties: {ties}</span>
        <span className="text-blue-700 font-medium">Telegram: {tgWins}</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100" role="img" aria-label={`WhatsApp wins ${waWins} features, Telegram wins ${tgWins} features, ${ties} ties`}>
        {waPct > 0 && (
          <div className="bg-green-500 transition-all duration-300" style={{ width: `${waPct}%` }} />
        )}
        {tiePct > 0 && (
          <div className="bg-gray-300 transition-all duration-300" style={{ width: `${tiePct}%` }} />
        )}
        {tgPct > 0 && (
          <div className="bg-blue-500 transition-all duration-300" style={{ width: `${tgPct}%` }} />
        )}
      </div>
    </div>
  );
}

// ─── Expandable Row (Desktop) ───
function ComparisonRowDesktop({
  feature,
  isExpanded,
  onToggle,
}: {
  feature: Feature;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50 transition"
        onClick={onToggle}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`detail-${feature.id}`}
      >
        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
          <span className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
            {feature.feature}
          </span>
        </td>
        <td className="px-4 py-3">
          <Stars score={feature.whatsapp.score} color="green" />
        </td>
        <td className="px-4 py-3">
          <Stars score={feature.telegram.score} color="blue" />
        </td>
        <td className="px-4 py-3">
          <WinnerBadge winner={feature.winner as Winner} />
        </td>
      </tr>
      {isExpanded && (
        <tr id={`detail-${feature.id}`}>
          <td colSpan={4} className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1">WhatsApp — {feature.whatsapp.summary}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.whatsapp.detail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-1">Telegram — {feature.telegram.summary}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.telegram.detail}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Expandable Row (Mobile) ───
function ComparisonRowMobile({
  feature,
  isExpanded,
  onToggle,
}: {
  feature: Feature;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`detail-mobile-${feature.id}`}
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{feature.feature}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1">
              <span className="text-xs text-green-700">WA</span>
              <Stars score={feature.whatsapp.score} color="green" />
            </span>
            <span className="flex items-center gap-1">
              <span className="text-xs text-blue-700">TG</span>
              <Stars score={feature.telegram.score} color="blue" />
            </span>
            <WinnerBadge winner={feature.winner as Winner} />
          </div>
        </div>
        <span className="text-gray-400 ml-2">{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div id={`detail-mobile-${feature.id}`} className="px-4 pb-4 space-y-3">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">WhatsApp — {feature.whatsapp.summary}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.whatsapp.detail}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Telegram — {feature.telegram.summary}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.telegram.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Verdict Card ───
function VerdictCard({ useCase }: { useCase: UseCase }) {
  const verdict = comparisonData.verdicts.find((v) => v.useCase === useCase);
  if (!verdict) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{verdict.headline}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{verdict.summary}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={verdict.ctaLink}
          className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition text-center"
        >
          {verdict.cta.length > 60 ? 'Learn how →' : verdict.cta}
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-3">{verdict.cta}</p>
    </div>
  );
}

// ─── Main Component ───
export default function ComparisonTool() {
  const [useCase, setUseCase] = useState<UseCase>('creator');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const tablistRef = useRef<HTMLDivElement>(null);

  // Filter features by current use case
  const filteredFeatures = useMemo(() => {
    const key = RELEVANCE_MAP[useCase];
    return (comparisonData.features as Feature[]).filter(
      (f) => f[key] === true
    );
  }, [useCase]);

  // Group by category (preserving order)
  const groupedFeatures = useMemo(() => {
    const groups: { category: string; label: string; features: Feature[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const feats = filteredFeatures.filter((f) => f.category === cat);
      if (feats.length > 0) {
        groups.push({ category: cat, label: categories[cat] || cat, features: feats });
      }
    }
    return groups;
  }, [filteredFeatures]);

  // Score counts
  const { waWins, tgWins, ties } = useMemo(() => {
    let wa = 0, tg = 0, t = 0;
    filteredFeatures.forEach((f) => {
      if (f.winner === 'whatsapp') wa++;
      else if (f.winner === 'telegram') tg++;
      else t++;
    });
    return { waWins: wa, tgWins: tg, ties: t };
  }, [filteredFeatures]);

  // Toggle switch: collapse all
  const handleUseCaseChange = useCallback((newCase: UseCase) => {
    setUseCase(newCase);
    setExpandedRows(new Set());
  }, []);

  // Row expand/collapse
  const toggleRow = useCallback((id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Keyboard navigation for tablist
  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = USE_CASES.findIndex((uc) => uc.key === useCase);
      let newIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % USE_CASES.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = (currentIndex - 1 + USE_CASES.length) % USE_CASES.length;
      }

      if (newIndex !== currentIndex) {
        handleUseCaseChange(USE_CASES[newIndex].key);
        // Focus the new tab
        const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[newIndex]?.focus();
      }
    },
    [useCase, handleUseCaseChange]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* H1 */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        WhatsApp vs Telegram — Interactive Comparison
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Compare features side-by-side for your specific use case. Click any row to see details.
      </p>

      {/* Use Case Toggle */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Choose comparison perspective"
        className="flex gap-2 mb-6"
      >
        {USE_CASES.map((uc) => (
          <button
            key={uc.key}
            role="tab"
            aria-selected={useCase === uc.key}
            tabIndex={useCase === uc.key ? 0 : -1}
            onClick={() => handleUseCaseChange(uc.key)}
            onKeyDown={handleTabKeyDown}
            className={`px-4 py-2 text-sm font-medium rounded-full transition ${
              useCase === uc.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {uc.label}
          </button>
        ))}
      </div>

      {/* Score Summary */}
      <ScoreSummary waWins={waWins} tgWins={tgWins} ties={ties} />

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto mb-8" role="tabpanel">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">Feature</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-green-700 uppercase tracking-wider">WhatsApp</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">Telegram</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Winner</th>
            </tr>
          </thead>
          <tbody>
            {groupedFeatures.map((group) => (
              <>{/* Fragment per category */}
                {/* Category Header */}
                <tr key={`cat-${group.category}`}>
                  <td
                    colSpan={4}
                    className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-gray-200"
                  >
                    {group.label}
                  </td>
                </tr>
                {/* Feature Rows */}
                {group.features.map((f) => (
                  <ComparisonRowDesktop
                    key={f.id}
                    feature={f}
                    isExpanded={expandedRows.has(f.id)}
                    onToggle={() => toggleRow(f.id)}
                  />
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-2 mb-8" role="tabpanel">
        {groupedFeatures.map((group) => (
          <div key={`mob-${group.category}`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 py-2 mt-3">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.features.map((f) => (
                <ComparisonRowMobile
                  key={f.id}
                  feature={f}
                  isExpanded={expandedRows.has(f.id)}
                  onToggle={() => toggleRow(f.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Verdict */}
      <VerdictCard useCase={useCase} />

      {/* Last Updated */}
      <p className="text-xs text-gray-400 text-center mb-8">
        Last updated: {comparisonData.lastUpdated.replace('-', ' / ')} · 
        {filteredFeatures.length} features compared
      </p>

      {/* Privacy Badge */}
      <PrivacyBadge />

      {/* Below-fold SEO Content */}
      <SEOContent
        sections={[
          {
            heading: 'WhatsApp vs Telegram: Key Differences in 2026',
            content: (
              <div className="space-y-3">
                <p>WhatsApp and Telegram are the two largest messaging platforms outside of China, with a combined user base exceeding 4 billion. While both offer channel-style broadcasting, they serve fundamentally different needs. WhatsApp is the default communication layer for most of the world — over 3 billion people use it daily. Telegram is the power user&apos;s platform, offering deeper tooling, larger groups, and a richer bot ecosystem.</p>
                <p>The key difference in 2026 is trajectory. WhatsApp Channels launched with explosive growth and Meta is now building the monetization infrastructure (paid subscriptions, promoted channels, status ads). Telegram&apos;s growth is decelerating while facing legal and regulatory challenges. For creators and businesses, the question isn&apos;t which platform is &quot;better&quot; — it&apos;s which serves your specific goals right now.</p>
              </div>
            ),
          },
          {
            heading: 'When to Choose WhatsApp',
            content: (
              <div className="space-y-3">
                <p>Choose WhatsApp when reach is your priority. If your audience is in India, Brazil, Indonesia, Nigeria, or most of Latin America and Africa, WhatsApp is where they already spend 38 minutes per day. The Channels feature puts your content in the same inbox as family messages — no separate app download required.</p>
                <p>WhatsApp is also the better choice for commerce. The Business API offers product catalogs, in-app payments, and deep integration with Meta&apos;s advertising platform. For businesses that need customer-facing communication at scale, WhatsApp&apos;s ecosystem is more mature.</p>
              </div>
            ),
          },
          {
            heading: 'When to Choose Telegram',
            content: (
              <div className="space-y-3">
                <p>Choose Telegram when tooling matters more than raw reach. If you need native scheduling, rich formatting, file sharing up to 2GB, built-in analytics, or a bot ecosystem, Telegram is years ahead. Content stays permanently, groups support 200,000 members, and the automation possibilities through bots and third-party integrations are unmatched.</p>
                <p>Telegram is especially strong for tech communities, crypto, developers, and any niche where engagement depth matters more than audience breadth. The linked discussion group feature — which lets you build a community around your channel content — has no WhatsApp equivalent.</p>
              </div>
            ),
          },
          {
            heading: 'Can You Use Both WhatsApp and Telegram?',
            content: (
              <div className="space-y-3">
                <p>Yes — and most smart creators do. 85% of Telegram users outside China already have WhatsApp. The platforms serve complementary purposes: WhatsApp for maximum reach and discoverability, Telegram for deeper engagement and tooling.</p>
                <p>The practical challenge is managing both manually. Tools like <Link href="/blog/telegram-to-whatsapp-make-automation" className="text-primary hover:underline">Make.com with WhatsScale</Link> can automate cross-posting between platforms, archive disappearing WhatsApp content, and gradually migrate your audience at whatever pace makes sense.</p>
              </div>
            ),
          },
          {
            heading: 'How to Cross-Post Between WhatsApp and Telegram',
            content: (
              <div className="space-y-3">
                <p>Cross-posting ensures your content reaches both audiences without doubling your workload. Using Make.com with a connector like <Link href="/" className="text-primary hover:underline">WhatsScale</Link>, you can set up scenarios where every Telegram post automatically mirrors to your WhatsApp Channel (or vice versa).</p>
                <p>Other useful automations include archiving WhatsApp Channel content before it auto-deletes at 30 days, scheduling timed updates to both platforms, and sending periodic migration nudges to your Telegram audience inviting them to follow your WhatsApp Channel. See our <Link href="/tools/channel-growth-calculator" className="text-primary hover:underline">Channel Growth Calculator</Link> to project your WhatsApp audience growth.</p>
              </div>
            ),
          },
        ]}
        faqs={[
          {
            question: 'Is WhatsApp better than Telegram?',
            answer:
              'Neither is universally better — it depends on your use case. WhatsApp wins on reach (3B+ users), daily engagement, and commerce integration. Telegram wins on content tools, bot ecosystem, file sharing, scheduling, and group size. For creators, WhatsApp offers more audience potential while Telegram offers more operational tools. Most serious creators use both.',
          },
          {
            question: 'Which is safer, WhatsApp or Telegram?',
            answer:
              'WhatsApp uses end-to-end encryption for all personal messages by default. Telegram uses server-client encryption by default, with end-to-end encryption only available in opt-in Secret Chats. However, both platforms have privacy concerns: WhatsApp shares metadata with Meta, while Telegram reversed its data-sharing policy in 2024 and now cooperates with law enforcement. Neither platform is perfectly private.',
          },
          {
            question: 'Can I use WhatsApp and Telegram together?',
            answer:
              'Yes, and 85% of Telegram users outside China already use WhatsApp. Many creators and businesses use WhatsApp for customer-facing communication and Telegram for community engagement and internal operations. Automation tools like Make.com can cross-post content between both platforms automatically.',
          },
          {
            question: "What's the difference between a WhatsApp Channel and a Telegram Channel?",
            answer:
              'Both are one-way broadcast tools with unlimited subscribers. Key differences: WhatsApp Channel content auto-deletes after 30 days (Telegram is permanent), Telegram supports file sharing up to 2GB (WhatsApp has no file sharing in Channels), Telegram has native scheduling and linked discussion groups (WhatsApp has neither), and WhatsApp is rolling out paid subscriptions with a 10% creator cut. WhatsApp has more potential reach; Telegram has more features.',
          },
        ]}
      />

      {/* CTA */}
      <ToolCTA
        heading="Using both platforms?"
        description="WhatsScale + Make.com cross-posts between WhatsApp and Telegram automatically. Archive disappearing content, schedule updates, migrate your audience — zero manual effort."
        buttonText="Get Started Free"
        href="/signup"
      />

      {/* Related Tools */}
      <RelatedTools
        tools={[
          {
            name: 'Channel Growth Calculator',
            href: '/tools/channel-growth-calculator',
            emoji: '📈',
            description: 'Project your WhatsApp Channel follower growth over 12 months.',
          },
          {
            name: 'Migration Calculator',
            href: '/tools/telegram-to-whatsapp-migration',
            emoji: '🔄',
            description: 'Plan your Telegram to WhatsApp Channel migration.',
          },
          {
            name: 'WhatsApp Link Generator',
            href: '/tools/whatsapp-link-generator',
            emoji: '🔗',
            description: 'Generate click-to-chat links and QR codes instantly.',
          },
          {
            name: 'Cross-Posting Guide',
            href: '/blog/telegram-to-whatsapp-make-automation',
            emoji: '📝',
            description: 'Automate Telegram → WhatsApp with Make.com.',
          },
        ]}
      />
    </div>
  );
}
