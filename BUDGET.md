# NLnet NGI Zero Commons Fund -- Budget Breakdown

**Total requested: €50,000**
**Applicant: Kamil Sobkowicz (individual developer, Poland)**
**Hourly rate: €75/hr (standard freelance rate for senior developer in EU)**

---

## 1. Open-sourcing and documentation
**€9,000 -- 120 hours**

- AGPL-3.0 license headers and compliance review across all files
- Public GitHub repository setup with branch protection and contribution guidelines
- English README with full architecture documentation
- OpenAPI specification for the eligibility REST API
- Developer docs: how to run locally, how to contribute, how to add benefits
- Security review and threat model documentation (privacy-by-design architecture)

## 2. Benefits database expansion: 117 to 200+
**€15,000 -- 200 hours**

- Research and legal verification of regional (voivodship-level) programs
- Research and verification of municipal-level social programs
- Data entry in structured YAML format with full citations
- Quality review against official source URLs
- Automated link-checker CI/CD integration (dead link detection)
- Changelog and versioning system for benefit rule changes

## 3. Open REST API for NGOs and civic tech
**€9,000 -- 120 hours**

- API design with clear versioning strategy
- Authentication for partner organizations (stateless, no database)
- Rate limiting and abuse prevention
- OpenAPI/Swagger documentation
- Integration examples for common use cases (HR portals, NGO case management)
- Public sandbox environment for testing

## 4. AI assistant improvements
**€6,000 -- 80 hours**

- Hallucination prevention: enforce citation-only answers (no invention)
- Structured output for benefit details (JSON mode for API consumers)
- Support for Ukrainian language (significant minority in Poland: ~1M people)
- Evaluation framework: automated testing of AI answer quality against known correct answers
- Context window optimization to handle more benefits per query

## 5. Replication methodology documentation
**€4,500 -- 60 hours**

- Methodology paper: how to build a verified benefit database for any EU country
- Legal framework notes for Czech Republic, Slovakia, Hungary (similar legislative structure)
- Data model specification (open standard for benefit eligibility rules)
- Deployment guide for self-hosting
- Case study: lessons learned from Poland

## 6. Community and conferences
**€3,000**

- Travel and accommodation: 1x Mozfest (2027) + 1x Polish civic tech conference
- Presentation materials
- Community outreach to NGOs and social workers who can contribute benefit knowledge

## 7. Infrastructure and tooling
**€3,500**

- CI/CD pipeline for automated testing of benefit rules
- Staging environment for testing database changes before production
- Monitoring and uptime tooling
- SSL certificates, CDN costs for open API endpoint

---

## Rate justification

€75/hr is the lower end of the market rate for senior full-stack development in Poland
with EU standards (comparable to Netherlands/Germany junior rates). The project
requires expertise in: Next.js, TypeScript, Polish legal research, AI prompt engineering,
and data modeling. This rate reflects honest valuation without padding.

## No prior funding

This project has received zero external funding. It has been developed and operated
entirely at the developer's personal expense since inception.
