# WhatsApp Tools

12 free WhatsApp tools — link generator, QR codes, message formatter, growth calculator & more. Built with Next.js + TypeScript.

Live at [whatsscale.com/tools](https://www.whatsscale.com/tools)

## Tools

| # | Tool | URL | Status |
|---|------|-----|--------|
| 1 | WhatsApp Link Generator + QR Code | `/tools/whatsapp-link-generator` | ✅ Live |
| 2 | WhatsApp Message Formatter | `/tools/whatsapp-message-formatter` | ✅ Live |
| 3 | WhatsApp Greeting Generator | `/tools/whatsapp-greeting-generator` | ✅ Live |
| 4 | Channel Growth Calculator | `/tools/channel-growth-calculator` | ✅ Live |
| 5 | WhatsApp vs Telegram Comparison | `/tools/whatsapp-vs-telegram` | 🔲 Planned |
| 6-12 | Remaining tools | — | 🔲 Planned |

## Tool #4: Channel Growth Calculator

12-month follower projections with monetization estimates and niche benchmarks.

- **Growth model:** Logistic dampening (S-curve) with 3 scenarios
- **10 niches:** Tech, Education, Entertainment, News, Sports, Business/Finance, Health, Food, Fashion, General
- **Chart:** Recharts LineChart with live updates
- **PDF report:** Client-side jsPDF generation
- **URL sharing:** `?followers=5000&posts=7&engagement=10&niche=tech`
- **Tests:** 41 (12 growth-model + 5 pdf-report + 15 component + 9 auth)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (charts)
- jsPDF (PDF generation)
- QRCode (QR generation)

## Architecture

All tools are pure client-side — zero API calls, no backend required. See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## License

MIT
