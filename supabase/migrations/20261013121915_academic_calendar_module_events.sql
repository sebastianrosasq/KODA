-- KODA · Eventos para calendarios académicos modulares

alter table public.institution_academic_calendar_events
  drop constraint if exists institution_academic_calendar_events_event_type_check;

alter table public.institution_academic_calendar_events
  add constraint institution_academic_calendar_events_event_type_check check (event_type in (
    'enrollment_regular',
    'enrollment_late',
    'classes_start',
    'classes_end',
    'module_start',
    'module_end',
    'midterm_exam_window',
    'final_exam_window',
    'makeup_exam_window',
    'academic_break'
  ));
