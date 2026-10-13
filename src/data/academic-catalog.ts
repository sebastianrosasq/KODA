export type CatalogStatus = 'verified' | 'source_identified';

export type CatalogInstitution = {
  slug: string;
  name: string;
  status: CatalogStatus;
};

export type CatalogProgram = {
  institutionSlug: string;
  slug: string;
  name: string;
  termLabel: 'Ciclo' | 'Semestre';
  termCount: number;
  status: CatalogStatus;
};

export const catalogInstitutions: CatalogInstitution[] = [
  { slug: 'tecsup', name: 'TECSUP', status: 'verified' },
  { slug: 'ucsm', name: 'Universidad Católica de Santa María', status: 'source_identified' },
  { slug: 'ucsp', name: 'Universidad Católica San Pablo', status: 'source_identified' },
  { slug: 'unsa', name: 'Universidad Nacional de San Agustín', status: 'source_identified' },
  { slug: 'utp', name: 'Universidad Tecnológica del Perú', status: 'verified' },
  { slug: 'idat', name: 'Instituto IDAT', status: 'verified' },
];

export const catalogPrograms: CatalogProgram[] = [
  {
    institutionSlug: 'tecsup',
    slug: 'diseno-desarrollo-software',
    name: 'Diseño y Desarrollo de Software',
    termLabel: 'Ciclo',
    termCount: 6,
    status: 'verified',
  },
  {
    institutionSlug: 'ucsm',
    slug: 'ingenieria-sistemas',
    name: 'Ingeniería de Sistemas',
    termLabel: 'Semestre',
    termCount: 10,
    status: 'source_identified',
  },
  {
    institutionSlug: 'ucsp',
    slug: 'ciencia-computacion',
    name: 'Ciencia de la Computación',
    termLabel: 'Semestre',
    termCount: 10,
    status: 'source_identified',
  },
  {
    institutionSlug: 'unsa',
    slug: 'ingenieria-sistemas',
    name: 'Ingeniería de Sistemas',
    termLabel: 'Semestre',
    termCount: 10,
    status: 'source_identified',
  },
  {
    institutionSlug: 'utp',
    slug: 'ingenieria-sistemas-informatica',
    name: 'Ingeniería de Sistemas e Informática',
    termLabel: 'Ciclo',
    termCount: 10,
    status: 'verified',
  },
  {
    institutionSlug: 'idat',
    slug: 'tecnico-programacion-software',
    name: 'Técnico en Programación de Software',
    termLabel: 'Ciclo',
    termCount: 4,
    status: 'verified',
  },
];

const suggestedCourses: Record<string, Record<number, string[]>> = {
  'tecsup/diseno-desarrollo-software': {
    4: ['Arquitectura de Software', 'Base de Datos', 'Desarrollo web', 'Inglés técnico'],
  },
  'utp/ingenieria-sistemas-informatica': {
    4: [
      'Programación Orientada a Objetos',
      'Base de Datos',
      'Análisis y Diseño de Algoritmos',
      'Cálculo 2',
    ],
  },
  'idat/tecnico-programacion-software': {
    4: [
      'Desarrollo de los Componentes del Negocio',
      'Desarrollo de Interfaces 3',
      'Patrones de Diseño de Software',
      'Innovación Centrada en Personas',
    ],
  },
};

export function getProgramsForInstitution(institutionSlug: string) {
  return catalogPrograms.filter((program) => program.institutionSlug === institutionSlug);
}

export function getCatalogProgram(institutionSlug: string, programSlug: string) {
  return catalogPrograms.find(
    (program) => program.institutionSlug === institutionSlug && program.slug === programSlug,
  );
}

export function getSuggestedCourses(institutionSlug: string, programSlug: string, termNumber: number) {
  return suggestedCourses[`${institutionSlug}/${programSlug}`]?.[termNumber] ?? [];
}
