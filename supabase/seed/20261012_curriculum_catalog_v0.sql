-- KODA · catálogo inicial de mallas verificadas.
-- Corte de fuentes: 2026-10-12.
-- Solo los planes con source_status = official_published se pueden precargar.

insert into public.curriculum_institutions
  (slug, name, institution_type, official_url, licensing_reference_url, catalog_status)
values
  ('tecsup', 'TECSUP', 'institute', 'https://www.tecsup.edu.pe/', 'https://www.datosabiertos.gob.pe/dataset/institutos-de-educaci%C3%B3n-superior-licenciados-por-el-ministerio-de-educaci%C3%B3n', 'verified'),
  ('ucsm', 'Universidad Católica de Santa María', 'university', 'https://www.ucsm.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'verified'),
  ('ucsp', 'Universidad Católica San Pablo', 'university', 'https://ucsp.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'verified'),
  ('unsa', 'Universidad Nacional de San Agustín de Arequipa', 'university', 'https://www.unsa.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'verified'),
  ('idat', 'Instituto IDAT', 'institute', 'https://www.idat.edu.pe/', 'https://www.datosabiertos.gob.pe/dataset/institutos-de-educaci%C3%B3n-superior-licenciados-por-el-ministerio-de-educaci%C3%B3n', 'verified'),
  ('certus', 'CERTUS', 'institute', 'https://www.certus.edu.pe/', 'https://www.datosabiertos.gob.pe/dataset/institutos-de-educaci%C3%B3n-superior-licenciados-por-el-ministerio-de-educaci%C3%B3n', 'source_identified'),
  ('isil', 'ISIL', 'institute', 'https://isil.pe/', 'https://www.datosabiertos.gob.pe/dataset/institutos-de-educaci%C3%B3n-superior-licenciados-por-el-ministerio-de-educaci%C3%B3n', 'source_identified'),
  ('senati', 'SENATI', 'institute', 'https://www.senati.edu.pe/', 'https://www.datosabiertos.gob.pe/dataset/institutos-de-educaci%C3%B3n-superior-licenciados-por-el-ministerio-de-educaci%C3%B3n', 'source_identified'),
  ('cibertec', 'CIBERTEC', 'institute', 'https://www.cibertec.edu.pe/', 'https://www.datosabiertos.gob.pe/dataset/institutos-de-educaci%C3%B3n-superior-licenciados-por-el-ministerio-de-educaci%C3%B3n', 'source_identified'),
  ('utp', 'Universidad Tecnológica del Perú', 'university', 'https://www.utp.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'verified'),
  ('upc', 'Universidad Peruana de Ciencias Aplicadas', 'university', 'https://www.upc.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'source_identified'),
  ('pucp', 'Pontificia Universidad Católica del Perú', 'university', 'https://www.pucp.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'source_identified'),
  ('unmsm', 'Universidad Nacional Mayor de San Marcos', 'university', 'https://www.unmsm.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'source_identified'),
  ('ucv', 'Universidad César Vallejo', 'university', 'https://www.ucv.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'source_identified'),
  ('upn', 'Universidad Privada del Norte', 'university', 'https://www.upn.edu.pe/', 'https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/', 'source_identified')
on conflict (slug) do nothing;

insert into public.curriculum_sources
  (institution_id, title, source_url, source_type, reviewed_at, notes)
select institution.id, source.title, source.url, source.source_type, date '2026-10-12', source.notes
from (
  values
    ('tecsup', 'Malla curricular: Diseño y Desarrollo de Software nacional v3', 'https://www1.tecsup.edu.pe/sites/default/files/files-webdrupal/plancurricular/53046-MALLACURRICULAR-3A_v3.pdf', 'official_pdf', 'Incluye 6 ciclos, 131 créditos y 2960 horas.'),
    ('ucsm', 'Ingeniería de Sistemas: plan de estudios 2026', 'https://www2.ucsm.edu.pe/ciencias-e-ingenierias/ingenieria-de-sistemas/', 'official_page', 'Fuente oficial de la UCSM con plan 2026; pendiente de transcribir y contrastar cada curso por semestre antes de activar la precarga.'),
    ('ucsp', 'Ciencia de la Computación: malla curricular 2026', 'https://ucsp.edu.pe/vive-san-pablo/universidad/transparencia/malla-curricular-programa-estudios-ciencia-computacion/', 'official_page', 'La página institucional de transparencia publica las mallas 2026 y 2016; se usará exclusivamente la versión 2026 tras extraer cada semestre.'),
    ('unsa', 'Ingeniería de Sistemas: listado de asignaturas del plan de estudios 2025', 'https://transparencia.unsa.edu.pe/bitstream/handle/123456789/1497/RCU-0086-2025.pdf?isAllowed=y&sequence=1', 'official_pdf', 'Documento oficial de la UNSA para el plan 2025; contiene asignaturas, créditos y prerrequisitos. Pendiente de importación controlada por semestre.'),
    ('idat', 'Computación e Informática / Desarrollo de Sistemas de Información', 'https://www.idat.edu.pe/carreras-profesionales-tecnicas/computacion-e-informatica', 'official_page', 'La página presenta rutas de 4, 6 y 8 ciclos; la semilla solo carga la ruta técnica de 4 ciclos.'),
    ('certus', 'Diseño y Desarrollo de Software', 'https://www.certus.edu.pe/carrera/diseno-desarrollo-software/', 'official_page', 'Fuente encontrada; el plan queda en revisión antes de activarse en KODA.'),
    ('isil', 'Desarrollo de Sistemas de Información', 'https://isil.pe/areas-academicas/desarollo-de-software/?cod_oc=s1018', 'official_page', 'La malla permite elegir cursos desde el primer ciclo; requiere modelado flexible antes de activarse.'),
    ('senati', 'Catálogo de programas SENATI', 'https://www.senati.edu.pe/sites/default/files/archivos/2017/publicaciones/09/catalogo_senati_2016.pdf', 'official_pdf', 'La fuente localizada es histórica; no se usa como plan vigente.'),
    ('cibertec', 'Ingeniería de Sistemas Informáticos', 'https://www.cibertec.edu.pe/carreras-bachiller/ingenieria-de-sistemas-informaticos/', 'official_page', 'Fuente identificada; pendiente de importar con versión y modalidad exactas.'),
    ('utp', 'Malla curricular: Ingeniería de Sistemas e Informática', 'https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-sistemas-e-informatica/malla-curricular', 'official_page', 'Malla de 10 ciclos publicada por UTP.'),
    ('utp', 'Currículum: Administración de Empresas presencial', 'https://www.utp.edu.pe/sites/default/files/2026-04/P02-Administracion-de-Empresas-Presencial.pdf', 'official_pdf', 'Versión 02-2024, publicada por UTP en 2026; incluye 10 ciclos y 54 cursos.'),
    ('upc', 'Malla curricular: Ingeniería de Software', 'https://pregrado.upc.edu.pe/facultad-de-ingenieria/ingenieria-de-software/malla-curricular/', 'official_page', 'Malla 2025, sujeta a modificaciones; pendiente de asignar cursos a cada ciclo desde su documento versionado.'),
    ('pucp', 'Plan de estudios: Ingeniería Informática', 'https://facultad-ciencias-ingenieria.pucp.edu.pe/carreras/ingenieria-informatica/plan-de-estudios/', 'official_page', 'La fuente indica 10 semestres, divididos en Estudios Generales y Facultad; pendiente importar el PDF vigente.'),
    ('unmsm', 'Plan de estudios: Ingeniería de Sistemas 2018', 'https://sum.unmsm.edu.pe/loginWebSum/ReportePlanes.htm?lEscuela=1&lEspecialidad=0&lFacultad=20&lPlan=2018', 'official_page', 'Plan oficial identificado; requiere una captura estable del reporte antes de activarse.'),
    ('ucv', 'Ingeniería de Sistemas a distancia', 'https://www.ucv.edu.pe/pregrado-distancia/ingenieria-de-sistemas', 'official_page', 'Fuente identificada; pendiente versión de plan y detalle por ciclo.'),
    ('upn', 'Ingeniería de Sistemas Computacionales', 'https://www.upn.edu.pe/pregrado/ingenieria/ingenieria-de-sistemas-computacionales', 'official_page', 'Fuente identificada; pendiente versión de plan y detalle por ciclo.')
) as source(slug, title, url, source_type, notes)
join public.curriculum_institutions institution on institution.slug = source.slug
on conflict (institution_id, source_url) do nothing;

insert into public.curriculum_programs
  (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status, source_id)
select institution.id, program.slug, program.name, program.discipline_family, program.term_label,
  program.default_term_count, program.modality, program.catalog_status, source.id
from (
  values
    ('tecsup', 'diseno-desarrollo-software', 'Diseño y Desarrollo de Software', 'Tecnología e informática', 'Ciclo', 6, 'presential', 'verified'),
    ('ucsm', 'ingenieria-sistemas', 'Ingeniería de Sistemas', 'Tecnología e informática', 'Semestre', 10, 'presential', 'source_identified'),
    ('ucsp', 'ciencia-computacion', 'Ciencia de la Computación', 'Tecnología e informática', 'Semestre', 10, 'presential', 'source_identified'),
    ('unsa', 'ingenieria-sistemas', 'Ingeniería de Sistemas', 'Tecnología e informática', 'Semestre', 10, 'presential', 'source_identified'),
    ('idat', 'tecnico-programacion-software', 'Técnico en Programación de Software', 'Tecnología e informática', 'Ciclo', 4, 'unspecified', 'verified'),
    ('certus', 'diseno-desarrollo-software', 'Diseño y Desarrollo de Software', 'Tecnología e informática', 'Ciclo', 6, 'virtual', 'source_identified'),
    ('isil', 'desarrollo-sistemas-informacion', 'Desarrollo de Sistemas de Información', 'Tecnología e informática', 'Ciclo', 6, 'flexible', 'source_identified'),
    ('senati', 'desarrollo-software', 'Desarrollo de Software', 'Tecnología e informática', 'Semestre', 6, 'unspecified', 'source_identified'),
    ('cibertec', 'ingenieria-sistemas-informaticos', 'Ingeniería de Sistemas Informáticos', 'Tecnología e informática', 'Ciclo', null, 'unspecified', 'source_identified'),
    ('utp', 'ingenieria-sistemas-informatica', 'Ingeniería de Sistemas e Informática', 'Tecnología e informática', 'Ciclo', 10, 'presential', 'verified'),
    ('upc', 'ingenieria-software', 'Ingeniería de Software', 'Tecnología e informática', 'Ciclo', 10, 'unspecified', 'source_identified'),
    ('pucp', 'ingenieria-informatica', 'Ingeniería Informática', 'Tecnología e informática', 'Semestre', 10, 'presential', 'source_identified'),
    ('unmsm', 'ingenieria-sistemas', 'Ingeniería de Sistemas', 'Tecnología e informática', 'Ciclo', 10, 'presential', 'source_identified'),
    ('ucv', 'ingenieria-sistemas', 'Ingeniería de Sistemas', 'Tecnología e informática', 'Ciclo', null, 'virtual', 'source_identified'),
    ('upn', 'ingenieria-sistemas-computacionales', 'Ingeniería de Sistemas Computacionales', 'Tecnología e informática', 'Ciclo', null, 'unspecified', 'source_identified')
) as program(institution_slug, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status)
join public.curriculum_institutions institution on institution.slug = program.institution_slug
join public.curriculum_sources source on source.institution_id = institution.id
  and source.source_url = case program.institution_slug
    when 'tecsup' then 'https://www1.tecsup.edu.pe/sites/default/files/files-webdrupal/plancurricular/53046-MALLACURRICULAR-3A_v3.pdf'
    when 'ucsm' then 'https://www2.ucsm.edu.pe/ciencias-e-ingenierias/ingenieria-de-sistemas/'
    when 'ucsp' then 'https://ucsp.edu.pe/vive-san-pablo/universidad/transparencia/malla-curricular-programa-estudios-ciencia-computacion/'
    when 'unsa' then 'https://transparencia.unsa.edu.pe/bitstream/handle/123456789/1497/RCU-0086-2025.pdf?isAllowed=y&sequence=1'
    when 'idat' then 'https://www.idat.edu.pe/carreras-profesionales-tecnicas/computacion-e-informatica'
    when 'certus' then 'https://www.certus.edu.pe/carrera/diseno-desarrollo-software/'
    when 'isil' then 'https://isil.pe/areas-academicas/desarollo-de-software/?cod_oc=s1018'
    when 'senati' then 'https://www.senati.edu.pe/sites/default/files/archivos/2017/publicaciones/09/catalogo_senati_2016.pdf'
    when 'cibertec' then 'https://www.cibertec.edu.pe/carreras-bachiller/ingenieria-de-sistemas-informaticos/'
    when 'utp' then 'https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-sistemas-e-informatica/malla-curricular'
    when 'upc' then 'https://pregrado.upc.edu.pe/facultad-de-ingenieria/ingenieria-de-software/malla-curricular/'
    when 'pucp' then 'https://facultad-ciencias-ingenieria.pucp.edu.pe/carreras/ingenieria-informatica/plan-de-estudios/'
    when 'unmsm' then 'https://sum.unmsm.edu.pe/loginWebSum/ReportePlanes.htm?lEscuela=1&lEspecialidad=0&lFacultad=20&lPlan=2018'
    when 'ucv' then 'https://www.ucv.edu.pe/pregrado-distancia/ingenieria-de-sistemas'
    when 'upn' then 'https://www.upn.edu.pe/pregrado/ingenieria/ingenieria-de-sistemas-computacionales'
  end
on conflict (institution_id, slug) do nothing;

insert into public.curriculum_programs
  (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status, source_id)
select institution.id, 'administracion-empresas', 'Administración de Empresas', 'Administración y negocios',
  'Ciclo', 10, 'presential', 'verified', source.id
from public.curriculum_institutions institution
join public.curriculum_sources source on source.institution_id = institution.id
  and source.source_url = 'https://www.utp.edu.pe/sites/default/files/2026-04/P02-Administracion-de-Empresas-Presencial.pdf'
where institution.slug = 'utp'
on conflict (institution_id, slug) do nothing;

insert into public.curriculum_plans
  (program_id, source_id, label, version_label, modality, term_count, total_credits, total_hours, source_status, reviewed_at)
select program.id, source.id, plan.label, plan.version_label, plan.modality, plan.term_count,
  plan.total_credits, plan.total_hours, 'official_published', date '2026-10-12'
from (
  values
    ('tecsup', 'diseno-desarrollo-software', 'Malla nacional', 'v3', 'presential', 6, 131.00, 2960),
    ('idat', 'tecnico-programacion-software', 'Ruta técnica publicada', null, 'unspecified', 4, null, null),
    ('utp', 'ingenieria-sistemas-informatica', 'Malla publicada por UTP', null, 'presential', 10, null, null)
) as plan(institution_slug, program_slug, label, version_label, modality, term_count, total_credits, total_hours)
join public.curriculum_institutions institution on institution.slug = plan.institution_slug
join public.curriculum_programs program on program.institution_id = institution.id and program.slug = plan.program_slug
join public.curriculum_sources source on source.id = program.source_id
on conflict (program_id, label, modality) do nothing;

insert into public.curriculum_plans
  (program_id, source_id, label, version_label, modality, term_count, total_credits, source_status, reviewed_at)
select program.id, source.id, 'Currículum presencial', '02-2024', 'presential', 10, 200.00,
  'official_published', date '2026-10-12'
from public.curriculum_programs program
join public.curriculum_institutions institution on institution.id = program.institution_id
join public.curriculum_sources source on source.institution_id = institution.id
  and source.source_url = 'https://www.utp.edu.pe/sites/default/files/2026-04/P02-Administracion-de-Empresas-Presencial.pdf'
where institution.slug = 'utp' and program.slug = 'administracion-empresas'
on conflict (program_id, label, modality) do nothing;

insert into public.curriculum_terms (plan_id, term_number, label)
select plan.id, term.number, 'Ciclo ' || lpad(term.number::text, 2, '0')
from public.curriculum_plans plan
join public.curriculum_programs program on program.id = plan.program_id
join public.curriculum_institutions institution on institution.id = program.institution_id
join (
  values
    ('tecsup', 'diseno-desarrollo-software', 1), ('tecsup', 'diseno-desarrollo-software', 2),
    ('tecsup', 'diseno-desarrollo-software', 3), ('tecsup', 'diseno-desarrollo-software', 4),
    ('tecsup', 'diseno-desarrollo-software', 5), ('tecsup', 'diseno-desarrollo-software', 6),
    ('idat', 'tecnico-programacion-software', 1), ('idat', 'tecnico-programacion-software', 2),
    ('idat', 'tecnico-programacion-software', 3), ('idat', 'tecnico-programacion-software', 4),
    ('utp', 'ingenieria-sistemas-informatica', 1), ('utp', 'ingenieria-sistemas-informatica', 2),
    ('utp', 'ingenieria-sistemas-informatica', 3), ('utp', 'ingenieria-sistemas-informatica', 4),
    ('utp', 'ingenieria-sistemas-informatica', 5), ('utp', 'ingenieria-sistemas-informatica', 6),
    ('utp', 'ingenieria-sistemas-informatica', 7), ('utp', 'ingenieria-sistemas-informatica', 8),
    ('utp', 'ingenieria-sistemas-informatica', 9), ('utp', 'ingenieria-sistemas-informatica', 10)
    ,('utp', 'administracion-empresas', 1), ('utp', 'administracion-empresas', 2),
    ('utp', 'administracion-empresas', 3), ('utp', 'administracion-empresas', 4),
    ('utp', 'administracion-empresas', 5), ('utp', 'administracion-empresas', 6),
    ('utp', 'administracion-empresas', 7), ('utp', 'administracion-empresas', 8),
    ('utp', 'administracion-empresas', 9), ('utp', 'administracion-empresas', 10)
) as term(institution_slug, program_slug, number)
  on institution.slug = term.institution_slug and program.slug = term.program_slug
on conflict (plan_id, term_number) do nothing;

insert into public.curriculum_courses (term_id, position, name, study_tags)
select term.id, course.position, course.name, course.tags
from (
  values
    ('tecsup', 'diseno-desarrollo-software', 1, 1, 'Diseño de Interfaces de Programación', array['programación', 'interfaces']),
    ('tecsup', 'diseno-desarrollo-software', 1, 2, 'Fundamentos de Programación', array['programación']),
    ('tecsup', 'diseno-desarrollo-software', 1, 3, 'Ciencias Básicas Aplicadas', array['ciencias básicas']),
    ('tecsup', 'diseno-desarrollo-software', 1, 4, 'Técnicas de Expresión Oral y Escrita', array['comunicación']),
    ('tecsup', 'diseno-desarrollo-software', 1, 5, 'Cálculo y Estadística', array['matemática', 'estadística']),
    ('tecsup', 'diseno-desarrollo-software', 1, 6, 'Desarrollo Personal', array['empleabilidad']),
    ('tecsup', 'diseno-desarrollo-software', 2, 1, 'Investigación de Mercado', array['investigación', 'negocios']),
    ('tecsup', 'diseno-desarrollo-software', 2, 2, 'Programación Orientada a Objetos', array['programación']),
    ('tecsup', 'diseno-desarrollo-software', 2, 3, 'Base de Datos', array['bases de datos']),
    ('tecsup', 'diseno-desarrollo-software', 2, 4, 'Arquitectura de Computadoras', array['arquitectura de computadoras']),
    ('tecsup', 'diseno-desarrollo-software', 2, 5, 'Informática Aplicada en TI', array['tecnologías de información']),
    ('tecsup', 'diseno-desarrollo-software', 2, 6, 'Comprensión y Producción de Textos', array['comunicación']),
    ('tecsup', 'diseno-desarrollo-software', 2, 7, 'Aplicaciones del Cálculo y Estadística', array['matemática', 'estadística']),
    ('tecsup', 'diseno-desarrollo-software', 3, 1, 'Ingeniería de Requerimientos y Diseño de Software', array['requerimientos', 'diseño de software']),
    ('tecsup', 'diseno-desarrollo-software', 3, 2, 'Estructuras de Datos y Algoritmos', array['algoritmos', 'estructuras de datos']),
    ('tecsup', 'diseno-desarrollo-software', 3, 3, 'Desarrollo de Aplicaciones en Internet', array['desarrollo web']),
    ('tecsup', 'diseno-desarrollo-software', 3, 4, 'Base de Datos Avanzado', array['bases de datos']),
    ('tecsup', 'diseno-desarrollo-software', 3, 5, 'Sistemas Operativos', array['sistemas operativos']),
    ('tecsup', 'diseno-desarrollo-software', 3, 6, 'Mejora Continua en el Diseño', array['calidad', 'diseño de software']),
    ('tecsup', 'diseno-desarrollo-software', 4, 1, 'Construcción y Pruebas de Software', array['construcción de software', 'pruebas de software']),
    ('tecsup', 'diseno-desarrollo-software', 4, 2, 'Tecnologías Emergentes', array['tecnologías emergentes']),
    ('tecsup', 'diseno-desarrollo-software', 4, 3, 'Desarrollo de Aplicaciones Empresariales', array['desarrollo empresarial']),
    ('tecsup', 'diseno-desarrollo-software', 4, 4, 'Desarrollo de Aplicaciones Web', array['desarrollo web']),
    ('tecsup', 'diseno-desarrollo-software', 4, 5, 'Programación en Móviles', array['desarrollo móvil']),
    ('tecsup', 'diseno-desarrollo-software', 4, 6, 'Investigación e Innovación Tecnológica', array['investigación', 'innovación']),
    ('tecsup', 'diseno-desarrollo-software', 5, 1, 'Aplicaciones Móviles Multiplataforma', array['desarrollo móvil']),
    ('tecsup', 'diseno-desarrollo-software', 5, 2, 'Integración de Sistemas Empresariales', array['integración de sistemas']),
    ('tecsup', 'diseno-desarrollo-software', 5, 3, 'Marketing y Comercialización de Nuevos Productos', array['marketing', 'negocios']),
    ('tecsup', 'diseno-desarrollo-software', 5, 4, 'Desarrollo de Aplicaciones Web Avanzado', array['desarrollo web']),
    ('tecsup', 'diseno-desarrollo-software', 5, 5, 'Programación en Móviles Avanzado', array['desarrollo móvil']),
    ('tecsup', 'diseno-desarrollo-software', 5, 6, 'Desarrollo de Soluciones en la Nube', array['cloud']),
    ('tecsup', 'diseno-desarrollo-software', 5, 7, 'Diseño de Proyectos de Innovación', array['innovación', 'proyectos']),
    ('tecsup', 'diseno-desarrollo-software', 6, 1, 'Gestión de Servicio de Software', array['gestión', 'software']),
    ('tecsup', 'diseno-desarrollo-software', 6, 2, 'Integración de Sistemas Empresariales Avanzado', array['integración de sistemas']),
    ('tecsup', 'diseno-desarrollo-software', 6, 3, 'Desarrollo de Aplicaciones Empresariales Avanzado', array['desarrollo empresarial']),
    ('tecsup', 'diseno-desarrollo-software', 6, 4, 'Startup Venture Project', array['emprendimiento', 'proyectos']),
    ('tecsup', 'diseno-desarrollo-software', 6, 5, 'Inteligencia de Negocios', array['inteligencia de negocios', 'datos']),
    ('tecsup', 'diseno-desarrollo-software', 6, 6, 'Consultoría y Desarrollo Profesional', array['empleabilidad']),
    ('tecsup', 'diseno-desarrollo-software', 6, 7, 'Emprendimiento', array['emprendimiento']),
    ('tecsup', 'diseno-desarrollo-software', 6, 8, 'Sociedad y Desarrollo Sostenible', array['sostenibilidad']),
    ('idat', 'tecnico-programacion-software', 1, 1, 'Lectura Comprensiva y Escritura', array['comunicación']),
    ('idat', 'tecnico-programacion-software', 1, 2, 'Fundamentos Lógico-Matemáticos para el Desarrollo de Sistemas', array['matemática', 'lógica']),
    ('idat', 'tecnico-programacion-software', 1, 3, 'Desarrollo de Habilidades Intrapersonales', array['empleabilidad']),
    ('idat', 'tecnico-programacion-software', 1, 4, 'Fundamentos de Programación', array['programación']),
    ('idat', 'tecnico-programacion-software', 1, 5, 'Desarrollo Web', array['desarrollo web']),
    ('idat', 'tecnico-programacion-software', 1, 6, 'Soporte de TI', array['soporte TI']),
    ('idat', 'tecnico-programacion-software', 1, 7, 'Herramientas Ofimáticas para la Investigación', array['ofimática', 'investigación']),
    ('idat', 'tecnico-programacion-software', 2, 1, 'Lectura Crítica y Argumentación', array['comunicación']),
    ('idat', 'tecnico-programacion-software', 2, 2, 'Solución de Problemas Matemáticos Aplicados al Desarrollo de Sistemas', array['matemática', 'lógica']),
    ('idat', 'tecnico-programacion-software', 2, 3, 'Programación Orientada a Objetos', array['programación']),
    ('idat', 'tecnico-programacion-software', 2, 4, 'Desarrollo de Interfaces 1', array['interfaces']),
    ('idat', 'tecnico-programacion-software', 2, 5, 'Diseño de Base de Datos Relacionales', array['bases de datos']),
    ('idat', 'tecnico-programacion-software', 2, 6, 'Seminario sobre Tecnología e Inteligencia Artificial', array['inteligencia artificial', 'tecnologías emergentes']),
    ('idat', 'tecnico-programacion-software', 2, 7, 'EFSRT 1: Proyecto Desarrollo de los Componentes de la Capa de Vista', array['proyecto', 'interfaces']),
    ('idat', 'tecnico-programacion-software', 3, 1, 'Desarrollo Profesional', array['empleabilidad']),
    ('idat', 'tecnico-programacion-software', 3, 2, 'Programación de Base de Datos', array['bases de datos']),
    ('idat', 'tecnico-programacion-software', 3, 3, 'Desarrollo de Interfaces 2', array['interfaces']),
    ('idat', 'tecnico-programacion-software', 3, 4, 'Análisis y Diseño de Sistemas Orientados a Objetos', array['análisis de sistemas', 'diseño de software']),
    ('idat', 'tecnico-programacion-software', 3, 5, 'Redes Informáticas', array['redes']),
    ('idat', 'tecnico-programacion-software', 3, 6, 'Investigación Ética y Responsabilidad Ciudadana', array['ética', 'investigación']),
    ('idat', 'tecnico-programacion-software', 3, 7, 'Seminario sobre Creatividad e Innovación', array['innovación']),
    ('idat', 'tecnico-programacion-software', 4, 1, 'Desarrollo de Habilidades Interpersonales', array['empleabilidad']),
    ('idat', 'tecnico-programacion-software', 4, 2, 'Desarrollo de los Componentes del Negocio', array['negocios']),
    ('idat', 'tecnico-programacion-software', 4, 3, 'Desarrollo de Interfaces 3', array['interfaces']),
    ('idat', 'tecnico-programacion-software', 4, 4, 'Patrones de Diseño de Software', array['diseño de software']),
    ('idat', 'tecnico-programacion-software', 4, 5, 'Innovación Centrada en Personas', array['innovación', 'UX']),
    ('idat', 'tecnico-programacion-software', 4, 6, 'Seminario sobre Retos y Reflexiones Sociales', array['ciudadanía']),
    ('idat', 'tecnico-programacion-software', 4, 7, 'EFSRT 2: Proyecto Integración de Componentes de Datos, Negocio y Vista', array['proyecto', 'integración de sistemas']),
    ('utp', 'ingenieria-sistemas-informatica', 1, 1, 'Introducción a la Vida Universitaria', array['vida universitaria']),
    ('utp', 'ingenieria-sistemas-informatica', 1, 2, 'Individuo y Medio Ambiente', array['medio ambiente']),
    ('utp', 'ingenieria-sistemas-informatica', 1, 3, 'Inglés 1', array['inglés']),
    ('utp', 'ingenieria-sistemas-informatica', 1, 4, 'Comprensión y Redacción de Textos 1', array['comunicación']),
    ('utp', 'ingenieria-sistemas-informatica', 1, 5, 'Principios de Algoritmos', array['algoritmos']),
    ('utp', 'ingenieria-sistemas-informatica', 1, 6, 'Matemática 1', array['matemática']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 1, 'Introducción a las TIC', array['tecnologías de información']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 2, 'Inglés 2', array['inglés']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 3, 'Comprensión y Redacción de Textos 2', array['comunicación']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 4, 'Matemática 2', array['matemática']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 5, 'Matemática Discreta', array['matemática']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 6, 'Problemas y Desafíos en el Perú Actual', array['ciudadanía']),
    ('utp', 'ingenieria-sistemas-informatica', 2, 7, 'Estadística Descriptiva y Probabilidades', array['estadística']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 1, 'Cálculo 1', array['matemática']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 2, 'Inglés 3', array['inglés']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 3, 'Ciudadanía y Reflexión Ética', array['ética', 'ciudadanía']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 4, 'Taller de Programación', array['programación']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 5, 'Estadística Inferencial', array['estadística']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 6, 'Mecánica Clásica', array['física']),
    ('utp', 'ingenieria-sistemas-informatica', 3, 7, 'Laboratorio de Mecánica Clásica', array['física', 'laboratorio']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 1, 'Inglés 4', array['inglés']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 2, 'Investigación Académica', array['investigación']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 3, 'Programación Orientada a Objetos', array['programación']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 4, 'Base de Datos', array['bases de datos']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 5, 'Análisis y Diseño de Algoritmos', array['algoritmos']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 6, 'Cálculo 2', array['matemática']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 7, 'Fundamentos de Electromagnetismo', array['física']),
    ('utp', 'ingenieria-sistemas-informatica', 4, 8, 'Laboratorio de Fundamentos de Electromagnetismo', array['física', 'laboratorio']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 1, 'Taller de Programación Web', array['desarrollo web']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 2, 'Sistemas Operativos', array['sistemas operativos']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 3, 'Algoritmos y Estructuras de Datos', array['algoritmos', 'estructuras de datos']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 4, 'Redes y Comunicación de Datos 1', array['redes']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 5, 'Herramientas Informáticas para la Toma de Decisiones', array['datos', 'negocios']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 6, 'Diseño de Patrones', array['diseño de software']),
    ('utp', 'ingenieria-sistemas-informatica', 5, 7, 'Base de Datos 2', array['bases de datos']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 1, 'Gestión de Proyectos', array['gestión de proyectos']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 2, 'Análisis y Diseño de Sistemas de Información', array['análisis de sistemas']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 3, 'Curso Integrador 1: Sistemas - Software', array['proyecto', 'software']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 4, 'JavaScript Avanzado', array['programación', 'desarrollo web']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 5, 'Marcos de Desarrollo Web', array['desarrollo web']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 6, 'Hoja de Estilo en Cascada Avanzado', array['desarrollo web']),
    ('utp', 'ingenieria-sistemas-informatica', 6, 7, 'Administración y Organización de Empresas', array['negocios']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 1, 'Seguridad Informática', array['ciberseguridad']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 2, 'Lenguajes de Programación', array['programación']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 3, 'Teoría de Sistemas', array['teoría de sistemas']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 4, 'Diseño de Productos y Servicios', array['diseño de producto']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 5, 'Desarrollo Web Integrado', array['desarrollo web']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 6, 'Herramientas de Desarrollo', array['herramientas de desarrollo']),
    ('utp', 'ingenieria-sistemas-informatica', 7, 7, 'Liderazgo y Gestión de Equipos', array['liderazgo', 'gestión']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 1, 'Innovación y Transformación Digital', array['innovación', 'transformación digital']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 2, 'Diseño e Implementación de Arquitectura Empresarial', array['arquitectura empresarial']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 3, 'Herramientas de Prototipado', array['prototipado']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 4, 'Gestión del Servicio TI', array['gestión TI']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 5, 'Inteligencia de Negocios', array['inteligencia de negocios', 'datos']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 6, 'Herramientas para la Comunicación Efectiva', array['comunicación']),
    ('utp', 'ingenieria-sistemas-informatica', 8, 7, 'Negociación y Narrativa', array['negociación', 'comunicación']),
    ('utp', 'ingenieria-sistemas-informatica', 9, 1, 'Curso Integrador 2: Sistemas', array['proyecto', 'sistemas']),
    ('utp', 'ingenieria-sistemas-informatica', 9, 2, 'Interacción Hombre Máquina', array['UX', 'interacción']),
    ('utp', 'ingenieria-sistemas-informatica', 9, 3, 'Planeamiento Estratégico de las TIC', array['planeamiento', 'TI']),
    ('utp', 'ingenieria-sistemas-informatica', 9, 4, 'Formación para la Investigación - Sistemas', array['investigación']),
    ('utp', 'ingenieria-sistemas-informatica', 9, 5, 'Sistemas de Información Empresarial', array['sistemas de información', 'negocios']),
    ('utp', 'ingenieria-sistemas-informatica', 9, 6, 'Gestión del Conocimiento', array['gestión del conocimiento']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 1, 'Taller de Investigación - Sistemas', array['investigación']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 2, 'Herramientas de Desarrollo Profesional - TIC', array['empleabilidad', 'TI']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 3, 'Ética Profesional', array['ética']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 4, 'Formación para la Empleabilidad', array['empleabilidad']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 5, 'Servicios Cloud', array['cloud']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 6, 'Ingeniería Económica', array['economía']),
    ('utp', 'ingenieria-sistemas-informatica', 10, 7, 'Electivo 1', array['electivo']),
    ('utp', 'administracion-empresas', 1, 1, 'Comprensión y Redacción de Textos I', array['comunicación']),
    ('utp', 'administracion-empresas', 1, 2, 'Fundamentos de Contabilidad y Finanzas', array['contabilidad', 'finanzas']),
    ('utp', 'administracion-empresas', 1, 3, 'Introducción a la Administración', array['administración']),
    ('utp', 'administracion-empresas', 1, 4, 'Introducción a la Vida Universitaria', array['vida universitaria']),
    ('utp', 'administracion-empresas', 1, 5, 'Matemática para los Negocios I', array['matemática', 'negocios']),
    ('utp', 'administracion-empresas', 1, 6, 'Problemas y Desafíos en el Perú Actual', array['ciudadanía']),
    ('utp', 'administracion-empresas', 2, 1, 'Comprensión y Redacción de Textos II', array['comunicación']),
    ('utp', 'administracion-empresas', 2, 2, 'Contabilidad Financiera', array['contabilidad']),
    ('utp', 'administracion-empresas', 2, 3, 'Derecho Empresarial', array['derecho', 'negocios']),
    ('utp', 'administracion-empresas', 2, 4, 'Gestión General', array['administración']),
    ('utp', 'administracion-empresas', 2, 5, 'Inglés I', array['inglés']),
    ('utp', 'administracion-empresas', 2, 6, 'Matemática para los Negocios II', array['matemática', 'negocios']),
    ('utp', 'administracion-empresas', 3, 1, 'Contabilidad Gerencial y de Costos', array['contabilidad', 'costos']),
    ('utp', 'administracion-empresas', 3, 2, 'Estadística Aplicada para los Negocios', array['estadística', 'negocios']),
    ('utp', 'administracion-empresas', 3, 3, 'Individuo y Medio Ambiente', array['medio ambiente']),
    ('utp', 'administracion-empresas', 3, 4, 'Informática para los Negocios', array['tecnologías de información', 'negocios']),
    ('utp', 'administracion-empresas', 3, 5, 'Inglés II', array['inglés']),
    ('utp', 'administracion-empresas', 4, 1, 'Ciudadanía y Reflexión Ética', array['ética', 'ciudadanía']),
    ('utp', 'administracion-empresas', 4, 2, 'Comportamiento y Cultura en las Organizaciones', array['organizaciones']),
    ('utp', 'administracion-empresas', 4, 3, 'Finanzas Aplicadas', array['finanzas']),
    ('utp', 'administracion-empresas', 4, 4, 'Fundamentos de Marketing', array['marketing']),
    ('utp', 'administracion-empresas', 4, 5, 'Inglés III', array['inglés']),
    ('utp', 'administracion-empresas', 4, 6, 'Microeconomía y Macroeconomía', array['economía']),
    ('utp', 'administracion-empresas', 5, 1, 'Curso Integrador en Administración y Negocios', array['proyecto', 'administración']),
    ('utp', 'administracion-empresas', 5, 2, 'Inglés IV', array['inglés']),
    ('utp', 'administracion-empresas', 5, 3, 'Investigación Académica', array['investigación']),
    ('utp', 'administracion-empresas', 5, 4, 'Investigación de Mercados', array['marketing', 'investigación']),
    ('utp', 'administracion-empresas', 5, 5, 'Investigación Operativa', array['investigación operativa']),
    ('utp', 'administracion-empresas', 6, 1, 'Gerencia de Evaluación Financiera', array['finanzas', 'gerencia']),
    ('utp', 'administracion-empresas', 6, 2, 'Gestión de Ventas', array['ventas', 'gestión']),
    ('utp', 'administracion-empresas', 6, 3, 'Gestión del Talento Humano', array['recursos humanos']),
    ('utp', 'administracion-empresas', 6, 4, 'Innovación y Transformación Empresarial', array['innovación', 'transformación digital']),
    ('utp', 'administracion-empresas', 6, 5, 'Negocios Digitales', array['negocios digitales']),
    ('utp', 'administracion-empresas', 6, 6, 'Taller de Habilidades Gerenciales', array['liderazgo', 'gestión']),
    ('utp', 'administracion-empresas', 7, 1, 'Administración de Operaciones', array['operaciones']),
    ('utp', 'administracion-empresas', 7, 2, 'Diseño Organizacional', array['organizaciones']),
    ('utp', 'administracion-empresas', 7, 3, 'Electivo I', array['electivo']),
    ('utp', 'administracion-empresas', 7, 4, 'Formulación y Evaluación Presupuestal', array['finanzas', 'presupuestos']),
    ('utp', 'administracion-empresas', 7, 5, 'Planificación y Estrategias de Acción', array['estrategia']),
    ('utp', 'administracion-empresas', 8, 1, 'Analítica de Datos', array['datos', 'analítica']),
    ('utp', 'administracion-empresas', 8, 2, 'Dirección de Personas', array['recursos humanos', 'liderazgo']),
    ('utp', 'administracion-empresas', 8, 3, 'Formación para la Empleabilidad', array['empleabilidad']),
    ('utp', 'administracion-empresas', 8, 4, 'Formación para la Investigación - Administración y Negocios', array['investigación']),
    ('utp', 'administracion-empresas', 8, 5, 'Gestión y Suministros de Bienes y Servicios', array['logística', 'operaciones']),
    ('utp', 'administracion-empresas', 9, 1, 'Curso Integrador en Gestión Estratégica de Empresas', array['proyecto', 'estrategia']),
    ('utp', 'administracion-empresas', 9, 2, 'Dirección Comercial', array['gestión comercial']),
    ('utp', 'administracion-empresas', 9, 3, 'Electivo II', array['electivo']),
    ('utp', 'administracion-empresas', 9, 4, 'Negociación y Toma de Decisiones', array['negociación', 'decisiones']),
    ('utp', 'administracion-empresas', 9, 5, 'Ética Profesional y Responsabilidad Social', array['ética', 'responsabilidad social']),
    ('utp', 'administracion-empresas', 10, 1, 'Dirección Estratégica', array['estrategia']),
    ('utp', 'administracion-empresas', 10, 2, 'Dirección Financiera', array['finanzas']),
    ('utp', 'administracion-empresas', 10, 3, 'Electivo III', array['electivo']),
    ('utp', 'administracion-empresas', 10, 4, 'Herramientas de Desarrollo Profesional - Gestión', array['empleabilidad', 'gestión']),
    ('utp', 'administracion-empresas', 10, 5, 'Taller de Investigación - Administración de Empresas', array['investigación'])
) as course(institution_slug, program_slug, term_number, position, name, tags)
join public.curriculum_institutions institution on institution.slug = course.institution_slug
join public.curriculum_programs program on program.institution_id = institution.id and program.slug = course.program_slug
join public.curriculum_plans plan on plan.program_id = program.id and plan.is_active
join public.curriculum_terms term on term.plan_id = plan.id and term.term_number = course.term_number
on conflict (term_id, position) do nothing;
