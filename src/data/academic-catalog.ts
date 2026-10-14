import { supabase } from '@/lib/supabase';

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

// La lista permite iniciar aun sin conexión. La malla exacta se consulta desde
// Supabase y solo se precarga cuando su fuente oficial fue verificada.
export const catalogInstitutions: CatalogInstitution[] = [
  { slug: 'tecsup', name: 'TECSUP', status: 'verified' },
  { slug: 'ucsm', name: 'Universidad Católica de Santa María', status: 'verified' },
  { slug: 'ucsp', name: 'Universidad Católica San Pablo', status: 'verified' },
  { slug: 'unsa', name: 'Universidad Nacional de San Agustín de Arequipa', status: 'source_identified' },
  { slug: 'continental', name: 'Universidad Continental', status: 'verified' },
  { slug: 'idat', name: 'Instituto IDAT', status: 'verified' },
  { slug: 'certus', name: 'CERTUS', status: 'source_identified' },
  { slug: 'isil', name: 'ISIL', status: 'source_identified' },
  { slug: 'senati', name: 'SENATI', status: 'source_identified' },
  { slug: 'cibertec', name: 'CIBERTEC', status: 'source_identified' },
  { slug: 'utp', name: 'Universidad Tecnológica del Perú', status: 'verified' },
  { slug: 'upc', name: 'Universidad Peruana de Ciencias Aplicadas', status: 'source_identified' },
  { slug: 'pucp', name: 'Pontificia Universidad Católica del Perú', status: 'source_identified' },
  { slug: 'unmsm', name: 'Universidad Nacional Mayor de San Marcos', status: 'source_identified' },
];

export const catalogPrograms: CatalogProgram[] = [
  { institutionSlug: 'tecsup', slug: 'diseno-desarrollo-software', name: 'Diseño y Desarrollo de Software', termLabel: 'Ciclo', termCount: 6, status: 'verified' },
  { institutionSlug: 'ucsm', slug: 'ingenieria-sistemas', name: 'Ingeniería de Sistemas', termLabel: 'Semestre', termCount: 10, status: 'verified' },
  { institutionSlug: 'ucsp', slug: 'ciencia-computacion', name: 'Ciencia de la Computación', termLabel: 'Semestre', termCount: 10, status: 'verified' },
  { institutionSlug: 'ucsp', slug: 'ingenieria-industrial', name: 'Ingeniería Industrial', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'ucsp', slug: 'ciencia-datos', name: 'Ciencia de Datos', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'ucsp', slug: 'inteligencia-artificial', name: 'Inteligencia Artificial', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'unsa', slug: 'ingenieria-sistemas', name: 'Ingeniería de Sistemas', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'unsa', slug: 'ciencia-computacion', name: 'Ciencia de la Computación', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'unsa', slug: 'ingenieria-industrial', name: 'Ingeniería Industrial', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'continental', slug: 'ingenieria-sistemas-informatica', name: 'Ingeniería de Sistemas e Informática', termLabel: 'Ciclo', termCount: 10, status: 'verified' },
  { institutionSlug: 'idat', slug: 'tecnico-programacion-software', name: 'Técnico en Programación de Software', termLabel: 'Ciclo', termCount: 4, status: 'verified' },
  { institutionSlug: 'certus', slug: 'diseno-desarrollo-software', name: 'Diseño y Desarrollo de Software', termLabel: 'Ciclo', termCount: 6, status: 'source_identified' },
  { institutionSlug: 'isil', slug: 'desarrollo-sistemas-informacion', name: 'Desarrollo de Sistemas de Información', termLabel: 'Ciclo', termCount: 6, status: 'source_identified' },
  { institutionSlug: 'senati', slug: 'desarrollo-software', name: 'Desarrollo de Software', termLabel: 'Semestre', termCount: 6, status: 'source_identified' },
  { institutionSlug: 'cibertec', slug: 'ingenieria-sistemas-informaticos', name: 'Ingeniería de Sistemas Informáticos', termLabel: 'Ciclo', termCount: 6, status: 'source_identified' },
  { institutionSlug: 'utp', slug: 'ingenieria-sistemas-informatica', name: 'Ingeniería de Sistemas e Informática', termLabel: 'Ciclo', termCount: 10, status: 'verified' },
  { institutionSlug: 'utp', slug: 'administracion-empresas', name: 'Administración de Empresas', termLabel: 'Ciclo', termCount: 10, status: 'verified' },
  { institutionSlug: 'upc', slug: 'ingenieria-software', name: 'Ingeniería de Software', termLabel: 'Ciclo', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'pucp', slug: 'ingenieria-informatica', name: 'Ingeniería Informática', termLabel: 'Semestre', termCount: 10, status: 'source_identified' },
  { institutionSlug: 'unmsm', slug: 'ingenieria-sistemas', name: 'Ingeniería de Sistemas', termLabel: 'Ciclo', termCount: 10, status: 'source_identified' },
];

const offlineSuggestions: Record<string, Record<number, string[]>> = {
  'tecsup/diseno-desarrollo-software': {
    4: ['Construcción y Pruebas de Software', 'Tecnologías Emergentes', 'Desarrollo de Aplicaciones Empresariales', 'Desarrollo de Aplicaciones Web', 'Programación en Móviles', 'Investigación e Innovación Tecnológica'],
  },
  'utp/ingenieria-sistemas-informatica': {
    4: ['Programación Orientada a Objetos', 'Base de Datos', 'Análisis y Diseño de Algoritmos', 'Cálculo 2'],
  },
  'idat/tecnico-programacion-software': {
    4: ['Desarrollo de los Componentes del Negocio', 'Desarrollo de Interfaces 3', 'Patrones de Diseño de Software', 'Innovación Centrada en Personas'],
  },
  'continental/ingenieria-sistemas-informatica': {
    1: ['Comprensión y Producción de Textos 1', 'Laboratorio de Liderazgo e Innovación', 'Estrategias y Herramientas Digitales para el Aprendizaje', 'Matemática Básica', 'Matemática Discreta 1', 'Técnicas de Programación', 'Introducción a la Ingeniería de Sistemas e Informática'],
  },
  // Fuente oficial UCSP: Plan Curricular 2016 de Ciencia de la Computación.
  // Esta copia local permite completar el registro aun cuando no haya conexión.
  'ucsp/ciencia-computacion': {
    1: ['Programación de Video Juegos', 'Estructuras Discretas I', 'Matemática I', 'Metodología del Estudio', 'Comunicación', 'Introducción a la Vida Universitaria'],
    2: ['Introducción de Ciencia de la Computación', 'Estructuras Discretas II', 'Ciencia de la Computación I', 'Matemática II', 'Introducción a la Filosofía', 'Persona, Matrimonio y Familia'],
    3: ['Ciencia de la Computación II', 'Desarrollo Basado en Plataformas', 'Arquitectura de Computadores', 'Álgebra Abstracta', 'Cálculo I', 'Antropología Filosófica y Teológica'],
    4: ['Algoritmos y Estructuras de Datos', 'Teoría de la Computación', 'Bases de Datos I', 'Cálculo II', 'Estadística y Probabilidades', 'Teología'],
    5: ['Bases de Datos II', 'Ingeniería de Software I', 'Análisis y Diseño de Algoritmos', 'Física Computacional', 'Análisis Numérico', 'Teatro', 'Moral'],
    6: ['Programación Competitiva', 'Estructuras de Datos Avanzadas', 'Sistemas Operativos', 'Ingeniería de Software II', 'Matemática Aplicada a la Computación', 'Oratoria'],
    7: ['Computación Gráfica', 'Ingeniería de Software III', 'Redes y Comunicación', 'Inteligencia Artificial', 'Metodología de la Investigación en Computación', 'Lenguajes de Programación', 'Liderazgo'],
    8: ['Computación en la Sociedad', 'Compiladores', 'Seguridad en Computación', 'Interacción Humano Computador', 'Proyecto de Final de Carrera I', 'Computación Paralela y Distribuida', 'Historia de la Cultura'],
    9: ['Proyecto de Final de Carrera II', 'Big Data', 'Tópicos Avanzados en Ingeniería de Software', 'Tópicos en Inteligencia Artificial', 'Historia de la Ciencia y Tecnología', 'Enseñanza Social de la Iglesia', 'Formación de Empresas de Base Tecnológica I'],
    10: ['Cloud Computing', 'Proyecto de Final de Carrera III', 'Sistemas de Información', 'Robótica', 'Ética Profesional', 'Análisis de la Realidad Peruana', 'Formación de Empresas de Base Tecnológica II', 'Inglés Técnico Profesional'],
  },
};

export function getProgramsForInstitution(institutionSlug: string) {
  return catalogPrograms.filter((program) => program.institutionSlug === institutionSlug);
}

export function getRegistrationInstitutions() {
  const readyInstitutionSlugs = new Set(
    catalogPrograms
      .filter((program) => program.status === 'verified')
      .map((program) => program.institutionSlug),
  );
  return catalogInstitutions.filter((institution) => readyInstitutionSlugs.has(institution.slug));
}

export function getRegistrationPrograms(institutionSlug: string) {
  return getProgramsForInstitution(institutionSlug).filter((program) => program.status === 'verified');
}

export function getCatalogProgram(institutionSlug: string, programSlug: string) {
  return catalogPrograms.find(
    (program) => program.institutionSlug === institutionSlug && program.slug === programSlug,
  );
}

export async function getSuggestedCourses(institutionSlug: string, programSlug: string, termNumber: number) {
  const fallback = offlineSuggestions[`${institutionSlug}/${programSlug}`]?.[termNumber] ?? [];
  if (!supabase) return fallback;

  const { data: institution } = await supabase
    .from('curriculum_institutions')
    .select('id')
    .eq('slug', institutionSlug)
    .maybeSingle();
  if (!institution) return fallback;

  const { data: program } = await supabase
    .from('curriculum_programs')
    .select('id')
    .eq('institution_id', institution.id)
    .eq('slug', programSlug)
    .eq('catalog_status', 'verified')
    .maybeSingle();
  if (!program) return fallback;

  const { data: plan } = await supabase
    .from('curriculum_plans')
    .select('id')
    .eq('program_id', program.id)
    .eq('source_status', 'official_published')
    .eq('is_active', true)
    .order('reviewed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!plan) return fallback;

  const { data: term } = await supabase
    .from('curriculum_terms')
    .select('id')
    .eq('plan_id', plan.id)
    .eq('term_number', termNumber)
    .maybeSingle();
  if (!term) return fallback;

  const { data: courses } = await supabase
    .from('curriculum_courses')
    .select('name')
    .eq('term_id', term.id)
    .order('position');

  return courses?.map((course) => course.name) ?? fallback;
}
