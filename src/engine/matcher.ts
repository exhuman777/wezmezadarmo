import { Benefit, UserProfile, MatchResult, BenefitStatus } from './types';
import { getAllBenefits } from './benefits';

function checkRequirements(benefit: Benefit, profile: UserProfile): { matched: string[]; failed: string[] } {
  const matched: string[] = [];
  const failed: string[] = [];
  const req = benefit.wymagania;

  if (req.wiekMin !== undefined) {
    if (profile.wiek >= req.wiekMin) matched.push(`Wiek ${profile.wiek} >= ${req.wiekMin}`);
    else failed.push(`Wiek ${profile.wiek} < wymagane ${req.wiekMin}`);
  }
  if (req.wiekMax !== undefined) {
    if (profile.wiek <= req.wiekMax) matched.push(`Wiek ${profile.wiek} <= ${req.wiekMax}`);
    else failed.push(`Wiek ${profile.wiek} > max ${req.wiekMax}`);
  }
  if (req.plec && req.plec !== 'dowolna') {
    if (profile.plec === req.plec) matched.push(`Plec: ${profile.plec}`);
    else failed.push(`Wymagana plec: ${req.plec}`);
  }
  if (req.dochodMax !== undefined) {
    if (profile.dochodNaOsobe <= req.dochodMax) matched.push(`Dochod ${profile.dochodNaOsobe} <= ${req.dochodMax}`);
    else failed.push(`Dochod ${profile.dochodNaOsobe} > max ${req.dochodMax}`);
  }
  if (req.dzieci) {
    const qualifyingKids = req.dzieci.wiekMax
      ? profile.wiekDzieci.filter(w => w <= req.dzieci!.wiekMax!).length
      : profile.liczbaDzieci;
    const minKids = req.dzieci.min ?? 1;
    if (qualifyingKids >= minKids) matched.push(`Dzieci: ${qualifyingKids} >= ${minKids}`);
    else failed.push(`Wymagane min. ${minKids} dzieci (masz: ${qualifyingKids})`);
  }
  if (req.stanCywilny && req.stanCywilny.length > 0) {
    if (req.stanCywilny.includes(profile.stanCywilny)) matched.push(`Stan cywilny: ${profile.stanCywilny}`);
    else failed.push(`Wymagany stan cywilny: ${req.stanCywilny.join('/')}`);
  }
  if (req.zatrudnienie && req.zatrudnienie.length > 0) {
    if (req.zatrudnienie.includes(profile.zatrudnienie)) matched.push(`Zatrudnienie: ${profile.zatrudnienie}`);
    else failed.push(`Wymagane zatrudnienie: ${req.zatrudnienie.join('/')}`);
  }
  if (req.niepelnosprawnosc && req.niepelnosprawnosc.length > 0) {
    if (req.niepelnosprawnosc.includes(profile.niepelnosprawnosc)) matched.push(`Niepelnosprawnosc: ${profile.niepelnosprawnosc}`);
    else failed.push(`Wymagana niepelnosprawnosc: ${req.niepelnosprawnosc.join('/')}`);
  }
  if (req.wlasnosc && req.wlasnosc.length > 0) {
    if (req.wlasnosc.includes(profile.wlasnosc)) matched.push(`Wlasnosc: ${profile.wlasnosc}`);
    else failed.push(`Wymagana wlasnosc: ${req.wlasnosc.join('/')}`);
  }
  if (req.prowadzDzialalnosc !== undefined) {
    if (profile.prowadzDzialalnosc === req.prowadzDzialalnosc) matched.push('Dzialalnosc: tak');
    else failed.push(req.prowadzDzialalnosc ? 'Wymagana dzialalnosc gospodarcza' : 'Nie moze prowadzic dzialalnosci');
  }
  if (req.pierwszaDzialalnosc !== undefined && req.pierwszaDzialalnosc) {
    if (profile.pierwszaDzialalnosc) matched.push('Pierwsza dzialalnosc: tak');
    else failed.push('Wymagana pierwsza dzialalnosc');
  }
  if (req.ciaza !== undefined && req.ciaza) {
    if (profile.ciaza) matched.push('Ciaza: tak');
    else failed.push('Wymagana ciaza');
  }
  if (req.student !== undefined && req.student) {
    if (profile.student) matched.push('Student: tak');
    else failed.push('Wymagany status studenta');
  }
  if (req.emeryt !== undefined && req.emeryt) {
    if (profile.emeryt) matched.push('Emeryt: tak');
    else failed.push('Wymagany status emeryta');
  }
  if (req.rolnik !== undefined && req.rolnik) {
    if (profile.rolnik) matched.push('Rolnik: tak');
    else failed.push('Wymagany status rolnika');
  }
  if (req.bezrobotnyZarejestrowany !== undefined && req.bezrobotnyZarejestrowany) {
    if (profile.bezrobotnyZarejestrowany) matched.push('Zarejestrowany bezrobotny: tak');
    else failed.push('Wymagana rejestracja w PUP');
  }
  if (req.statusWdowiec !== undefined && req.statusWdowiec) {
    if (profile.stanCywilny === 'wdowiec') matched.push('Wdowiec/wdowa: tak');
    else failed.push('Wymagany status wdowca/wdowy');
  }

  return { matched, failed };
}

export function matchBenefits(profile: UserProfile): MatchResult[] {
  const results: MatchResult[] = [];
  const allBenefits = getAllBenefits();

  for (const benefit of allBenefits) {
    const { matched, failed } = checkRequirements(benefit, profile);
    const totalCriteria = matched.length + failed.length;

    // Skip benefits with hard failures on gender or age
    const req = benefit.wymagania;
    if (req.plec && req.plec !== 'dowolna' && profile.plec !== req.plec) continue;
    if (req.wiekMin !== undefined && profile.wiek < req.wiekMin) continue;
    if (req.wiekMax !== undefined && profile.wiek > req.wiekMax) continue;
    if (req.dzieci && req.dzieci.min) {
      const qualifyingKids = req.dzieci.wiekMax
        ? profile.wiekDzieci.filter(w => w <= req.dzieci!.wiekMax!).length
        : profile.liczbaDzieci;
      if (qualifyingKids < req.dzieci.min) continue;
    }

    let status: BenefitStatus;
    const warnings: string[] = [];

    if (failed.length === 0) {
      status = 'PRZYSLUGUJE';
    } else if (failed.length <= 1 && totalCriteria > 2) {
      status = 'MOZLIWE';
      warnings.push(...failed.map(f => `Wymaga weryfikacji: ${f}`));
    } else if (totalCriteria === 0) {
      status = 'PRZYSLUGUJE';
    } else {
      status = 'NIE_PRZYSLUGUJE';
    }

    for (const wyk of benefit.wykluczenia) {
      warnings.push(`Sprawdz wykluczenie: ${wyk.opis}`);
    }

    if (status !== 'NIE_PRZYSLUGUJE') {
      results.push({
        benefit, status,
        confidence: status === 'PRZYSLUGUJE' && warnings.length === 0 ? 'WYSOKA' : 'SREDNIA',
        matchedCriteria: matched, failedCriteria: failed, warnings,
      });
    }
  }

  results.sort((a, b) => (b.benefit.kwotaMax ?? 0) - (a.benefit.kwotaMax ?? 0));
  return results;
}
