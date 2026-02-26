import data from '../wa-vs-tg-comparison.json';

describe('wa-vs-tg-comparison.json', () => {
  // Test 1
  it('parses without error and has expected top-level keys', () => {
    expect(data).toHaveProperty('lastUpdated');
    expect(data).toHaveProperty('features');
    expect(data).toHaveProperty('verdicts');
    expect(data).toHaveProperty('categories');
  });

  // Test 2
  it('contains exactly 29 features', () => {
    expect(data.features).toHaveLength(29);
  });

  // Test 3
  it('all features have required fields', () => {
    const requiredFields = [
      'id', 'feature', 'category', 'whatsapp', 'telegram',
      'winner', 'creatorRelevant', 'businessRelevant', 'personalRelevant'
    ];
    data.features.forEach((f, i) => {
      requiredFields.forEach(field => {
        expect(f).toHaveProperty(field);
      });
      // Sub-fields
      expect(f.whatsapp).toHaveProperty('score');
      expect(f.whatsapp).toHaveProperty('summary');
      expect(f.whatsapp).toHaveProperty('detail');
      expect(f.telegram).toHaveProperty('score');
      expect(f.telegram).toHaveProperty('summary');
      expect(f.telegram).toHaveProperty('detail');
    });
  });

  // Test 4
  it('all scores are integers between 1 and 5', () => {
    data.features.forEach((f) => {
      [f.whatsapp.score, f.telegram.score].forEach(score => {
        expect(Number.isInteger(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(5);
      });
    });
  });

  // Test 5
  it('all winners are valid enum values', () => {
    const validWinners = ['whatsapp', 'telegram', 'tie', 'depends'];
    data.features.forEach((f) => {
      expect(validWinners).toContain(f.winner);
    });
  });

  // Test 6
  it('all categories are valid enum values', () => {
    const validCategories = [
      'reach', 'channels', 'content_tools', 'monetization',
      'automation', 'privacy', 'groups', 'growth'
    ];
    data.features.forEach((f) => {
      expect(validCategories).toContain(f.category);
    });
  });

  // Test 7
  it('creator view has at least 15 features', () => {
    const count = data.features.filter(f => f.creatorRelevant).length;
    expect(count).toBeGreaterThanOrEqual(15);
  });

  // Test 8
  it('business view has at least 15 features', () => {
    const count = data.features.filter(f => f.businessRelevant).length;
    expect(count).toBeGreaterThanOrEqual(15);
  });

  // Test 9
  it('personal view has at least 12 features', () => {
    const count = data.features.filter(f => f.personalRelevant).length;
    expect(count).toBeGreaterThanOrEqual(12);
  });

  // Test 10 — fairness check
  it('Telegram wins at least 10 features (fairness)', () => {
    const tgWins = data.features.filter(f => f.winner === 'telegram').length;
    expect(tgWins).toBeGreaterThanOrEqual(10);
  });

  // Test 11
  it('lastUpdated is present and matches YYYY-MM format', () => {
    expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}$/);
  });

  // Test 12
  it('has 3 verdicts (creator, business, personal) with required fields', () => {
    expect(data.verdicts).toHaveLength(3);
    const useCases = data.verdicts.map(v => v.useCase);
    expect(useCases).toContain('creator');
    expect(useCases).toContain('business');
    expect(useCases).toContain('personal');
    data.verdicts.forEach(v => {
      expect(v).toHaveProperty('headline');
      expect(v).toHaveProperty('summary');
      expect(v).toHaveProperty('cta');
      expect(v).toHaveProperty('ctaLink');
      expect(v.headline.length).toBeGreaterThan(10);
      expect(v.summary.length).toBeGreaterThan(50);
    });
  });
});
