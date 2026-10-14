# Privacidad de KODA

> Borrador de publicación para la primera versión. Antes de enlazarlo desde Google Play, reemplaza el bloque de contacto por un correo de soporte real de KODA y publícalo en una URL HTTPS estable.

## Qué datos guarda KODA

KODA guarda los datos necesarios para organizar el estudio de cada cuenta:

- correo de acceso, nombre mostrado y datos mínimos de sesión;
- institución, carrera, ciclo, cursos, exámenes, temas, disponibilidad y sesiones de estudio;
- flashcards, progreso y resultados de simulacros;
- metadatos y resultados de análisis de los PDF o audios que la persona elige subir;
- historial del chat de KODA IA, si la persona aceptó el uso de IA.

Los documentos se almacenan en un espacio privado asociado a la cuenta. Ningún estudiante puede acceder a los datos de otra cuenta.

## Para qué se usan

Los datos se usan exclusivamente para mostrar el espacio de estudio, sincronizarlo entre dispositivos, generar el plan, medir progreso y ofrecer las funciones solicitadas por la persona usuaria.

KODA no vende perfiles de estudiantes ni comparte sus materiales con otros estudiantes.

## Servicios que intervienen

- **Supabase** procesa autenticación, base de datos, funciones seguras y almacenamiento privado.
- **Google** procesa el inicio de sesión solo cuando la persona elige ingresar con Google.
- **Gemini** recibe una pregunta o el PDF/audio seleccionado únicamente después del consentimiento explícito para generar una ayuda de estudio. La respuesta puede equivocarse y debe contrastarse con el material original.

La clave de Gemini se conserva en el servidor; nunca se incluye en la APK ni se entrega a estudiantes.

## Elecciones de la persona usuaria

Desde **Perfil → Tus datos** se puede:

- descargar un archivo JSON con los registros de KODA y resultados generados;
- borrar el historial de conversaciones desde el chat IA;
- eliminar de forma definitiva la cuenta, los datos académicos, resultados, conversaciones y materiales privados.

Los PDF y audios originales no se adjuntan al archivo JSON de exportación. La persona debe conservar una copia de esos archivos antes de eliminar la cuenta.

## Conservación y eliminación

Los datos se conservan mientras la cuenta exista. Al eliminarla, KODA primero borra los objetos privados de almacenamiento y luego elimina la cuenta y sus datos relacionados. Una sesión ya emitida puede durar hasta que expire, según la configuración de autenticación del servicio.

## Contacto

Para consultas sobre datos personales, escribe a **[correo de soporte de KODA pendiente de publicar]**. Este dato debe sustituirse por un correo activo antes de distribuir la aplicación.

## Vigencia

Última actualización: 13 de octubre de 2026.
