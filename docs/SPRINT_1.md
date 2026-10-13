# Sprint 1 · Fundacion visual y navegacion

## Objetivo

Entregar una primera experiencia movil de KODA que se pueda abrir y recorrer en Android. Esta version establece la identidad premium de la aplicacion y deja preparada la estructura para conectar datos reales en los siguientes sprints.

## Incluido

- Cinco secciones navegables: Inicio, Plan, Repaso, Progreso y Perfil.
- Sistema visual claro y oscuro con colores, espaciado, radios, sombras y estados compartidos.
- Componentes reutilizables para tarjetas, botones, indicadores, etiquetas y barras de progreso.
- Acciones con respuesta tactil suave y etiquetas de accesibilidad.
- Datos de demostracion locales, sin cuentas ni datos personales.
- Icono y pantalla de carga propios de KODA.

## Como probarlo

1. Ejecuta `npm ci` la primera vez o `npm install` si ya tienes dependencias instaladas.
2. Conecta un telefono Android con Expo Go o inicia un emulador.
3. Ejecuta `npm run android`.
4. Recorre las cinco pestañas inferiores.
5. En Perfil, cambia `Modo oscuro` y verifica que toda la interfaz cambie de tema.
6. En Repaso, pulsa la tarjeta para revelar la respuesta y luego pulsa `Siguiente tarjeta`.

## Criterios de aceptacion verificados

- La aplicacion inicia y se navega en Android.
- La barra inferior comunica la seccion activa y permite ir a las cinco secciones.
- El tema claro y oscuro se aplica a fondos, texto, tarjetas, botones e indicadores.
- Los controles principales tienen una etiqueta accesible y una respuesta visual al tocarlos.
- No se requiere iniciar sesion, configurar servicios externos ni compartir claves.

## Fuera de alcance por ahora

- Registro e inicio de sesion.
- Malla curricular real, cursos guardados y planificador conectado a datos.
- Recordatorios, notificaciones, IA, PDF, audios y flashcards persistentes.

Estas funciones se conectaran en los sprints siguientes sobre esta misma base.
