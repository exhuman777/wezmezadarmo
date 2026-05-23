// E2E health check for wezmezadarmo.com
// Run: node scripts/e2e-check.mjs
// Or against local: BASE=http://localhost:3000 node scripts/e2e-check.mjs

const BASE = process.env.BASE ?? 'https://www.wezmezadarmo.com';

async function get(path, label, opts = {}) {
  try {
    const r = await fetch(BASE + path, { signal: AbortSignal.timeout(20000) });
    let json = null;
    if (opts.json) { try { json = await r.json(); } catch { /* not json */ } }
    return { label, path, status: r.status, ok: opts.expectStatus ? r.status === opts.expectStatus : r.status < 400, data: json };
  } catch (e) {
    return { label, path, status: 'ERR', ok: false, error: e.message };
  }
}

async function postJson(path, body, label, opts = {}) {
  try {
    const r = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    let data = null;
    try { data = await r.json(); } catch { data = null; }
    return { label, path, status: r.status, ok: opts.expectStatus ? r.status === opts.expectStatus : r.status < 400, data };
  } catch (e) {
    return { label, path, status: 'ERR', ok: false, error: e.message };
  }
}

function print(results, title) {
  console.log(`\n=== ${title} ===`);
  for (const r of results) {
    const icon = r.ok ? 'OK  ' : 'FAIL';
    const err = r.error ? ` (${r.error})` : '';
    console.log(`[${icon}] [${r.status}] ${r.label || r.path}${err}`);
  }
}

console.log(`E2E check against: ${BASE}\n`);

// ============================================================
// 1. PUBLIC PAGES (SSR rendering)
// ============================================================
const pages = [
  '/', '/swiadczenia', '/aktualnosci', '/wnioski', '/automatyzacje',
  '/o-projekcie', '/regulamin', '/polityka-prywatnosci',
  '/wnioski/zus-zas53', '/wnioski/zus-z15a', '/wnioski/zus-z15b',
  '/wnioski/zus-erpo', '/wnioski/zus-ersu', '/wnioski/zus-pel', '/wnioski/zus-z3',
  '/wnioski/nlnet',
  '/dla-firm', '/dotacje', '/dotacje/regulamin', '/dotacje/polityka-ai',
  '/dotacje/rejestracja', '/dotacje/logowanie',
  '/dotacje/panel', '/dotacje/panel/monitoring',
  '/agent', '/agent/rejestracja', '/agent/logowanie',
  '/centrum-obywatela', '/centrum-obywatela/kursy',
  '/centrum-obywatela/powietrze', '/centrum-obywatela/biala-lista',
  '/nfz',
];
const pageResults = await Promise.all(pages.map(p => get(p, p)));
print(pageResults, 'PAGES (SSR)');

// ============================================================
// 2. PUBLIC API: NEW INTEGRATIONS
// ============================================================
const publicApis = [
  ['/api/public/nbp', 'NBP exchange rates'],
  ['/api/public/gios?lat=52.2297&lon=21.0122', 'GIOS air quality (Warsaw)'],
  ['/api/public/gios?lat=50.0647&lon=19.945', 'GIOS air quality (Krakow)'],
  ['/api/public/whitelist?nip=5260250274', 'Biala Lista VAT (mBank NIP)'],
  ['/api/public/nfz?type=benefits&q=KARD', 'NFZ benefit autocomplete'],
  ['/api/public/nfz?type=queues&benefit=PORADNIA+ALERGOLOGICZNA&province=mazowieckie&case=1&limit=5', 'NFZ kolejki alergologia Warsaw'],
  ['/api/public/nfz?type=providers&province=mazowieckie&limit=5', 'NFZ swiadczeniodawcy mazowieckie'],
];
const publicApiResults = await Promise.all(publicApis.map(([p, l]) => get(p, l, { json: true })));
print(publicApiResults, 'PUBLIC API: New integrations');

// Sanity output
const nbp = publicApiResults.find(r => r.label === 'NBP exchange rates');
if (nbp?.data) {
  const eurRate = nbp.data.rates?.find(r => r.code === 'EUR');
  console.log(`   NBP EUR: ${eurRate?.mid ?? 'missing'} PLN (${nbp.data.effectiveDate})`);
}
const gios = publicApiResults.find(r => r.label === 'GIOS air quality (Warsaw)');
if (gios?.data) {
  console.log(`   GIOS Warsaw station: ${gios.data.stationName ?? 'n/a'}, overall: ${gios.data.overall ?? 'n/a'}`);
}
const wl = publicApiResults.find(r => r.label === 'Biala Lista VAT (mBank NIP)');
if (wl?.data) {
  console.log(`   WL found: ${wl.data.found}, VAT: ${wl.data.statusVat ?? 'n/a'}, name: ${wl.data.name?.slice(0, 50) ?? 'n/a'}`);
}
const nfzQ = publicApiResults.find(r => r.label === 'NFZ kolejki alergologia Warsaw');
if (nfzQ?.data) {
  console.log(`   NFZ kolejki: ${nfzQ.data.count ?? 0} wynikow, sample: ${nfzQ.data.results?.[0]?.provider?.slice(0, 50) ?? 'n/a'}`);
}
const nfzPr = publicApiResults.find(r => r.label === 'NFZ swiadczeniodawcy mazowieckie');
if (nfzPr?.data) {
  console.log(`   NFZ providers: ${nfzPr.data.count ?? 0} placowek, sample: ${nfzPr.data.providers?.[0]?.name?.slice(0, 50) ?? 'n/a'}`);
}
const nfzBe = publicApiResults.find(r => r.label === 'NFZ benefit autocomplete');
if (nfzBe?.data) {
  console.log(`   NFZ benefits: ${nfzBe.data.benefits?.length ?? 0} sugestii dla 'KARD'`);
}

// ============================================================
// 3. VALIDATION (expect 400s)
// ============================================================
const validation = [
  await get('/api/public/whitelist?nip=12345', 'WL invalid NIP -> 400'),
  await get('/api/public/nfz?type=queues', 'NFZ queues missing benefit -> 400'),
  await get('/api/public/nfz?type=providers', 'NFZ providers missing name+province -> 400'),
  await get('/api/public/gios', 'GIOS missing params -> 400'),
];
const validationLabeled = validation.map(r => ({
  ...r,
  ok: r.status === 400,
}));
print(validationLabeled, 'INPUT VALIDATION (expect 400)');

// ============================================================
// 4. CEIDG (POST)
// ============================================================
console.log('\n=== CEIDG (POST) ===');
// 7740001454 -- valid checksum, PKN ORLEN (SA, not in CEIDG -- will return empty data with status 200)
const ceidgValid = await postJson('/api/ceidg', { nip: '7740001454' }, 'CEIDG valid NIP (PKN ORLEN, SA)');
print([ceidgValid], 'CEIDG');
if (ceidgValid.data) {
  console.log(`   CEIDG: aktywna=${ceidgValid.data.aktywna}, nazwa=${ceidgValid.data.nazwa?.slice(0, 50)}, vat=${ceidgValid.data.vat?.status ?? 'n/a'}`);
}
// 1234567890 -- fails checksum (sum 230 mod 11 = 10, can't equal last digit 0)
const ceidgBad = await postJson('/api/ceidg', { nip: '1234567890' }, 'CEIDG invalid NIP -> 400');
print([{ ...ceidgBad, ok: ceidgBad.status === 400 }], 'CEIDG validation');

// ============================================================
// 5. EXISTING APIs
// ============================================================
const existingGet = [
  ['/api/aktualnosci', 'Aktualnosci RSS'],
  ['/llm.md', 'llm.md'],
  ['/agents.md', 'agents.md'],
  ['/robots.txt', 'robots.txt'],
  ['/sitemap.xml', 'sitemap.xml'],
];
const existingResults = await Promise.all(existingGet.map(([p, l]) => get(p, l)));
print(existingResults, 'EXISTING APIs');

const profile = {
  wiek: 35, plec: 'K', stanCywilny: 'samotny', liczbaDzieci: 2,
  wiekDzieci: [3, 6], dochodMiesiecznie: 3500, dochodNaOsobe: 1166,
  zatrudnienie: 'umowa_o_prace', niepelnosprawnosc: 'brak',
  wlasnosc: 'najemca', wojewodztwo: 'mazowieckie',
  prowadzDzialalnosc: false, pierwszaDzialalnosc: false,
};
const verifyRes = await postJson('/api/verify', { profile }, '/api/verify');
print([verifyRes], 'POST /api/verify');
if (verifyRes.data?.results) {
  console.log(`   results: ${verifyRes.data.results.length}, aiVerified: ${verifyRes.data.aiVerified}`);
}

const fcRes = await postJson('/api/form-chat',
  { formType: 'zus-zas53', messages: [{ role: 'user', content: 'Ile wynosi zasilek chorobowy?' }] },
  '/api/form-chat');
print([fcRes], 'POST /api/form-chat');

const contactBad = await postJson('/api/contact', { imie: 'X' }, '/api/contact bad -> 400');
print([{ ...contactBad, ok: contactBad.status === 400 }], 'POST /api/contact validation');

// ============================================================
// 6. SUMMARY
// ============================================================
const all = [
  ...pageResults, ...publicApiResults, ...validationLabeled,
  ceidgValid, { ...ceidgBad, ok: ceidgBad.status === 400 },
  ...existingResults, verifyRes, fcRes,
  { ...contactBad, ok: contactBad.status === 400 },
];
const failed = all.filter(r => !r.ok);
console.log(`\n=== SUMMARY ===`);
console.log(`Total: ${all.length}, Passed: ${all.length - failed.length}, Failed: ${failed.length}`);
if (failed.length) {
  console.log('\nFAILURES:');
  failed.forEach(r => console.log(`  FAIL ${r.label || r.path} [${r.status}]${r.error ? ' ' + r.error : ''}`));
  process.exit(1);
}
console.log('\nAll green');
