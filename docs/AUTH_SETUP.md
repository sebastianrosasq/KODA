# Acceso de cuentas en KODA

KODA ofrece dos formas de acceso: correo con contraseña y Google. Los datos del estudiante se guardan bajo las reglas de Supabase; la aplicación móvil guarda la sesión en el almacenamiento seguro del sistema operativo.

## Correo y contraseña

En Supabase abre **Authentication → Providers → Email** y verifica que el proveedor esté habilitado. Para desarrollo se puede desactivar temporalmente la confirmación de correo. Antes de publicar, vuelve a activarla y personaliza los correos desde Supabase.

## Google

No subas ni compartas secretos en GitHub, `.env` ni el chat. La configuración se realiza una sola vez por una persona administradora:

1. En Google Cloud Console, configura la pantalla de consentimiento OAuth y crea un cliente OAuth de tipo **Web application**.
2. En sus URI de redirección autorizados agrega:

   ```text
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```

3. En Supabase abre **Authentication → Providers → Google**, habilítalo y registra el Client ID y Client Secret generados por Google.
4. En **Authentication → URL Configuration** agrega las URL permitidas:

   ```text
   koda://google-auth
   http://localhost:8081
   ```

   Cuando haya un dominio web de producción, agrégalo también a esta lista.
5. Para probar Google en Android se requiere una compilación de desarrollo o la APK instalada, porque el retorno usa el esquema privado `koda://google-auth`. Expo Go sirve para la interfaz, pero no es el destino de prueba de OAuth de producción.

El botón de Google de KODA ya muestra un error útil si el proveedor no está configurado. No almacena secretos de Google dentro de la aplicación.
