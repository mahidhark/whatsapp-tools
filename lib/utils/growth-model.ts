// lib/utils/growth-model.ts
// Pure math functions for Channel Growth Calculator (Tool #4)
// No React imports — testable in isolation

import { type NicheData } from '@/lib/data/niche-data';

// ============================================================
// Types
// ============================================================

export interface GrowthInputs {
  followers: number;
  postsPerWeek: number;
  engagementRate: number; // percentage (e.g., 8 = 8%)
  niche: NicheData;
}

export interface MonthProjection {
  month: number; // 1-12
  conservative: number;
  expected: number;
  optimistic: number;
}

export interface GrowthProjections {
  monthly: MonthProjection[];
  summary: {
    conservative: number;
    expected: number;
    optimistic: number;
  };
}

export interface Milestone {
  target: number;
  label: string;
  monthConservative: number | null; // null = not reachable in 12 months
  monthExpected: number | null;
  monthOptimistic: number | null;
  revenueEstimate: number;
}

export type BenchmarkLabel =
  | 'Top 5%'
  | 'Top 15%'
  | 'Above Average'
  | 'Average'
  | 'Below Average';

export interface BenchmarkResult {
  percentile: number; // 0-100
  label: BenchmarkLabel;
  engagementVsNiche: number; // ratio (e.g., 1.2 = 20% above avg)
  frequencyVsNiche: number; // ratio
}

// ============================================================
// Core Growth Formula
// ============================================================

const BASE_GROWTH_RATE = 0.05; // 5% monthly
const MAX_ENGAGEMENT_MULT = 2.5;
const MAX_FREQUENCY_MULT = 1.5;

const SCENARIO_MULTIPLIERS = {
  conservative: 0.6,
  expected: 1.0,
  optimistic: 1.5,
} as const;

/**
 * Calculate effective monthly growth rate with logistic dampening.
 * Returns a rate (e.g., 0.075 = 7.5% growth).
 */
export function calculateEffectiveRate(
  followers: number,
  engagementRate: number,
  postsPerWeek: number,
  niche: NicheData
): number {
  const engagementMult = Math.min(engagementRate / niche.avgEngagement, MAX_ENGAGEMENT_MULT);
  const frequencyMult = Math.min(0.5 + postsPerWeek / 10, MAX_FREQUENCY_MULT);
  const monthlyGrowth = BASE_GROWTH_RATE * engagementMult * frequencyMult;

  // Logistic dampening: growth slows as followers approach niche capacity
  const dampeningFactor = niche.capacity / (niche.capacity + followers);
  return monthlyGrowth * dampeningFactor;
}

// ============================================================
// Projections (12 months, iterative)
// ============================================================

/**
 * Calculate 12-month projections with 3 scenarios.
 * Iterative: recalculates dampening each month as followers grow.
 */
export function calculateProjections(inputs: GrowthInputs): GrowthProjections {
  const { followers: startFollowers, engagementRate, postsPerWeek, niche } = inputs;

  // Seed at 50 if followers = 0
  const seedFollowers = startFollowers === 0 ? 50 : startFollowers;

  const monthly: MonthProjection[] = [];
  let conservative = seedFollowers;
  let expected = seedFollowers;
  let optimistic = seedFollowers;

  for (let month = 1; month <= 12; month++) {
    // Calculate rate for each scenario using current follower count
    const rateConservative =
      calculateEffectiveRate(conservative, engagementRate, postsPerWeek, niche) *
      SCENARIO_MULTIPLIERS.conservative;
    const rateExpected =
      calculateEffectiveRate(expected, engagementRate, postsPerWeek, niche) *
      SCENARIO_MULTIPLIERS.expected;
    const rateOptimistic =
      calculateEffectiveRate(optimistic, engagementRate, postsPerWeek, niche) *
      SCENARIO_MULTIPLIERS.optimistic;

    conservative = Math.round(conservative * (1 + rateConservative));
    expected = Math.round(expected * (1 + rateExpected));
    optimistic = Math.round(optimistic * (1 + rateOptimistic));

    monthly.push({ month, conservative, expected, optimistic });
  }

  return {
    monthly,
    summary: {
      conservative: monthly[11].conservative,
      expected: monthly[11].expected,
      optimistic: monthly[11].optimistic,
    },
  };
}

// ============================================================
// Milestones
// ============================================================

const MILESTONE_TARGETS = [10_000, 50_000, 100_000, 500_000, 1_000_000];

/**
 * Calculate when each milestone is reached (month number) for each scenario.
 * Only returns milestones above the current follower count.
 */
export function calculateMilestones(
  inputs: GrowthInputs,
  projections: GrowthProjections
): Milestone[] {
  const currentFollowers = inputs.followers === 0 ? 50 : inputs.followers;

  return MILESTONE_TARGETS.filter((target) => target > currentFollowers).map((target) => {
    const monthConservative =
      projections.monthly.find((m) => m.conservative >= target)?.month ?? null;
    const monthExpected =
      projections.monthly.find((m) => m.expected >= target)?.month ?? null;
    const monthOptimistic =
      projections.monthly.find((m) => m.optimistic >= target)?.month ?? null;

    // Revenue at this milestone
    const revenueEstimate =
      target * (inputs.niche.convRate / 100) * inputs.niche.avgSubPrice * 0.9;

    return {
      target,
      label: formatFollowerCount(target),
      monthConservative,
      monthExpected,
      monthOptimistic,
      revenueEstimate,
    };
  });
}

// ============================================================
// Monetization
// ============================================================

/**
 * Calculate monthly revenue estimate at a given follower count.
 * revenue = followers × convRate × avgPrice × 0.9 (10% Meta cut)
 */
export function calculateMonetization(followers: number, niche: NicheData): number {
  return followers * (niche.convRate / 100) * niche.avgSubPrice * 0.9;
}

// ============================================================
// Benchmark
// ============================================================

// Average posting frequency assumption: 5 posts/week across all niches
const AVG_POSTS_PER_WEEK = 5;

/**
 * Calculate benchmark percentile and label.
 */
export function calculateBenchmark(inputs: GrowthInputs): BenchmarkResult {
  const engagementVsNiche = inputs.engagementRate / inputs.niche.avgEngagement;
  const frequencyVsNiche = inputs.postsPerWeek / AVG_POSTS_PER_WEEK;

  // Combined score: weighted 60% engagement, 40% frequency
  const combinedScore = engagementVsNiche * 0.6 + frequencyVsNiche * 0.4;

  // Map to percentile (rough mapping)
  let percentile: number;
  if (combinedScore >= 2.0) percentile = 95;
  else if (combinedScore >= 1.5) percentile = 85;
  else if (combinedScore >= 1.1) percentile = 70;
  else if (combinedScore >= 0.8) percentile = 50;
  else if (combinedScore >= 0.5) percentile = 30;
  else percentile = 15;

  let label: BenchmarkLabel;
  if (percentile >= 90) label = 'Top 5%';
  else if (percentile >= 80) label = 'Top 15%';
  else if (percentile >= 60) label = 'Above Average';
  else if (percentile >= 40) label = 'Average';
  else label = 'Below Average';

  return { percentile, label, engagementVsNiche, frequencyVsNiche };
}

// ============================================================
// Personalized Tips
// ============================================================

export interface Tip {
  text: string;
  priority: 'High Impact' | 'Medium' | 'Low';
}

export function generateTips(inputs: GrowthInputs): Tip[] {
  const tips: Tip[] = [];
  const { engagementRate, postsPerWeek, followers, niche } = inputs;

  if (engagementRate < niche.avgEngagement * 0.5) {
    tips.push({
      text: 'Your engagement rate is well below the niche average. Focus on interactive content — polls, questions, and timely updates get more reactions.',
      priority: 'High Impact',
    });
  } else if (engagementRate < niche.avgEngagement) {
    tips.push({
      text: `Your engagement is slightly below the ${niche.label} niche average of ${niche.avgEngagement}%. Try posting at peak hours and using reaction-driving content formats.`,
      priority: 'Medium',
    });
  }

  if (postsPerWeek < 3) {
    tips.push({
      text: 'Posting fewer than 3 times per week limits your visibility. Aim for at least 3-5 posts per week to maintain audience attention.',
      priority: 'High Impact',
    });
  }

  if (postsPerWeek > 10) {
    tips.push({
      text: 'High-frequency posting works best with automation. Tools like Make.com + WhatsScale can schedule and distribute content automatically.',
      priority: 'Medium',
    });
  }

  if (followers < 100) {
    tips.push({
      text: 'Channels under 100 followers grow fastest through direct promotion. Share your channel link on every platform — website, email signature, social bios.',
      priority: 'High Impact',
    });
  }

  if (engagementRate > niche.avgEngagement * 1.5) {
    tips.push({
      text: 'Your engagement is significantly above average — your audience is highly active. Consider monetization through paid subscriptions when Meta enables it.',
      priority: 'Medium',
    });
  }

  // Always include a general tip
  tips.push({
    text: 'WhatsApp Channels content auto-deletes after 30 days. Archive important posts using Make.com to Google Sheets or Notion.',
    priority: 'Low',
  });

  return tips.slice(0, 4); // Max 4 tips
}

// ============================================================
// Helpers
// ============================================================

export function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function formatCurrency(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatCommaNumber(n: number): string {
  return n.toLocaleString('en-US');
}
