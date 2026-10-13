-- KODA · cierre de alertas de seguridad y rendimiento para S6/S7.
-- La cuota solo se consume desde la Edge Function, usando la clave secreta
-- interna de Supabase después de verificar el JWT del estudiante.

drop function public.consume_koda_ai_quota(text);

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
  next_document_count smallint;
  next_coach_count smallint;
begin
  if requested_user_id is null then
    raise exception 'Usuario requerido';
  end if;

  if requested_operation = 'document_analysis' then
    insert into public.student_ai_daily_quotas (user_id, quota_day, document_analyses_used)
    values (requested_user_id, local_day, 1)
    on conflict (user_id, quota_day) do update
      set document_analyses_used = student_ai_daily_quotas.document_analyses_used + 1,
          updated_at = now()
      where student_ai_daily_quotas.document_analyses_used < 2
    returning document_analyses_used, coach_messages_used
    into next_document_count, next_coach_count;

    return jsonb_build_object(
      'allowed', next_document_count is not null,
      'remaining', greatest(0, 2 - coalesce(next_document_count, 2))
    );
  end if;

  if requested_operation = 'study_coach' then
    insert into public.student_ai_daily_quotas (user_id, quota_day, coach_messages_used)
    values (requested_user_id, local_day, 1)
    on conflict (user_id, quota_day) do update
      set coach_messages_used = student_ai_daily_quotas.coach_messages_used + 1,
          updated_at = now()
      where student_ai_daily_quotas.coach_messages_used < 8
    returning document_analyses_used, coach_messages_used
    into next_document_count, next_coach_count;

    return jsonb_build_object(
      'allowed', next_coach_count is not null,
      'remaining', greatest(0, 8 - coalesce(next_coach_count, 8))
    );
  end if;

  raise exception 'Operación de IA no permitida';
end;
$$;

revoke all on function public.consume_koda_ai_quota(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_koda_ai_quota(uuid, text) to service_role;

create index student_quiz_attempts_document_completed_idx
  on public.student_quiz_attempts (document_id, completed_at desc)
  where document_id is not null;
