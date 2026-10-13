# KODA · hoja de ruta S1–S8

| Sprint | Entregable demostrable | Dependencia externa |
| --- | --- | --- |
| S1 · Fundación | Navegación móvil, design tokens premium claro/oscuro, accesibilidad y app ejecutando en Android. | Expo / dispositivo o emulador |
| S2 · Cuenta y catálogo | Auth, perfil curricular, cursos editables, migraciones y RLS. | Proyecto Supabase |
| S3 · Organización | Exámenes, temas, disponibilidad y planificador explicable. | Supabase |
| S4 · Repaso | Flashcards, materiales, audio y sesiones de repaso. | Storage Supabase |
| S5 · Seguimiento | Progreso, riesgo, recordatorios y push Android. | Firebase FCM / Expo |
| S6 · IA y documentos | PDF privado, extracción controlada, resumen, tarjetas y práctica generada. | OpenAI + Supabase Edge Functions |
| S7 · Evaluación | Simulacros, analítica de aprendizaje, pruebas unitarias/e2e y accesibilidad. | Dispositivos de prueba |
| S8 · Release | Privacidad, manejo de errores, telemetría, APK interna y AAB de Play. | EAS / Play Console |

Cada sprint termina con una demo en Android y criterios de aceptación verificables. Ningún sprint posterior se inicia con vulnerabilidades críticas no evaluadas o con secretos dentro del repositorio.

## Estado de implementación

- S1 está integrado: navegación, tema, componentes base e identidad visual.
- S2 y S3 están integrados con Supabase: autenticación, RLS, catálogo oficial, sincronización de perfil, cursos, exámenes, temas, disponibilidad y sesiones.
- S4 ya contiene flashcards creadas por el estudiante y sincronizadas. Materiales, audios y carga privada de archivos continúan en el trabajo de Storage del S6.
- S5 cuenta con progreso derivado del avance real y recordatorios locales semanales; el envío remoto con FCM/Expo Push se cerrará en la etapa de release.
- S6 inicia con Storage privado y una Edge Function autenticada para PDFs. Falta configurar una clave de servidor, cuotas, la pantalla de carga y pruebas físicas antes de cerrarlo.
- La comprobación visual integral en Android se consolidará antes de cerrar el S8, sin reemplazar las validaciones de código de cada sprint.
