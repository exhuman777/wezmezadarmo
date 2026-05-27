# Contributing to WezmeZadarmo

Thank you for your interest. The most valuable contribution is **adding or correcting benefits** in the database -- that directly helps Polish citizens claim what they are entitled to.

## Ways to contribute

- Add a missing benefit or eligibility rule
- Fix an outdated amount, date, or URL
- Improve AI agent knowledge (step-by-step procedures)
- Report a broken government URL
- Translate the README or add docs

---

## Adding a benefit

Benefits live in `src/engine/benefits/`. Each file covers one population segment:

```
src/engine/benefits/
  rodzina.ts       # families, children (800+, becikowe, ...)
  senior.ts        # seniors, retirees
  niepelnosprawni.ts
  bezrobotni.ts
  studenci.ts
  rolnicy.ts
  jdg.ts           # sole proprietors
  zdrowie.ts       # healthcare, NFZ
  mieszkanie.ts    # housing
  inne.ts          # cross-cutting
```

Each benefit is a `Benefit` object (see `src/engine/types.ts`). Minimum required fields:

```ts
{
  id: 'unique-kebab-case-id',
  nazwa: 'Nazwa świadczenia',              // Polish name
  opis: 'One sentence what it is.',
  kwota: '1 000 PLN/mies.',               // amount or range
  zrodlo: 'ZUS',                          // issuing authority
  zrodloUrl: 'https://www.zus.pl/...',    // official gov source URL
  kategoria: 'swiadczenia_spoleczne',     // see BenefitCategory in types.ts
  warunki: { ... },                       // eligibility rules
  dokumenty: ['dowód osobisty', ...],
  kanalWnioskowania: ['PUE_ZUS'],         // see ApplicationChannel
  dataWeryfikacji: '2026-05-27',          // when you checked this
}
```

Rules for contribution:
- Source URL must be an official Polish government domain (gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl, krus.gov.pl, praca.gov.pl, podatki.gov.pl)
- No AI-generated amounts or eligibility rules -- verify against the official source
- Amounts must reflect the current year (update `dataWeryfikacji`)
- Expired or suspended programs: set `aktywny: false` (do not delete -- history matters)

---

## Running locally

```bash
git clone https://github.com/exhuman777/wezmezadarmo.git
cd wezmezadarmo
npm install
cp .env.example .env.local
# Fill in .env.local -- only SUPABASE_* and OPENROUTER_API_KEY are needed for full dev
npm run dev
```

The benefits calculator at `/` works with zero API keys (fully deterministic, no network calls).

The AI chat at `/agent/panel/chat` needs `OPENROUTER_API_KEY`.

Supabase is needed for auth, RSS cache, and the agent panel. See `supabase/migrations/` -- run them in order in the Supabase SQL editor to create the schema.

### Running tests

```bash
npm test                  # unit tests (Vitest)
npx tsc --noEmit          # TypeScript check
```

---

## Improving AI agent knowledge

AI agent knowledge lives in `src/agents/<agent>/knowledge.md`. Each file is a plain Markdown document loaded as system prompt context. You can add:

- Step-by-step procedures ("Jak złożyć wniosek o X")
- Updated amounts, dates, deadlines
- Explanations of edge cases

No code changes needed -- just edit the `.md` file and open a PR.

---

## Pull request checklist

- [ ] Benefit source URL resolves and is from an official Polish government domain
- [ ] `dataWeryfikacji` is set to today's date
- [ ] Polish diacritics correct (ą ę ó ś ź ż ć ń ł) -- no "Aktualnosci" instead of "Aktualności"
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm test` passes

---

## License

By contributing you agree that your contribution is licensed under AGPL-3.0-only (same as the project). See [LICENSE](LICENSE).
