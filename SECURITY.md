# Security Policy

## Reporting a vulnerability

If you discover a security or privacy issue in WezmeZadarmo, please report it
privately. Do not open a public issue for security problems.

- Email: sobkowicz.kamil@gmail.com
- Subject line: `SECURITY: <short description>`

Please include steps to reproduce, affected URLs or files, and any proof-of-concept.
We aim to acknowledge reports within 5 working days and to agree a disclosure
timeline with you.

## Scope

In scope:
- The eligibility engine (`src/engine/`) and the benefits dataset
  (`src/engine/benefits/`).
- The web application and its API routes (`src/app/api/`).
- Privacy boundaries: anonymous calculator, stateless evaluation, rate limiting,
  data minimisation.

Particularly interested in:
- Any path by which identifying personal data could be stored, logged or leaked.
- Prompt-injection against the AI assistant via ingested content (e.g. RSS).
- Bypass of rate limiting or citation enforcement.

## Privacy commitments

The anonymous calculator stores no account and no national identifier. Demographic
input is discarded after computation. Chat history lives only in the browser and
expires. IP addresses are held in memory for rate limiting only. Reports that
demonstrate a deviation from these commitments are treated as high priority.

## Supported versions

The latest `main` branch and the live deployment at https://www.wezmezadarmo.com
are supported. Older commits are not maintained.
