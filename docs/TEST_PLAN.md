# Plan de pruebas · Sprints 6 y 7

Las pruebas automatizadas verifican reglas deterministas. La validación de interfaz y de Gemini se realiza con una cuenta de desarrollo y material no sensible; no se necesita abrir un emulador para ejecutar las comprobaciones de código.

## Automatizadas

| Comando | Cubre | Resultado esperado |
| --- | --- | --- |
| `npm test` | Constructor y calificador de simulacros. | No acepta preguntas incompletas/duplicadas; calcula aciertos correctamente. |
| `npx tsc --noEmit` | Contratos TypeScript de aplicación. | Sin errores de tipos. |
| `npm run lint` | Reglas de calidad Expo. | Sin errores. |
| `npx expo export --platform web` | Empaquetado estático sin dispositivo. | Exportación correcta. |

## Manual antes de S8

| Flujo | Verificación |
| --- | --- |
| Consentimiento IA | Sin aceptar, el selector no analiza; al aceptar se conserva la fecha en el perfil. |
| Acceso | Una visita sin sesión muestra solo el registro/inicio; después de acceder aparece el registro académico y luego KODA. |
| Google | Si Google está desactivado, se muestra un aviso en KODA y no una página JSON. Después de configurarlo según `AUTH_SETUP.md`, el retorno crea una sesión. |
| Privacidad | Una cuenta B no lista, descarga ni elimina PDFs, audios o resultados de una cuenta A. |
| Cuota | El tercer análisis del mismo usuario y día devuelve un mensaje claro; no envía el archivo a Gemini. |
| Material | Se rechazan archivos que no sean PDF/audio compatible o excedan 12 MB; un material válido genera resumen, tarjetas y preguntas. |
| Chat IA | Requiere consentimiento; puede usar el análisis de un material seleccionado, no guarda mensajes y respeta el límite de 8 mensajes diarios. |
| Simulacro | No permite finalizar con preguntas sin responder; muestra corrección y explicación al final. |
| Accesibilidad | Botones, opciones y barra de avance tienen etiqueta/estado accesible; revisar lector de pantalla y modo oscuro en Android. |
| Error de red | La pantalla no pierde el documento ni presenta un resultado inventado. |

## Criterio de cierre

S6/S7 quedan cerrados en código y base de datos cuando pasen las pruebas automatizadas. La activación de IA y la pasada en un Android físico se registrarán como comprobación de release en S8, porque requieren una clave real y un dispositivo del equipo.
