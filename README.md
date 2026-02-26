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
| 5 | WhatsApp vs Telegram Comparison | `/tools/whatsapp-vs-telegram` | ✅ Live |
| 6-12 | Remaining tools | — | 🔲 Planned |
## Tool #5: WhatsApp vs Telegram Comparison
Interactive side-by-side comparison with 29 features across 8 categories.
- **3 use case views:** Creators, Business, Personal — toggle to filter relevant features
- **Expandable rows:** Click any feature for detailed WhatsApp vs Telegram breakdown
- **Dynamic scoring:** Stars (★★★★☆), winner badges, score summary bar
- **Verdict card:** Dynamic recommendation per use case
- **Data:** Static JSON, easy monthly refresh without touching component code
- **Accessibility:** tablist + aria-expanded + keyboard nav + aria-labels on stars
- **Fairness:** Telegram wins 14, WhatsApp wins 10, 5 ties
- **Tests:** 32 (12 data integrity + 2 SEOContent + 18 component)
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
