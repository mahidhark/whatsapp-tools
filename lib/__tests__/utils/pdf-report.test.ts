// lib/__tests__/utils/pdf-report.test.ts
// Tests for PDF report generation (Tool #4)

import {
  calculateProjections,
  calculateMilestones,
  calculateBenchmark,
  type GrowthInputs,
} from '../../utils/growth-model';
import { getNicheById } from '../../data/niche-data';

// We test generateGrowthPDF in jsdom environment since it uses jsPDF
// These tests validate the inputs/outputs contract without full DOM rendering

function makeInputs(overrides: Partial<GrowthInputs> = {}): GrowthInputs {
  return {
    followers: 5000,
    postsPerWeek: 5,
    engagementRate: 10,
    niche: getNicheById('education'),
    ...overrides,
  };
}

describe('pdf-report data contract', () => {
  // Test 13: PDF inputs produce valid projections
  test('inputs produce valid projections for PDF', () => {
    const inputs = makeInputs();
    const projections = calculateProjections(inputs);
    const milestones = calculateMilestones(inputs, projections);
    const benchmark = calculateBenchmark(inputs);

    // All data required by generateGrowthPDF exists and is valid
    expect(projections.monthly).toHaveLength(12);
    expect(projections.summary.expected).toBeGreaterThan(0);
    expect(milestones.length).toBeGreaterThan(0);
    expect(benchmark.label).toBeTruthy();
    expect(benchmark.percentile).toBeGreaterThan(0);
  });

  // Test 14: All 12 months x 3 scenarios present
  test('all 12 months x 3 scenarios present for PDF table', () => {
    const inputs = makeInputs();
    const projections = calculateProjections(inputs);

    for (const m of projections.monthly) {
      expect(m.month).toBeGreaterThanOrEqual(1);
      expect(m.month).toBeLessThanOrEqual(12);
      expect(Number.isFinite(m.conservative)).toBe(true);
      expect(Number.isFinite(m.expected)).toBe(true);
      expect(Number.isFinite(m.optimistic)).toBe(true);
    }
  });

  // Test 15: Milestones above current followers shown
  test('milestones only include targets above current followers', () => {
    const inputs = makeInputs({ followers: 60_000 });
    const projections = calculateProjections(inputs);
    const milestones = calculateMilestones(inputs, projections);

    for (const m of milestones) {
      expect(m.target).toBeGreaterThan(60_000);
      expect(m.revenueEstimate).toBeGreaterThan(0);
    }
  });

  // Test 16: Tips generated based on input values
  test('tips are generated for PDF', () => {
    const { generateTips } = require('../../utils/growth-model');
    const inputs = makeInputs({ engagementRate: 3, postsPerWeek: 2 });
    const tips = generateTips(inputs);

    expect(tips.length).toBeGreaterThanOrEqual(1);
    expect(tips.length).toBeLessThanOrEqual(4);
    for (const tip of tips) {
      expect(tip.text).toBeTruthy();
      expect(['High Impact', 'Medium', 'Low']).toContain(tip.priority);
    }
  });

  // Test 17: Zero followers produces valid PDF data
  test('zero followers produces valid PDF data with seed', () => {
    const inputs = makeInputs({ followers: 0 });
    const projections = calculateProjections(inputs);
    const milestones = calculateMilestones(inputs, projections);
    const benchmark = calculateBenchmark(inputs);

    expect(projections.monthly[0].expected).toBeGreaterThan(50);
    expect(milestones.length).toBeGreaterThan(0);
    expect(benchmark.label).toBeTruthy();
  });
});
