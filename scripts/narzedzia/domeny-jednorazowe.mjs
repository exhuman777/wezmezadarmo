// Aktualizacja listy jednorazowych domen e-mail (src/lib/narzedzia/domeny-jednorazowe.ts).
// Źródło: https://github.com/disposable-email-domains/disposable-email-domains (plik disposable_email_blocklist.conf),
// licencja CC0 1.0 (domena publiczna). Uruchom: node scripts/narzedzia/domeny-jednorazowe.mjs
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const REPO = 'https://github.com/disposable-email-domains/disposable-email-domains';
const URL_LISTY = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf';

const odp = await fetch(URL_LISTY);
if (!odp.ok) throw new Error(`pobranie listy: HTTP ${odp.status}`);
const domeny = [...new Set((await odp.text()).split('\n').map(d => d.trim().toLowerCase()).filter(d => d && !d.startsWith('#')))].sort();
let commit = 'nieznany';
try { commit = execSync(`git ls-remote ${REPO} HEAD`, { encoding: 'utf8' }).slice(0, 12); } catch { /* bez gita */ }
const dzis = new Date().toISOString().slice(0, 10);

writeFileSync('src/lib/narzedzia/domeny-jednorazowe.ts', `/**
 * Jednorazowe domeny e-mail (${domeny.length}), odrzucane przy sprawdzeniu firmy po NIP.
 * Źródło: ${REPO} (disposable_email_blocklist.conf, commit ${commit}, pobrane ${dzis}).
 * Licencja listy: CC0 1.0 (domena publiczna). Plik generowany: node scripts/narzedzia/domeny-jednorazowe.mjs
 */
export const ZRODLO_DOMEN = '${REPO}';
export const DOMENY_JEDNORAZOWE_TEKST = ${JSON.stringify(domeny.join('\n'))};
`);
console.log(`zapisano ${domeny.length} domen`);
