// Przepisuje absolutne ścieżki w statycznym buildzie narzędzia (Astro, dist/) na podkatalog w WZD.
// Użycie: node przepisz-sciezki.mjs <dist> <baza, np. /narzedzia/kpir>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [, , dist, baza] = process.argv;
if (!dist || !baza || !baza.startsWith('/') || baza.endsWith('/')) {
  console.error('użycie: node przepisz-sciezki.mjs <dist> </baza>');
  process.exit(1);
}
// Pierwsze segmenty ścieżek, które istnieją w dist/ (katalogi i pliki).
const korzen = readdirSync(dist).map((n) => n.replace(/\.html$/, ''));
const segmenty = [...new Set([...korzen, 'polityka-prywatnosci', 'api'])].map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const wzor = new RegExp(`(["'\`(=,\\s])/(${segmenty.join('|')})(?=[/"'\`)?#.\\s]|$)`, 'g');

let pliki = 0, zmiany = 0;
const idz = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { idz(p); continue; }
    if (!/\.(html|js|mjs|css|json|webmanifest|svg)$/.test(n)) continue;
    const s = readFileSync(p, 'utf8');
    let t = s.replace(wzor, (_, a, seg) => { zmiany++; return `${a}${baza}/${seg}`; });
    if (n.endsWith('.html')) t = t.replace(/href="\/"/g, () => { zmiany++; return `href="${baza}/"`; });
    if (t !== s) { writeFileSync(p, t); pliki++; }
  }
};
idz(dist);
console.log(`przepisz-sciezki: ${pliki} plików, ${zmiany} zmian → ${baza}`);
