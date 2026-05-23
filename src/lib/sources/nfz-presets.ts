/**
 * Presety wyszukiwań dla NFZ -- pogrupowane wg kategorii zdrowia.
 * Lista typowych świadczeń (z bazy NFZ) + popularnych leków.
 */

export const BENEFIT_GROUPS: { id: string; label: string; icon: string; benefits: string[] }[] = [
  {
    id: 'specjalisci',
    label: 'Specjaliści',
    icon: 'M',
    benefits: [
      'PORADNIA KARDIOLOGICZNA',
      'PORADNIA DERMATOLOGICZNA',
      'PORADNIA ENDOKRYNOLOGICZNA',
      'PORADNIA NEUROLOGICZNA',
      'PORADNIA OKULISTYCZNA',
      'PORADNIA ORTOPEDYCZNA',
      'PORADNIA REUMATOLOGICZNA',
      'PORADNIA ALERGOLOGICZNA',
      'PORADNIA GASTROENTEROLOGICZNA',
      'PORADNIA UROLOGICZNA',
      'PORADNIA OTOLARYNGOLOGICZNA',
      'PORADNIA CHIRURGII OGÓLNEJ',
      'PORADNIA DIABETOLOGICZNA',
      'PORADNIA HEMATOLOGICZNA',
      'PORADNIA HEPATOLOGICZNA',
      'PORADNIA NEFROLOGICZNA',
      'PORADNIA PULMONOLOGICZNA',
      'PORADNIA CHIRURGII NACZYNIOWEJ',
    ],
  },
  {
    id: 'badania',
    label: 'Badania',
    icon: 'B',
    benefits: [
      'REZONANS MAGNETYCZNY',
      'TOMOGRAFIA KOMPUTEROWA',
      'USG',
      'GASTROSKOPIA',
      'KOLONOSKOPIA',
      'EKG SPOCZYNKOWE',
      'HOLTER EKG',
      'ECHO SERCA',
      'MAMMOGRAFIA',
      'DENSYTOMETRIA',
      'TESTY ALERGICZNE',
      'BADANIE WYSIŁKOWE EKG',
    ],
  },
  {
    id: 'rehabilitacja',
    label: 'Rehabilitacja',
    icon: 'R',
    benefits: [
      'FIZJOTERAPIA AMBULATORYJNA',
      'REHABILITACJA OGÓLNOUSTROJOWA',
      'REHABILITACJA NEUROLOGICZNA',
      'REHABILITACJA KARDIOLOGICZNA',
      'REHABILITACJA PULMONOLOGICZNA',
      'REHABILITACJA DZIECIĘCA',
      'PORADNIA REHABILITACYJNA',
    ],
  },
  {
    id: 'psychika',
    label: 'Zdrowie psychiczne',
    icon: 'Ψ',
    benefits: [
      'PORADNIA ZDROWIA PSYCHICZNEGO',
      'PSYCHOTERAPIA INDYWIDUALNA',
      'PSYCHIATRA',
      'PORADNIA UZALEŻNIEŃ',
      'PORADNIA ZDROWIA PSYCHICZNEGO DLA DZIECI',
    ],
  },
  {
    id: 'stomatologia',
    label: 'Stomatologia',
    icon: 'S',
    benefits: [
      'PORADNIA STOMATOLOGICZNA',
      'PORADNIA ORTODONTYCZNA',
      'PORADNIA PROTETYKI STOMATOLOGICZNEJ',
      'PORADNIA CHIRURGII STOMATOLOGICZNEJ',
      'STOMATOLOGIA DZIECIĘCA',
    ],
  },
  {
    id: 'kobieta',
    label: 'Kobieta',
    icon: 'K',
    benefits: [
      'PORADNIA GINEKOLOGICZNO-POŁOŻNICZA',
      'PORADNIA PATOLOGII CIĄŻY',
      'PORADNIA LECZENIA NIEPŁODNOŚCI',
      'PORADNIA ENDOKRYNOLOGII GINEKOLOGICZNEJ',
    ],
  },
  {
    id: 'dzieci',
    label: 'Dzieci',
    icon: 'D',
    benefits: [
      'PORADNIA PEDIATRYCZNA',
      'PORADNIA NEUROLOGICZNA DLA DZIECI',
      'PORADNIA KARDIOLOGICZNA DLA DZIECI',
      'PORADNIA OKULISTYCZNA DLA DZIECI',
      'PORADNIA ALERGOLOGICZNA DLA DZIECI',
      'PORADNIA ORTOPEDYCZNA DLA DZIECI',
      'PORADNIA ENDOKRYNOLOGICZNA DLA DZIECI',
    ],
  },
  {
    id: 'onkologia',
    label: 'Onkologia',
    icon: 'O',
    benefits: [
      'PORADNIA ONKOLOGICZNA',
      'PORADNIA HEMATOONKOLOGICZNA',
      'PORADNIA CHIRURGII ONKOLOGICZNEJ',
      'PORADNIA RADIOTERAPII',
      'PORADNIA GINEKOLOGII ONKOLOGICZNEJ',
    ],
  },
  {
    id: 'senior',
    label: 'Senior',
    icon: '60+',
    benefits: [
      'PORADNIA GERIATRYCZNA',
      'PORADNIA LECZENIA BÓLU',
    ],
  },
];

export const DRUG_PRESETS: { category: string; items: { label: string; q: string }[] }[] = [
  {
    category: 'Cukrzyca',
    items: [
      { label: 'Insulina', q: 'insulin' },
      { label: 'Metformin', q: 'metformin' },
      { label: 'Gliklazyd', q: 'gliklaz' },
    ],
  },
  {
    category: 'Serce i krążenie',
    items: [
      { label: 'Atorwastatyna', q: 'atorvastat' },
      { label: 'Ramipril', q: 'ramipril' },
      { label: 'Bisoprolol', q: 'bisoprolol' },
      { label: 'Klopidogrel', q: 'klopidogrel' },
    ],
  },
  {
    category: 'Astma / alergia',
    items: [
      { label: 'Salbutamol', q: 'salbutamol' },
      { label: 'Budezonid', q: 'budezonid' },
      { label: 'Cetyryzyna', q: 'cetyryzyn' },
    ],
  },
  {
    category: 'Tarczyca',
    items: [
      { label: 'Levothyroxin', q: 'levotyroks' },
      { label: 'Tiamazol', q: 'tiamazol' },
    ],
  },
  {
    category: 'Depresja / Lęki',
    items: [
      { label: 'Sertralina', q: 'sertralin' },
      { label: 'Escitalopram', q: 'escitalopram' },
      { label: 'Wenlafaksyna', q: 'wenlafaksyn' },
    ],
  },
  {
    category: 'Żołądek',
    items: [
      { label: 'Omeprazol', q: 'omeprazol' },
      { label: 'Pantoprazol', q: 'pantoprazol' },
    ],
  },
];

export const POPULAR_CITIES = [
  'WARSZAWA', 'KRAKÓW', 'WROCŁAW', 'POZNAŃ', 'GDAŃSK',
  'ŁÓDŹ', 'KATOWICE', 'LUBLIN', 'SZCZECIN', 'BIAŁYSTOK',
];

export const PROVIDER_TYPES = [
  { label: 'Szpital', q: 'szpital' },
  { label: 'Przychodnia', q: 'przychodnia' },
  { label: 'POZ', q: 'podstawowej opieki' },
  { label: 'Laboratorium', q: 'laboratorium' },
  { label: 'Apteka', q: 'apteka' },
];
