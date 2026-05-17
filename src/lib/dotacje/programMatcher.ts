import { PROGRAMS, type B2BProgram, type EligibilityFlag } from '@/data/programs-b2b';

const STATUS_ORDER: Record<string, number> = {
  open: 0,
  expected: 1,
  continuous: 2,
  closed: 3,
};

export function matchPrograms(
  flags: EligibilityFlag[],
  voivodeship: string,
  _size: string,
): B2BProgram[] {
  const flagSet = new Set(flags);

  const matched = PROGRAMS.filter((program) => {
    const flagMatch =
      program.eligibilityFlags.length === 0 ||
      program.eligibilityFlags.some((f) => flagSet.has(f));

    const regionMatch =
      program.voivodeships.includes('all') ||
      program.voivodeships.includes(voivodeship);

    return flagMatch && regionMatch;
  });

  return matched.sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] ?? 99;
    const orderB = STATUS_ORDER[b.status] ?? 99;
    return orderA - orderB;
  });
}

export function getTopMatches(
  flags: EligibilityFlag[],
  voivodeship: string,
  size: string,
  limit = 5,
): B2BProgram[] {
  return matchPrograms(flags, voivodeship, size).slice(0, limit);
}
