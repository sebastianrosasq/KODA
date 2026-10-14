# Preparación para presentación · 14 de octubre de 2026

Este documento separa lo comprobado en el código de lo que todavía requiere una cuenta real y un teléfono. No sustituye una prueba de release.

## Auditoría priorizada

| Prioridad | Hallazgo | Causa identificada | Estado |
| --- | --- | --- | --- |
| Crítica | El primer análisis de PDF/audio podía fallar con un error de `ArrayBuffer` y pedir reintento. | La lectura del archivo mediante la API de archivo de Expo acababa en una conversión Blob no fiable para Supabase Storage en React Native. | Corregido: el selector copia el archivo localmente y se sube como `ArrayBuffer` leído con `fetch(uri)`. |
| Crítica | Toques repetidos podían solicitar más de un análisis del mismo material. | No existía una reserva atómica del documento antes de llamar a la IA. | Corregido: la Edge Function cambia el estado solo desde `ready`/`failed` a `processing`. |
| Crítica | Algunos análisis mostraban números dentro de palabras. | La salida del modelo podía llegar con corrupción tipográfica y no se detectaba antes de persistirla. | Corregido: instrucciones Unicode explícitas, una regeneración controlada y rechazo de la salida aún corrupta. |
| Importante | Copias y botones podían empujar contenido fuera de tarjetas estrechas. | Elementos flexibles sin `minWidth: 0` ni contracción de texto. | Corregido en tarjetas, botones, píldoras y estados vacíos sin ocultar contenido. |
| Importante | El proceso de carga no distinguía guardar de analizar. | Un único estado de carga. | Corregido: “Guardando archivo” y “Analizando con IA” son estados separados. |
| Media | KODA Plus parecía una función inactiva. | El botón estaba deshabilitado y no comunicaba la propuesta. | Corregido: precio visible y modal “Próximamente”; no hay cobro ni suscripción activa. |

## Verificado sin dispositivo

- `npm test`: simulacros, alternativas y resultados.
- `npx tsc --noEmit`: contratos TypeScript de la aplicación.
- `npm run lint`: reglas de calidad Expo.
- `npx expo-doctor`: configuración y dependencias Expo.
- `npx expo export --platform web`: empaquetado estático de las rutas, sin emulador ni APK.
- `git diff --check`: no hay errores de espacios o parches mal formados.

## Pendiente antes de entregar una APK

1. Desplegar `analyze-study-document` y `study-coach` en el proyecto de Supabase que usa KODA. Sin ese despliegue, la APK seguirá ejecutando la versión anterior de las funciones.
2. Con una cuenta de desarrollo y archivos no sensibles, comprobar una carga de PDF y una de audio desde un teléfono Android real; revisar el plan manual de [TEST_PLAN.md](TEST_PLAN.md).
3. Verificar en Supabase que Google siga habilitado y que las URL de redirección de Android coincidan con la configuración descrita en [AUTH_SETUP.md](AUTH_SETUP.md).
4. Ejecutar la compilación Android solo después de esos pasos. Esta revisión no cambió firma, paquete, versión ni configuración nativa.

## Riesgos conocidos y decisión de producto

- El análisis depende de Gemini y de conectividad: KODA conserva el documento privado y presenta un reintento cuando el proveedor falla; nunca inventa un resultado.
- La corrección de tipografía está diseñada para no modificar fórmulas, fechas o identificadores automáticamente. Si el segundo intento sigue corrupto, se rechaza la salida.
- KODA Plus y los anuncios recompensados son propuestas de producto. No hay SDK de anuncios, checkout, cobros ni premios ficticios en esta versión.
