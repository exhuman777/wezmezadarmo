# Benefits-as-code schema

This document describes how a benefit is expressed as machine-readable data in
WezmeZadarmo, and the direction for the generalised, jurisdiction-neutral schema
that is a deliverable of the NLnet NGI Zero work (Milestone 1).

## Why a schema

Eligibility rules for public benefits are usually trapped in prose on government
portals. Expressing them as structured, sourced, dated data makes them auditable,
queryable, reusable and replicable across jurisdictions. The deterministic engine
matches a user profile against these records; no rule lives in code, only in data.

## Current record shape (Polish instance)

Each benefit is a typed record (`src/engine/types.ts`, `Benefit`). Core fields:

- `id` — stable slug.
- `nazwa` — human-readable name.
- `opis` — plain-language description.
- `kategoria` — category (health, family, tax, business, housing, disability,
  energy, social-insurance, work, education, senior, social-welfare, ecology).
- `kwota` / `kwotaMin` / `kwotaMax` — amount as text plus numeric bounds.
- `czestotliwosc` — frequency (one-off, monthly, continuous, ...).
- `wymagania` — structured eligibility predicates (see below).
- `wykluczenia[]` — exclusion conditions: `{ opis, sprawdz }` (description + the
  variable to check).
- `wniosek` — application guide: `{ kanal[], formularz?, dokumenty[], kroki[],
  terminRealizacji, pulapki[], odwolanie }` (channels, optional form id, documents,
  steps, processing time, common pitfalls, appeal path).
- `zrodloUrl` / `zrodloNazwa` — official source URL and issuing body (provenance).
- `dataWeryfikacji` / `dataWaznosci` — date verified and date valid until (freshness).

### Eligibility predicates (`wymagania`)

A structured set of optional conditions, e.g. `wiekMin` / `wiekMax` (age),
`plec` (gender), `dochodMax` / `dochodMaxGospodarstwo` (income, individual /
household), `dzieci` (children: count and max age), `niepelnosprawnosc`
(disability), `wojewodztwo` (region), `prowadzDzialalnosc` /
`pierwszaDzialalnosc` / `miesiaceDzialalnosci` / `pkd` (self-employment),
`student`, `emeryt`, `rolnik`, `bezrobotnyZarejestrowany`, `ciaza` (pregnancy).

A user profile (`UserProfile`) carries the matching fields; the engine returns a
`MatchResult` with status (entitled / possible / not-entitled), confidence, and the
criteria that matched, failed, or raised warnings.

## Generalised schema (Milestone 1 deliverable)

The current field names are Polish and some predicates are Poland-specific. The
generalised open schema will:

1. Use jurisdiction-neutral, documented English field names with a versioned spec.
2. Separate universal predicates (age, income, household, disability degree, region,
   time window, means test) from jurisdiction-specific extensions, so a country adds
   its own predicates without forking the engine.
3. Make provenance and dating first-class: every value carries a source URL, issuing
   body, currency, and verification date.
4. Ship a schema linter so contributors (including non-programmers) can validate
   entries before submission.
5. Be published with the Polish dataset as a worked reference instance under an
   open-data license.

## Contribution rules (today)

Every benefit must:
- Have a verified official source URL (gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl,
  krus.gov.pl, praca.gov.pl, podatki.gov.pl).
- Include eligibility criteria, amount, application channel and required documents.
- Be currently active and dated.
- Contain no AI-generated benefit descriptions — every entry is sourced from official
  publications.

See `CONTRIBUTING.md` for the workflow.
