# Sprints 2 y 3 · Perfil, organización y planificación

## Resultado de esta entrega

KODA ya permite construir una planificación de estudio real desde la propia app, aun cuando el proyecto remoto no esté conectado. El estudiante puede definir su institución, carrera y ciclo; mantener los cursos que quiera; registrar exámenes y temas; indicar sus horas disponibles y ver una propuesta de sesiones explicada.

El diseño claro ahora usa tonos marfil y ciruela apagada para reducir la intensidad del morado. El modo oscuro mantiene su identidad profunda y la preferencia elegida se conserva en el dispositivo.

## Funciones incluidas

- Perfil académico editable: institución, carrera, ciclo o semestre según corresponda.
- Catálogo inicial de TECSUP, UTP, IDAT, UCSM, UCSP y UNSA.
- Cursos sugeridos para los planes ya verificados y cursos propios que el estudiante puede añadir, desactivar o quitar.
- Registro de exámenes con fecha y dificultad.
- Registro de temas pendientes con prioridad y marcación de avance.
- Bloques disponibles de estudio por día, hora y duración.
- Planificador local explicable: ordena los temas según prioridad, dificultad y cercanía del examen.
- Inicio y progreso derivados de los datos reales del estudiante, no de textos fijos de demostración.
- Persistencia local de la planificación y de la preferencia de tema.
- Formularios de cuenta preparados para Supabase, sin incluir secretos en la app.

## Qué se guarda por ahora

Mientras Supabase no esté vinculado, KODA usa almacenamiento local del teléfono. Es suficiente para trabajar y probar la experiencia en un único dispositivo; no sincroniza entre celulares ni permite recuperar datos después de borrar la aplicación.

Cuando el backend quede conectado, el mismo modelo se guardará en PostgreSQL con reglas de seguridad por estudiante.

## Base de datos preparada

Las migraciones están versionadas y no se aplican automáticamente:

- `20261012_001_curriculum_catalog.sql`: instituciones, programas, mallas y cursos de catálogo.
- `20261012_002_student_planning.sql`: perfil, exámenes, temas, disponibilidad y sesiones de estudio.

La segunda migración añade RLS a cada tabla nueva. Cada política verifica que la fila pertenezca al usuario autenticado; no hay una política pública para leer datos de otros estudiantes.

## Activar Supabase cuando el responsable lo indique

1. El responsable inicia sesión en el panel o la CLI de Supabase con su propia cuenta.
2. Crea o selecciona el proyecto de desarrollo de KODA.
3. Aplica las migraciones y la semilla del catálogo mediante el flujo de Supabase acordado por el equipo.
4. En su equipo local, copia `.env.example` a `.env` y completa únicamente la URL pública y la clave publicable del proyecto.
5. Reinicia Expo. En Perfil aparecerán las acciones de registro e inicio de sesión.

No se debe pegar por chat ni versionar una contraseña de base de datos, un `service_role`, tokens personales, claves de OpenAI ni credenciales FCM.

## Validación técnica esperada

Desde la raíz del repositorio:

~~~powershell
npm ci
npx tsc --noEmit
npm run lint
npx expo-doctor
~~~

La comprobación visual en Android se hará junto a los flujos completos antes del Sprint 8, como acordó el equipo.

## Límites conscientes de esta fase

- El catálogo local muestra solo una selección inicial para no duplicar toda la base curricular dentro de la APK. El catálogo completo y su procedencia viven en `supabase/seed/`.
- UCSM, UCSP y UNSA se presentan como fuentes identificadas: sus cursos no se prellenan hasta completar el contraste de sus mallas oficiales.
- La autenticación ya tiene interfaz y cliente, pero la sincronización remota se habilita después de enlazar el proyecto Supabase.
- Flashcards, materiales, audios, recordatorios, PDF e IA pertenecen a los sprints posteriores.
