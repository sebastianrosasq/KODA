# KODA · hoja de ruta S1–S8

| Sprint | Entregable demostrable | Dependencia externa |
| --- | --- | --- |
| S1 · Fundación | Navegación móvil, design tokens premium claro/oscuro, accesibilidad y app ejecutando en Android. | Expo / dispositivo o emulador |
| S2 · Cuenta y catálogo | Auth, perfil curricular, cursos editables, migraciones y RLS. | Proyecto Supabase |
| S3 · Organización | Exámenes, temas, disponibilidad y planificador explicable. | Supabase |
| S4 · Repaso | Flashcards, materiales, audio y sesiones de repaso. | Storage Supabase |
| S5 · Seguimiento | Progreso, riesgo, recordatorios y push Android. | Firebase FCM / Expo |
| S6 · IA y materiales | PDF/audio privado, extracción controlada, chat, resumen, tarjetas y práctica generada. | Gemini + Supabase Edge Functions |
| S7 · Evaluación | Simulacros, analítica de aprendizaje, pruebas unitarias/e2e y accesibilidad. | Dispositivos de prueba |
| S8 · Release | Privacidad, manejo de errores, telemetría, APK interna y AAB de Play. | EAS / Play Console |

Cada sprint termina con una demo en Android y criterios de aceptación verificables. Ningún sprint posterior se inicia con vulnerabilidades críticas no evaluadas o con secretos dentro del repositorio.

## Estado de implementación

- S1 está integrado: navegación, tema, componentes base e identidad visual.
- S2 y S3 están integrados con Supabase: autenticación, RLS, catálogo oficial, sincronización de perfil, cursos, exámenes, temas, disponibilidad y sesiones.
- S4 ya contiene flashcards creadas por el estudiante y sincronizadas. Materiales, audios y carga privada de archivos continúan en el trabajo de Storage del S6.
- S5 cuenta con progreso derivado del avance real y recordatorios locales semanales; el envío remoto con FCM/Expo Push se cerrará en la etapa de release.
- S6 está implementado y activo: selector de PDF/audio, consentimiento, Storage privado, funciones autenticadas para Gemini, chat con contexto, historial privado por cuenta, salida JSON validada, cuota por estudiante y pantalla de resultados. La comprobación física con material no sensible se realizará durante el cierre de release; la clave no se versiona.
- S7 está implementado: simulacros desde flashcards o análisis de PDF, corrección explicada, resultados persistidos, analítica acumulada y pruebas unitarias de la lógica crítica. La pasada manual integral en Android se consolidará antes de cerrar el S8, sin reemplazar las validaciones de código de cada sprint.
- S8 está en cierre: ya incluye exportación de datos, eliminación definitiva de cuenta y borrado de materiales privados desde una función autenticada. Faltan la URL pública de política/condiciones, telemetría de errores, push remoto, la APK/AAB y las pruebas físicas de release.
