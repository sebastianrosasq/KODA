-- KODA · Cuotas separadas por formato y análisis de sílabos.
-- El chat no se contabiliza. Los materiales mantienen límite diario para
-- controlar el costo del análisis binario con Gemini.

alter table public.student_ai_daily_quotas
  add column if not exists pdf_analyses_used smallint not null default 0
    check (pdf_analyses_used between 0 and 3),
  add column if not exists audio_analyses_used smallint not null default 0
    check (audio_analyses_used between 0 and 5);

alter table public.student_study_documents
  add column if not exists document_role text not null default 'study_material';

alter table public.student_study_documents
  add constraint student_study_documents_role_check
    check (document_role in ('study_material', 'syllabus')),
  add constraint student_study_documents_syllabus_pdf_check
    check (document_role <> 'syllabus' or content_kind = 'pdf');

alter table public.student_exams
  add column if not exists event_kind text not null default 'assessment'
    check (event_kind in ('assessment', 'activity'));

drop function if exists public.consume_koda_ai_quota(uuid, text);

create function public.consume_koda_ai_quota(
  requested_user_id uuid,
  requested_operation text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  local_day date := (timezone('America/Lima', now()))::date;
  next_count smallint;
  quota_limit smallint;
  quota_column text;
begin
  if requested_user_id is null then
    raise exception 'Usuario requerido';
  end if;

  -- Compatibilidad segura con instalaciones antiguas mientras se actualiza la APK.
  if requested_operation = 'study_coach' then
    return jsonb_build_object('allowed', true, 'remaining', null);
  end if;

  if requested_operation = 'document_pdf' then
    quota_column := 'pdf_analyses_used';
    quota_limit := 3;
  elsif requested_operation = 'document_audio' then
    quota_column := 'audio_analyses_used';
    quota_limit := 5;
  elsif requested_operation = 'document_analysis' then
    -- Las APK antiguas no declaran formato; se les aplica el límite de PDF.
    quota_column := 'pdf_analyses_used';
    quota_limit := 3;
  else
    raise exception 'Operación de IA no permitida';
  end if;

  if quota_column = 'pdf_analyses_used' then
    insert into public.student_ai_daily_quotas (user_id, quota_day, pdf_analyses_used)
    values (requested_user_id, local_day, 1)
    on conflict (user_id, quota_day) do update
      set pdf_analyses_used = student_ai_daily_quotas.pdf_analyses_used + 1,
          updated_at = now()
      where student_ai_daily_quotas.pdf_analyses_used < quota_limit
    returning pdf_analyses_used into next_count;
  else
    insert into public.student_ai_daily_quotas (user_id, quota_day, audio_analyses_used)
    values (requested_user_id, local_day, 1)
    on conflict (user_id, quota_day) do update
      set audio_analyses_used = student_ai_daily_quotas.audio_analyses_used + 1,
          updated_at = now()
      where student_ai_daily_quotas.audio_analyses_used < quota_limit
    returning audio_analyses_used into next_count;
  end if;

  return jsonb_build_object(
    'allowed', next_count is not null,
    'remaining', greatest(0, quota_limit - coalesce(next_count, quota_limit)),
    'limit', quota_limit
  );
end;
$$;

revoke all on function public.consume_koda_ai_quota(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_koda_ai_quota(uuid, text) to service_role;
