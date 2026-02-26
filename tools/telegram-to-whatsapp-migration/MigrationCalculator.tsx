// app/tools/telegram-to-whatsapp-migration/MigrationCalculator.tsx
// Client component — Telegram to WhatsApp Migration Calculator (Tool #7)

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import {
  getMode,
  calculateReachable,
  calculateTimeline,
  getStrategy,
  getRisks,
  formatCommaNumber,
  type MigrationInputs,
  type PostFrequency,
  type Mode,
} from '@/lib/utils/migration-model';
import SEOContent from '@/components/tools/SEOContent';
import ToolCTA from '@/components/tools/ToolCTA';
import RelatedTools from '@/components/tools/RelatedTools';
import PrivacyBadge from '@/components/tools/PrivacyBadge';

// ============================================================
// Constants
// ============================================================

const CHART_COLORS = {
  conservative: '#6B7280',
  expected: '#25D366',
  optimistic: '#2563EB',
};

const FREQUENCY_OPTIONS: { value: PostFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: '2-3x', label: '2-3x per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const RELATED_TOOLS = [
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
    description: 'Interactive side-by-side comparison.',
  },
  {
    name: 'WhatsApp Link Generator',
    href: '/tools/whatsapp-link-generator',
    emoji: '🔗',
    description: 'Generate wa.me links and QR codes.',
  },
];

const SEO_SECTIONS = [
  {
    heading: 'Why Creators Are Moving from Telegram to WhatsApp',
    content:
      'WhatsApp Channels launched to 500 million followers within months, making it the fastest-adopted feature in Meta\'s history. With over 3 billion users across 100+ countries, WhatsApp offers creators unmatched reach without requiring their audience to download a new app. Meanwhile, Telegram faces growing challenges: CEO Pavel Durov\'s arrest in France, policy reversals on data sharing with authorities, country bans in Vietnam, Kenya, and Nepal, and growth slowing from 30% annually to just 5.3% in 2025. The key insight: 85% of Telegram users outside China already use WhatsApp — your audience is already there.',
  },
  {
    heading: 'Step-by-Step Guide to Migrate from Telegram to WhatsApp',
    content:
      'Start by creating your WhatsApp Channel and cross-posting your best content to both platforms. In your Telegram channel, add a pinned message with your WhatsApp Channel link. Post 2-3 nudges per week inviting followers to join your WhatsApp Channel. Use automation tools like Make.com with WhatsScale to cross-post automatically. Track which platform gets more engagement and gradually shift your primary focus. Keep your Telegram channel active as a backup — never delete it abruptly.',
  },
  {
    heading: 'How to Cross-Post During Migration',
    content:
      'Cross-posting is the bridge between your Telegram and WhatsApp audiences. Tools like Make.com with the WhatsScale connector can automatically mirror every Telegram post to your WhatsApp Channel with zero manual effort. WhatsApp content auto-deletes after 30 days, so consider archiving important posts to a Google Sheet or Notion database. The 12-18 month window before WhatsApp introduces algorithmic ranking is your opportunity to build an audience while the feed is still chronological.',
  },
];

const SEO_FAQS = [
  {
    question: 'Can I move my Telegram subscribers to WhatsApp?',
    answer:
      'There is no direct migration tool. However, 85% of Telegram users already use WhatsApp. Cross-post content and nudge your Telegram audience to follow your WhatsApp Channel.',
  },
  {
    question: 'How long does migration take?',
    answer:
      'With a gradual strategy posting 2-3 times per week, expect 50% migration within 4 weeks and 90% within 12-20 weeks.',
  },
  {
    question: 'Should I delete my Telegram channel?',
    answer:
      'No. Keep it active as a backup. Some followers may not be on WhatsApp, and Telegram still serves as a secondary distribution channel.',
  },
];

// ============================================================
// Component
// ============================================================

export default function MigrationCalculator() {
  const router = useRouter();
  const { user, loading: authLoadingInit } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);

  // ----- Input state -----
  const [tgSubscribers, setTgSubscribers] = useState(1000);
  const [overlapPercent, setOverlapPercent] = useState(85);
  const [postFrequency, setPostFrequency] = useState<PostFrequency>('2-3x');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [autoDownloadPDF, setAutoDownloadPDF] = useState(false);

  // ----- Restore from localStorage after signup redirect -----
  const authLoading = authLoadingInit;
  useEffect(() => {
    if (authLoading) return;
    const saved = localStorage.getItem('migration-calc-inputs');
    if (saved && user) {
      try {
        const parsed = JSON.parse(saved);
        setTgSubscribers(parsed.tgSubscribers ?? 1000);
        setOverlapPercent(parsed.overlapPercent ?? 85);
        setPostFrequency(parsed.postFrequency ?? '2-3x');
        localStorage.removeItem('migration-calc-inputs');
        setHasCalculated(true);
        setAutoDownloadPDF(true);
      } catch {
        localStorage.removeItem('migration-calc-inputs');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // ----- Auto-download PDF after restored inputs propagate -----
  useEffect(() => {
    if (autoDownloadPDF && user && !pdfLoading) {
      setAutoDownloadPDF(false);
      handlePDFDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownloadPDF, tgSubscribers, overlapPercent, postFrequency]);

  // ----- Derived calculations (only when hasCalculated) -----
  const inputs: MigrationInputs = useMemo(
    () => ({ tgSubscribers, overlapPercent, postFrequency }),
    [tgSubscribers, overlapPercent, postFrequency]
  );

  const mode = useMemo(() => getMode(tgSubscribers), [tgSubscribers]);

  const timeline = useMemo(
    () => (hasCalculated && mode === 'full' ? calculateTimeline(inputs) : null),
    [hasCalculated, mode, inputs]
  );

  const strategy = useMemo(
    () => (hasCalculated && mode === 'full' ? getStrategy(inputs) : null),
    [hasCalculated, mode, inputs]
  );

  const risks = useMemo(() => {
    if (!hasCalculated || mode !== 'full') return null;
    const projected = timeline?.weeks[Math.min(23, (timeline?.weeks.length ?? 1) - 1)]?.expected ?? 0;
    return getRisks(inputs, projected);
  }, [hasCalculated, mode, inputs, timeline]);

  const reachable = useMemo(
    () => calculateReachable(tgSubscribers, overlapPercent),
    [tgSubscribers, overlapPercent]
  );

  // ----- Handlers -----
  const handleCalculate = useCallback(() => {
    setHasCalculated(true);
  }, []);

  const handleSubscriberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0 && num <= 10000000) {
      setTgSubscribers(num);
    } else if (raw === '') {
      setTgSubscribers(0);
    }
  }, []);

  // ----- PDF Download -----
  const handlePDFDownload = useCallback(async () => {
    if (!user) {
      localStorage.setItem(
        'migration-calc-inputs',
        JSON.stringify({ tgSubscribers, overlapPercent, postFrequency })
      );
      router.push(
        `/signup?redirect=${encodeURIComponent('/tools/telegram-to-whatsapp-migration')}`
      );
      return;
    }
    setPdfLoading(true);
    try {
      const { generateMigrationPDF } = await import('@/lib/utils/migration-pdf');
      const blob = await generateMigrationPDF(inputs, timeline!, strategy!, risks!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'whatsscale-migration-plan.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  }, [user, tgSubscribers, overlapPercent, postFrequency, inputs, timeline, strategy, risks, router]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* H1 */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Telegram to WhatsApp Migration Calculator
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Plan your move from Telegram to WhatsApp Channel. Calculate your migration timeline, get strategy recommendations, and understand the risks.
      </p>

      <PrivacyBadge />

      {/* ===== Inputs ===== */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Channel Details</h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Telegram Subscribers */}
          <div>
            <label htmlFor="tg-subs" className="mb-1 block text-sm font-medium text-gray-700">
              Telegram Subscribers
            </label>
            <input
              id="tg-subs"
              type="text"
              inputMode="numeric"
              value={formatCommaNumber(tgSubscribers)}
              onChange={handleSubscriberChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="e.g. 10,000"
            />
          </div>

          {/* Audience Overlap */}
          <div>
            <label htmlFor="overlap" className="mb-1 block text-sm font-medium text-gray-700">
              Audience Overlap
              <span className="relative ml-1 group">
                <span className="cursor-help text-gray-400" title="Percentage of your Telegram followers who also use WhatsApp">ⓘ</span>
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  Default based on global data. Audiences in India, Brazil, Indonesia tend to be higher (90%+). Audiences in Russia, Iran, Central Asia may be lower (40-60%). Adjust based on where your audience is.
                </span>
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="overlap"
                type="range"
                min={10}
                max={100}
                value={overlapPercent}
                onChange={(e) => setOverlapPercent(Number(e.target.value))}
                disabled={mode === 'startFresh'}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="w-12 text-right text-sm font-semibold text-gray-900">{overlapPercent}%</span>
            </div>
            {overlapPercent === 100 && (
              <p className="mt-1 text-xs text-amber-600">
                100% overlap is optimistic. Most audiences have 70-90% overlap. Consider adjusting for a more realistic projection.
              </p>
            )}
          </div>

          {/* Post Frequency */}
          <div>
            <label htmlFor="frequency" className="mb-1 block text-sm font-medium text-gray-700">
              Post Frequency
            </label>
            <select
              id="frequency"
              value={postFrequency}
              onChange={(e) => setPostFrequency(e.target.value as PostFrequency)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
        >
          Calculate Migration Plan
        </button>
      </div>

      {/* ===== Results ===== */}
      {hasCalculated && (
        <div className="mt-8 space-y-8">
          {/* --- Start Fresh Mode (TG = 0) --- */}
          {mode === 'startFresh' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-green-800">🚀 Start Fresh on WhatsApp</h3>
                <p className="mb-4 text-sm text-green-700">
                  No migration needed — you&apos;re starting with a clean slate. Here&apos;s how to build your WhatsApp Channel from scratch:
                </p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Create your Channel and customize the name, description, and icon</li>
                  <li>• Share the Channel link on every platform you own (website, social media, email)</li>
                  <li>• Post consistently — 2-3 times per week minimum to build momentum</li>
                  <li>• Cross-promote with other WhatsApp Channel creators in your niche</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Why WhatsApp Channels Over Telegram for New Creators</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: 'Built-in audience', desc: '3B+ users already on WhatsApp — no separate app download needed.' },
                    { title: 'Higher open rates', desc: 'WhatsApp messages land in the same inbox as family chats — 83% daily open rate.' },
                    { title: 'Monetization coming', desc: 'Meta announced paid subscriptions with a 10% revenue cut — the most creator-friendly split.' },
                    { title: 'No algorithm (yet)', desc: 'The feed is chronological. Early creators build audiences before algorithmic gatekeeping arrives.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-gray-100 p-4">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- Migrate Manually Mode (TG 1-49) --- */}
          {mode === 'migrateManually' && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-800">💬 Migrate Manually</h3>
              <p className="mb-4 text-sm text-blue-700">
                With {formatCommaNumber(tgSubscribers)} subscribers, your channel is small enough to migrate personally. A calculator isn&apos;t needed — direct outreach is your best strategy.
              </p>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Send a direct message to your Telegram channel announcing your WhatsApp Channel</li>
                <li>• Pin a message with your WhatsApp Channel link at the top of your Telegram channel</li>
                <li>• Cross-post your best content to both platforms for 2-3 weeks</li>
                <li>• Personally reach out to your most engaged followers</li>
              </ul>
              <p className="mt-4 text-sm text-blue-600">
                With {overlapPercent}% overlap, approximately {formatCommaNumber(reachable)} of your followers are already on WhatsApp.
              </p>
            </div>
          )}

          {/* --- Full Calculator Mode (TG >= 50) --- */}
          {mode === 'full' && timeline && strategy && risks && (
            <>
              {/* Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">Migration Timeline</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Projected WhatsApp Channel followers over {timeline.totalWeeks} weeks ({formatCommaNumber(reachable)} reachable from {formatCommaNumber(tgSubscribers)} subscribers at {overlapPercent}% overlap)
                </p>
                <div ref={chartRef} className="h-[250px] w-full sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline.weeks} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Week', position: 'insideBottom', offset: -2, fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          formatCommaNumber(value),
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                        labelFormatter={(label: any) => `Week ${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="conservative"
                        stroke={CHART_COLORS.conservative}
                        fill={CHART_COLORS.conservative}
                        fillOpacity={0.1}
                        strokeWidth={2}
                        name="Conservative"
                      />
                      <Area
                        type="monotone"
                        dataKey="expected"
                        stroke={CHART_COLORS.expected}
                        fill={CHART_COLORS.expected}
                        fillOpacity={0.15}
                        strokeWidth={2}
                        name="Expected"
                      />
                      <Area
                        type="monotone"
                        dataKey="optimistic"
                        stroke={CHART_COLORS.optimistic}
                        fill={CHART_COLORS.optimistic}
                        fillOpacity={0.1}
                        strokeWidth={2}
                        name="Optimistic"
                      />
                      {/* Milestone markers */}
                      {timeline.milestonesExpected.fiftyPercent && (
                        <ReferenceDot
                          x={timeline.milestonesExpected.fiftyPercent}
                          y={timeline.weeks[timeline.milestonesExpected.fiftyPercent - 1]?.expected ?? 0}
                          r={5}
                          fill={CHART_COLORS.expected}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Milestone labels */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>📢 Week 1: Announcement bump</span>
                  {timeline.milestonesExpected.fiftyPercent && (
                    <span>🎯 Week {timeline.milestonesExpected.fiftyPercent}: 50% migrated</span>
                  )}
                  {timeline.milestonesExpected.ninetyPercent && (
                    <span>✅ Week {timeline.milestonesExpected.ninetyPercent}: 90% migrated</span>
                  )}
                </div>
              </div>

              {/* Strategy Cards */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Recommended Strategy</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Sort: recommended first */}
                  {[...strategy.cards]
                    .sort((a, b) => (a.type === strategy.recommended ? -1 : b.type === strategy.recommended ? 1 : 0))
                    .map((card) => {
                      const isRecommended = card.type === strategy.recommended;
                      const isViableAlt = card.type === 'fullSwitch' && strategy.showFullSwitchAsViable;
                      return (
                        <div
                          key={card.type}
                          className={`rounded-xl border p-5 ${
                            isRecommended
                              ? 'border-green-300 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          {isRecommended && (
                            <span className="mb-2 inline-block rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white">
                              Recommended
                            </span>
                          )}
                          {isViableAlt && !isRecommended && (
                            <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                              Viable Alternative
                            </span>
                          )}
                          <h4 className="text-base font-semibold text-gray-900">{card.name}</h4>
                          <p className="mt-1 text-sm text-gray-600">{card.description}</p>
                          <p className="mt-2 text-xs font-medium text-gray-500">Timeline: ~{card.timelineWeeks} weeks</p>
                          <div className="mt-3 space-y-1">
                            <p className="text-xs font-semibold text-green-700">Pros:</p>
                            {card.pros.map((pro, i) => (
                              <p key={i} className="text-xs text-gray-600">✓ {pro}</p>
                            ))}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-semibold text-red-700">Cons:</p>
                            {card.cons.map((con, i) => (
                              <p key={i} className="text-xs text-gray-600">✗ {con}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {strategy.isLargeChannel && (
                  <p className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    💼 Managing a large channel ({formatCommaNumber(tgSubscribers)}+ subscribers)? Migration may take 12-16 weeks. Consider reaching out to discuss enterprise migration strategies.
                  </p>
                )}
              </div>

              {/* Risk Matrix */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Risk Assessment</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Risk of Waiting */}
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                    <h4 className="mb-3 text-base font-semibold text-orange-800">⏳ Risk of Waiting</h4>
                    <div className="space-y-3">
                      {risks.waiting.map((risk, i) => (
                        <div key={i}>
                          <p className="text-sm font-semibold text-gray-900">{risk.title}</p>
                          <p className="text-xs text-gray-600">{risk.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Risk of Rushing */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h4 className="mb-3 text-base font-semibold text-blue-800">⚡ Risk of Rushing</h4>
                    <div className="space-y-3">
                      {risks.rushing.map((risk, i) => (
                        <div key={i}>
                          <p className="text-sm font-semibold text-gray-900">{risk.title}</p>
                          <p className="text-xs text-gray-600">{risk.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Download */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  Download Your Migration Plan
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Get a PDF with your timeline, strategy, risk assessment, and a week-by-week action checklist.
                </p>
                <button
                  onClick={handlePDFDownload}
                  disabled={pdfLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    '📄 Download Migration Plan as PDF'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== CTA ===== */}
      <div className="mt-12">
        <ToolCTA />
      </div>

      {/* ===== SEO Content ===== */}
      <SEOContent sections={SEO_SECTIONS} faqs={SEO_FAQS} />

      {/* ===== Related Tools ===== */}
      <RelatedTools tools={RELATED_TOOLS} />
    </div>
  );
}
