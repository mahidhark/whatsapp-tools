// lib/utils/migration-model.ts
// Pure math functions for Telegram to WhatsApp Migration Calculator (Tool #7)
// No React imports — testable in isolation

// ============================================================
// Types
// ============================================================

export type PostFrequency = 'daily' | '2-3x' | 'weekly' | 'monthly';
export type Mode = 'full' | 'startFresh' | 'migrateManually';
export type StrategyType = 'gradual' | 'parallel' | 'fullSwitch';

export interface MigrationInputs {
  tgSubscribers: number;
  overlapPercent: number; // 10-100
  postFrequency: PostFrequency;
}

export interface TimelineWeek {
  week: number;
  conservative: number; // cumulative WA followers
  expected: number;
  optimistic: number;
}

export interface MigrationTimeline {
  weeks: TimelineWeek[];
  totalWeeks: number;
  milestonesExpected: {
    announcementBump: number; // week number
    fiftyPercent: number | null;
    ninetyPercent: number | null;
  };
}

export interface StrategyCard {
  type: StrategyType;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  timelineWeeks: number;
}

export interface StrategyResult {
  recommended: StrategyType;
  cards: StrategyCard[];
  isLargeChannel: boolean;
  showFullSwitchAsViable: boolean;
}

export interface Risk {
  title: string;
  content: string;
  type: 'static' | 'dynamic';
}

export interface RiskMatrix {
  waiting: Risk[];
  rushing: Risk[];
}

// ============================================================
// Constants
// ============================================================

const FREQUENCY_MULTIPLIERS: Record<PostFrequency, number> = {
  'daily': 1.3,
  '2-3x': 1.0,
  'weekly': 0.7,
  'monthly': 0.4,
};

const SCENARIO_MULTIPLIERS = {
  conservative: 0.7,
  expected: 1.0,
  optimistic: 1.4,
};

// Base weekly conversion rates (percentage of TOTAL reachable)
const BASE_CONVERSION_RATES = [
  0.20, // week 1: 20% announcement bump
  0.12, // week 2: regular nudges
  0.10, // week 3
  0.08, // week 4
  0.06, // week 5: stragglers
  0.05, // week 6
  0.04, // week 7
  0.03, // week 8
  0.02, // week 9+ long tail
];

// ============================================================
// Mode Detection
// ============================================================

export function getMode(tgSubscribers: number): Mode {
  if (tgSubscribers === 0) return 'startFresh';
  if (tgSubscribers < 50) return 'migrateManually';
  return 'full';
}

// ============================================================
// Core Migration Formula
// ============================================================

export function calculateReachable(tgSubscribers: number, overlapPercent: number): number {
  return Math.round(tgSubscribers * (overlapPercent / 100));
}

/**
 * Calculate week-by-week migration timeline.
 * Conversion curve: big announcement bump week 1, diminishing after.
 * Frequency multiplier affects speed (how fast), not ceiling (how many).
 * Three scenarios: conservative (0.7x), expected (1.0x), optimistic (1.4x).
 */
export function calculateTimeline(inputs: MigrationInputs): MigrationTimeline {
  const { tgSubscribers, overlapPercent, postFrequency } = inputs;
  const reachable = calculateReachable(tgSubscribers, overlapPercent);
  const freqMult = FREQUENCY_MULTIPLIERS[postFrequency];

  // Calculate for each scenario
  const weeks: TimelineWeek[] = [];
  const cumulative = { conservative: 0, expected: 0, optimistic: 0 };

  // Determine how many weeks to simulate (until optimistic hits 95% or max 24 weeks)
  const maxWeeks = 24;

  for (let w = 1; w <= maxWeeks; w++) {
    const baseRate = w <= BASE_CONVERSION_RATES.length
      ? BASE_CONVERSION_RATES[w - 1]
      : BASE_CONVERSION_RATES[BASE_CONVERSION_RATES.length - 1]; // last rate for week 9+

    for (const scenario of ['conservative', 'expected', 'optimistic'] as const) {
      const scenarioMult = SCENARIO_MULTIPLIERS[scenario];
      const effectiveRate = baseRate * freqMult * scenarioMult;
      const newFollowers = Math.round(reachable * effectiveRate);
      cumulative[scenario] = Math.min(cumulative[scenario] + newFollowers, reachable);
    }

    weeks.push({
      week: w,
      conservative: cumulative.conservative,
      expected: cumulative.expected,
      optimistic: cumulative.optimistic,
    });

    // Stop if all scenarios have converged (>95% of reachable)
    if (cumulative.conservative >= reachable * 0.95) break;
  }

  // Find milestone weeks (for expected scenario)
  const fiftyTarget = reachable * 0.5;
  const ninetyTarget = reachable * 0.9;

  const fiftyPercent = weeks.find(w => w.expected >= fiftyTarget)?.week ?? null;
  const ninetyPercent = weeks.find(w => w.expected >= ninetyTarget)?.week ?? null;

  return {
    weeks,
    totalWeeks: weeks.length,
    milestonesExpected: {
      announcementBump: 1,
      fiftyPercent,
      ninetyPercent,
    },
  };
}

// ============================================================
// Strategy Recommendation
// ============================================================

export function getStrategy(inputs: MigrationInputs): StrategyResult {
  const { tgSubscribers, overlapPercent, postFrequency } = inputs;
  const timeline = calculateTimeline(inputs);
  const ninetyWeek = timeline.milestonesExpected.ninetyPercent ?? timeline.totalWeeks;

  const isLargeChannel = tgSubscribers >= 100000;
  const showFullSwitchAsViable =
    postFrequency === 'daily' && overlapPercent >= 80;

  // Determine recommendation
  let recommended: StrategyType;
  if (overlapPercent >= 70) {
    recommended = 'gradual';
  } else if (overlapPercent >= 30) {
    recommended = 'parallel';
  } else {
    recommended = 'parallel'; // strong parallel for <30%
  }

  const cards: StrategyCard[] = [
    {
      type: 'gradual',
      name: 'Gradual Migration',
      description: 'Cross-post to both platforms. Send weekly nudges to your Telegram audience inviting them to your WhatsApp Channel. Keep Telegram active throughout.',
      pros: [
        'Preserves audience trust — no sudden disruption',
        'Low risk — you never lose access to either platform',
        'Audience self-selects their preferred platform',
      ],
      cons: [
        'Slower — takes ' + ninetyWeek + ' weeks to reach 90% migration',
        'Doubles your content effort in the short term',
        'Requires consistent cross-posting discipline',
      ],
      timelineWeeks: ninetyWeek,
    },
    {
      type: 'parallel',
      name: 'Parallel (Run Both)',
      description: 'Run both platforms equally with no active migration push. Let your audience naturally discover your WhatsApp Channel over time.',
      pros: [
        'Zero audience loss — everyone stays where they are',
        'No urgency pressure on your followers',
        'Works best when audiences don\'t fully overlap',
      ],
      cons: [
        'Permanent double effort with no clear end date',
        'No clear transition — you run both indefinitely',
        'Slower WhatsApp growth without active nudges',
      ],
      timelineWeeks: Math.round(ninetyWeek * 1.8),
    },
    {
      type: 'fullSwitch',
      name: 'Full Switch',
      description: 'Announce the move. Cross-post for 2-4 weeks. Then go WhatsApp-only and archive your Telegram channel.',
      pros: [
        'Fastest transition — forces decisive action',
        'Clean break — one platform to manage going forward',
        'Creates urgency that drives higher conversion',
      ],
      cons: [
        'Risky — loses ' + Math.round(tgSubscribers * (1 - overlapPercent / 100)).toLocaleString() + ' followers not on WhatsApp',
        'Can frustrate loyal Telegram followers',
        'No safety net if WhatsApp doesn\'t work out',
      ],
      timelineWeeks: Math.min(4, ninetyWeek),
    },
  ];

  return { recommended, cards, isLargeChannel, showFullSwitchAsViable };
}

// ============================================================
// Risk Matrix
// ============================================================

export function getRisks(inputs: MigrationInputs, projectedMonth6Followers: number): RiskMatrix {
  const { tgSubscribers, overlapPercent } = inputs;
  const nonOverlapCount = Math.round(tgSubscribers * (1 - overlapPercent / 100));

  const waiting: Risk[] = [
    {
      title: 'Algorithm arrives',
      content: 'WhatsApp Channels is chronological today. When algorithmic ranking kicks in (12\u201318 months), early creators will have the advantage.',
      type: 'static',
    },
    {
      title: 'Competition saturates',
      content: 'The leaderboard is wide open for individual creators right now. That window is closing.',
      type: 'static',
    },
    {
      title: 'Audience attrition on Telegram',
      content: `Telegram\u2019s growth has slowed to 5.3%. With country bans expanding, a portion of your ${tgSubscribers.toLocaleString()} followers could lose access.`,
      type: 'dynamic',
    },
    {
      title: 'Monetization miss',
      content: `At your current size, reaching ${projectedMonth6Followers.toLocaleString()} WhatsApp followers by month 6 could unlock paid subscriptions. Waiting 6 months delays that.`,
      type: 'dynamic',
    },
  ];

  const rushing: Risk[] = [
    {
      title: 'Audience confusion',
      content: 'Abruptly leaving Telegram without a transition plan frustrates loyal followers.',
      type: 'static',
    },
    {
      title: 'Content gap',
      content: 'WhatsApp Channels still lacks scheduling, analytics, and automation. Running both gives you a safety net.',
      type: 'static',
    },
    {
      title: 'Non-overlapping audience loss',
      content: `${nonOverlapCount.toLocaleString()} of your followers (${100 - overlapPercent}%) are NOT on WhatsApp. A full switch loses them entirely.`,
      type: 'dynamic',
    },
    {
      title: 'Trust erosion',
      content: 'Your Telegram audience chose that platform for a reason. Respect the transition.',
      type: 'static',
    },
  ];

  return { waiting, rushing };
}

// ============================================================
// Formatting Helpers
// ============================================================

export function formatCommaNumber(n: number): string {
  return n.toLocaleString();
}
