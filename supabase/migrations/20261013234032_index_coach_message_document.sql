-- Evita recorridos completos al limpiar o consultar mensajes ligados a un material.
create index student_coach_messages_document_idx
  on public.student_coach_messages (document_id)
  where document_id is not null;
