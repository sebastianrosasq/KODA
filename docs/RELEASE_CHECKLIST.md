# Lista de salida a release

Esta lista evita que una APK se construya con código correcto pero un backend o una configuración incompleta.

## 1. Antes de construir

- [ ] Confirmar que `.env` local no se añadirá al repositorio y que solo contiene la URL y clave pública de Supabase.
- [ ] Ejecutar `npm ci` si cambiaron dependencias.
- [ ] Ejecutar las comprobaciones:

```powershell
npx tsc --noEmit
npm test
npx expo lint
npx expo export --platform web
```

- [ ] Revisar `git status --short`: no deben subirse APKs, carpetas `.expo-*`, capturas privadas, archivos de firma ni secretos.
- [ ] Actualizar la versión y el número de compilación en `app.json` si corresponde una nueva entrega.

## 2. Backend de la misma versión

Desde la raíz del repositorio y con acceso autorizado al proyecto Supabase:

```powershell
npx supabase db push
npx supabase functions deploy analyze-study-document
npx supabase functions deploy study-coach
npx supabase functions deploy delete-koda-account
```

Esto aplica las migraciones, publica el procesamiento de materiales y chat, y habilita la eliminación de perfil junto con sus archivos privados.

## 3. Prueba funcional mínima en Android físico

1. Crear o iniciar sesión con una cuenta de prueba.
2. Completar institución, carrera y ciclo; verificar cursos sugeridos y añadir un curso propio.
3. Registrar una evaluación, un tema y disponibilidad; generar el plan y eliminar un evento de prueba.
4. Subir un PDF o audio compatible y comprobar su análisis, flashcards y chat.
5. Verificar Perfil, recordatorio, exportación y cierre de sesión.
6. Solo en una cuenta desechable: eliminar la cuenta y confirmar que un registro posterior comienza el onboarding desde cero.

## 4. Construcción y entrega

```powershell
npx eas-cli@latest build --platform android --profile preview
```

- [ ] Esperar el estado `FINISHED` en Expo antes de compartir el enlace.
- [ ] Instalar la APK desde el enlace de Expo en al menos un Android físico.
- [ ] Confirmar nombre, icono, inicio de sesión y navegación principal.
- [ ] Registrar el enlace de la compilación, versión, fecha y cambios incluidos en la entrega.

## 5. Límites que no se deben presentar como terminados

- La propuesta KODA Plus está definida, pero los cobros y anuncios reales necesitan su integración de producción.
- Un programa universitario solo se habilita en el registro cuando su malla completa fue contrastada con una fuente oficial.
- La eliminación de cuenta depende de que la migración y la función `delete-koda-account` estén desplegadas en Supabase.
