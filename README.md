# WezmeZadarmo -- Open Benefits Eligibility Engine for Polish Citizens

**Live:** https://www.wezmezadarmo.com

Poland has 117+ government benefits, subsidies, and social programs. Most citizens never claim what they are entitled to -- because the information is scattered across dozens of portals, written in bureaucratic language, and requires navigating complex eligibility rules.

WezmeZadarmo ("I'll take it for free") solves this. Answer 10 anonymous questions. Get a personalised list of benefits you qualify for, with step-by-step application instructions and links to official sources. Ask the AI assistant follow-up questions.

**No account. No tracking. No personal data stored. Everything stateless.**

---

## What it does

- Matches your demographic profile against a hand-verified database of 117 Polish government benefits
- Covers: ZUS (social insurance), NFZ (healthcare), PFRON (disability), KRUS (farmers), MOPS (social welfare), local government programs
- AI assistant (Google Gemini via OpenRouter) answers follow-up questions with citation-enforced answers
- B2B API for companies integrating benefit eligibility into HR portals, fintech apps, NGO case management

## Privacy by design

- No user accounts, no registration, no email required
- No PESEL (national ID) collected -- ever
- Demographic data processed in server RAM for milliseconds, then discarded
- Chat history stored only in browser localStorage, auto-expires after 7 days
- IP address held in RAM for 24h for rate limiting only (not logged, not stored)
- AI queries contain only anonymised demographic data -- no identifying information

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **AI:** Google Gemini 2.0 Flash via OpenRouter (chat), Gemini 2.0 Flash Lite (verification)
- **Eligibility engine:** deterministic rule-based matcher in TypeScript
- **Benefits database:** hand-verified YAML/TypeScript, sourced from gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl, krus.gov.pl, praca.gov.pl
- **Deployment:** Vercel (serverless, edge)

## License

AGPL-3.0. See [LICENSE](LICENSE) for details including attribution requirements.

The benefits database (`src/engine/benefits/`) is covered by AGPL-3.0 for open-source use. Commercial use of the database outside this software requires a separate license.

## Running locally

```bash
npm install
cp .env.example .env.local
# Add your OPENROUTER_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

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
