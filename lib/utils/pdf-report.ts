// lib/utils/pdf-report.ts
// Client-side PDF generation for Channel Growth Calculator (Tool #4)
// Uses jsPDF — generates fresh PDF on each download, zero server cost

import jsPDF from 'jspdf';
import {
  type GrowthInputs,
  type GrowthProjections,
  type Milestone,
  type BenchmarkResult,
  calculateMonetization,
  generateTips,
  formatFollowerCount,
  formatCurrency,
  formatCommaNumber,
} from '@/lib/utils/growth-model';

// ============================================================
// PDF Generation
// ============================================================

export async function generateGrowthPDF(
  inputs: GrowthInputs,
  projections: GrowthProjections,
  milestones: Milestone[],
  benchmark: BenchmarkResult,
  chartRef: React.RefObject<HTMLDivElement | null>
): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = margin;
    }
  };

  const addFooter = () => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('WhatsScale | whatsscale.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(
      'Generated ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  };

  // ============================================================
  // Page 1: Header + Chart + Summary
  // ============================================================

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175);
  doc.text('WhatsApp Channel Growth Report', margin, y);
  y += 10;

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(inputs.niche.label + ' Niche | ' + formatCommaNumber(inputs.followers) + ' Followers', margin, y);
  y += 12;

  // Input summary
  doc.setFontSize(10);
  doc.setTextColor(60);
  const seedLabel = inputs.followers === 0 ? ' (seeded from 0)' : '';
  const startCount = inputs.followers === 0 ? 50 : inputs.followers;
  const inputLines = [
    'Current Followers: ' + formatCommaNumber(startCount) + seedLabel,
    'Posts per Week: ' + inputs.postsPerWeek,
    'Engagement Rate: ' + inputs.engagementRate + '% (Niche avg: ' + inputs.niche.avgEngagement + '%)',
    'Benchmark: ' + benchmark.label + ' (' + benchmark.percentile + 'th percentile)',
  ];
  for (const line of inputLines) {
    doc.text(line, margin, y);
    y += 5;
  }
  y += 5;

  // Chart image
  if (chartRef.current) {
    try {
      const svg = chartRef.current.querySelector('svg');
      if (svg) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.scale(2, 2);
              ctx.drawImage(img, 0, 0);
            }
            resolve();
          };
          img.onerror = reject;
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });

        const imgData = canvas.toDataURL('image/png');
        const chartHeight = (contentWidth * canvas.height) / canvas.width;
        doc.addImage(imgData, 'PNG', margin, y, contentWidth, Math.min(chartHeight, 80));
        y += Math.min(chartHeight, 80) + 8;
      }
    } catch (err) {
      console.warn('Could not embed chart in PDF:', err);
    }
  }

  // ============================================================
  // 12-Month Projection Summary
  // ============================================================
  addPageIfNeeded(30);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('12-Month Projection Summary', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60);
  const scenarioSummary = [
    'Conservative: ' + formatCommaNumber(projections.summary.conservative) + ' followers (' + formatCurrency(calculateMonetization(projections.summary.conservative, inputs.niche)) + '/mo)',
    'Expected: ' + formatCommaNumber(projections.summary.expected) + ' followers (' + formatCurrency(calculateMonetization(projections.summary.expected, inputs.niche)) + '/mo)',
    'Optimistic: ' + formatCommaNumber(projections.summary.optimistic) + ' followers (' + formatCurrency(calculateMonetization(projections.summary.optimistic, inputs.niche)) + '/mo)',
  ];
  for (const line of scenarioSummary) {
    doc.text(line, margin, y);
    y += 5;
  }
  y += 8;

  // ============================================================
  // Month-by-Month Table (GATED)
  // ============================================================
  addPageIfNeeded(80);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Month-by-Month Projections', margin, y);
  y += 8;

  // Table header
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, y - 4, contentWidth, 7, 'F');
  doc.text('Month', margin + 3, y);
  doc.text('Conservative', margin + 35, y);
  doc.text('Expected', margin + 75, y);
  doc.text('Optimistic', margin + 110, y);
  doc.text('Est. Revenue', margin + 140, y);
  y += 6;

  // Table rows
  doc.setTextColor(60);
  for (const m of projections.monthly) {
    addPageIfNeeded(8);
    if (m.month % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, contentWidth, 6, 'F');
    }
    doc.text('Month ' + m.month, margin + 3, y);
    doc.text(formatCommaNumber(m.conservative), margin + 35, y);
    doc.text(formatCommaNumber(m.expected), margin + 75, y);
    doc.text(formatCommaNumber(m.optimistic), margin + 110, y);
    doc.text(formatCurrency(calculateMonetization(m.expected, inputs.niche)), margin + 140, y);
    y += 6;
  }
  y += 8;

  // ============================================================
  // Milestone Revenue Breakdown (GATED)
  // ============================================================
  if (milestones.length > 0) {
    addPageIfNeeded(40);
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text('Monetization Milestones', margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Based on Meta Cannes Lions 2025 announcement (10% revenue cut). Estimates only.', margin, y);
    y += 7;

    for (const m of milestones) {
      addPageIfNeeded(12);
      doc.setFontSize(10);
      doc.setTextColor(60);
      const timeline = m.monthExpected ? 'Expected: Month ' + m.monthExpected : 'Beyond 12 months';
      doc.text(
        m.label + ' followers -> ' + formatCurrency(m.revenueEstimate) + '/mo | ' + timeline,
        margin,
        y
      );
      y += 6;
    }
    y += 8;
  }

  // ============================================================
  // Niche Comparison (GATED)
  // ============================================================
  addPageIfNeeded(30);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Your Metrics vs Niche Average', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60);
  const engDiff = ((benchmark.engagementVsNiche - 1) * 100).toFixed(0);
  const freqDiff = ((benchmark.frequencyVsNiche - 1) * 100).toFixed(0);
  const comparisons = [
    'Engagement Rate: ' + inputs.engagementRate + '% vs ' + inputs.niche.avgEngagement + '% avg (' + (benchmark.engagementVsNiche >= 1 ? '+' : '') + engDiff + '%)',
    'Posting Frequency: ' + inputs.postsPerWeek + '/wk vs 5/wk avg (' + (benchmark.frequencyVsNiche >= 1 ? '+' : '') + freqDiff + '%)',
    'Benchmark: ' + benchmark.label + ' (' + benchmark.percentile + 'th percentile in ' + inputs.niche.label + ')',
  ];
  for (const line of comparisons) {
    doc.text(line, margin, y);
    y += 5;
  }
  y += 8;

  // ============================================================
  // Personalized Tips (GATED)
  // ============================================================
  addPageIfNeeded(40);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Personalized Recommendations', margin, y);
  y += 8;

  const tips = generateTips(inputs);
  for (const tip of tips) {
    addPageIfNeeded(15);
    doc.setFontSize(9);
    if (tip.priority === 'High Impact') {
      doc.setTextColor(220, 38, 38);
    } else if (tip.priority === 'Medium') {
      doc.setTextColor(59, 130, 246);
    } else {
      doc.setTextColor(100, 100, 100);
    }
    doc.text('[' + tip.priority + ']', margin, y);
    doc.setTextColor(60);
    const tipLines = doc.splitTextToSize(tip.text, contentWidth - 30);
    doc.text(tipLines, margin + 25, y);
    y += tipLines.length * 5 + 4;
  }
  y += 5;

  // ============================================================
  // 30/60/90 Day Action Plan (GATED)
  // ============================================================
  addPageIfNeeded(50);
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('30 / 60 / 90 Day Action Plan', margin, y);
  y += 8;

  const actionPlan = generateActionPlan(inputs);
  for (const phase of actionPlan) {
    addPageIfNeeded(25);
    doc.setFontSize(11);
    doc.setTextColor(30, 64, 175);
    doc.text(phase.label, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(60);
    for (const action of phase.actions) {
      const actionLines = doc.splitTextToSize('- ' + action, contentWidth - 5);
      doc.text(actionLines, margin + 3, y);
      y += actionLines.length * 4.5 + 2;
    }
    y += 4;
  }

  // ============================================================
  // CTA Page
  // ============================================================
  doc.addPage();
  y = 60;

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('Want Real Data Instead of Estimates?', pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFontSize(11);
  doc.setTextColor(80);
  const ctaLines = doc.splitTextToSize(
    'Connect your WhatsApp Channel in WhatsScale to get real-time analytics: actual engagement rates, optimal posting times, subscriber growth trends, and audience insights. Replace estimates with data.',
    contentWidth - 20
  );
  doc.text(ctaLines, pageWidth / 2, y, { align: 'center' });
  y += ctaLines.length * 6 + 10;

  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.textWithLink('Get started at whatsscale.com', pageWidth / 2, y, {
    url: 'https://www.whatsscale.com?utm_source=pdf&utm_medium=growth-calculator',
    align: 'center',
  });

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  return doc.output('blob');
}

// ============================================================
// 30/60/90 Action Plan Generator
// ============================================================

interface ActionPhase {
  label: string;
  actions: string[];
}

function generateActionPlan(inputs: GrowthInputs): ActionPhase[] {
  const { followers, postsPerWeek, engagementRate, niche } = inputs;
  const plan: ActionPhase[] = [];

  // 30 days
  const day30: string[] = [];
  if (followers < 100) {
    day30.push('Share your channel link on all social media profiles, website, and email signature');
    day30.push('Post your first 12-15 updates to establish a content rhythm');
    day30.push('Promote your channel in 3-5 relevant WhatsApp groups');
  } else {
    day30.push('Establish a consistent posting schedule: ' + Math.min(postsPerWeek, 7) + ' posts per week');
    day30.push('Analyze your top 5 performing posts — identify what drives reactions');
    day30.push('Create a content calendar for the next 30 days');
  }
  plan.push({ label: 'First 30 Days — Foundation', actions: day30 });

  // 60 days
  const day60: string[] = [];
  if (engagementRate < niche.avgEngagement) {
    day60.push('Focus on engagement: experiment with polls, questions, and time-sensitive content to reach ' + niche.avgEngagement + '% avg');
  } else {
    day60.push('Double down on what works: analyze your highest-engagement content formats');
  }
  if (postsPerWeek < 5) {
    day60.push('Increase posting frequency gradually — aim for 5 posts per week');
  } else {
    day60.push('Set up content automation: connect YouTube/blog/RSS to auto-post via Make.com + WhatsScale');
  }
  day60.push('Cross-promote with 2-3 complementary channels in your niche');
  plan.push({ label: 'Days 31-60 — Growth', actions: day60 });

  // 90 days
  const day90: string[] = [];
  day90.push('Review 90-day growth against projections — adjust strategy based on actual data');
  if (followers >= 10000 || (followers >= 1000 && postsPerWeek >= 5)) {
    day90.push('Prepare for monetization: segment your audience, test premium content previews');
  }
  day90.push('Set up content archiving (WhatsApp deletes after 30 days) — automate to Google Sheets or Notion');
  plan.push({ label: 'Days 61-90 — Optimize & Scale', actions: day90 });

  return plan;
}
