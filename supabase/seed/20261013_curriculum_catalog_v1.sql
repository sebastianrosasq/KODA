-- KODA · ampliación curada del catálogo curricular peruano.
-- Corte de fuentes: 2026-10-13.
-- Ejecutar después de 20261012_curriculum_catalog_v0.sql.
-- Solo activa planes cuya fuente oficial expone cada periodo y sus cursos.

insert into public.curriculum_sources
  (institution_id, title, source_url, source_type, reviewed_at, notes)
select institution.id, source.title, source.url, source.source_type, date '2026-10-13', source.notes
from (
  values
    (
      'ucv',
      'Ingeniería de Sistemas: malla curricular a distancia',
      'https://www.ucv.edu.pe/sube-distancia/ingenieria-de-sistemas',
      'official_page',
      'La página institucional expone los diez ciclos y sus experiencias curriculares.'
    )
) as source(institution_slug, title, url, source_type, notes)
join public.curriculum_institutions institution on institution.slug = source.institution_slug
on conflict (institution_id, source_url) do nothing;

update public.curriculum_programs program
set
  catalog_status = 'verified',
  source_id = source.id
from public.curriculum_institutions institution
join public.curriculum_sources source on source.institution_id = institution.id
where institution.id = program.institution_id
  and (
    (institution.slug = 'ucsm' and program.slug = 'ingenieria-sistemas'
      and source.source_url = 'https://www2.ucsm.edu.pe/ciencias-e-ingenierias/ingenieria-de-sistemas/')
    or (institution.slug = 'ucv' and program.slug = 'ingenieria-sistemas'
      and source.source_url = 'https://www.ucv.edu.pe/sube-distancia/ingenieria-de-sistemas')
    or (institution.slug = 'upn' and program.slug = 'ingenieria-sistemas-computacionales'
      and source.source_url = 'https://www.upn.edu.pe/pregrado/ingenieria/ingenieria-de-sistemas-computacionales')
  );

insert into public.curriculum_plans
  (program_id, source_id, label, version_label, modality, term_count, source_status, reviewed_at)
select program.id, source.id, plan.label, plan.version_label, plan.modality, plan.term_count,
  'official_published', date '2026-10-13'
from (
  values
    ('ucsm', 'ingenieria-sistemas', 'Plan de estudios', '2026', 'presential', 10),
    ('ucv', 'ingenieria-sistemas', 'Malla a distancia', null, 'virtual', 10),
    ('upn', 'ingenieria-sistemas-computacionales', 'Malla curricular', '2026', 'presential', 10)
) as plan(institution_slug, program_slug, label, version_label, modality, term_count)
join public.curriculum_institutions institution on institution.slug = plan.institution_slug
join public.curriculum_programs program
  on program.institution_id = institution.id and program.slug = plan.program_slug
join public.curriculum_sources source on source.id = program.source_id
on conflict (program_id, label, modality) do nothing;

insert into public.curriculum_terms (plan_id, term_number, label)
select plan.id, term.number, program.term_label || ' ' || lpad(term.number::text, 2, '0')
from public.curriculum_plans plan
join public.curriculum_programs program on program.id = plan.program_id
join public.curriculum_institutions institution on institution.id = program.institution_id
join (
  values
    ('ucsm', 'ingenieria-sistemas', 1), ('ucsm', 'ingenieria-sistemas', 2),
    ('ucsm', 'ingenieria-sistemas', 3), ('ucsm', 'ingenieria-sistemas', 4),
    ('ucsm', 'ingenieria-sistemas', 5), ('ucsm', 'ingenieria-sistemas', 6),
    ('ucsm', 'ingenieria-sistemas', 7), ('ucsm', 'ingenieria-sistemas', 8),
    ('ucsm', 'ingenieria-sistemas', 9), ('ucsm', 'ingenieria-sistemas', 10),
    ('ucv', 'ingenieria-sistemas', 1), ('ucv', 'ingenieria-sistemas', 2),
    ('ucv', 'ingenieria-sistemas', 3), ('ucv', 'ingenieria-sistemas', 4),
    ('ucv', 'ingenieria-sistemas', 5), ('ucv', 'ingenieria-sistemas', 6),
    ('ucv', 'ingenieria-sistemas', 7), ('ucv', 'ingenieria-sistemas', 8),
    ('ucv', 'ingenieria-sistemas', 9), ('ucv', 'ingenieria-sistemas', 10),
    ('upn', 'ingenieria-sistemas-computacionales', 1), ('upn', 'ingenieria-sistemas-computacionales', 2),
    ('upn', 'ingenieria-sistemas-computacionales', 3), ('upn', 'ingenieria-sistemas-computacionales', 4),
    ('upn', 'ingenieria-sistemas-computacionales', 5), ('upn', 'ingenieria-sistemas-computacionales', 6),
    ('upn', 'ingenieria-sistemas-computacionales', 7), ('upn', 'ingenieria-sistemas-computacionales', 8),
    ('upn', 'ingenieria-sistemas-computacionales', 9), ('upn', 'ingenieria-sistemas-computacionales', 10)
) as term(institution_slug, program_slug, number)
  on institution.slug = term.institution_slug and program.slug = term.program_slug
on conflict (plan_id, term_number) do nothing;

with courses(institution_slug, program_slug, term_number, position, name, course_type) as (
  values
    -- UCSM · Ingeniería de Sistemas · plan 2026
    ('ucsm', 'ingenieria-sistemas', 1, 1, 'Introducción a la Ingeniería de Sistemas', 'required'),
    ('ucsm', 'ingenieria-sistemas', 1, 2, 'Introducción a los Datos en los Negocios', 'required'),
    ('ucsm', 'ingenieria-sistemas', 1, 3, 'Investigación Informativa', 'required'),
    ('ucsm', 'ingenieria-sistemas', 1, 4, 'Matemática', 'required'),
    ('ucsm', 'ingenieria-sistemas', 1, 5, 'Metodología de la Programación', 'required'),
    ('ucsm', 'ingenieria-sistemas', 1, 6, 'Redacción Académica', 'required'),
    ('ucsm', 'ingenieria-sistemas', 2, 1, 'Argumentación y Pensamiento Crítico', 'required'),
    ('ucsm', 'ingenieria-sistemas', 2, 2, 'Cálculo', 'required'),
    ('ucsm', 'ingenieria-sistemas', 2, 3, 'Cultura e Identidad', 'required'),
    ('ucsm', 'ingenieria-sistemas', 2, 4, 'Estructuras Discretas', 'required'),
    ('ucsm', 'ingenieria-sistemas', 2, 5, 'Lenguajes de Programación I', 'required'),
    ('ucsm', 'ingenieria-sistemas', 2, 6, 'Pensamiento Computacional', 'required'),
    ('ucsm', 'ingenieria-sistemas', 3, 1, 'Cálculo Integral', 'required'),
    ('ucsm', 'ingenieria-sistemas', 3, 2, 'Economía y Globalización', 'required'),
    ('ucsm', 'ingenieria-sistemas', 3, 3, 'Física I', 'required'),
    ('ucsm', 'ingenieria-sistemas', 3, 4, 'Fundamentos de Infraestructura de la Información', 'required'),
    ('ucsm', 'ingenieria-sistemas', 3, 5, 'Innovación y Emprendimiento', 'required'),
    ('ucsm', 'ingenieria-sistemas', 3, 6, 'Lenguajes de Programación II', 'required'),
    ('ucsm', 'ingenieria-sistemas', 4, 1, 'Computación en Red I', 'required'),
    ('ucsm', 'ingenieria-sistemas', 4, 2, 'Desarrollo Personal y Social', 'required'),
    ('ucsm', 'ingenieria-sistemas', 4, 3, 'Física II', 'required'),
    ('ucsm', 'ingenieria-sistemas', 4, 4, 'Inteligencia Artificial Aplicada', 'required'),
    ('ucsm', 'ingenieria-sistemas', 4, 5, 'Lenguajes de Programación III', 'required'),
    ('ucsm', 'ingenieria-sistemas', 4, 6, 'Sistemas de Información I', 'required'),
    ('ucsm', 'ingenieria-sistemas', 5, 1, 'Algoritmos y Estructura de Datos', 'required'),
    ('ucsm', 'ingenieria-sistemas', 5, 2, 'Análisis y Diseño de Sistemas', 'required'),
    ('ucsm', 'ingenieria-sistemas', 5, 3, 'Computación en Red II', 'required'),
    ('ucsm', 'ingenieria-sistemas', 5, 4, 'Estadística y Probabilidad', 'required'),
    ('ucsm', 'ingenieria-sistemas', 5, 5, 'Sistemas de Información II', 'required'),
    ('ucsm', 'ingenieria-sistemas', 5, 6, 'Sistemas Inteligentes', 'required'),
    ('ucsm', 'ingenieria-sistemas', 6, 1, 'Aprendizaje Automático', 'required'),
    ('ucsm', 'ingenieria-sistemas', 6, 2, 'Computación en Red III', 'required'),
    ('ucsm', 'ingenieria-sistemas', 6, 3, 'Desarrollo de Aplicaciones', 'required'),
    ('ucsm', 'ingenieria-sistemas', 6, 4, 'Gestión de Datos e Información', 'required'),
    ('ucsm', 'ingenieria-sistemas', 6, 5, 'Inglés Técnico', 'required'),
    ('ucsm', 'ingenieria-sistemas', 6, 6, 'Pruebas de Software y QA Automatizado', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 1, 'Ciencia de Datos y Big Data', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 2, 'Desarrollo con Frameworks Modernos', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 3, 'Desarrollo de Sistemas de Información', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 4, 'Doctrina Social de la Iglesia', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 5, 'Gestión Estratégica y de Portafolio de TI', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 6, 'Sistemas Operativos', 'required'),
    ('ucsm', 'ingenieria-sistemas', 7, 7, 'Tecnologías Móviles', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 1, 'Analítica de Datos', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 2, 'Aprendizaje Profundo', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 3, 'Arquitectura de Software y Patrones de Diseño', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 4, 'Arquitectura de Soluciones en la Nube', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 5, 'Filosofía y Ética', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 6, 'Gestión de Procesos de Negocio', 'required'),
    ('ucsm', 'ingenieria-sistemas', 8, 7, 'Programación de Gamificación', 'required'),
    ('ucsm', 'ingenieria-sistemas', 9, 1, 'Ciberseguridad', 'required'),
    ('ucsm', 'ingenieria-sistemas', 9, 2, 'Desarrollo y Operaciones de Software', 'required'),
    ('ucsm', 'ingenieria-sistemas', 9, 3, 'Gestión de Proyectos y Desarrollo', 'required'),
    ('ucsm', 'ingenieria-sistemas', 9, 4, 'Investigación en Ingeniería', 'required'),
    ('ucsm', 'ingenieria-sistemas', 9, 5, 'Prácticas Preprofesionales', 'internship'),
    ('ucsm', 'ingenieria-sistemas', 9, 6, 'Realidad Virtual y Aumentada', 'required'),
    ('ucsm', 'ingenieria-sistemas', 9, 7, 'Visualización de Datos', 'required'),
    ('ucsm', 'ingenieria-sistemas', 10, 1, 'Auditoría de Sistemas y TI', 'required'),
    ('ucsm', 'ingenieria-sistemas', 10, 2, 'Diseño de Interactividad y Gamificación', 'required'),
    ('ucsm', 'ingenieria-sistemas', 10, 3, 'Planificación de Recursos Empresariales', 'required'),
    ('ucsm', 'ingenieria-sistemas', 10, 4, 'Proyecto de Fin de Carrera', 'project'),
    ('ucsm', 'ingenieria-sistemas', 10, 5, 'Seguridad de la Información', 'required'),
    ('ucsm', 'ingenieria-sistemas', 10, 6, 'Tecnologías Emergentes', 'required'),
    ('ucsm', 'ingenieria-sistemas', 10, 7, 'Trabajo de Investigación', 'project'),

    -- UCV · Ingeniería de Sistemas · modalidad a distancia
    ('ucv', 'ingenieria-sistemas', 1, 1, 'Pensamiento Lógico', 'required'),
    ('ucv', 'ingenieria-sistemas', 1, 2, 'Habilidades Comunicativas', 'required'),
    ('ucv', 'ingenieria-sistemas', 1, 3, 'Objetivos de Desarrollo Sostenible', 'required'),
    ('ucv', 'ingenieria-sistemas', 1, 4, 'Fundamentos en Ingeniería de Sistemas', 'required'),
    ('ucv', 'ingenieria-sistemas', 1, 5, 'Inglés I', 'required'),
    ('ucv', 'ingenieria-sistemas', 1, 6, 'Computación I', 'required'),
    ('ucv', 'ingenieria-sistemas', 2, 1, 'Cambio Climático y Gestión de Riesgos', 'required'),
    ('ucv', 'ingenieria-sistemas', 2, 2, 'Algoritmos y Programación', 'required'),
    ('ucv', 'ingenieria-sistemas', 2, 3, 'Cátedra Vallejo', 'required'),
    ('ucv', 'ingenieria-sistemas', 2, 4, 'Expresión Gráfica', 'required'),
    ('ucv', 'ingenieria-sistemas', 2, 5, 'Inglés II', 'required'),
    ('ucv', 'ingenieria-sistemas', 3, 1, 'Creatividad e Innovación', 'required'),
    ('ucv', 'ingenieria-sistemas', 3, 2, 'Fundamentos de Modelado y Animación', 'required'),
    ('ucv', 'ingenieria-sistemas', 3, 3, 'Matemática para la Ingeniería', 'required'),
    ('ucv', 'ingenieria-sistemas', 3, 4, 'Estadística y Análisis de Datos', 'required'),
    ('ucv', 'ingenieria-sistemas', 3, 5, 'Inglés III', 'required'),
    ('ucv', 'ingenieria-sistemas', 3, 6, 'Computación II', 'required'),
    ('ucv', 'ingenieria-sistemas', 4, 1, 'Metodología de la Investigación Científica', 'required'),
    ('ucv', 'ingenieria-sistemas', 4, 2, 'Cálculo Integral y Ecuaciones Diferenciales', 'required'),
    ('ucv', 'ingenieria-sistemas', 4, 3, 'Física General', 'required'),
    ('ucv', 'ingenieria-sistemas', 4, 4, 'Programación Orientada a Objetos', 'required'),
    ('ucv', 'ingenieria-sistemas', 4, 5, 'Inglés IV', 'required'),
    ('ucv', 'ingenieria-sistemas', 4, 6, 'Computación III', 'required'),
    ('ucv', 'ingenieria-sistemas', 5, 1, 'Accesibilidad y Diseño Universal', 'required'),
    ('ucv', 'ingenieria-sistemas', 5, 2, 'Constitución y Derechos Humanos', 'required'),
    ('ucv', 'ingenieria-sistemas', 5, 3, 'Gestión de Datos e Información', 'required'),
    ('ucv', 'ingenieria-sistemas', 5, 4, 'Redes Inalámbricas y Telefonía IP', 'required'),
    ('ucv', 'ingenieria-sistemas', 5, 5, 'Inglés V', 'required'),
    ('ucv', 'ingenieria-sistemas', 5, 6, 'Computación IV', 'required'),
    ('ucv', 'ingenieria-sistemas', 6, 1, 'Ingeniería de Software', 'required'),
    ('ucv', 'ingenieria-sistemas', 6, 2, 'Administración de Servidores Multiplataforma', 'required'),
    ('ucv', 'ingenieria-sistemas', 6, 3, 'Inteligencia de Negocios', 'required'),
    ('ucv', 'ingenieria-sistemas', 6, 4, 'Experiencia Curricular Electiva', 'elective'),
    ('ucv', 'ingenieria-sistemas', 6, 5, 'Inglés VI', 'required'),
    ('ucv', 'ingenieria-sistemas', 6, 6, 'Computación V', 'required'),
    ('ucv', 'ingenieria-sistemas', 7, 1, 'Filosofía y Ética', 'required'),
    ('ucv', 'ingenieria-sistemas', 7, 2, 'Machine Learning', 'required'),
    ('ucv', 'ingenieria-sistemas', 7, 3, 'Ciberseguridad', 'required'),
    ('ucv', 'ingenieria-sistemas', 7, 4, 'Tecnología Web y Cloud Computing', 'required'),
    ('ucv', 'ingenieria-sistemas', 7, 5, 'Inglés VII', 'required'),
    ('ucv', 'ingenieria-sistemas', 8, 1, 'Patrones de Diseño de Realidad Virtual', 'required'),
    ('ucv', 'ingenieria-sistemas', 8, 2, 'Programación de Aplicaciones Móviles', 'required'),
    ('ucv', 'ingenieria-sistemas', 8, 3, 'Gestión de Proyectos', 'required'),
    ('ucv', 'ingenieria-sistemas', 8, 4, 'Experiencia Curricular Electiva', 'elective'),
    ('ucv', 'ingenieria-sistemas', 8, 5, 'Inglés VIII', 'required'),
    ('ucv', 'ingenieria-sistemas', 9, 1, 'Trabajo de Investigación I', 'project'),
    ('ucv', 'ingenieria-sistemas', 9, 2, 'Práctica Preprofesional I', 'internship'),
    ('ucv', 'ingenieria-sistemas', 9, 3, 'Inglés IX', 'required'),
    ('ucv', 'ingenieria-sistemas', 10, 1, 'Trabajo de Investigación II', 'project'),
    ('ucv', 'ingenieria-sistemas', 10, 2, 'Práctica Preprofesional II', 'internship'),
    ('ucv', 'ingenieria-sistemas', 10, 3, 'Inglés X', 'required'),

    -- UPN · Ingeniería de Sistemas Computacionales · malla 2026
    ('upn', 'ingenieria-sistemas-computacionales', 1, 1, 'Interpretación de Textos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 2, 'Desarrollo del Talento', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 3, 'Principios de Seguridad', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 4, 'Fundamentos de la Sostenibilidad Ambiental', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 5, 'Taller de Interpretación de Textos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 6, 'Arquitectura Empresarial de TI', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 7, 'Introducción a la Ingeniería de Sistemas Computacionales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 1, 8, 'Matemática Discreta y Geometría Analítica', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 1, 'Pensamiento Numérico', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 2, 'Empleabilidad y Tendencias del Mercado', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 3, 'Teoría de la Computación', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 4, 'Liderazgo en Gestión Socioambiental', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 5, 'Taller de Pensamiento Numérico', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 6, 'Lenguajes de Programación', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 7, 'Habilidades Digitales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 2, 8, 'Fundamentos de Programación', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 1, 'Comunicación Efectiva', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 2, 'Programación Web', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 3, 'Ciudadanía y Cambio Climático', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 4, 'Essentials 1', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 5, 'Estructuras de Datos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 6, 'Cálculo', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 3, 7, 'Base de Datos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 1, 'Probabilidad y Estadística', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 2, 'Análisis de Datos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 3, 'Essentials 2', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 4, 'Base de Datos Avanzadas y Big Data', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 5, 'Innovación y Emprendimiento', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 6, 'Cálculo Diferencial', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 4, 7, 'Modelado y Desarrollo de Aplicaciones', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 1, 'Metodología de la Investigación', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 2, 'Simulación y Análisis de Sistemas Computacionales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 3, 'Arquitectura del Computador', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 4, 'Inteligencia Artificial Aplicada para la Investigación', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 5, 'Metodologías Ágiles', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 6, 'Estructuras de Datos Avanzadas y Estrategias de Algoritmos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 7, 'Física 1', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 5, 8, 'Cálculo Integral', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 1, 'Formulación de Proyectos Interdisciplinarios', 'project'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 2, 'Ética y Ciudadanía Global', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 3, 'Física 2', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 4, 'Matemáticas Avanzadas para Ingenieros', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 5, 'Diseño y Arquitectura de Software', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 6, 'Diseño de Circuitos Digitales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 6, 7, 'Curso Certificador 1 de Ingeniería de Sistemas Computacionales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 1, 'Arte y Cultura', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 2, 'Dilemas Éticos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 3, 'Diseño Centrado en el Usuario', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 4, 'Fundamentos de Infraestructuras de Redes', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 5, 'Sistemas Embebidos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 6, 'Desarrollo de Aplicaciones Móviles', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 7, 'Estadística Aplicada', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 7, 8, 'Bootcamp Web', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 1, 'Electivo de Hub', 'elective'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 2, 'Soluciones de IoT y Robótica', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 3, 'Electivo de Carrera 1', 'elective'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 4, 'Diseño y Gestión Avanzada de Redes de Datos', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 5, 'Sistemas Inteligentes y Machine Learning', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 6, 'Aseguramiento de la Calidad en Sistemas Computacionales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 7, 'Optimización y Toma de Decisiones en Sistemas', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 8, 8, 'Curso Certificador 2 de Ingeniería de Sistemas Computacionales', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 1, 'Investigación en Ingeniería', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 2, 'Emprendimiento Integrador', 'project'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 3, 'Electivo de Carrera 2', 'elective'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 4, 'Computación Gráfica', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 5, 'Proyectos y Gobernanza de TI', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 6, 'Infraestructura y Seguridad en la Nube', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 9, 7, 'Integración de Competencias Generales y Habilidades Blandas', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 10, 1, 'Programación Competitiva y Modelos Inteligentes', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 10, 2, 'Compiladores', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 10, 3, 'Seguridad Integral de Sistemas', 'required'),
    ('upn', 'ingenieria-sistemas-computacionales', 10, 4, 'Trabajo de Investigación', 'project'),
    ('upn', 'ingenieria-sistemas-computacionales', 10, 5, 'Proyecto Integrador de Sistemas Computacionales', 'project'),
    ('upn', 'ingenieria-sistemas-computacionales', 10, 6, 'Integración de Competencias Específicas de Ingeniería de Sistemas Computacionales', 'required')
)
insert into public.curriculum_courses (term_id, position, name, course_type)
select term.id, course.position, course.name, course.course_type
from courses course
join public.curriculum_institutions institution on institution.slug = course.institution_slug
join public.curriculum_programs program
  on program.institution_id = institution.id and program.slug = course.program_slug
join public.curriculum_plans plan on plan.program_id = program.id and plan.is_active
join public.curriculum_terms term
  on term.plan_id = plan.id and term.term_number = course.term_number
on conflict (term_id, position) do nothing;
