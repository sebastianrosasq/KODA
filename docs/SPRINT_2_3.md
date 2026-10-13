# Sprints 2 y 3 · Perfil, organización y planificación

## Resultado de esta entrega

KODA ya permite construir una planificación de estudio real desde la propia app, aun cuando el proyecto remoto no esté conectado. El estudiante puede definir su institución, carrera y ciclo; mantener los cursos que quiera; registrar exámenes y temas; indicar sus horas disponibles y ver una propuesta de sesiones explicada.

El diseño claro ahora usa tonos marfil y ciruela apagada para reducir la intensidad del morado. El modo oscuro mantiene su identidad profunda y la preferencia elegida se conserva en el dispositivo.

## Funciones incluidas

- Perfil académico editable: institución, carrera, ciclo o semestre según corresponda.
- Catálogo de 15 instituciones y 16 carreras; las siete mallas verificadas se consultan desde Supabase antes de precargar cursos.
- Cursos sugeridos para los planes ya verificados y cursos propios que el estudiante puede añadir, desactivar o quitar.
- Registro de exámenes con fecha y dificultad.
- Registro de temas pendientes con prioridad y marcación de avance.
- Bloques disponibles de estudio por día, hora y duración.
- Planificador local explicable: ordena los temas según prioridad, dificultad y cercanía del examen.
- Inicio y progreso derivados de los datos reales del estudiante, no de textos fijos de demostración.
- Persistencia local de la planificación y de la preferencia de tema.
- Registro, inicio de sesión y sincronización remota por estudiante, sin incluir secretos en la app.

## Qué se guarda por ahora

KODA conserva una copia local para trabajar sin conexión. Con una sesión iniciada, sincroniza el perfil, los cursos, exámenes, temas, disponibilidad y sesiones con PostgreSQL protegido por reglas por estudiante.

## Base de datos preparada

Las migraciones aplicadas al proyecto y versionadas en el repositorio son:

- `20261012_001_curriculum_catalog.sql`: instituciones, programas, mallas y cursos de catálogo.
- `20261012_002_student_planning.sql`: perfil, exámenes, temas, disponibilidad y sesiones de estudio.
- `20261013063257_workspace_sync_keys.sql`: identificadores estables para upserts seguros desde la APK.

La segunda migración añade RLS a cada tabla nueva. Cada política verifica que la fila pertenezca al usuario autenticado; no hay una política pública para leer datos de otros estudiantes.

## Configurar Supabase en un clon nuevo

1. Pide al responsable la URL pública y la clave publicable del proyecto de desarrollo; nunca pidas ni uses `service_role`.
2. En tu clon, copia `.env.example` a `.env` y escribe esas dos variables públicas.
3. Ejecuta `npm ci` y luego `npm run start`.
4. Crea una cuenta desde Perfil o inicia sesión. El estado de sincronización aparece bajo “Cuenta y privacidad”.

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
- UCSM, UCV y UPN ya tienen mallas verificadas y precargables. UCSP, UNSA y las demás fuentes identificadas no se precargan hasta completar el contraste oficial.
- La sincronización no sustituye el modo local: si el teléfono está sin red, el estudiante sigue trabajando y se conserva la copia del dispositivo.
- Materiales, audios, PDF e IA pertenecen a los sprints posteriores.
