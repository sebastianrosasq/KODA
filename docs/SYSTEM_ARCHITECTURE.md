# KODA · arquitectura del sistema

Esta arquitectura permite construir una APK útil desde el Sprint 1 sin exponer credenciales. Cada bloque tiene una responsabilidad concreta y puede evolucionar sin mezclar interfaz, datos e IA.

## Vista general

~~~mermaid
flowchart TD
    student[Estudiante] --> app

    subgraph phone[Teléfono Android · APK KODA]
        app[Expo + React Native + TypeScript]
        router[Expo Router]
        planner[Planificador local]
        session[Sesión local segura]
        app --> router
        app --> planner
        app --> session
    end

    app -->|Clave publicable| supabase

    subgraph backend[Supabase]
        supabase[API segura]
        auth[Auth]
        db[(PostgreSQL + RLS)]
        storage[Storage privado]
        functions[Edge Functions]
        supabase --> auth
        supabase --> db
        supabase --> storage
        supabase --> functions
    end

    functions --> push[Expo Push Service / FCM]
    functions --> ai[Gemini API]
~~~

## Responsabilidades

| Parte | Hace | Nunca contiene |
| --- | --- | --- |
| APK KODA | Interfaz, navegación, datos del estudiante y reglas de planificación locales. | Claves de Gemini, Firebase, firma o service_role. |
| Supabase Auth | Crea sesión y reconoce al usuario autenticado. | Permisos para acceder a datos de otra persona. |
| PostgreSQL con RLS | Guarda perfiles, cursos, exámenes, temas, sesiones y progreso. | Lecturas o escrituras entre estudiantes distintos. |
| Storage privado | Guarda material y PDFs de cada estudiante. | Archivos públicos por defecto. |
| Edge Functions | Procesa IA, PDFs, cuotas y notificaciones. | Secretos enviados a la APK. |
| Gemini | Genera ayuda de estudio con datos autorizados. | Acceso directo desde el móvil. |

## Recorrido futuro de un PDF con IA

~~~mermaid
sequenceDiagram
    participant E as Estudiante
    participant A as APK KODA
    participant S as Supabase Storage
    participant F as Edge Function
    participant G as Gemini

    E->>A: Selecciona su PDF
    A->>S: Sube al espacio privado del estudiante
    A->>F: Solicita análisis con sesión autenticada
    F->>F: Valida propiedad, tipo, tamaño y cuota
    F->>S: Lee solo el archivo autorizado
    F->>G: Envía el contenido mínimo necesario
    G-->>F: Devuelve resumen o preguntas
    F-->>A: Devuelve resultado seguro
    A-->>E: Muestra el resultado
~~~

Este recorrido está implementado desde el Sprint 6. Las funciones validan sesión, propiedad, formato, tamaño y cuota antes de enviar un material a Gemini; el cierre de release incluye verificarlo desde una APK con material no sensible.

## Datos principales

~~~text
Perfil curricular
  └─ institución, carrera, plan, modalidad y ciclo

Curso personal
  └─ copia editable de una malla oficial o curso creado por el estudiante
       ├─ exámenes
       ├─ temas
       ├─ sesiones de estudio
       ├─ materiales y flashcards
       └─ progreso
~~~

La malla oficial acelera el registro, pero el curso personal es la fuente de verdad. Una actualización de catálogo no altera lo que alguien ya organizó.

## Seguridad por capas

1. **Repositorio:** privado y sin secretos.
2. **Aplicación:** usa solo variables públicas explícitas.
3. **Base de datos:** RLS restringe cada fila al estudiante dueño.
4. **Archivos:** PDFs y materiales privados y validados antes de procesarse.
5. **IA:** una Edge Function verifica identidad, límites y costo; la clave permanece en el servidor.

## Estado por sprint

| Sprint | Qué se activa |
| --- | --- |
| S1 | Navegación, tema visual, componentes base y datos simulados locales. |
| S2 | Autenticación, perfil curricular, catálogo y base de datos con RLS. |
| S3–S4 | Organización, planificación, flashcards y materiales. |
| S5 | Progreso y recordatorios con notificaciones. |
| S6 | Storage privado, análisis de PDF y ayuda por IA mediante Edge Functions. |
| S7–S8 | Simulacros, pruebas completas, APK/AAB y publicación. |
