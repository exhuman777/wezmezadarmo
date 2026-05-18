// E2E health check for wezmezadarmo.com
const BASE = 'https://www.wezmezadarmo.com';

async function get(path, label) {
  try {
    const r = await fetch(BASE + path, { signal: AbortSignal.timeout(15000) });
    return { label, path, status: r.status, ok: r.status < 400 };
  } catch (e) {
    return { label, path, status: 'ERR', ok: false, error: e.message };
  }
}

async function postJson(path, body, label) {
  try {
    const r = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'public' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    let data = null;
    try { data = await r.json(); } catch { data = null; }
    return { label, path, status: r.status, ok: r.status < 400, data };
  } catch (e) {
    return { label, path, status: 'ERR', ok: false, error: e.message };
  }
}

function print(results, title) {
  console.log(`\n=== ${title} ===`);
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗';
    const err = r.error ? ` (${r.error})` : '';
    console.log(`${icon} [${r.status}] ${r.label || r.path}${err}`);
  }
}

// ---- Pages ----
const pages = [
  '/', '/aktualnosci', '/wnioski',
  '/wnioski/zus-zas53', '/wnioski/zus-z15a', '/wnioski/zus-z15b',
  '/wnioski/zus-erpo', '/wnioski/zus-ersu', '/wnioski/zus-pel', '/wnioski/zus-z3',
  '/wnioski/nlnet', '/automatyzacje', '/o-projekcie',
  '/regulamin', '/polityka-prywatnosci', '/dla-firm', '/swiadczenia',
  '/dotacje', '/dotacje/regulamin', '/dotacje/polityka-ai',
  '/dotacje/rejestracja', '/dotacje/logowanie',
  '/dotacje/panel', '/dotacje/panel/monitoring',
  '/agent', '/agent/rejestracja', '/agent/logowanie',
];

const pageResults = await Promise.all(pages.map(p => get(p, p)));
print(pageResults, 'PAGES');

// ---- Public API: GET ----
const getApis = [
  ['/api/aktualnosci', 'aktualnosci RSS'],
  ['/api/ceidg?nip=5213013185', 'CEIDG lookup (PKN ORLEN)'],
  ['/public/llm.md', 'llm.md (AI discoverability)'],
  ['/public/agents.md', 'agents.md (B2B)'],
  ['/robots.txt', 'robots.txt'],
  ['/sitemap.xml', 'sitemap.xml'],
];
const getResults = await Promise.all(getApis.map(([p, l]) => get(p, l)));
print(getResults, 'GET APIs & STATIC FILES');

// ---- POST: verify ----
const profile = {
  wiek: 35, plec: 'K', stanCywilny: 'samotny', liczbaDzieci: 2,
  wiekDzieci: [3, 6], dochodMiesiecznie: 3500, dochodNaOsobe: 1166,
  zatrudnienie: 'umowa_o_prace', niepelnosprawnosc: 'brak',
  wlasnosc: 'najemca', wojewodztwo: 'mazowieckie',
  prowadzDzialalnosc: false, pierwszaDzialalnosc: false,
};
const verifyRes = await postJson('/api/verify', { profile }, '/api/verify');
print([verifyRes], 'POST verify');
if (verifyRes.data?.results) {
  const r = verifyRes.data;
  console.log(`  results: ${r.results.length}, aiVerified: ${r.aiVerified}`);
  r.results.slice(0, 4).forEach(x =>
    console.log(`  [${x.status}] ${x.benefit.nazwa} (${x.confidence})`));
}

// ---- POST: form-chat ----
const fcRes = await postJson('/api/form-chat',
  { formType: 'zus-zas53', messages: [{ role: 'user', content: 'Ile wynosi zasilek chorobowy?' }] },
  '/api/form-chat');
print([fcRes], 'POST form-chat');
if (fcRes.data) console.log('  response:', JSON.stringify(fcRes.data).slice(0, 100));

// ---- POST: contact (no email sending -- just validation check) ----
const contactBad = await postJson('/api/contact', { imie: 'X' }, '/api/contact (validation)');
print([{ ...contactBad, ok: contactBad.status === 400, label: '/api/contact bad payload -> 400?' }], 'POST contact');

// ---- POST: pdf ----
const pdfRes = await postJson('/api/pdf', {
  type: 'zas53',
  data: {
    imieNazwisko: 'Jan Kowalski', pesel: '90010112345', adres: 'Warszawa',
    telefon: '500000000', powodNiezdolnosci: 'choroba',
    dataOd: '2026-05-01', dataDo: '2026-05-10',
    nrKonta: '12345678901234567890123456',
    nazwaPracodawcy: 'Firma Sp. z o.o.', nipPracodawcy: '1234567890',
    adresPracodawcy: 'Warszawa', wynagrodzenieBrutto: '5000',
  },
}, '/api/pdf zas53');
print([pdfRes], 'POST pdf');

// ---- Aktualnosci detail ----
console.log('\n=== RSS FEEDS DETAIL ===');
const rssRes = await fetch(BASE + '/api/aktualnosci', { signal: AbortSignal.timeout(20000) });
if (rssRes.ok) {
  const d = await rssRes.json();
  console.log(`items: ${d.items?.length ?? 0}`);
  console.log(`active: ${JSON.stringify(d.active)}`);
  console.log(`failed: ${JSON.stringify(d.failed)}`);
  if (d.items?.length) {
    d.items.slice(0, 3).forEach(i => console.log(`  [${i.source}] ${i.title.slice(0, 65)}`));
  }
} else {
  console.log('RSS request failed:', rssRes.status);
}

// ---- Summary ----
const all = [...pageResults, ...getResults, verifyRes, fcRes, contactBad, pdfRes];
const failed = all.filter(r => !r.ok);
console.log(`\n=== SUMMARY ===`);
console.log(`Total checks: ${all.length}`);
console.log(`Passed: ${all.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
if (failed.length) {
  console.log('FAILURES:');
  failed.forEach(r => console.log(`  ✗ ${r.label || r.path} [${r.status}]`));
}
