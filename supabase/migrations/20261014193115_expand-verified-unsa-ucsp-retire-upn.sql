-- KODA · Catálogo curricular contrastado el 2026-10-14.
-- Las mallas sin relación completa de cursos se mantienen en source_identified:
-- no se ofrecen en el onboarding hasta concluir su contraste. Esto evita
-- asignar cursos inventados a un estudiante.

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
  values ('ucsp', 'Universidad Católica San Pablo', 'university', 'https://ucsp.edu.pe/', 'verified')
  on conflict (slug) do update
    set name = excluded.name, official_url = excluded.official_url, catalog_status = 'verified', updated_at = now()
  returning id into institution_uuid;

  insert into public.curriculum_sources (institution_id, title, source_url, source_type, is_official, published_at, reviewed_at, notes)
  values (
    institution_uuid,
    'Plan Curricular 2016 de Ciencia de la Computación',
    'https://cs.ucsp.edu.pe/media/cs-ucsp-plan-de-estudios-2016.pdf',
    'official_pdf', true, date '2016-01-01', date '2026-10-14',
    'Malla oficial publicada por la UCSP. Se conserva su versión 2016 explícitamente para no presentarla como una malla 2026.'
  )
  on conflict (institution_id, source_url) do update
    set reviewed_at = excluded.reviewed_at, notes = excluded.notes
  returning id into source_uuid;

  insert into public.curriculum_programs (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status, source_id)
  values (institution_uuid, 'ciencia-computacion', 'Ciencia de la Computación', 'technology', 'Semestre', 10, 'presential', 'verified', source_uuid)
  on conflict (institution_id, slug) do update
    set name = excluded.name, term_label = 'Semestre', default_term_count = 10, catalog_status = 'verified', source_id = excluded.source_id
  returning id into program_uuid;

  insert into public.curriculum_plans (program_id, source_id, label, version_label, modality, term_count, total_credits, source_status, reviewed_at, is_active)
  values (program_uuid, source_uuid, 'Plan Curricular 2016', 'publicado por UCSP; contrastado el 2026-10-14', 'presential', 10, 219, 'official_published', date '2026-10-14', true)
  on conflict (program_id, label, modality) do update
    set source_id = excluded.source_id, version_label = excluded.version_label, total_credits = excluded.total_credits, reviewed_at = excluded.reviewed_at, is_active = true
  returning id into plan_uuid;

  for term_record in
    select * from (values
      (1::smallint, 'Primer semestre'), (2::smallint, 'Segundo semestre'), (3::smallint, 'Tercer semestre'), (4::smallint, 'Cuarto semestre'), (5::smallint, 'Quinto semestre'),
      (6::smallint, 'Sexto semestre'), (7::smallint, 'Séptimo semestre'), (8::smallint, 'Octavo semestre'), (9::smallint, 'Noveno semestre'), (10::smallint, 'Décimo semestre')
    ) as terms(term_number, label)
  loop
    insert into public.curriculum_terms (plan_id, term_number, label)
    values (plan_uuid, term_record.term_number, term_record.label)
    on conflict (plan_id, term_number) do update set label = excluded.label
    returning id into term_uuid;

    delete from public.curriculum_courses where term_id = term_uuid;

    for course_record in
      select * from (values
        (1::smallint, 1::smallint, 'Programación de Video Juegos', 'required'),
        (1, 2, 'Estructuras Discretas I', 'required'),
        (1, 3, 'Matemática I', 'required'),
        (1, 4, 'Metodología del Estudio', 'required'),
        (1, 5, 'Comunicación', 'required'),
        (1, 6, 'Introducción a la Vida Universitaria', 'required'),
        (2, 1, 'Introducción de Ciencia de la Computación', 'required'),
        (2, 2, 'Estructuras Discretas II', 'required'),
        (2, 3, 'Ciencia de la Computación I', 'required'),
        (2, 4, 'Matemática II', 'required'),
        (2, 5, 'Introducción a la Filosofía', 'required'),
        (2, 6, 'Persona, Matrimonio y Familia', 'elective'),
        (2, 7, 'Apreciación Musical', 'elective'),
        (3, 1, 'Ciencia de la Computación II', 'required'),
        (3, 2, 'Desarrollo Basado en Plataformas', 'required'),
        (3, 3, 'Arquitectura de Computadores', 'required'),
        (3, 4, 'Álgebra Abstracta', 'required'),
        (3, 5, 'Cálculo I', 'required'),
        (3, 6, 'Antropología Filosófica y Teológica', 'required'),
        (3, 7, 'Apreciación Artística', 'elective'),
        (3, 8, 'Apreciación Literaria', 'elective'),
        (4, 1, 'Algoritmos y Estructuras de Datos', 'required'),
        (4, 2, 'Teoría de la Computación', 'required'),
        (4, 3, 'Bases de Datos I', 'required'),
        (4, 4, 'Cálculo II', 'required'),
        (4, 5, 'Estadística y Probabilidades', 'required'),
        (4, 6, 'Teología', 'required'),
        (5, 1, 'Bases de Datos II', 'required'),
        (5, 2, 'Ingeniería de Software I', 'required'),
        (5, 3, 'Análisis y Diseño de Algoritmos', 'required'),
        (5, 4, 'Física Computacional', 'required'),
        (5, 5, 'Análisis Numérico', 'required'),
        (5, 6, 'Teatro', 'required'),
        (5, 7, 'Moral', 'required'),
        (6, 1, 'Programación Competitiva', 'required'),
        (6, 2, 'Estructuras de Datos Avanzadas', 'required'),
        (6, 3, 'Sistemas Operativos', 'required'),
        (6, 4, 'Ingeniería de Software II', 'required'),
        (6, 5, 'Matemática Aplicada a la Computación', 'required'),
        (6, 6, 'Oratoria', 'required'),
        (7, 1, 'Computación Gráfica', 'required'),
        (7, 2, 'Ingeniería de Software III', 'required'),
        (7, 3, 'Redes y Comunicación', 'required'),
        (7, 4, 'Inteligencia Artificial', 'required'),
        (7, 5, 'Metodología de la Investigación en Computación', 'required'),
        (7, 6, 'Lenguajes de Programación', 'required'),
        (7, 7, 'Liderazgo', 'required'),
        (8, 1, 'Computación en la Sociedad', 'required'),
        (8, 2, 'Compiladores', 'required'),
        (8, 3, 'Seguridad en Computación', 'required'),
        (8, 4, 'Interacción Humano Computador', 'required'),
        (8, 5, 'Proyecto de Final de Carrera I', 'project'),
        (8, 6, 'Computación Paralela y Distribuida', 'required'),
        (8, 7, 'Historia de la Cultura', 'required'),
        (9, 1, 'Proyecto de Final de Carrera II', 'project'),
        (9, 2, 'Big Data', 'required'),
        (9, 3, 'Tópicos Avanzados en Ingeniería de Software', 'elective'),
        (9, 4, 'Tópicos en Inteligencia Artificial', 'elective'),
        (9, 5, 'Tópicos en Computación Gráfica', 'elective'),
        (9, 6, 'Computación Molecular Biológica', 'elective'),
        (9, 7, 'Historia de la Ciencia y Tecnología', 'required'),
        (9, 8, 'Enseñanza Social de la Iglesia', 'required'),
        (9, 9, 'Formación de Empresas de Base Tecnológica I', 'project'),
        (10, 1, 'Cloud Computing', 'required'),
        (10, 2, 'Proyecto de Final de Carrera III', 'project'),
        (10, 3, 'Sistemas de Información', 'elective'),
        (10, 4, 'Robótica', 'elective'),
        (10, 5, 'Ética Profesional', 'required'),
        (10, 6, 'Análisis de la Realidad Peruana', 'required'),
        (10, 7, 'Formación de Empresas de Base Tecnológica II', 'project'),
        (10, 8, 'Inglés Técnico Profesional', 'required')
      ) as courses(term_number, position, name, course_type)
      where term_number = term_record.term_number
      order by position
    loop
      insert into public.curriculum_courses (term_id, position, name, course_type, study_tags)
      values (term_uuid, course_record.position, course_record.name, course_record.course_type, array['official-catalog', 'ucsp', 'plan-2016']);
    end loop;
  end loop;
end;
$$;

-- Programas detectados en las páginas institucionales. No se habilitan para
-- selección hasta tener la malla completa y vigente cargada por ciclo.
insert into public.curriculum_programs (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status)
select id, 'ingenieria-industrial', 'Ingeniería Industrial', 'engineering', 'Semestre', 10, 'presential', 'source_identified'
from public.curriculum_institutions where slug = 'ucsp'
on conflict (institution_id, slug) do update set name = excluded.name, catalog_status = 'source_identified';

insert into public.curriculum_programs (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status)
select id, 'ciencia-datos', 'Ciencia de Datos', 'technology', 'Semestre', 10, 'presential', 'source_identified'
from public.curriculum_institutions where slug = 'ucsp'
on conflict (institution_id, slug) do update set name = excluded.name, catalog_status = 'source_identified';

insert into public.curriculum_programs (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status)
select id, 'inteligencia-artificial', 'Inteligencia Artificial', 'technology', 'Semestre', 10, 'presential', 'source_identified'
from public.curriculum_institutions where slug = 'ucsp'
on conflict (institution_id, slug) do update set name = excluded.name, catalog_status = 'source_identified';

insert into public.curriculum_institutions (slug, name, institution_type, official_url, catalog_status)
values ('unsa', 'Universidad Nacional de San Agustín de Arequipa', 'university', 'https://www.unsa.edu.pe/', 'source_identified')
on conflict (slug) do update set name = excluded.name, official_url = excluded.official_url, updated_at = now();

insert into public.curriculum_sources (institution_id, title, source_url, source_type, is_official, published_at, reviewed_at, notes)
select id, 'Plan de Estudios 2025 de Ingeniería de Sistemas', 'https://transparencia.unsa.edu.pe/bitstream/handle/123456789/1497/RCU-0086-2025.pdf?isAllowed=y&sequence=1', 'official_pdf', true, date '2025-01-01', date '2026-10-14', 'Fuente oficial localizada; su carga se mantiene pendiente de revisión completa por semestre.'
from public.curriculum_institutions where slug = 'unsa'
on conflict (institution_id, source_url) do update set reviewed_at = excluded.reviewed_at, notes = excluded.notes;

insert into public.curriculum_programs (institution_id, slug, name, discipline_family, term_label, default_term_count, modality, catalog_status)
select institution.id, program.slug, program.name, program.family, 'Semestre', 10, 'presential', 'source_identified'
from public.curriculum_institutions as institution
cross join (values
  ('ingenieria-sistemas', 'Ingeniería de Sistemas', 'technology'),
  ('ciencia-computacion', 'Ciencia de la Computación', 'technology'),
  ('ingenieria-industrial', 'Ingeniería Industrial', 'engineering')
) as program(slug, name, family)
where institution.slug = 'unsa'
on conflict (institution_id, slug) do update set name = excluded.name, catalog_status = 'source_identified';

-- UPN deja de aparecer para nuevos registros. No se eliminan perfiles
-- históricos ni datos de estudiantes que ya la seleccionaron.
update public.curriculum_programs
set catalog_status = 'retired'
where institution_id = (select id from public.curriculum_institutions where slug = 'upn');

update public.curriculum_institutions
set catalog_status = 'retired', updated_at = now()
where slug = 'upn';
