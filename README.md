# KODA

KODA ayuda a estudiantes peruanos durante la semana de exámenes: organiza cursos, exámenes y temas; transforma disponibilidad en un plan de estudio; ofrece repaso activo y muestra el avance real.

La aplicación móvil se construye con **TypeScript, React Native y Expo**. Supabase aporta autenticación, base de datos, almacenamiento y Edge Functions. La IA se invoca exclusivamente desde una función de servidor, nunca desde la APK.

## Estado

El repositorio está en preparación técnica previa al Sprint 1. La plantilla Expo aún no representa la interfaz final de KODA.

## Ejecutar localmente

```powershell
npm install
npx expo start
```

Para Android local se requiere JDK 17, Android SDK API 36 y `ANDROID_HOME`. Consulta [accesos y secretos](docs/ACCESS_AND_SECRETS.md) antes de configurar un servicio externo.

## Documentación clave

- [Alcance y casos de uso](docs/PRODUCT_SCOPE.md)
- [Arquitectura](docs/SYSTEM_ARCHITECTURE.md)
- [Plan de sprints](docs/SPRINTS.md)
- [Accesos y secretos](docs/ACCESS_AND_SECRETS.md)
- [Catálogo curricular versionado](supabase/seed/CURRICULUM_CATALOG_README.md)

## Reglas de seguridad

- No subir `.env`, credenciales Firebase ni claves privadas.
- La clave de OpenAI vive como secreto de Supabase Edge Functions.
- Las políticas RLS protegen todos los registros de cada estudiante.
- Una actualización de malla jamás modifica los cursos que el estudiante ya confirmó.
