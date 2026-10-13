-- KODA · Calendarios académicos oficiales verificados (corte 2026-10-13)
--
-- Solo se registran eventos con fecha publicada por la institución. Si una
-- universidad no divulga una fecha de evaluación, KODA pide la fecha real al
-- estudiante en lugar de calcularla como si fuera oficial.

with periods (
  institution_slug,
  period_code,
  label,
  modality,
  source_url,
  source_title
) as (
  values
    ('unsa', '2026-A', 'Semestre académico 2026-A', 'presential', 'https://www.unsa.edu.pe/unsa-aprueba-cronograma-academico-2026-a/', 'Cronograma académico UNSA 2026-A'),
    ('certus', '2026-2', 'Periodo académico 2026-2', 'flexible', 'https://www.certus.edu.pe/matricula/', 'Matrícula CERTUS 2026-2'),
    ('cibertec', '2026-43', 'Ciclo regular 2026-43', 'flexible', 'https://explora.cibertec.edu.pe/es_ES/notas/%C2%BFcuando-inicia-y-termina-el-modulo-academico', 'Calendario modular CIBERTEC 2026-43'),
    ('utp', '2026-1', 'Pregrado ciclo 1 - marzo 2026', 'presential', 'https://www.utp.edu.pe/web/sites/default/files/2026-05/RRN%C2%BA-0070-2026-R-UTP-Proceso-de-Admision-y-Calendario-de-Admision-2026-1-v3_PT.pdf', 'Resolución Rectoral UTP 2026 ciclo 1'),
    ('upc', '2026-2', 'Pregrado 2026-2', 'presential', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf', 'Calendario académico anual UPC 2026'),
    ('pucp', '2026-2', 'Semestre 2026-2', 'presential', 'https://estudiante.pucp.edu.pe/tramite/matricula/', 'Matrícula PUCP 2026-2'),
    ('unmsm', '2026-II', 'Semestre académico 2026-II', 'presential', 'https://viceacademico.unmsm.edu.pe/wp-content/uploads/2026/02/Gu%C3%ADa-del-estudiante-de-pregrado-2026.pdf', 'Cronograma de actividades académicas de pregrado UNMSM 2026'),
    ('ucv', '2026-II', 'Pregrado a distancia 2026-II', 'virtual', 'https://webadminportal.ucv.edu.pe/uploads/files/transparencia_01-04-24/2025/octubre_2025/RCUN_0404-2025-UCV_Cronograma_Acadeemico_y_Pagos_2026_%281%29_20251003173731.pdf', 'Cronograma académico UCV 2026'),
    ('upn', '2026-2', 'Pregrado tradicional 2026-2', 'presential', 'https://estudiante.upn.edu.pe/matricula-upn', 'Matrícula UPN 2026-2')
)
insert into public.institution_academic_periods (
  institution_id,
  period_code,
  label,
  modality,
  source_url,
  source_title,
  source_status,
  reviewed_at
)
select
  institution.id,
  period.period_code,
  period.label,
  period.modality,
  period.source_url,
  period.source_title,
  'official_published',
  date '2026-10-13'
from periods period
join public.curriculum_institutions institution on institution.slug = period.institution_slug
on conflict (institution_id, period_code, modality) do update set
  label = excluded.label,
  source_url = excluded.source_url,
  source_title = excluded.source_title,
  source_status = excluded.source_status,
  reviewed_at = excluded.reviewed_at,
  updated_at = now();

with events (
  institution_slug,
  period_code,
  modality,
  event_type,
  label,
  starts_on,
  ends_on,
  source_url
) as (
  values
    ('unsa', '2026-A', 'presential', 'enrollment_regular', 'Matrícula general virtual', date '2026-03-23', date '2026-03-31', 'https://www.unsa.edu.pe/matriculas-en-la-unsa-inician-este-23-de-marzo/'),
    ('unsa', '2026-A', 'presential', 'classes_start', 'Inicio de clases', date '2026-04-06', date '2026-04-06', 'https://www.unsa.edu.pe/unsa-aprueba-cronograma-academico-2026-a/'),
    ('unsa', '2026-A', 'presential', 'classes_end', 'Fin del semestre académico', date '2026-07-31', date '2026-07-31', 'https://www.unsa.edu.pe/unsa-aprueba-cronograma-academico-2026-a/'),
    ('certus', '2026-2', 'flexible', 'module_start', 'Inicio del módulo 1', date '2026-08-24', date '2026-08-24', 'https://www.certus.edu.pe/matricula/'),
    ('certus', '2026-2', 'flexible', 'module_end', 'Fin del módulo 1', date '2026-10-18', date '2026-10-18', 'https://www.certus.edu.pe/matricula/'),
    ('certus', '2026-2', 'flexible', 'module_start', 'Inicio del módulo 2', date '2026-10-19', date '2026-10-19', 'https://www.certus.edu.pe/matricula/'),
    ('certus', '2026-2', 'flexible', 'module_end', 'Fin del módulo 2', date '2026-12-13', date '2026-12-13', 'https://www.certus.edu.pe/matricula/'),
    ('cibertec', '2026-43', 'flexible', 'module_start', 'Inicio del módulo 1', date '2026-07-06', date '2026-07-06', 'https://explora.cibertec.edu.pe/es_ES/notas/%C2%BFcuando-inicia-y-termina-el-modulo-academico'),
    ('cibertec', '2026-43', 'flexible', 'module_end', 'Fin del módulo 1', date '2026-08-30', date '2026-08-30', 'https://explora.cibertec.edu.pe/es_ES/notas/%C2%BFcuando-inicia-y-termina-el-modulo-academico'),
    ('cibertec', '2026-43', 'flexible', 'module_start', 'Inicio del módulo 2', date '2026-09-07', date '2026-09-07', 'https://explora.cibertec.edu.pe/es_ES/notas/%C2%BFcuando-inicia-y-termina-el-modulo-academico'),
    ('cibertec', '2026-43', 'flexible', 'module_end', 'Fin del módulo 2', date '2026-11-01', date '2026-11-01', 'https://explora.cibertec.edu.pe/es_ES/notas/%C2%BFcuando-inicia-y-termina-el-modulo-academico'),
    ('utp', '2026-1', 'presential', 'enrollment_regular', 'Fin del proceso de matrícula', date '2025-09-22', date '2026-03-30', 'https://www.utp.edu.pe/web/sites/default/files/2026-05/RRN%C2%BA-0070-2026-R-UTP-Proceso-de-Admision-y-Calendario-de-Admision-2026-1-v3_PT.pdf'),
    ('utp', '2026-1', 'presential', 'classes_start', 'Inicio del periodo académico', date '2026-03-23', date '2026-03-23', 'https://www.utp.edu.pe/web/sites/default/files/2026-05/RRN%C2%BA-0070-2026-R-UTP-Proceso-de-Admision-y-Calendario-de-Admision-2026-1-v3_PT.pdf'),
    ('utp', '2026-1', 'presential', 'classes_end', 'Fin del periodo académico', date '2026-07-26', date '2026-07-26', 'https://www.utp.edu.pe/web/sites/default/files/2026-05/RRN%C2%BA-0070-2026-R-UTP-Proceso-de-Admision-y-Calendario-de-Admision-2026-1-v3_PT.pdf'),
    ('upc', '2026-2', 'presential', 'enrollment_regular', 'Matrícula', date '2026-08-17', date '2026-08-22', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf'),
    ('upc', '2026-2', 'presential', 'classes_start', 'Inicio de clases', date '2026-08-24', date '2026-08-24', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf'),
    ('upc', '2026-2', 'presential', 'midterm_exam_window', 'Evaluaciones parciales', date '2026-10-11', date '2026-10-18', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf'),
    ('upc', '2026-2', 'presential', 'classes_end', 'Último día de clases', date '2026-12-05', date '2026-12-05', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf'),
    ('upc', '2026-2', 'presential', 'final_exam_window', 'Evaluaciones finales', date '2026-12-06', date '2026-12-15', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf'),
    ('upc', '2026-2', 'presential', 'makeup_exam_window', 'Recuperaciones', date '2026-12-14', date '2026-12-19', 'https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf'),
    ('pucp', '2026-2', 'presential', 'enrollment_regular', 'Matrícula vía Campus Virtual', date '2026-08-04', date '2026-08-06', 'https://estudiante.pucp.edu.pe/tramite/matricula/'),
    ('pucp', '2026-2', 'presential', 'enrollment_late', 'Matrícula extemporánea', date '2026-08-10', date '2026-08-11', 'https://estudiante.pucp.edu.pe/tramite/matricula/'),
    ('pucp', '2026-2', 'presential', 'classes_start', 'Inicio de clases', date '2026-08-17', date '2026-08-17', 'https://estudiante.pucp.edu.pe/tramite/matricula/'),
    ('pucp', '2026-2', 'presential', 'midterm_exam_window', 'Primeros exámenes', date '2026-10-05', date '2026-10-17', 'https://estudios-generales-ciencias.pucp.edu.pe/informacion-academica/fechas-importantes/'),
    ('pucp', '2026-2', 'presential', 'classes_end', 'Fin del semestre', date '2026-12-12', date '2026-12-12', 'https://facultad-ciencias-ingenieria.pucp.edu.pe/estudiantes/https-facultad-ciencias-ingenieria-pucp-edu-pe-wp-content-uploads-2025-07-calendario-de-matricula-ciclo-2026-1-pdf/'),
    ('unmsm', '2026-II', 'presential', 'enrollment_regular', 'Matrícula regular', date '2026-08-10', date '2026-08-14', 'https://viceacademico.unmsm.edu.pe/wp-content/uploads/2026/02/Gu%C3%ADa-del-estudiante-de-pregrado-2026.pdf'),
    ('unmsm', '2026-II', 'presential', 'enrollment_late', 'Matrícula extemporánea y rectificación', date '2026-09-07', date '2026-09-11', 'https://viceacademico.unmsm.edu.pe/wp-content/uploads/2026/02/Gu%C3%ADa-del-estudiante-de-pregrado-2026.pdf'),
    ('unmsm', '2026-II', 'presential', 'midterm_exam_window', 'Evaluación parcial', date '2026-10-12', date '2026-10-17', 'https://viceacademico.unmsm.edu.pe/wp-content/uploads/2026/02/Gu%C3%ADa-del-estudiante-de-pregrado-2026.pdf'),
    ('ucv', '2026-II', 'virtual', 'enrollment_regular', 'Registro de matrícula', date '2026-06-15', date '2026-08-31', 'https://webadminportal.ucv.edu.pe/uploads/files/transparencia_01-04-24/2025/octubre_2025/RCUN_0404-2025-UCV_Cronograma_Acadeemico_y_Pagos_2026_%281%29_20251003173731.pdf'),
    ('ucv', '2026-II', 'virtual', 'classes_start', 'Inicio de clases', date '2026-09-01', date '2026-09-01', 'https://webadminportal.ucv.edu.pe/uploads/files/transparencia_01-04-24/2025/octubre_2025/RCUN_0404-2025-UCV_Cronograma_Acadeemico_y_Pagos_2026_%281%29_20251003173731.pdf'),
    ('ucv', '2026-II', 'virtual', 'classes_end', 'Fin del semestre', date '2026-12-21', date '2026-12-21', 'https://webadminportal.ucv.edu.pe/uploads/files/transparencia_01-04-24/2025/octubre_2025/RCUN_0404-2025-UCV_Cronograma_Acadeemico_y_Pagos_2026_%281%29_20251003173731.pdf'),
    ('ucv', '2026-II', 'virtual', 'makeup_exam_window', 'Evaluación opcional', date '2026-12-19', date '2026-12-22', 'https://webadminportal.ucv.edu.pe/uploads/files/transparencia_01-04-24/2025/octubre_2025/RCUN_0404-2025-UCV_Cronograma_Acadeemico_y_Pagos_2026_%281%29_20251003173731.pdf'),
    ('upn', '2026-2', 'presential', 'enrollment_regular', 'Turnos de matrícula', date '2026-08-08', date '2026-08-12', 'https://estudiante.upn.edu.pe/matricula-upn'),
    ('upn', '2026-2', 'presential', 'classes_start', 'Inicio de clases', date '2026-08-17', date '2026-08-17', 'https://estudiante.upn.edu.pe/matricula-upn')
)
insert into public.institution_academic_calendar_events (
  period_id,
  event_type,
  label,
  starts_on,
  ends_on,
  is_estimated,
  source_url
)
select
  period.id,
  event.event_type,
  event.label,
  event.starts_on,
  event.ends_on,
  false,
  event.source_url
from events event
join public.curriculum_institutions institution on institution.slug = event.institution_slug
join public.institution_academic_periods period
  on period.institution_id = institution.id
  and period.period_code = event.period_code
  and period.modality = event.modality
on conflict (period_id, event_type, starts_on, ends_on) do update set
  label = excluded.label,
  is_estimated = excluded.is_estimated,
  source_url = excluded.source_url,
  updated_at = now();
