# WezmeZadarmo: Open Benefits Eligibility Engine for Polish Citizens

![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)
![Status: Live](https://img.shields.io/badge/status-live-brightgreen.svg)
![Privacy: stateless, no tracking](https://img.shields.io/badge/privacy-stateless%2C%20no%20tracking-success.svg)

**Live:** https://www.wezmezadarmo.com

Poland has 118+ government benefits, subsidies, and social programs. Most citizens never claim what they are entitled to - because the information is scattered across dozens of portals, written in bureaucratic language, and requires navigating complex eligibility rules.

WezmeZadarmo ("I'll take it for free") solves this. Answer a short set of anonymous questions. Get a personalised list of benefits you qualify for, with step-by-step application instructions and links to official sources. Ask the AI assistant follow-up questions.

**No account. No tracking. No personal data stored. Everything stateless.**

**Free public good.** WezmeZadarmo is free and open source for citizens across Poland
and, through the planned open engine, the EU. A personal AI assistant for the citizen of
a digitised Europe: it knows the law, the bureaucracy and the rules, and helps people
actually use the digital state. This is civic infrastructure, not a business.

---

## What it does

- Matches your demographic profile against a hand-verified database of 118 Polish government benefits
- Covers: ZUS (social insurance), NFZ (healthcare), PFRON (disability), KRUS (farmers), MOPS (social welfare), local government programs
- AI assistant (Google Gemini via OpenRouter) answers follow-up questions with citation-enforced answers
- Personal agent panel (`/panel`): saved profile, matched benefits with embedded AI chat, RSS news monitoring, daily email digest
- Free dotacje panel (`/dotacje/panel`): company-specific grant monitoring, AI matching, RSS feeds per firm (free, no payments, fair-use limits)
- ZUS forms wizard (`/wnioski`): AI-assisted form filling with PDF export
- Automations info page (`/automatyzacje`): informational overview of AI automations available to European firms (co-promotion of independent EU partners; nothing is sold here)
- B2B API for companies integrating benefit eligibility into HR portals, fintech apps, NGO case management

## Privacy by design

- Anonymous mode (calculator on `/`): no account, no PESEL required. A short questionnaire (age, sex, household/situation; NIP optional, only to check business status in CEIDG) is matched and then discarded after computation
- Form-filling identifiers (e.g. PESEL) are collected only when the user chooses to file an official wniosek, stored securely on EU servers (Supabase, EU region), used solely to fill that form, and never sold or used for marketing or AI training
- Authenticated agent panel: Supabase auth, profile data encrypted at rest, deleteable on demand
- Chat history stored only in browser localStorage, auto-expires after 7 days
- IP address held in RAM for 24h for rate limiting only (not logged, not stored)
- AI queries contain only anonymised demographic data - no identifying information

## AI transparency

- The user is always aware they are interacting with AI
- Reducing hallucination: the assistant is constrained to answer only from the verified benefits dataset, cites its sources, and declines (pointing to the right office) when it does not know, which lowers the risk of invented amounts, dates or forms
- Further hardening is planned (stricter citation enforcement, prompt-injection resistance against ingested RSS)

## Tech stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **AI:** Google Gemini 2.0 Flash via OpenRouter (chat), Gemini 2.0 Flash Lite (verification)
- **Eligibility engine:** deterministic rule-based matcher in TypeScript
- **Benefits database:** hand-verified YAML/TypeScript, sourced from gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl, krus.gov.pl, praca.gov.pl
- **Auth + DB:** Supabase (SSR, agent profiles, RSS cache, company accounts)
- **RSS monitoring:** GitHub Actions cron (2x/dzień) for IP-blocked sources (NBP, Sejm, UOKiK, Fundusze EU, e-Zdrowie, ARiMR), Cloudflare Worker proxy for real-time
- **Deployment:** Vercel (serverless, edge) + GitHub Actions cron + Cloudflare Worker

Everything is free to use (fair-use limits only). No payments, no accounts required for the public tools.

## Roadmap (NLnet NGI Zero Commons Fund)

WezmeZadarmo is being generalised from a Polish app into reusable, privacy-first
commons infrastructure any EU country or NGO can fork:

1. **Benefits-as-code schema** - an open, machine-readable standard for eligibility
   rules, amounts, sources and documents (see [docs/benefits-schema.md](docs/benefits-schema.md)).
2. **Open dataset** - the verified Polish benefits republished as open data.
3. **Engine as a library** - the deterministic matcher extracted into a standalone,
   tested open-source package, independent of the web app.
4. **Privacy-preserving evaluation** - stateless matching from the smallest necessary
   question set (no PESEL required), with secure, purpose-limited handling of any
   identifier a form needs, and a published security review.
5. **i18n + replicability** - internationalisation, reference instances for the Netherlands and Germany,
   and fork-and-deploy docs for EU NGOs.
6. **Accessibility (WCAG 2.2 AA) + governance** - inclusive design and a contributor
   workflow for keeping benefits data verified and current.

Comparable to OpenFisca / Rules-as-Code, but citizen-facing, privacy-first, and built
on a live verified dataset.

## License

AGPL-3.0. See [LICENSE](LICENSE) for details including attribution requirements.

The benefits dataset (`src/engine/benefits/`) is released as open data under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/): free to reuse, including commercially, with attribution. The schema and dataset are intended as reusable commons (see the NLnet NGI Zero roadmap above).

## Running locally

```bash
npm install
cp .env.example .env.local
# Add: OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Open http://localhost:3000

## Project map

Public pages:
- `/` - benefits calculator (anonymous, short questionnaire)
- `/swiadczenia` - browse all 118+ benefits with embedded AI chat
- `/wnioski` - AI-assisted ZUS form wizard with PDF export
- `/aktualnosci` - RSS news monitoring (public preview + B2B panel for firms)
- `/statystyki` - GUS/SDG statistics dashboard (live indicators + charts)
- `/automatyzacje` - AI automations for SMBs (KSeF, foreign invoices, custom workflows)
- `/dotacje` - free grant-monitoring landing (57 programs database)
- `/dla-firm` - B2B landing for firms and sole proprietors
- `/agent` - AI agent landing for individuals
- `/o-projekcie`, `/polityka-prywatnosci`, `/regulamin` - info pages

Agent panel (`/panel/*`):
- `/panel` - dashboard with module cards + empty-profile onboarding banner
- `/panel/swiadczenia` - master-detail view of matched benefits with embedded AI chat
- `/panel/chat` - AI assistant with 8 specialized agents + auto-routing
- `/panel/aktualnosci` - personalized RSS feed
- `/panel/profil` - step-by-step profile wizard
- `/panel/powiadomienia` - daily email digest settings

AI agent system (`src/agents/`):
- 8 specialized agents: konsjerz, swiadczenia, wnioski, nfz-zdrowie, finanse-jdg, dotacje, prawo-terminy, rolnik
- Auto-routing via keyword matching (`router.ts`)
- Per-agent knowledge in `.md` files, selective live API prefetch
- `X-Agent-Id` response header - frontend shows which agent responded

B2B dotacje panel (`/dotacje/panel/*`):
- Dashboard, AI agent config, active monitoring, RSS per firma (free, no payments)

API:
- `/api/chat` - public AI chat (rate limit 3/day)
- `/api/agent/*` - authenticated agent endpoints (chat, profile, verify)
- `/api/aktualnosci` - merged RSS (live + Supabase cache)
- `/api/dotacje/*` - company endpoints (auth, company, monitoring, cron)
- `/api/ceidg` - Polish business registry integration
- `/api/digest` - Vercel Cron endpoint for daily emails
- `/api/contact` - contact form

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

Kamil Sobkowicz - sobkowicz.kamil@gmail.com

This project is developed pro bono as a civic tech contribution to Polish society.
