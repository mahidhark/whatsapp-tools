# WhatsApp Tools

12 free WhatsApp tools for creators and businesses. Built with Next.js + TypeScript + Tailwind CSS.

**Live at:** [whatsscale.com/tools](https://www.whatsscale.com/tools)

## Tools

| # | Tool | Keywords | Status |
|---|------|----------|--------|
| 1 | [WhatsApp Link Generator + QR Code](https://www.whatsscale.com/tools/whatsapp-link-generator) | whatsapp link generator, whatsapp qr code | ✅ Live |
| 2 | WhatsApp Message Formatter | whatsapp bold italic text | ⬜ Coming Soon |
| 3 | WhatsApp Greeting Generator | whatsapp greeting message | ⬜ Coming Soon |
| 4 | Channel Growth Calculator | whatsapp channel growth | ⬜ Coming Soon |
| 5 | WhatsApp vs Telegram | whatsapp vs telegram | ⬜ Coming Soon |
| 6 | Telegram to WhatsApp Migration Calculator | telegram to whatsapp | ⬜ Coming Soon |
| 7 | Auto-Reply Generator | whatsapp auto reply | ⬜ Coming Soon |
| 8 | Character Counter | whatsapp character limit | ⬜ Coming Soon |
| 9 | Broadcast Calculator | whatsapp broadcast | ⬜ Coming Soon |
| 10 | Chat Wrapped / Stats Analyzer | whatsapp stats | ⬜ Coming Soon |
| 11 | FPL League Roast Generator | fpl roast | ⬜ Coming Soon |

## Architecture

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **100% client-side** — no API calls, no backend, no auth
- **Privacy first** — all data stays in the browser, nothing is sent to any server

## Shared Components

| Component | Purpose |
|-----------|---------|
| `CopyButton` | Click → clipboard → "Copied!" (2s) → revert |
| `SEOContent` | Below-fold content with FAQ accordion + schema.org JSON-LD |
| `ToolCTA` | Soft pitch card with CTA link |
| `RelatedTools` | Grid of related tool cards |
| `PrivacyBadge` | Shield icon + "Works offline" message |

## Project Structure
```
app/tools/
├── layout.tsx                          # Shared tools layout
├── page.tsx                            # Tools index (/tools)
└── whatsapp-link-generator/
    ├── page.tsx                        # SEO metadata (server component)
    └── LinkGenerator.tsx               # Tool logic (client component)

components/tools/
├── CopyButton.tsx
├── SEOContent.tsx
├── ToolCTA.tsx
├── RelatedTools.tsx
├── PrivacyBadge.tsx
└── __tests__/
    ├── CopyButton.test.tsx
    ├── SEOContent.test.tsx
    ├── ToolCTA.test.tsx
    ├── RelatedTools.test.tsx
    └── PrivacyBadge.test.tsx

lib/data/
└── country-codes.json                  # 240+ countries with flags
```

## Tests

38 tests across 6 test suites. Run with:
```bash
npx jest tools --verbose
```

## License

MIT
