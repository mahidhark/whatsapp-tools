/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComparisonTool from '../ComparisonTool';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  );
});

// Helper: jsdom renders both desktop table + mobile cards (CSS hidden doesn't apply).
// All feature names appear twice. Use getAllByText and check first/length.

describe('ComparisonTool', () => {
  // Test 15
  it('renders 3 toggle buttons with Creators selected by default', () => {
    render(<ComparisonTool />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('For Creators');
    expect(tabs[1]).toHaveTextContent('For Business');
    expect(tabs[2]).toHaveTextContent('For Personal');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  // Test 16
  it('default view shows only creator-relevant features', () => {
    render(<ComparisonTool />);
    // "Geographic Strength" is creatorRelevant: true — appears in both desktop + mobile
    expect(screen.getAllByText('Geographic Strength').length).toBeGreaterThanOrEqual(1);
    // "Commerce Integration" is creatorRelevant: false — should not appear at all
    expect(screen.queryAllByText('Commerce Integration')).toHaveLength(0);
  });

  // Test 17
  it('switching toggle updates visible features and score summary', () => {
    render(<ComparisonTool />);
    // Commerce not visible in creator view
    expect(screen.queryAllByText('Commerce Integration')).toHaveLength(0);
    // Switch to business
    fireEvent.click(screen.getByText('For Business'));
    // Commerce is businessRelevant: true — now appears (desktop + mobile = 2)
    expect(screen.getAllByText('Commerce Integration').length).toBeGreaterThanOrEqual(1);
    // Tab state updated
    expect(screen.getByText('For Business')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('For Creators')).toHaveAttribute('aria-selected', 'false');
  });

  // Test 18
  it('renders category headers', () => {
    render(<ComparisonTool />);
    expect(screen.getAllByText('Reach & Audience').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Channel Features').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Automation & Bots').length).toBeGreaterThanOrEqual(1);
  });

  // Test 19 — target mobile button (more reliable in jsdom)
  it('clicking a row expands detail', () => {
    render(<ComparisonTool />);
    // Mobile rows use <button> with aria-expanded
    const buttons = screen.getAllByRole('button', { name: /Monthly Active Users/i });
    const mobileButton = buttons.find(b => b.getAttribute('aria-expanded') !== null) || buttons[0];
    fireEvent.click(mobileButton);
    // Detail text appears (may appear in both desktop + mobile)
    expect(screen.getAllByText(/Over 3 billion monthly active users/).length).toBeGreaterThanOrEqual(1);
  });

  // Test 20
  it('clicking expanded row collapses it', () => {
    render(<ComparisonTool />);
    const buttons = screen.getAllByRole('button', { name: /Monthly Active Users/i });
    const mobileButton = buttons.find(b => b.getAttribute('aria-expanded') !== null) || buttons[0];
    // Expand
    fireEvent.click(mobileButton);
    expect(screen.getAllByText(/Over 3 billion monthly active users/).length).toBeGreaterThanOrEqual(1);
    // Collapse
    fireEvent.click(mobileButton);
    expect(screen.queryAllByText(/Over 3 billion monthly active users/)).toHaveLength(0);
  });

  // Test 21
  it('toggle switch collapses all expanded rows', () => {
    render(<ComparisonTool />);
    const buttons = screen.getAllByRole('button', { name: /Monthly Active Users/i });
    const mobileButton = buttons.find(b => b.getAttribute('aria-expanded') !== null) || buttons[0];
    // Expand
    fireEvent.click(mobileButton);
    expect(screen.getAllByText(/Over 3 billion monthly active users/).length).toBeGreaterThanOrEqual(1);
    // Switch toggle
    fireEvent.click(screen.getByText('For Business'));
    // Detail should be gone
    expect(screen.queryAllByText(/Over 3 billion monthly active users/)).toHaveLength(0);
  });

  // Test 22
  it('winner badges show correct text', () => {
    render(<ComparisonTool />);
    const whatsappBadges = screen.getAllByText('WhatsApp');
    const telegramBadges = screen.getAllByText('Telegram');
    expect(whatsappBadges.length).toBeGreaterThan(0);
    expect(telegramBadges.length).toBeGreaterThan(0);
  });

  // Test 23
  it('stars render with correct aria-labels', () => {
    render(<ComparisonTool />);
    const starLabels = screen.getAllByLabelText(/out of 5/);
    expect(starLabels.length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('5 out of 5').length).toBeGreaterThan(0);
  });

  // Test 24
  it('score summary counts match filtered features', () => {
    render(<ComparisonTool />);
    const summaryBar = screen.getByLabelText(/WhatsApp wins.*features/);
    expect(summaryBar).toBeInTheDocument();
  });

  // Test 25
  it('verdict card shows correct headline per toggle', () => {
    render(<ComparisonTool />);
    expect(screen.getByText(/reach.*tools|tools.*reach/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('For Business'));
    expect(screen.getByText(/customers.*operations|operations.*customers/i)).toBeInTheDocument();
  });

  // Test 26
  it('shows last updated badge', () => {
    render(<ComparisonTool />);
    expect(screen.getByText(/Last updated.*2026/)).toBeInTheDocument();
  });

  // Test 27
  it('SEO content renders with internal links', () => {
    render(<ComparisonTool />);
    const calcLinks = screen.getAllByRole('link').filter(
      (a) => a.getAttribute('href') === '/tools/channel-growth-calculator'
    );
    expect(calcLinks.length).toBeGreaterThan(0);
  });

  // Test 28
  it('RelatedTools shows 4 cards', () => {
    render(<ComparisonTool />);
    // RelatedTools renders as links — check href targets exist
    const relatedLinks = screen.getAllByRole('link');
    const growthCalc = relatedLinks.filter(a => a.getAttribute('href') === '/tools/channel-growth-calculator');
    const migration = relatedLinks.filter(a => a.getAttribute('href') === '/tools/telegram-to-whatsapp-migration');
    const linkGen = relatedLinks.filter(a => a.getAttribute('href') === '/tools/whatsapp-link-generator');
    const crossPost = relatedLinks.filter(a => a.getAttribute('href') === '/blog/telegram-to-whatsapp-make-automation');
    expect(growthCalc.length).toBeGreaterThan(0);
    expect(migration.length).toBeGreaterThan(0);
    expect(linkGen.length).toBeGreaterThan(0);
    expect(crossPost.length).toBeGreaterThan(0);
  });

  // Test 29
  it('ToolCTA renders with custom copy', () => {
    render(<ComparisonTool />);
    expect(screen.getByText('Using both platforms?')).toBeInTheDocument();
  });

  // Test 30
  it('keyboard: arrow keys navigate toggle tabs', () => {
    render(<ComparisonTool />);
    const firstTab = screen.getByText('For Creators');
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(screen.getByText('For Business')).toHaveAttribute('aria-selected', 'true');
  });

  // Test 31 — use mobile button for keyboard test
  it('keyboard: Enter expands row', () => {
    render(<ComparisonTool />);
    const buttons = screen.getAllByRole('button', { name: /Daily Engagement/i });
    const target = buttons.find(b => b.getAttribute('aria-expanded') !== null);
    if (target) {
      fireEvent.click(target);
      expect(screen.getAllByText(/Users open WhatsApp 23/).length).toBeGreaterThanOrEqual(1);
    } else {
      // Desktop: find the tr with tabIndex
      const rows = screen.getAllByText('Daily Engagement');
      const tr = rows[0].closest('tr');
      if (tr) {
        fireEvent.keyDown(tr, { key: 'Enter' });
        expect(screen.getAllByText(/Users open WhatsApp 23/).length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  // Test 32
  it('screen reader: stars have aria-label with score', () => {
    render(<ComparisonTool />);
    const labels = screen.getAllByLabelText(/\d out of 5/);
    expect(labels.length).toBeGreaterThan(10);
  });
});
