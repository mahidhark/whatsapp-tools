# WhatsApp Tools — Architecture

## Overview

12 free client-side WhatsApp tools for SEO and domain ranking. Each tool is a standalone page that runs entirely in the browser — no API calls, no backend, no authentication, no data collection.

**Live at:** [whatsscale.com/tools](https://www.whatsscale.com/tools)

## Design Principles

1. **Zero backend** — all logic runs client-side in the browser
2. **Privacy first** — no data leaves the device, no cookies, no tracking
3. **SEO optimized** — each tool targets high-volume keywords with structured data
4. **Mobile first** — responsive design, touch-friendly inputs
5. **Shared components** — build once, reuse across all 12 tools
6. **Incremental build** — shared components added only when their first consumer is built

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| QR Generation | qrcode (npm) |
| Testing | Jest + React Testing Library |
| Deployment | PM2 + Nginx on Ubuntu |

## Routing & Layout
```
URL Structure:
/tools                              → Tools index (grid of all tool cards)
/tools/whatsapp-link-generator      → Tool #1
/tools/whatsapp-message-formatter   → Tool #2 (planned)
/tools/[slug]                       → Tool #N

File Structure:
app/tools/
├── layout.tsx                      → Shared layout (lighter nav + footer)
├── page.tsx                        → Index page (server component)
└── [slug]/
    ├── page.tsx                    → SEO metadata (server component)
    └── [Component].tsx             → Tool logic (client component)
```

### Layout Strategy

Tools use a dedicated layout separate from the main marketing site:

| Element | Marketing Layout | Tools Layout |
|---------|-----------------|--------------|
| Navbar | Full nav (8+ links) | Lighter: logo + "All Tools" + "Back to WhatsScale" |
| Footer | Full footer | Same full footer (SEO internal links) |
| Purpose | Product pages, blog, docs | Tool pages only |

## Shared Components

Located in `components/tools/`. Built incrementally — only created when first consumer needs them.

### Built (5 components)

| Component | File | Purpose | Used By |
|-----------|------|---------|---------|
| CopyButton | `CopyButton.tsx` | Click → clipboard → "Copied!" (2s) → revert. Fallback for older browsers via textarea hack. | All tools |
| SEOContent | `SEOContent.tsx` | Below-fold wrapper. Renders H2 content sections (supports React.ReactNode for JSX/links) + FAQ accordion. Injects schema.org FAQPage JSON-LD for rich results. | All tools |
| ToolCTA | `ToolCTA.tsx` | Soft pitch card: "Need to automate this?" Links to WhatsScale signup. Customizable heading, description, button text. | All tools |
| RelatedTools | `RelatedTools.tsx` | Grid of 3-4 related tool cards. Takes array of {name, href, emoji, description}. Returns null for empty array. | All tools |
| PrivacyBadge | `PrivacyBadge.tsx` | Shield SVG icon + "Works offline. Your data stays on your device." | All tools |

### Deferred (2 components)

| Component | First Consumer | Purpose |
|-----------|---------------|---------|
| WhatsAppPreview | Tool #2 (Message Formatter) | Chat bubble mockup with #DCF8C6 background, rounded corners |
| CharacterCounter | Tool #2 (Message Formatter) | Live char/word/byte count with color-coded limit bars |

## Data

### Country Codes (`lib/data/country-codes.json`)

Static JSON file with 240+ countries. Each entry:
```json
{"code": "IN", "name": "India", "dial": "91", "flag": "🇮🇳"}
```

**Smart sorting in UI:**
1. Detect user locale via `navigator.language` → show their country first
2. Pin top WhatsApp markets: India, Brazil, Indonesia, Nigeria, UK, US
3. Alphabetical for the rest

## Tool Pattern

Every tool follows the same two-file pattern:

### Server Component (`page.tsx`)
- Exports `metadata` for SEO (title, description, keywords, OpenGraph)
- Renders the client component
- No logic, no state, no interactivity

### Client Component (`[Tool].tsx`)
- `'use client'` directive
- All tool logic, state management, user interaction
- Imports shared components (CopyButton, SEOContent, ToolCTA, RelatedTools, PrivacyBadge)
- Page structure: Hero → Tool UI → Output → CTA → Related Tools → SEO Content

## Testing Strategy

Each component has its own test file with Jest + React Testing Library.

| Test Category | Location | Environment |
|--------------|----------|-------------|
| Shared components | `components/tools/__tests__/` | jsdom |
| Tool components | `app/tools/[slug]/__tests__/` | jsdom |

### Test Coverage

| Component | Tests | Covers |
|-----------|-------|--------|
| LinkGenerator | 17 | Validation, link generation, QR, copy, edge cases, SEO sections |
| CopyButton | 6 | Clipboard API, feedback state, disabled, timeout revert |
| SEOContent | 8 | Sections render, FAQ accordion, expand/collapse, schema JSON-LD |
| RelatedTools | 4 | Cards render, links correct, empty array handling |
| ToolCTA | 3 | Default props, custom props, link href |
| PrivacyBadge | 2 | Text render, SVG icon |
| ComparisonTool | 18 | Toggle, filter, expand/collapse, badges, stars, verdict, a11y |
| wa-vs-tg data | 12 | JSON integrity, scores, fairness, verdicts, relevance filters |
| migration-model | 39 | Mode detection, reachable calc, timeline curve, frequency multipliers, scenarios, strategy, risks, edge cases |
| MigrationCalculator | 24 | Inputs, defaults, calculation flow, special modes, overlap slider, edge cases |
| **Total** | **131+** | |

### Running Tests
```bash
# All tool tests
npx jest tools --verbose

# Specific component
npx jest CopyButton --verbose
npx jest LinkGenerator --verbose
```

## SEO Strategy

Each tool page targets specific high-volume keywords:

| Tool | Primary Keyword | Monthly Volume |
|------|----------------|----------------|
| Link Generator + QR | whatsapp link generator | 50K+ |
| Link Generator + QR | whatsapp qr code generator | 30K+ |
| Message Formatter | whatsapp bold italic text | 20K+ |
| Greeting Generator | whatsapp greeting message | 15K+ |
| WA vs Telegram | whatsapp vs telegram | 40K+ |
| Migration Calculator | telegram to whatsapp | 3K+ |

### SEO Elements Per Tool
- Meta title + description + keywords
- OpenGraph tags
- schema.org FAQPage JSON-LD (via SEOContent component)
- Below-fold content sections (500-800 words)
- Internal linking via RelatedTools component
- Sitemap entries auto-generated at build time

## Tool Roadmap

| # | Tool | Complexity | Status |
|---|------|-----------|--------|
| 1 | WhatsApp Link Generator + QR Code | Low | ✅ Live |
| 2 | WhatsApp Message Formatter | Low | ✅ Live |
| 3 | WhatsApp Greeting Generator | Low | ✅ Live |
| 4 | Channel Growth Calculator | Medium | ✅ Live |
| 5 | WhatsApp vs Telegram Comparison | Medium | ✅ Live |
| 6 | Telegram to WhatsApp Migration Calculator | Medium | ✅ Live |
| 7 | Auto-Reply Generator | Low | ⬜ Planned |
| 8 | Character Counter | Low | ⬜ Planned |
| 9 | Broadcast Calculator | Low | ⬜ Planned |
| 10 | Chat Wrapped / Stats Analyzer | High | ⬜ Planned |
| 11 | FPL League Roast Generator | High | ⬜ Planned |

## Tool #6: Telegram to WhatsApp Migration Calculator

### Files
- `lib/utils/migration-model.ts` — Pure functions: mode detection, conversion curve, strategy logic, risk matrix
- `lib/utils/migration-pdf.ts` — Client-side jsPDF report with week-by-week action checklist
- `app/tools/telegram-to-whatsapp-migration/page.tsx` — Server component with metadata + FAQ schema
- `app/tools/telegram-to-whatsapp-migration/MigrationCalculator.tsx` — Client component

### Migration Model
```
reachable = tgSubscribers * (overlapPercent / 100)
weeklyNew = reachable * baseRate * frequencyMult * scenarioMult
cumulative = min(cumulative + weeklyNew, reachable)
```

Base rates diminish from 20% (week 1 announcement bump) to 2% (week 9+ long tail).
Frequency multipliers: daily (1.3x), 2-3x/week (1.0x), weekly (0.7x), monthly (0.4x).
Three scenarios: conservative (0.7x), expected (1.0x), optimistic (1.4x).

### Three Modes
- **Full** (50+ subs): Chart + strategy cards + risk matrix + PDF
- **Start Fresh** (0 subs): WhatsApp advantages card, no migration chart
- **Migrate Manually** (1-49 subs): Direct outreach tips, no chart, no PDF

### Dependencies
- recharts (AreaChart)
- jspdf (PDF generation)

## Tool #5: WhatsApp vs Telegram Comparison

### Files
- `lib/data/wa-vs-tg-comparison.json` — 29 features, 3 verdicts, 8 category labels, lastUpdated field
- `app/tools/whatsapp-vs-telegram/page.tsx` — Server component with metadata + WebApplication schema
- `app/tools/whatsapp-vs-telegram/ComparisonTool.tsx` — Client component (553 lines)

### Data Model
Static JSON with typed features: id, feature, category, whatsapp/telegram (score + summary + detail), winner enum, 3 relevance boolean flags. Separate verdicts array per use case. Monthly refresh by editing JSON only.

### Component Architecture
All inline in ComparisonTool.tsx:
- UseCaseToggle — 3 pills with tablist/aria-selected/keyboard nav
- ScoreSummary — horizontal bar computed from filtered features
- ComparisonTable — category headers + expandable rows (desktop: table, mobile: cards)
- Stars — inline SVG, 1-5 filled, green for WA / blue for TG
- WinnerBadge — color-coded: green/blue/gray/amber
- VerdictCard — dynamic headline + summary + CTA per use case

### Dependencies
None. Pure React + Tailwind + inline SVG.

## Tool #4: Channel Growth Calculator

### Files
- `lib/data/niche-data.ts` — 10 niches with engagement, pricing, conversion, capacity
- `lib/utils/growth-model.ts` — Pure functions: projections, milestones, benchmarks, monetization
- `lib/utils/pdf-report.ts` — Client-side jsPDF report with chart embed
- `app/tools/channel-growth-calculator/page.tsx` — Server component with metadata + FAQ schema
- `app/tools/channel-growth-calculator/GrowthCalculator.tsx` — Client component

### Growth Model
```
baseGrowthRate = 0.05
engagementMult = min(userEngagement / nicheAvg, 2.5)
frequencyMult = min(0.5 + postsPerWeek/10, 1.5)
dampeningFactor = nicheCapacity / (nicheCapacity + followers)
effectiveRate = baseGrowthRate * engagementMult * frequencyMult * dampeningFactor
```

Three scenarios: conservative (0.6x), expected (1.0x), optimistic (1.5x).
Projections calculated iteratively (month-by-month with dampening recalculated each step).

### Dependencies
- recharts (LineChart)
- jspdf (PDF generation)
