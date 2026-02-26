// lib/__tests__/utils/growth-model.test.ts
// Tests for Channel Growth Calculator growth model (Tool #4)

import {
  calculateEffectiveRate,
  calculateProjections,
  calculateMilestones,
  calculateMonetization,
  calculateBenchmark,
  generateTips,
  formatFollowerCount,
  type GrowthInputs,
} from '../../utils/growth-model';
import { getNicheById, NICHE_DATA } from '../../data/niche-data';

// Helper: build inputs with defaults
function makeInputs(overrides: Partial<GrowthInputs> = {}): GrowthInputs {
  return {
    followers: 1000,
    postsPerWeek: 3,
    engagementRate: 8,
    niche: getNicheById('general'),
    ...overrides,
  };
}

// ============================================================
// Test 1: Base case
// ============================================================
describe('calculateProjections', () => {
  test('base case: 1000 followers, 3 posts/wk, 8% engagement, General niche', () => {
    const inputs = makeInputs();
    const result = calculateProjections(inputs);

    expect(result.monthly).toHaveLength(12);
    expect(result.summary.expected).toBeGreaterThan(1000);
    expect(result.summary.conservative).toBeLessThan(result.summary.expected);
    expect(result.summary.optimistic).toBeGreaterThan(result.summary.expected);

    // All values should be finite and positive
    for (const m of result.monthly) {
      expect(m.conservative).toBeGreaterThan(0);
      expect(m.expected).toBeGreaterThan(0);
      expect(m.optimistic).toBeGreaterThan(0);
      expect(Number.isFinite(m.expected)).toBe(true);
    }
  });

  // ============================================================
  // Test 2: Followers = 0 seeds at 50
  // ============================================================
  test('followers = 0 seeds at 50', () => {
    const inputs = makeInputs({ followers: 0 });
    const result = calculateProjections(inputs);

    // Month 1 should be based on 50, not 0
    expect(result.monthly[0].expected).toBeGreaterThan(50);
    expect(result.monthly[0].expected).toBeLessThan(200);
  });

  // ============================================================
  // Test 3: High engagement capped at 2.5x multiplier
  // ============================================================
  test('high engagement capped at 2.5x', () => {
    // 50% / 8% avg = 6.25x, should be capped at 2.5x
    // 20% / 8% avg = 2.5x exactly
    const highEngInputs = makeInputs({ engagementRate: 50 });
    const cappedInputs = makeInputs({ engagementRate: 20 });

    const highResult = calculateProjections(highEngInputs);
    const cappedResult = calculateProjections(cappedInputs);

    // Both should produce same results since engagement is capped at 2.5x
    expect(highResult.summary.expected).toBe(cappedResult.summary.expected);
  });

  // ============================================================
  // Test 4: Low engagement (<2%) — no errors
  // ============================================================
  test('low engagement (<2%) returns valid low growth', () => {
    const inputs = makeInputs({ engagementRate: 1 });
    const result = calculateProjections(inputs);

    expect(result.summary.expected).toBeGreaterThan(1000);
    expect(result.summary.expected).toBeLessThan(2000);
    for (const m of result.monthly) {
      expect(Number.isFinite(m.expected)).toBe(true);
      expect(m.expected).toBeGreaterThan(0);
    }
  });

  // ============================================================
  // Test 5: Posts/week = 1 — frequency multiplier floor
  // ============================================================
  test('posts/week = 1 produces valid growth', () => {
    const inputs = makeInputs({ postsPerWeek: 1 });
    const result = calculateProjections(inputs);

    expect(result.summary.expected).toBeGreaterThan(1000);
    expect(result.summary.expected).toBeLessThan(result.summary.optimistic);
  });

  // ============================================================
  // Test 6: Posts/week = 30 capped at 1.5x frequency multiplier
  // ============================================================
  test('posts/week = 30 capped at 1.5x frequency multiplier', () => {
    const at10 = makeInputs({ postsPerWeek: 10 }); // 0.5 + 10/10 = 1.5
    const at30 = makeInputs({ postsPerWeek: 30 }); // 0.5 + 30/10 = 3.5, capped at 1.5

    const result10 = calculateProjections(at10);
    const result30 = calculateProjections(at30);

    expect(result30.summary.expected).toBe(result10.summary.expected);
  });

  // ============================================================
  // Test 7: Near capacity — dampening kicks in
  // ============================================================
  test('near capacity: growth approaches zero', () => {
    const niche = getNicheById('business'); // capacity 200K
    const inputs = makeInputs({ followers: 190_000, niche });
    const result = calculateProjections(inputs);

    const growthPct = (result.summary.expected - 190_000) / 190_000;
    expect(growthPct).toBeLessThan(0.3);
  });

  // ============================================================
  // Test 8: All 10 niches produce valid output
  // ============================================================
  test('all 10 niches produce valid output (no NaN, no negatives, no Infinity)', () => {
    for (const niche of NICHE_DATA) {
      const inputs = makeInputs({ niche: { ...niche } });
      const result = calculateProjections(inputs);

      for (const m of result.monthly) {
        expect(Number.isFinite(m.conservative)).toBe(true);
        expect(Number.isFinite(m.expected)).toBe(true);
        expect(Number.isFinite(m.optimistic)).toBe(true);
        expect(m.conservative).toBeGreaterThan(0);
        expect(m.expected).toBeGreaterThan(0);
        expect(m.optimistic).toBeGreaterThan(0);
      }
    }
  });

  // ============================================================
  // Test 11: Conservative = 0.6x expected rate
  // ============================================================
  test('conservative scenario uses 0.6x rate', () => {
    const inputs = makeInputs({ followers: 5000 });
    const rate = calculateEffectiveRate(5000, 8, 3, inputs.niche);

    const expectedMonth1 = Math.round(5000 * (1 + rate));
    const conservativeMonth1 = Math.round(5000 * (1 + rate * 0.6));

    const result = calculateProjections(inputs);
    expect(result.monthly[0].conservative).toBe(conservativeMonth1);
    expect(result.monthly[0].expected).toBe(expectedMonth1);
  });

  // ============================================================
  // Test 12: Optimistic = 1.5x expected rate
  // ============================================================
  test('optimistic scenario uses 1.5x rate', () => {
    const inputs = makeInputs({ followers: 5000 });
    const rate = calculateEffectiveRate(5000, 8, 3, inputs.niche);

    const optimisticMonth1 = Math.round(5000 * (1 + rate * 1.5));

    const result = calculateProjections(inputs);
    expect(result.monthly[0].optimistic).toBe(optimisticMonth1);
  });
});

// ============================================================
// Test 9: Monetization at milestones
// ============================================================
describe('calculateMonetization', () => {
  test('revenue = followers * convRate * avgPrice * 0.9', () => {
    const niche = getNicheById('education'); // conv=5%, price=$4
    const revenue = calculateMonetization(100_000, niche);
    // 100000 * 0.05 * 4 * 0.9 = 18000
    expect(revenue).toBeCloseTo(18000, 0);
  });

  test('revenue is 0 for 0 followers', () => {
    const niche = getNicheById('general');
    expect(calculateMonetization(0, niche)).toBe(0);
  });
});

// ============================================================
// Test 10: Benchmark percentile
// ============================================================
describe('calculateBenchmark', () => {
  test('high engagement + high frequency = Top 5%', () => {
    const inputs = makeInputs({ engagementRate: 20, postsPerWeek: 14 });
    const result = calculateBenchmark(inputs);
    expect(result.label).toBe('Top 5%');
    expect(result.percentile).toBeGreaterThanOrEqual(90);
  });

  test('average engagement + average frequency = Average or Above Average', () => {
    const inputs = makeInputs({ engagementRate: 8, postsPerWeek: 5 });
    const result = calculateBenchmark(inputs);
    expect(['Average', 'Above Average']).toContain(result.label);
  });

  test('low engagement + low frequency = Below Average', () => {
    const inputs = makeInputs({ engagementRate: 2, postsPerWeek: 1 });
    const result = calculateBenchmark(inputs);
    expect(result.label).toBe('Below Average');
  });

  test('returns valid engagementVsNiche ratio', () => {
    const inputs = makeInputs({ engagementRate: 16 }); // 16/8 = 2.0
    const result = calculateBenchmark(inputs);
    expect(result.engagementVsNiche).toBeCloseTo(2.0, 1);
  });
});

// ============================================================
// Milestones
// ============================================================
describe('calculateMilestones', () => {
  test('only returns milestones above current followers', () => {
    const inputs = makeInputs({ followers: 60_000 });
    const projections = calculateProjections(inputs);
    const milestones = calculateMilestones(inputs, projections);

    expect(milestones.every((m) => m.target > 60_000)).toBe(true);
  });

  test('milestone revenue estimate uses niche data', () => {
    const niche = getNicheById('tech'); // conv=4%, price=$3
    const inputs = makeInputs({ followers: 1000, niche });
    const projections = calculateProjections(inputs);
    const milestones = calculateMilestones(inputs, projections);

    const m10k = milestones.find((m) => m.target === 10_000);
    expect(m10k).toBeDefined();
    // 10000 * 0.04 * 3 * 0.9 = 1080
    expect(m10k!.revenueEstimate).toBeCloseTo(1080, 0);
  });
});

// ============================================================
// Tips
// ============================================================
describe('generateTips', () => {
  test('low engagement generates high-impact tip', () => {
    const inputs = makeInputs({ engagementRate: 2 });
    const tips = generateTips(inputs);
    expect(tips.some((t) => t.priority === 'High Impact')).toBe(true);
  });

  test('returns max 4 tips', () => {
    const inputs = makeInputs({ engagementRate: 1, postsPerWeek: 1, followers: 50 });
    const tips = generateTips(inputs);
    expect(tips.length).toBeLessThanOrEqual(4);
  });
});

// ============================================================
// Helpers
// ============================================================
describe('formatFollowerCount', () => {
  test('formats millions', () => expect(formatFollowerCount(1_000_000)).toBe('1M'));
  test('formats thousands', () => expect(formatFollowerCount(50_000)).toBe('50K'));
  test('formats small numbers', () => expect(formatFollowerCount(500)).toBe('500'));
});
