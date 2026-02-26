// app/tools/channel-growth-calculator/GrowthCalculator.tsx
// Client component — Channel Growth Calculator (Tool #4)

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { getNicheById, NICHE_OPTIONS, NICHE_DATA } from '@/lib/data/niche-data';
import {
  calculateProjections,
  calculateMilestones,
  calculateMonetization,
  calculateBenchmark,
  formatFollowerCount,
  formatCurrency,
  formatCommaNumber,
  type GrowthInputs,
} from '@/lib/utils/growth-model';
import SEOContent from '@/components/tools/SEOContent';
import ToolCTA from '@/components/tools/ToolCTA';
import RelatedTools from '@/components/tools/RelatedTools';
import PrivacyBadge from '@/components/tools/PrivacyBadge';

// ============================================================
// Constants
// ============================================================

const CHART_COLORS = {
  conservative: '#94a3b8', // slate-400 — colorblind-safe
  expected: '#3b82f6',     // blue-500
  optimistic: '#22c55e',   // green-500
};

const RELATED_TOOLS = [
  {
    name: 'WhatsApp vs Telegram',
    href: '/tools/whatsapp-vs-telegram',
    emoji: '⚔️',
    description: 'Interactive comparison for creators and business.',
  },
  {
    name: 'WhatsApp Link Generator',
    href: '/tools/whatsapp-link-generator',
    emoji: '🔗',
    description: 'Generate wa.me links and QR codes.',
  },
  {
    name: 'WhatsApp Message Formatter',
    href: '/tools/whatsapp-message-formatter',
    emoji: '✍️',
    description: 'Bold, italic, and monospace formatting.',
  },
];

const SEO_SECTIONS = [
  {
    heading: 'How to Grow Your WhatsApp Channel',
    content:
      'Growing a WhatsApp Channel comes down to three levers: posting frequency, engagement quality, and cross-promotion. Channels that post 3-5 times per week consistently outperform those posting daily bursts followed by silence. Focus on content that drives reactions — polls, breaking updates, and exclusive insights generate the highest engagement. Promote your channel link on every platform you own: website, email signature, social media bios, and WhatsApp groups. The WhatsApp Channels feed is currently chronological with no algorithmic gatekeeping, meaning early movers who build audiences now will have a structural advantage when Meta introduces algorithmic ranking.',
  },
  {
    heading: 'WhatsApp Channel Monetization: What Creators Can Earn',
    content:
      "At Cannes Lions 2025, Meta announced paid subscriptions for WhatsApp Channels with a 10% revenue cut — the most creator-friendly split of any major platform. Monetization estimates depend on your niche: Business and Finance channels can command $5/month subscription prices with 4% conversion rates, while Entertainment channels see lower prices ($1.50) but higher audience sizes. The calculator above models these niche differences. Note that paid subscriptions are not yet live — all monetization estimates are projections based on Meta's announced model and creator economy benchmarks from other platforms.",
  },
  {
    heading: 'WhatsApp Channel Engagement Rate Benchmarks by Niche',
    content:
      'Engagement rate on WhatsApp Channels is calculated as reactions divided by views, multiplied by 100. Average rates vary significantly by niche: News channels lead at 15%, followed by Sports (14%), Entertainment (12%), Food (11%), Education (10%), Health (9%), General and Fashion (8%), Business/Finance (7%), and Tech (6%). If your rate is above your niche average, you are outperforming most creators. The benchmark gauge in the calculator above shows your percentile ranking. Note that views are only visible to channel admins with 100+ followers.',
  },
  {
    heading: 'Automate Your WhatsApp Channel Growth',
    content:
      'Posting to WhatsApp Channels manually does not scale, especially for creators managing multiple platforms. Automation tools like Make.com combined with WhatsScale let you schedule posts in advance, cross-post content from YouTube, Telegram, or your blog automatically, and distribute updates to both WhatsApp and Telegram from a single workflow. You can even set up RSS-to-Channel pipelines that publish new blog posts or podcast episodes the moment they go live. If you are posting more than 10 times per week, automation is not a luxury — it is a necessity.',
  },
  {
    heading: 'How the Growth Calculator Works',
    content:
      "This calculator uses a logistic growth model with dampening. The base monthly growth rate (5%) is modified by two multipliers: engagement (how your rate compares to the niche average, capped at 2.5x) and frequency (based on posts per week, capped at 1.5x). As your follower count approaches the estimated niche capacity, a dampening factor reduces the growth rate — mimicking real-world saturation where large channels grow proportionally slower. Three scenarios are projected: conservative (0.6x), expected (1.0x), and optimistic (1.5x). All projections are estimates based on modeled assumptions, not guaranteed outcomes.",
  },
];

const SEO_FAQS = [
  {
    question: 'How fast do WhatsApp Channels grow?',
    answer:
      'Growth depends on your niche, posting frequency, and engagement rate. Motivated creators posting 3-5 times per week with above-average engagement can expect 5-15% monthly follower growth. Entertainment and News niches tend to grow fastest due to higher shareability.',
  },
  {
    question: 'How many followers do you need to monetize a WhatsApp Channel?',
    answer:
      'Meta announced paid subscriptions with a 10% revenue cut at Cannes Lions 2025. While there is no official minimum, creators with 10,000+ followers and strong engagement are best positioned to monetize when the feature launches.',
  },
  {
    question: 'What is a good engagement rate for WhatsApp Channels?',
    answer:
      'Average rates vary by niche: News (15%), Sports (14%), Entertainment (12%), Education (10%), Tech (6%). Above your niche average means you are outperforming most creators.',
  },
  {
    question: 'How to increase WhatsApp Channel followers fast?',
    answer:
      'Share your channel link everywhere, post 3-5 times per week, create reaction-driving content, cross-post from other platforms with automation, and promote in WhatsApp groups.',
  },
  {
    question: 'Can you automate WhatsApp Channel posting?',
    answer:
      'Yes. Tools like Make.com + WhatsScale let you schedule posts, cross-post from YouTube, Telegram, and blogs, and distribute content automatically.',
  },
];

// ============================================================
// Custom Tooltip
// ============================================================

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCommaNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ============================================================
// Component
// ============================================================

export default function GrowthCalculator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);

  // ----- Inputs -----
  const [followers, setFollowers] = useState(0);
  const [followersDisplay, setFollowersDisplay] = useState('');
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [engagementRate, setEngagementRate] = useState(5);
  const [nicheId, setNicheId] = useState('general');

  // ----- State -----
  const [pdfLoading, setPdfLoading] = useState(false);
  const [autoDownloadPDF, setAutoDownloadPDF] = useState(false);

  // ----- URL params on mount -----
  useEffect(() => {
    const f = searchParams.get('followers');
    const p = searchParams.get('posts');
    const e = searchParams.get('engagement');
    const n = searchParams.get('niche');

    if (f) {
      const num = parseInt(f, 10);
      if (!isNaN(num) && num >= 0 && num <= 10_000_000) {
        setFollowers(num);
        setFollowersDisplay(num.toLocaleString('en-US'));
      }
    }
    if (p) {
      const num = parseInt(p, 10);
      if (!isNaN(num) && num >= 1 && num <= 30) setPostsPerWeek(num);
    }
    if (e) {
      const num = parseFloat(e);
      if (!isNaN(num) && num >= 0.1 && num <= 50) setEngagementRate(num);
    }
    if (n && NICHE_DATA.some((nd) => nd.id === n)) setNicheId(n);
  }, [searchParams]);

  // ----- Restore from localStorage after signup redirect -----
  useEffect(() => {
    if (authLoading) return;
    const saved = localStorage.getItem('growth-calc-inputs');
    if (saved && user) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.followers !== undefined) {
          setFollowers(parsed.followers);
          setFollowersDisplay(parsed.followers.toLocaleString('en-US'));
        }
        if (parsed.postsPerWeek) setPostsPerWeek(parsed.postsPerWeek);
        if (parsed.engagementRate) setEngagementRate(parsed.engagementRate);
        if (parsed.nicheId) setNicheId(parsed.nicheId);
        localStorage.removeItem('growth-calc-inputs');

        // Flag to auto-trigger PDF after restored values propagate
        setAutoDownloadPDF(true);
      } catch {
        localStorage.removeItem('growth-calc-inputs');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // ----- Auto-download PDF after restored inputs propagate -----
  useEffect(() => {
    if (autoDownloadPDF && user && !pdfLoading) {
      setAutoDownloadPDF(false);
      handlePDFDownload(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownloadPDF, followers, postsPerWeek, engagementRate, nicheId]);

  // ----- Derived data -----
  const niche = useMemo(() => getNicheById(nicheId), [nicheId]);

  const inputs: GrowthInputs = useMemo(
    () => ({ followers, postsPerWeek, engagementRate, niche }),
    [followers, postsPerWeek, engagementRate, niche]
  );

  const projections = useMemo(() => calculateProjections(inputs), [inputs]);
  const milestones = useMemo(() => calculateMilestones(inputs, projections), [inputs, projections]);
  const benchmark = useMemo(() => calculateBenchmark(inputs), [inputs]);

  // Chart data
  const chartData = useMemo(() => {
    const start = followers === 0 ? 50 : followers;
    return [
      { month: 'Now', conservative: start, expected: start, optimistic: start },
      ...projections.monthly.map((m) => ({
        month: `M${m.month}`,
        conservative: m.conservative,
        expected: m.expected,
        optimistic: m.optimistic,
      })),
    ];
  }, [projections, followers]);

  // ----- Handlers -----
  const handleFollowersChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10);
    const clamped = Math.min(num, 10_000_000);
    setFollowers(clamped);
    setFollowersDisplay(clamped === 0 && raw === '' ? '' : clamped.toLocaleString('en-US'));
  };

  const handleUseNicheAverage = () => {
    setEngagementRate(niche.avgEngagement);
  };

  // ----- URL param sync -----
  useEffect(() => {
    const params = new URLSearchParams();
    if (followers > 0) params.set('followers', String(followers));
    if (postsPerWeek !== 3) params.set('posts', String(postsPerWeek));
    if (engagementRate !== 5) params.set('engagement', String(engagementRate));
    if (nicheId !== 'general') params.set('niche', nicheId);

    const paramString = params.toString();
    if (paramString) {
      window.history.replaceState(null, '', `?${paramString}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [followers, postsPerWeek, engagementRate, nicheId]);

  // ----- PDF Download -----
  const handlePDFDownload = useCallback(
    async (autoTriggered = false) => {
      if (!user) {
        // Save inputs to localStorage
        localStorage.setItem(
          'growth-calc-inputs',
          JSON.stringify({ followers, postsPerWeek, engagementRate, nicheId })
        );
        // Redirect to signup
        router.push(
          `/signup?redirect=${encodeURIComponent('/tools/channel-growth-calculator')}`
        );
        return;
      }

      setPdfLoading(true);
      try {
        const { generateGrowthPDF } = await import('@/lib/utils/pdf-report');
        const blob = await generateGrowthPDF(inputs, projections, milestones, benchmark, chartRef);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `whatsscale-growth-report-${nicheId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('PDF generation failed:', err);
      } finally {
        setPdfLoading(false);
      }
    },
    [user, followers, postsPerWeek, engagementRate, nicheId, inputs, projections, milestones, benchmark, router]
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* H1 */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        WhatsApp Channel Growth Calculator
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Free 12-month follower projections with monetization estimates and niche benchmarks.
      </p>

      <PrivacyBadge />

      {/* ============================================================ */}
      {/* INPUTS SECTION */}
      {/* ============================================================ */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Your Channel Details</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Followers */}
          <div>
            <label htmlFor="followers" className="mb-1 block text-sm font-medium text-gray-700">
              Current Followers
            </label>
            <input
              id="followers"
              type="text"
              inputMode="numeric"
              value={followersDisplay}
              onChange={(e) => handleFollowersChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Current follower count"
            />
            {followers > 0 && followers < 100 && (
              <p className="mt-1 text-xs text-blue-600">
                Tip: Channels under 100 grow fastest through direct promotion.{' '}
                <a href="/tools/whatsapp-link-generator" className="underline">
                  Generate a share link →
                </a>
              </p>
            )}
          </div>

          {/* Niche */}
          <div>
            <label htmlFor="niche" className="mb-1 block text-sm font-medium text-gray-700">
              Niche
            </label>
            <select
              id="niche"
              value={nicheId}
              onChange={(e) => setNicheId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Select your niche"
            >
              {NICHE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Posts per Week */}
          <div>
            <label htmlFor="posts" className="mb-1 block text-sm font-medium text-gray-700">
              Posts per Week: <span className="font-semibold text-blue-600">{postsPerWeek}</span>
            </label>
            <input
              id="posts"
              type="range"
              min={1}
              max={30}
              value={postsPerWeek}
              onChange={(e) => setPostsPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500"
              aria-label="Posts per week"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>15</span>
              <span>30</span>
            </div>
            {postsPerWeek > 10 && (
              <p className="mt-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Posting this frequently? Automate it with{' '}
                
                <a
                  href="https://www.make.com/en/integrations/whatsscale?utm_source=whatsscale-app&utm_medium=partner&utm_campaign=partner-listing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  Make.com
                </a>{' '}
                + WhatsScale.
              </p>
            )}
          </div>

          {/* Engagement Rate */}
          <div>
            <label htmlFor="engagement" className="mb-1 block text-sm font-medium text-gray-700">
              Avg Engagement Rate:{' '}
              <span className="font-semibold text-blue-600">{engagementRate}%</span>
            </label>
            <input
              id="engagement"
              type="range"
              min={0.1}
              max={50}
              step={0.1}
              value={engagementRate}
              onChange={(e) => setEngagementRate(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
              aria-label="Average engagement rate"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-400">0.1%</span>
              <button
                onClick={handleUseNicheAverage}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Use niche average ({niche.avgEngagement}%)
              </button>
              <span className="text-xs text-gray-400">50%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Reactions ÷ Views × 100 on your last 5 posts. Not sure? Use the niche average.
            </p>
            {engagementRate < 2 && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠ Your engagement rate is well below the niche average. Improving engagement is the
                fastest way to accelerate growth.
              </p>
            )}
            {engagementRate > 30 && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠ This is unusually high. Make sure you&apos;re calculating reactions ÷ views, not
                reactions ÷ posts.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* RESULTS SECTION */}
      {/* ============================================================ */}
      <section className="mb-8 space-y-6">
        {/* Growth Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold text-gray-900">12-Month Growth Projection</h2>
          {followers === 0 && (
            <p className="mb-4 text-sm text-amber-600">
              Assuming 50 initial followers from launch.
            </p>
          )}
          <p className="mb-4 text-sm text-gray-500">
            All estimates in USD. Projections are modeled, not guaranteed.
          </p>

          <div ref={chartRef} className="h-[350px] w-full sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(val: number) => formatFollowerCount(val)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conservative"
                  name="Conservative"
                  stroke={CHART_COLORS.conservative}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expected"
                  name="Expected"
                  stroke={CHART_COLORS.expected}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="optimistic"
                  name="Optimistic"
                  stroke={CHART_COLORS.optimistic}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projection Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Conservative',
              value: projections.summary.conservative,
              color: 'text-slate-600',
              bg: 'bg-slate-50',
              border: 'border-slate-200',
            },
            {
              label: 'Expected',
              value: projections.summary.expected,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-200',
            },
            {
              label: 'Optimistic',
              value: projections.summary.optimistic,
              color: 'text-green-600',
              bg: 'bg-green-50',
              border: 'border-green-200',
            },
          ].map((scenario) => (
            <div
              key={scenario.label}
              className={`rounded-xl border ${scenario.border} ${scenario.bg} p-5`}
            >
              <p className="text-sm font-medium text-gray-600">{scenario.label} (12 months)</p>
              <p className={`mt-1 text-2xl font-bold ${scenario.color}`}>
                {formatCommaNumber(scenario.value)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                followers · {formatCurrency(calculateMonetization(scenario.value, niche))}/mo est.
              </p>
            </div>
          ))}
        </div>

        {/* Benchmark Gauge */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Your Benchmark: <span className="text-blue-600">{benchmark.label}</span>
          </h3>
          <div className="mb-2 h-4 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
              style={{ width: `${benchmark.percentile}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Below Average</span>
            <span>Average</span>
            <span>Top 5%</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Engagement vs Niche</p>
              <p className="text-lg font-semibold text-gray-900">
                {(benchmark.engagementVsNiche * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">
                {benchmark.engagementVsNiche >= 1 ? 'Above' : 'Below'} {niche.label} average (
                {niche.avgEngagement}%)
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Posting Frequency vs Average</p>
              <p className="text-lg font-semibold text-gray-900">
                {(benchmark.frequencyVsNiche * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">
                {benchmark.frequencyVsNiche >= 1 ? 'Above' : 'Below'} average (5 posts/wk)
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        {milestones.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Milestone Timeline</h3>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m.target}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{m.label} followers</p>
                    <p className="text-xs text-gray-500">
                      Est. revenue: {formatCurrency(m.revenueEstimate)}/mo
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {m.monthExpected ? (
                      <p className="font-medium text-blue-600">Month {m.monthExpected}</p>
                    ) : (
                      <p className="text-gray-400">12+ months</p>
                    )}
                    {m.monthOptimistic && m.monthOptimistic !== m.monthExpected && (
                      <p className="text-xs text-green-600">
                        Optimistic: M{m.monthOptimistic}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Gate */}
        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Get Your Full Growth Report</h3>
          <p className="mb-4 text-sm text-gray-600">
            Month-by-month data table, detailed monetization breakdown, niche comparison,
            personalized tips, and 30/60/90 day action plan.
          </p>
          <button
            onClick={() => handlePDFDownload()}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pdfLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>📄 Download Full Report (PDF)</>
            )}
          </button>
          {!user && (
            <p className="mt-2 text-xs text-gray-500">
              Free WhatsScale account required. No credit card needed.
            </p>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SEO CONTENT */}
      {/* ============================================================ */}
      <SEOContent sections={SEO_SECTIONS} faqs={SEO_FAQS} />

      {/* ============================================================ */}
      {/* CTA + Related Tools */}
      {/* ============================================================ */}
      <ToolCTA />
      <RelatedTools tools={RELATED_TOOLS} />
    </div>
  );
}
