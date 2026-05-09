export function validatePesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  const digits = pesel.split('').map(Number);
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  return (10 - (sum % 10)) % 10 === digits[10];
}

export function decodePesel(pesel: string): {
  wiek: number;
  plec: 'K' | 'M';
  dataUrodzenia: string;
  valid: boolean;
} {
  if (!validatePesel(pesel)) {
    return { wiek: 0, plec: 'M', dataUrodzenia: '', valid: false };
  }

  const digits = pesel.split('').map(Number);
  const rawYear = digits[0] * 10 + digits[1];
  const rawMonth = digits[2] * 10 + digits[3];
  const day = digits[4] * 10 + digits[5];

  let year: number;
  let month: number;

  if (rawMonth >= 81 && rawMonth <= 92) {
    year = 1800 + rawYear;
    month = rawMonth - 80;
  } else if (rawMonth >= 1 && rawMonth <= 12) {
    year = 1900 + rawYear;
    month = rawMonth;
  } else if (rawMonth >= 21 && rawMonth <= 32) {
    year = 2000 + rawYear;
    month = rawMonth - 20;
  } else if (rawMonth >= 41 && rawMonth <= 52) {
    year = 2100 + rawYear;
    month = rawMonth - 40;
  } else {
    return { wiek: 0, plec: 'M', dataUrodzenia: '', valid: false };
  }

  const plec = digits[9] % 2 === 1 ? 'M' as const : 'K' as const;
  const dataUrodzenia = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let wiek = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    wiek--;
  }

  return { wiek, plec, dataUrodzenia, valid: true };
}
