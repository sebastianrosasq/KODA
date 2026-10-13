# Primer arranque de KODA

Esta guía está escrita para integrantes que empiezan desde cero en Windows y Android. Sigue el orden. Si un paso falla, revisa los problemas frecuentes antes de continuar.

## 1. Instala lo necesario

Necesitas:

- Una cuenta personal de GitHub y acceso al repositorio privado **sebastianrosasq/KODA**.
- Windows 10 u 11, internet y 10 GB libres si usarás emulador.
- [Node.js](https://nodejs.org/) **22.13 o superior**. KODA usa Expo SDK 57, cuya versión mínima de Node es 22.13.
- [Git](https://git-scm.com/downloads) y [Visual Studio Code](https://code.visualstudio.com/).
- Un Android con [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) o Android Studio con emulador.

Después de instalar Node y Git, cierra y abre PowerShell. Verifica:

~~~powershell
node --version
npm --version
git --version
~~~

El primer comando debe mostrar v22.13.0 o una versión mayor.

## 2. Configura tu autoría de Git

Solo se hace una vez por computador. Reemplaza los valores por tu nombre y tu correo de GitHub. Si prefieres ocultar tu correo real, usa el noreply que GitHub muestra en **Settings > Emails**.

~~~powershell
git config --global user.name "Tu nombre y apellido"
git config --global user.email "tu-correo@ejemplo.com"
git config --global --list
~~~

## 3. Descarga el proyecto

1. Abre PowerShell donde guardarás tus proyectos:

   ~~~powershell
   cd $HOME\Documentos
   ~~~

2. Descarga KODA y entra a la carpeta:

   ~~~powershell
   git clone https://github.com/sebastianrosasq/KODA.git
   cd KODA
   ~~~

3. Comprueba la rama y el estado:

   ~~~powershell
   git branch --show-current
   git status
   ~~~

Debes ver main y un mensaje indicando que el árbol de trabajo está limpio.

> Si Git muestra Repository not found o 403, todavía no tienes permiso. Envía tu usuario de GitHub al responsable. No crees otro repositorio ni copies el código a uno público.

## 4. Instala las dependencias

Dentro de la carpeta KODA, ejecuta:

~~~powershell
npm ci
~~~

npm ci instala exactamente las versiones aprobadas en package-lock.json. La primera instalación puede tardar algunos minutos.

No uses npm install para cambiar dependencias por iniciativa propia. Para una librería de Expo el equipo usará npx expo install.

## 5. Prueba en un teléfono Android

Esta es la opción recomendada para empezar.

1. Instala **Expo Go** desde Google Play.
2. Conecta teléfono y computadora a la misma red Wi‑Fi.
3. En PowerShell, dentro de KODA, ejecuta:

   ~~~powershell
   npm run start
   ~~~

4. Espera el código QR.
5. Abre Expo Go, elige **Scan QR code** y escanea el código.
6. Expo Go abrirá KODA. Al guardar cambios, se actualizará automáticamente.

Para detener el servidor, presiona Ctrl + C en PowerShell.

## 6. Alternativa: Android Studio y emulador

1. Instala [JDK 17](https://learn.microsoft.com/java/openjdk/download) y [Android Studio](https://developer.android.com/studio).
2. Completa el asistente de Android Studio con la opción **Standard**.
3. En **Settings > Languages & Frameworks > Android SDK**:
   - instala **Android 16 (API 36)** en SDK Platforms;
   - instala **Android SDK Build-Tools**, **Android Emulator** y **Android SDK Platform-Tools** en SDK Tools.
4. Crea la variable de usuario de Windows:

   ~~~text
   Nombre: ANDROID_HOME
   Valor: %LOCALAPPDATA%\Android\Sdk
   ~~~

5. Agrega estas entradas al Path de usuario:

   ~~~text
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   ~~~

6. Cierra y abre PowerShell. Verifica:

   ~~~powershell
   adb --version
   emulator -list-avds
   ~~~

7. En Android Studio abre **Device Manager**, crea un dispositivo virtual con API 36 y enciéndelo.
8. En KODA ejecuta:

   ~~~powershell
   npm run android
   ~~~

## 7. Comprueba tu instalación

Desde la raíz de KODA:

~~~powershell
npx tsc --noEmit
npm run lint
npx expo-doctor
~~~

Los tres deben terminar sin errores. Si el lint se ejecuta por primera vez, Expo puede crear su configuración estándar; avisa al equipo antes de subir ese cambio.

## Problemas frecuentes

| Problema | Qué probar |
| --- | --- |
| git clone falla con 403 o repositorio inexistente | Confirma que fuiste invitado con el mismo usuario de GitHub con el que iniciaste sesión. |
| node o git no se reconoce | Cierra y abre PowerShell. Si continúa, reinstala la herramienta agregándola al PATH. |
| El QR no abre la app | Comprueba la misma Wi‑Fi y desactiva temporalmente una VPN que bloquee la red local. |
| adb no se reconoce | Revisa ANDROID_HOME y las dos entradas de Path; luego reinicia PowerShell. |
| El emulador no aparece | Inícialo desde Android Studio > Device Manager y ejecuta de nuevo npm run android. |
| Las dependencias quedaron extrañas | No borres archivos al azar. Ejecuta git status y comparte el error con el equipo. |

## Lo que no debes hacer

- No subas archivos .env, PDFs reales, credenciales ni capturas con información personal.
- No trabajes directamente sobre main; crea una rama según [CONTRIBUTING.md](../CONTRIBUTING.md).
- No modifiques package-lock.json sin que la tarea agregue o actualice una dependencia.
- No crees carpetas android o ios a mano. Expo las generará si una etapa lo requiere.
