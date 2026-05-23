# WezmeZadarmo -- Open Benefits Eligibility Engine for Polish Citizens

**Live:** https://www.wezmezadarmo.com

Poland has 117+ government benefits, subsidies, and social programs. Most citizens never claim what they are entitled to -- because the information is scattered across dozens of portals, written in bureaucratic language, and requires navigating complex eligibility rules.

WezmeZadarmo ("I'll take it for free") solves this. Answer 10 anonymous questions. Get a personalised list of benefits you qualify for, with step-by-step application instructions and links to official sources. Ask the AI assistant follow-up questions.

**No account. No tracking. No personal data stored. Everything stateless.**

---

## What it does

- Matches your demographic profile against a hand-verified database of 117+ Polish government benefits
- Covers: ZUS (social insurance), NFZ (healthcare), PFRON (disability), KRUS (farmers), MOPS (social welfare), local government programs
- AI assistant (Google Gemini via OpenRouter) answers follow-up questions with citation-enforced answers
- Personal agent panel (`/panel`): saved profile, matched benefits with embedded AI chat, RSS news monitoring, daily email digest
- B2B dotacje panel (`/dotacje/panel`): company-specific grant monitoring, AI matching, RSS feeds per firm, Stripe subscription
- ZUS forms wizard (`/wnioski`): AI-assisted form filling with PDF export
- Automations marketplace (`/automatyzacje`): KSeF, foreign invoices, custom workflows for SMBs
- B2B API for companies integrating benefit eligibility into HR portals, fintech apps, NGO case management

## Privacy by design

- Anonymous mode (calculator on `/`): no account, no PESEL, demographic data discarded after computation
- Authenticated agent panel: Supabase auth, profile data encrypted at rest, deleteable on demand
- Chat history stored only in browser localStorage, auto-expires after 7 days
- IP address held in RAM for 24h for rate limiting only (not logged, not stored)
- AI queries contain only anonymised demographic data -- no identifying information

## Tech stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **AI:** Google Gemini 2.0 Flash via OpenRouter (chat), Gemini 2.0 Flash Lite (verification)
- **Eligibility engine:** deterministic rule-based matcher in TypeScript
- **Benefits database:** hand-verified YAML/TypeScript, sourced from gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl, krus.gov.pl, praca.gov.pl
- **Auth + DB:** Supabase (SSR, agent profiles, RSS cache, B2B subscriptions)
- **RSS monitoring:** GitHub Actions cron (2x/dzień) for IP-blocked sources (NBP, Sejm, UOKiK, Fundusze EU, e-Zdrowie, ARiMR), Cloudflare Worker proxy for real-time
- **Payments:** Stripe (B2B dotacje panel)
- **Deployment:** Vercel (serverless, edge) + GitHub Actions cron + Cloudflare Worker

## License

AGPL-3.0. See [LICENSE](LICENSE) for details including attribution requirements.

The benefits database (`src/engine/benefits/`) is covered by AGPL-3.0 for open-source use. Commercial use of the database outside this software requires a separate license.

## Running locally

```bash
npm install
cp .env.example .env.local
# Add: OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
npm run dev
```

Open http://localhost:3000

## Project map

Public pages:
- `/` -- benefits calculator (anonymous, 10-question form)
- `/swiadczenia` -- browse all 117+ benefits with embedded AI chat
- `/wnioski` -- AI-assisted ZUS form wizard with PDF export
- `/aktualnosci` -- RSS news monitoring (public preview + B2B panel for firms)
- `/automatyzacje` -- AI automations for SMBs (KSeF, foreign invoices, custom workflows)
- `/dotacje` -- B2B SaaS landing for grant monitoring
- `/dla-firm` -- B2B landing for firms and sole proprietors
- `/agent` -- AI agent landing for individuals
- `/o-projekcie`, `/polityka-prywatnosci`, `/regulamin` -- info pages

Agent panel (`/panel/*`):
- `/panel` -- dashboard with module cards + empty-profile onboarding banner
- `/panel/swiadczenia` -- master-detail view of matched benefits with embedded AI chat
- `/panel/chat` -- standalone AI assistant
- `/panel/aktualnosci` -- personalized RSS feed
- `/panel/profil` -- step-by-step profile wizard
- `/panel/powiadomienia` -- daily email digest settings

B2B dotacje panel (`/dotacje/panel/*`):
- Dashboard, AI agent config, active monitoring, RSS per firma, Stripe subscription

API:
- `/api/chat` -- public AI chat (rate limit 3/day)
- `/api/agent/*` -- authenticated agent endpoints (chat, profile, verify)
- `/api/aktualnosci` -- merged RSS (live + Supabase cache)
- `/api/dotacje/*` -- B2B endpoints (auth, company, monitoring, Stripe, cron)
- `/api/ceidg` -- Polish business registry integration
- `/api/digest` -- Vercel Cron endpoint for daily emails
- `/api/contact` -- contact form

## RSS monitoring architecture

Some Polish government sites (NBP, Sejm, UOKiK) block Vercel IPs via Incapsula/Imperva. Solution: 2-tier fetch.

1. **Live fetch** (ZUS, GUS): direct from `/api/aktualnosci` with corrected feed URLs
2. **Cached** (NBP, Sejm, UOKiK, Fundusze EU, e-Zdrowie, ARiMR): GitHub Actions cron runs `scripts/fetch-rss-cache.mjs` 2x/day from Azure IPs, upserts to Supabase `rss_cache` table
3. **Real-time proxy** (optional): Cloudflare Worker in `cf-worker/` with browser-like headers + HTML scrapers

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add benefits to the database.

Benefits must:
- Have a verified source URL (gov.pl, zus.pl, nfz.gov.pl, etc.)
- Include eligibility criteria, amount, application channel, required documents
- Be currently active (not expired programs)

## Data sources

All benefits are sourced exclusively from official Polish government sources:

- https://www.gov.pl
- https://www.zus.pl
- https://www.nfz.gov.pl
- https://www.pfron.org.pl
- https://www.krus.gov.pl
- https://www.praca.gov.pl
- https://www.podatki.gov.pl

No third-party data, no scraped content, no AI-generated benefit descriptions.

## B2B API

Companies can integrate the eligibility engine via REST API. See https://www.wezmezadarmo.com/dla-firm for details.

API key required. Contact: sobkowicz.kamil@gmail.com

## Author

Kamil Sobkowicz -- sobkowicz.kamil@gmail.com

This project is developed pro bono as a civic tech contribution to Polish society.
