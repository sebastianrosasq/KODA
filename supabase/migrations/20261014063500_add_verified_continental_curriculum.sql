-- Malla oficial consultada el 2026-10-14:
-- https://ucontinental.edu.pe/carrera/ingenieria-de-sistemas-e-informatica/plan-de-estudios/
-- La página institucional publica los diez periodos y sus créditos.

do $$
declare
  institution_uuid uuid;
  source_uuid uuid;
  program_uuid uuid;
  plan_uuid uuid;
  term_uuid uuid;
  term_record record;
  course_record record;
begin
  insert into public.curriculum_institutions (slug, name, institution_type, official_url, catalog_status)
  values ('continental', 'Universidad Continental', 'university', 'https://ucontinental.edu.pe/', 'verified')
  on conflict (slug) do update set name = excluded.name, official_url = excluded.official_url, catalog_status = 'verified', updated_at = now()
  returning id into institution_uuid;

  insert into public.curriculum_sources (institution_id, title, source_url, source_type, is_official, reviewed_at, notes)
  values (
    institution_uuid,
    'Plan de estudios de Ingeniería de Sistemas e Informática',
    'https://ucontinental.edu.pe/carrera/ingenieria-de-sistemas-e-informatica/plan-de-estudios/',
    'official_page',
    true,
    date '2026-10-14',
    'Plan institucional de diez periodos académicos; los electivos se conservan como tales.'
  )
  on conflict (institution_id, source_url) do update set reviewed_at = excluded.reviewed_at, notes = excluded.notes
  returning id into source_uuid;

  insert into public.curriculum_programs (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status, source_id)
  values (institution_uuid, 'ingenieria-sistemas-informatica', 'Ingeniería de Sistemas e Informática', 'technology', 'Ciclo', 10, 'flexible', 'verified', source_uuid)
  on conflict (institution_id, slug) do update set name = excluded.name, catalog_status = 'verified', source_id = excluded.source_id, default_term_count = 10
  returning id into program_uuid;

  insert into public.curriculum_plans (program_id, source_id, label, version_label, modality, term_count, total_credits, source_status, reviewed_at, is_active)
  values (program_uuid, source_uuid, 'Plan publicado 2026', 'vigente al 2026-10-14', 'flexible', 10, 220, 'official_published', date '2026-10-14', true)
  on conflict (program_id, label, modality) do update set source_id = excluded.source_id, version_label = excluded.version_label, reviewed_at = excluded.reviewed_at, is_active = true
  returning id into plan_uuid;

  for term_record in
    select * from (values
      (1::smallint, 'Ciclo 1'), (2::smallint, 'Ciclo 2'), (3::smallint, 'Ciclo 3'), (4::smallint, 'Ciclo 4'), (5::smallint, 'Ciclo 5'),
      (6::smallint, 'Ciclo 6'), (7::smallint, 'Ciclo 7'), (8::smallint, 'Ciclo 8'), (9::smallint, 'Ciclo 9'), (10::smallint, 'Ciclo 10')
    ) as terms(term_number, label)
  loop
    insert into public.curriculum_terms (plan_id, term_number, label)
    values (plan_uuid, term_record.term_number, term_record.label)
    on conflict (plan_id, term_number) do update set label = excluded.label
    returning id into term_uuid;

    delete from public.curriculum_courses where term_id = term_uuid;

    for course_record in
      select * from (values
        (1::smallint, 1::smallint, 'Comprensión y Producción de Textos 1', 3::numeric, 'required'),
        (1, 2, 'Laboratorio de Liderazgo e Innovación', 3, 'required'),
        (1, 3, 'Estrategias y Herramientas Digitales para el Aprendizaje', 4, 'required'),
        (1, 4, 'Matemática Básica', 4, 'required'),
        (1, 5, 'Matemática Discreta 1', 4, 'required'),
        (1, 6, 'Técnicas de Programación', 2, 'required'),
        (1, 7, 'Introducción a la Ingeniería de Sistemas e Informática', 3, 'required'),
        (2, 1, 'Comprensión y Producción de Textos 2', 4, 'required'),
        (2, 2, 'Electivo General 1', 3, 'elective'),
        (2, 3, 'Álgebra Lineal y Geometría Analítica', 4, 'required'),
        (2, 4, 'Modelado de Negocios', 3, 'required'),
        (2, 5, 'Matemática Superior', 4, 'required'),
        (2, 6, 'Matemática Discreta 2', 4, 'required'),
        (2, 7, 'Programación Orientada a Objetos', 2, 'required'),
        (3, 1, 'Estadística y Probabilidades', 4, 'required'),
        (3, 2, 'Electivo General 2', 3, 'elective'),
        (3, 3, 'Laboratorio de Liderazgo e Innovación Intermedio', 2, 'required'),
        (3, 4, 'Cálculo Diferencial', 4, 'required'),
        (3, 5, 'Física 1', 4, 'required'),
        (3, 6, 'Base de Datos 1', 3, 'required'),
        (3, 7, 'Diseño Web', 2, 'required'),
        (3, 8, 'Estructura de Datos', 2, 'required'),
        (4, 1, 'Electivo General 3', 3, 'elective'),
        (4, 2, 'Electivo General 4', 3, 'elective'),
        (4, 3, 'English Course 1', 3, 'required'),
        (4, 4, 'Cálculo Integral', 4, 'required'),
        (4, 5, 'Física Electromagnética', 4, 'required'),
        (4, 6, 'Análisis y Diseño de Software', 4, 'required'),
        (4, 7, 'Programación Web', 2, 'required'),
        (5, 1, 'English Course 2', 3, 'required'),
        (5, 2, 'Laboratorio de Liderazgo e Innovación Avanzado', 3, 'required'),
        (5, 3, 'Ecuaciones Diferenciales', 4, 'required'),
        (5, 4, 'Estadística para Ingeniería', 3, 'required'),
        (5, 5, 'Desarrollo de Aplicaciones Web', 2, 'required'),
        (5, 6, 'Base de Datos 2', 3, 'required'),
        (5, 7, 'Arquitectura del Computador', 3, 'required'),
        (6, 1, 'Investigación Académica', 3, 'required'),
        (6, 2, 'English Course 3', 3, 'required'),
        (6, 3, 'Investigación Operativa 1', 4, 'required'),
        (6, 4, 'Métodos Numéricos', 4, 'required'),
        (6, 5, 'Desarrollo de Videojuegos', 4, 'required'),
        (6, 6, 'Sistemas Operativos', 4, 'required'),
        (7, 1, 'English Course 4', 3, 'required'),
        (7, 2, 'Electivo General 5', 1, 'elective'),
        (7, 3, 'Ingeniería Económica', 3, 'required'),
        (7, 4, 'Redes de Computadoras', 4, 'required'),
        (7, 5, 'Ingeniería de Software', 4, 'required'),
        (7, 6, 'Proyectos de Innovación', 2, 'project'),
        (7, 7, 'Fundamentos de Sistemas Dinámicos y Modelado', 3, 'required'),
        (7, 8, 'Construcción y Pruebas de Software', 4, 'required'),
        (8, 1, 'Simulación de Procesos', 3, 'required'),
        (8, 2, 'Gestión de Proyectos en Ingeniería', 3, 'project'),
        (8, 3, 'Conmutación y Enrutamiento', 4, 'required'),
        (8, 4, 'Desarrollo de Aplicaciones Móviles', 4, 'required'),
        (8, 5, 'Arquitectura de Software', 3, 'required'),
        (8, 6, 'Metodologías Ágiles para el Desarrollo de Software', 3, 'required'),
        (9, 1, 'Electivo Transversal o de Especialidad 1', 3, 'elective'),
        (9, 2, 'Taller de Investigación 1 en Ingeniería de Sistemas e Informática', 4, 'project'),
        (9, 3, 'Proyectos de Diseño en Ingeniería de Sistemas e Informática', 4, 'project'),
        (9, 4, 'Inteligencia de Negocios y Ciencia de Datos', 4, 'required'),
        (9, 5, 'Seguridad de la Información', 3, 'required'),
        (9, 6, 'Aplicaciones Cloud', 2, 'required'),
        (10, 1, 'Taller de Investigación 2 en Ingeniería de Sistemas e Informática', 4, 'project'),
        (10, 2, 'Proyectos de Diseño y Desarrollo en Ingeniería de Sistemas e Informática', 4, 'project'),
        (10, 3, 'Auditoría de Sistemas', 3, 'required'),
        (10, 4, 'Robótica y Machine Learning', 2, 'required'),
        (10, 5, 'Planificación y Gestión de Tecnologías de la Información', 3, 'required'),
        (10, 6, 'Electivo Transversal o de Especialidad 2', 3, 'elective')
      ) as courses(term_number, position, name, credits, course_type)
      where term_number = term_record.term_number
      order by position
    loop
      insert into public.curriculum_courses (term_id, position, name, credits, course_type, study_tags)
      values (term_uuid, course_record.position, course_record.name, course_record.credits, course_record.course_type, array['official-catalog', 'continental']) ;
    end loop;
  end loop;
end;
$$;

-- UCV deja de estar disponible para nuevas selecciones. No se borran perfiles
-- históricos ni cursos de estudiantes que ya la eligieron.
update public.curriculum_programs
set catalog_status = 'retired'
where institution_id = (select id from public.curriculum_institutions where slug = 'ucv');

update public.curriculum_institutions
set catalog_status = 'retired', updated_at = now()
where slug = 'ucv';
