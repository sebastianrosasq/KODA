# KODA

KODA es una aplicación móvil para estudiantes peruanos durante la semana de exámenes. Organiza cursos, exámenes y temas; convierte el tiempo disponible en un plan de estudio, facilita el repaso y muestra el progreso real.

> Estado actual: Sprint 1 en progreso. KODA ya tiene su navegación móvil, identidad visual premium y una demo funcional para Android; los datos actuales son de demostración local.

## Qué resolverá KODA

- Registrar institución, carrera y ciclo del estudiante.
- Sugerir una malla curricular editable.
- Organizar exámenes, temas y disponibilidad.
- Proponer un plan de estudio explicable.
- Ofrecer flashcards, material, audios, progreso y, más adelante, IA y análisis de PDF.

El alcance completo y los 16 casos de uso están en [PRODUCT_SCOPE.md](docs/PRODUCT_SCOPE.md).

## Inicio rápido para el equipo

Esta guía es para una persona que ya recibió acceso al repositorio privado. Si aún no lo recibió, debe enviar su usuario de GitHub al responsable antes de continuar.

1. Instala [Node.js 22.13 o superior](https://nodejs.org/), [Git](https://git-scm.com/downloads) y [Visual Studio Code](https://code.visualstudio.com/).
2. Abre **PowerShell** en la carpeta donde guardarás el proyecto.
3. Clona el repositorio y entra a él:

~~~powershell
git clone https://github.com/sebastianrosasq/KODA.git
cd KODA
~~~

4. Instala exactamente las dependencias registradas por el equipo:

~~~powershell
npm ci
~~~

5. Inicia la aplicación:

~~~powershell
npm run start
~~~

6. Pruébala en un Android con Expo Go o en un emulador. Los pasos detallados están en [GETTING_STARTED.md](docs/GETTING_STARTED.md).

Para el Sprint 1 no se requieren cuentas de Supabase, Firebase u OpenAI y nadie debe crear ni compartir claves. **.env.example** es solo una referencia para etapas futuras.

## Comandos que usaremos

| Objetivo | Comando |
| --- | --- |
| Iniciar el servidor | npm run start |
| Abrir Android | npm run android |
| Revisar tipos | npx tsc --noEmit |
| Revisar estilo y errores comunes | npm run lint |
| Diagnosticar Expo y dependencias | npx expo-doctor |

Cuando se agregue una librería de Expo, se usa **npx expo install nombre-del-paquete**, no npm install, para conservar la compatibilidad con Expo SDK 57.

## Estructura del repositorio

~~~text
KODA/
├── src/app/                 Pantallas y navegación con Expo Router
├── src/                     Componentes, lógica, hooks y tipos compartidos
├── assets/                  Íconos e imágenes de la aplicación
├── supabase/
│   ├── migrations/          Cambios versionados de la base de datos
│   └── seed/                Catálogo curricular inicial y sus fuentes
├── docs/                    Producto, arquitectura, sprints y guías del equipo
├── .github/workflows/       Validaciones automáticas
├── app.json                 Configuración pública de Expo
└── eas.json                 Perfiles para APK de prueba y publicación
~~~

## Documentación para orientarse

- [Guía de instalación y primer arranque](docs/GETTING_STARTED.md)
- [Cómo colaborar: ramas, revisiones y commits](CONTRIBUTING.md)
- [Alcance y casos de uso](docs/PRODUCT_SCOPE.md)
- [Arquitectura explicada con diagrama](docs/SYSTEM_ARCHITECTURE.md)
- [Plan de los ocho sprints](docs/SPRINTS.md)
- [Qué incluye y cómo probar el Sprint 1](docs/SPRINT_1.md)
- [Accesos y secretos por etapa](docs/ACCESS_AND_SECRETS.md)
- [Catálogo curricular versionado](supabase/seed/CURRICULUM_CATALOG_README.md)

## Seguridad y datos del equipo

- El repositorio es privado. Solo se invitará a integrantes que necesiten contribuir.
- No se suben archivos .env, claves de OpenAI, credenciales de Firebase, contraseñas, archivos de firma ni datos reales de estudiantes.
- La APK solo llevará configuración pública. Las acciones sensibles y la IA vivirán en funciones seguras de servidor.
- Las mallas se conservan con fuente y versión; un cambio de catálogo nunca modifica cursos que un estudiante ya confirmó.

Consulta [ACCESS_AND_SECRETS.md](docs/ACCESS_AND_SECRETS.md) antes de conectar servicios externos.
