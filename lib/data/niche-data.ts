// lib/data/niche-data.ts
// Static niche data for Channel Growth Calculator (Tool #4)
// Used by: growth-model.ts, pdf-report.ts, GrowthCalculator.tsx, SEO content

export interface NicheData {
  id: string;
  label: string;
  avgEngagement: number; // percentage (e.g., 8 = 8%)
  avgSubPrice: number; // USD monthly
  convRate: number; // percentage (e.g., 3 = 3%)
  capacity: number; // max followers (logistic dampening ceiling)
}

export const NICHE_DATA: readonly NicheData[] = [
  { id: 'general', label: 'General', avgEngagement: 8, avgSubPrice: 2, convRate: 3, capacity: 300_000 },
  { id: 'tech', label: 'Tech', avgEngagement: 6, avgSubPrice: 3, convRate: 4, capacity: 300_000 },
  { id: 'education', label: 'Education', avgEngagement: 10, avgSubPrice: 4, convRate: 5, capacity: 500_000 },
  { id: 'entertainment', label: 'Entertainment', avgEngagement: 12, avgSubPrice: 1.5, convRate: 2, capacity: 1_000_000 },
  { id: 'news', label: 'News', avgEngagement: 15, avgSubPrice: 2, convRate: 3, capacity: 2_000_000 },
  { id: 'sports', label: 'Sports', avgEngagement: 14, avgSubPrice: 2, convRate: 3, capacity: 1_500_000 },
  { id: 'business', label: 'Business / Finance', avgEngagement: 7, avgSubPrice: 5, convRate: 4, capacity: 200_000 },
  { id: 'health', label: 'Health', avgEngagement: 9, avgSubPrice: 3, convRate: 3, capacity: 300_000 },
  { id: 'food', label: 'Food', avgEngagement: 11, avgSubPrice: 2, convRate: 2, capacity: 400_000 },
  { id: 'fashion', label: 'Fashion', avgEngagement: 8, avgSubPrice: 2, convRate: 2, capacity: 250_000 },
] as const;

export const getNicheById = (id: string): NicheData =>
  NICHE_DATA.find((n) => n.id === id) ?? NICHE_DATA[0];

export const NICHE_OPTIONS = NICHE_DATA.map((n) => ({ value: n.id, label: n.label }));
