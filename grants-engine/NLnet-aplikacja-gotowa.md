# NLnet NGI Zero Commons Fund -- Gotowa aplikacja WezmeZadarmo

DEADLINE: 1 czerwca 2026, 12:00 CEST (poludnie, nie wieczor)
FORMULARZ: https://nlnet.nl/propose/
REPO: https://github.com/exhuman777/wezmezadarmo
STRONA: https://www.wezmezadarmo.com

---

## KROK PO KROKU -- co robic przy formularzu

1. Wejdz na https://nlnet.nl/propose/
2. Wybierz call: "NGI Zero Commons Fund"
3. Wypelnij Contact Information (imie, email, telefon, kraj)
4. Wklej kazde pole z sekcji TRESC ponizej
5. W polu "Attachments" mozesz wgrac BUDGET.md z repo (opcjonalne)
6. Generative AI Disclosure -- wklej gotowy tekst z sekcji ponizej
7. Zatwierdz politykę prywatnosci
8. Wyslij -- dostaniesz potwierdzenie na email

UWAGA: Formularz moze sie resetowac. Najpierw skopiuj wszystkie teksty
do osobnego dokumentu, potem wklejaj pole po polu.

---

## TRESC -- gotowe teksty do wklejenia

---

### POLE: Proposal name

WezmeZadarmo -- Open AI-powered benefits eligibility engine for Polish citizens

---

### POLE: Website / wiki URL

https://www.wezmezadarmo.com

---

### POLE: Abstract (wklej caly blok)

Poland has over 117 government benefits, subsidies, and social programs -- yet most citizens never claim what they are entitled to. The reasons are structural: information is scattered across dozens of government portals, written in bureaucratic language, and requires navigating eligibility rules that differ for every benefit and change with legislation. The people who need these benefits most -- low-income families, elderly, disabled, farmers, unemployed -- are also the least equipped to navigate this bureaucratic maze.

WezmeZadarmo ("I'll take it for free") is a free, anonymous, open-source tool that solves this problem. A citizen answers ten short questions about their situation -- age, family status, income bracket, employment, disability status -- and within seconds receives a personalised list of benefits they likely qualify for. Each result includes the benefit amount, step-by-step application instructions, required documents, and a direct link to the official government source. An AI assistant then answers follow-up questions: "What documents do I need?", "Does this apply to my situation?", "How do I appeal a rejection?"

The core is a deterministic eligibility engine: a hand-verified database of 117 benefits mapped against 18 citizen profile parameters. The engine is transparent -- every match shows its reasoning, every benefit links to its legal source. AI plays a supporting role only: answering questions with citation-enforced answers, never inventing benefits.

The project runs completely without user accounts, data collection, or tracking. Every session is stateless. No personal data is stored anywhere -- not even on the server. Citizens in vulnerable situations must be able to access information without fear of surveillance.

With NGI Zero funding, WezmeZadarmo will become reusable European infrastructure rather than a single-country tool:

1. Open-source the eligibility engine and benefits database under AGPL-3.0, enabling NGOs and civic tech teams in other EU countries to adapt it.
2. Expand the database from 117 to 200+ benefits, adding regional and municipal programs currently missing.
3. Build a documented open REST API so social workers, NGOs, and HR platforms can integrate the eligibility engine into their own tools.
4. Publish a replication methodology: how to build a verified, hallucination-resistant benefit database for any EU member state.

The tool is already live and used by real Polish citizens. This funding would transform it from a working national product into open civic infrastructure that any EU country can fork, adapt, and deploy.

---

### POLE: Prior involvement

No prior involvement with NLnet or NGI programs. The project is independently developed by a solo developer in Poland. WezmeZadarmo is connected to the Polish civic tech ecosystem: the methodology and benefit database structure are compatible with open standards used by ePanstwo Foundation, the main Polish civic tech organisation. The project has been presented informally in Polish developer communities and is listed as open-source on GitHub at github.com/exhuman777/wezmezadarmo.

---

### POLE: Amount requested (EUR)

50000

---

### POLE: Budget breakdown (wklej caly blok)

Total requested: EUR 50,000. Hourly rate: EUR 75/hr (senior full-stack developer, Poland, EU market rate).

1. Open-sourcing, documentation and API specification -- 120 hours -- EUR 9,000
Tasks: AGPL-3.0 license compliance, public GitHub setup with contribution guidelines, full English README and architecture documentation, OpenAPI specification for the eligibility REST API, developer onboarding guide, security review and threat model documentation.

2. Benefits database expansion: 117 to 200+ verified benefits -- 200 hours -- EUR 15,000
Tasks: Research and legal verification of regional (voivodship-level) and municipal social programs, data entry in structured format with full citations to official sources, quality review process, automated link-checker CI/CD integration to detect dead source links.

3. Open REST API for NGOs and civic tech -- 120 hours -- EUR 9,000
Tasks: API design with versioning strategy, stateless authentication for partner organisations, rate limiting and abuse prevention, integration examples for common use cases (NGO case management, HR portals), public sandbox environment.

4. AI assistant improvements -- 80 hours -- EUR 6,000
Tasks: Hallucination prevention enforcement (citation-only answers), structured JSON output for API consumers, Ukrainian language support (approx. 1 million Ukrainian speakers in Poland), automated evaluation framework for AI answer quality.

5. Replication methodology documentation -- 60 hours -- EUR 4,500
Tasks: Methodology paper for building a verified benefit database in any EU country, legal framework notes for Czech Republic, Slovakia, Hungary (similar post-communist benefit structure), data model specification as open standard.

6. Community outreach and conference participation -- EUR 3,000
Planned: one European civic tech conference (e.g. Mozfest 2027) and one Polish NGO conference. Travel, accommodation, presentation materials.

7. Infrastructure and tooling -- EUR 3,500
CI/CD pipeline for automated testing of benefit rules, staging environment, monitoring, CDN costs for open API endpoint.

Rate justification: EUR 75/hr is the lower range for senior full-stack TypeScript development in Poland with EU standards. The work requires combined expertise in Next.js, Polish legal research, AI prompt engineering, and data modelling. No padding has been applied.

---

### POLE: Other funding sources

This project has received no external funding of any kind since its inception. It has been developed and operated entirely at the developer's personal expense, including server costs, AI API costs, and development time. No equity investors, no prior grants, no loans. A B2B API monetisation track is planned (API keys for companies integrating the eligibility engine into HR and fintech products) but no revenue has been generated to date.

---

### POLE: Comparison with existing/historical efforts

In Poland: the official gov.pl benefits portal lists benefits but requires user registration, is not AI-assisted, covers only a fraction of available programs, and provides no personalised matching. ZUS, NFZ, PFRON, and KRUS each maintain separate portals covering only their own benefits -- no cross-agency matching exists. NGO helplines (e.g. regional social workers) operate with limited hours and cannot scale.

Internationally: Benefits.gov (USA) is closed-source, US-only, and has no open API. Turn2Us (UK) is closed-source and UK-specific. EntitlementFinder (Ireland) covers a limited set of benefits. None of these projects publish their eligibility logic or benefit databases as open, reusable infrastructure.

WezmeZadarmo differs in four ways: (a) it is fully open-source under AGPL-3.0, enabling any country to fork and adapt it; (b) it is anonymous and stateless by design -- no account, no PESEL, no data retention; (c) it uses a hybrid approach -- deterministic eligibility engine for verifiable results, AI only for follow-up questions with citation enforcement; (d) it is designed as reusable infrastructure from the start, not a closed national portal.

The closest historical parallel is the Open Eligibility Project (USA, 2012-2015), which attempted to standardise benefit taxonomy as an open data standard. WezmeZadarmo goes further by including the full eligibility engine, AI assistant, and a proven production deployment.

---

### POLE: Expected technical challenges

1. Hallucination prevention in AI responses. Benefits rules change frequently and vary by edge case. The AI must refuse to speculate and cite only verified sources. Solution: retrieval-augmented prompting where the verified database is the only knowledge source; automated regression tests that flag any response lacking a source citation.

2. Legal accuracy of eligibility rules. Benefit rules involve precise income thresholds, age ranges, regional variations, and exception cases. An error in the engine could mislead vulnerable citizens. Solution: unit tests per benefit with known-correct test cases, human review of all rules by a legal researcher before publication, versioned changelog for every rule change.

3. Sustainability of the benefit database at scale. Keeping 200+ benefits current as laws change requires a community contribution model that maintains quality. Solution: structured YAML contribution format with mandatory source URL field, automated link-checking against official sources, and a review process for pull requests.

4. Cross-country adaptation. Adapting the data model for Czech, Slovak, or Hungarian benefit systems requires handling different legal structures and administrative hierarchies. Solution: design the data model as an open standard with a documented extension mechanism, and publish a methodology paper before starting adaptations.

5. Privacy-preserving architecture at scale. As usage grows, ensuring zero data retention remains technically enforced, not just policy. Solution: architecture review by an independent security researcher, published threat model, and automated testing of data flows to confirm no PII is written to any persistent storage.

---

### POLE: Ecosystem description and stakeholder engagement

Primary stakeholders: Polish citizens (especially low-income families, elderly, disabled, farmers, registered unemployed), social workers at local social welfare centres (MOPS/OPS), NGOs providing legal and social assistance, local government units (gminy) looking for digital inclusion tools, and European civic tech organisations working on similar problems in other EU countries.

Engagement plan: The open-source repository with full documentation will be the primary engagement channel. The open REST API will allow NGO case management systems and HR platforms to integrate the eligibility engine directly, multiplying reach without requiring adoption of the full application. A contribution guide will enable social workers and domain experts to propose benefit additions and corrections.

Institutional partnerships: WezmeZadarmo is compatible with the workflow of ePanstwo Foundation (Poland's main civic tech NGO) and will be formally proposed as a partnership tool. Contact with local MOPS centres is planned to gather real-world feedback from social workers on missing benefits and edge cases.

European dimension: The replication methodology and open data model will be presented at European civic tech events. Czech, Slovak, and Hungarian civic tech communities will be contacted directly -- these countries share a similar post-communist benefit structure and face the same information access problem. The goal is to seed at least one fork in another EU country within 18 months of the grant period.

Open-source ecosystem contribution: The benefit eligibility data model will be proposed as a candidate open standard for the Open Government Data community. All code, documentation, and methodology will be released under AGPL-3.0 or Creative Commons, with no proprietary lock-in.

---

### POLE: Generative AI disclosure

This application was drafted with assistance from Claude (Anthropic) for structure, phrasing, and section organisation. All factual content -- project description, technical details, budget figures, stakeholder analysis, and competitive comparisons -- was provided by the applicant and verified against the actual production system. The final text was reviewed, edited, and approved by the applicant. The applicant takes full responsibility for the accuracy of all statements made in this application.

---

## DANE KONTAKTOWE (wypelnij w formularzu)

Name: Kamil Sobkowicz
Email: sobkowicz.kamil@gmail.com
Phone: [Twoj numer]
Organisation: (zostaw puste lub wpisz "individual developer")
Country: Poland

---

## FINALNA CHECKLIST

[ ] Repo GitHub publiczne: github.com/exhuman777/wezmezadarmo
[ ] LICENSE (AGPL-3.0) widoczny w repo
[ ] README.md po angielsku widoczny w repo
[ ] Strona live: wezmezadarmo.com
[ ] Formularz wyslany PRZED 1 czerwca 2026, 12:00 CEST
[ ] Potwierdzenie na email otrzymane
