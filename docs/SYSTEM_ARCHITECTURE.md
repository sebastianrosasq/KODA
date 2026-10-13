# KODA · arquitectura objetivo

```text
Expo / React Native (APK)
  ├─ Expo Router + diseño claro/oscuro
  ├─ almacenamiento seguro de sesión
  ├─ planificador determinista local
  └─ Supabase JS (solo clave publicable)
          │
          ▼
Supabase
  ├─ Auth
  ├─ PostgreSQL + RLS
  ├─ Storage privado para material/PDF
  ├─ Edge Functions: IA, notificaciones y tareas privilegiadas
  └─ Cron/cola según necesidad
          │
          ├─ Expo Push Service / FCM
          └─ OpenAI Responses API
              (OPENAI_API_KEY solo como secreto de Edge Function)
```

## Límites de confianza

- **APK:** puede usar únicamente la URL de Supabase y su clave publicable. Ninguna clave de servicio, OpenAI o Firebase privada viaja con la aplicación.
- **Base de datos:** RLS obliga que un estudiante solo lea/escriba sus propios datos.
- **PDF:** se sube a un bucket privado; una Edge Function valida tipo, tamaño, cuota y propiedad antes de procesarlo.
- **IA:** la función autentica al estudiante, limita uso/costo, registra métricas mínimas y devuelve solo el resultado necesario.

## Datos centrales

- Perfil curricular: institución, carrera, plan, modalidad y ciclo.
- Curso personal: instantánea editable de una malla o curso creado por el estudiante.
- Examen, tema, disponibilidad, sesión de estudio y progreso.
- Flashcard, material, simulacro, intento y resultado.
- Solicitud de IA: tipo, consumo, resultado y trazabilidad sin almacenar claves.

El esquema curricular inicial ya vive en `supabase/migrations` y `supabase/seed`. Sus fuentes, versiones y reglas de activación están documentadas junto al seed.
