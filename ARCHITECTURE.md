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
| SEOContent | `SEOContent.tsx` | Below-fold wrapper. Renders H2 content sections + FAQ accordion. Injects schema.org FAQPage JSON-LD for rich results. | All tools |
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
| SEOContent | 6 | Sections render, FAQ accordion, expand/collapse, schema JSON-LD |
| RelatedTools | 4 | Cards render, links correct, empty array handling |
| ToolCTA | 3 | Default props, custom props, link href |
| PrivacyBadge | 2 | Text render, SVG icon |
| **Total** | **38** | |

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
| 2 | WhatsApp Message Formatter | Low | ⬜ Planned |
| 3 | WhatsApp Greeting Generator | Low | ⬜ Planned |
| 4 | Channel Growth Calculator | Medium | ⬜ Planned |
| 5 | WhatsApp vs Telegram Comparison | Medium | ⬜ Planned |
| 6 | Telegram to WhatsApp Migration Calculator | Medium | ⬜ Planned |
| 7 | Auto-Reply Generator | Low | ⬜ Planned |
| 8 | Character Counter | Low | ⬜ Planned |
| 9 | Broadcast Calculator | Low | ⬜ Planned |
| 10 | Chat Wrapped / Stats Analyzer | High | ⬜ Planned |
| 11 | FPL League Roast Generator | High | ⬜ Planned |
