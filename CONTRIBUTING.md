# Cómo colaborar en KODA

Este documento evita que cinco personas se pisen cambios o suban información que no corresponde. La regla es simple: una tarea, una rama, una revisión y un commit comprensible.

## Antes de tomar una tarea

1. Lee [PRODUCT_SCOPE.md](docs/PRODUCT_SCOPE.md) y el sprint activo en [SPRINTS.md](docs/SPRINTS.md).
2. Avisa al grupo qué caso de uso o pantalla trabajarás.
3. Actualiza tu copia local:

   ~~~powershell
   git switch main
   git pull origin main
   ~~~

4. Crea una rama corta y en minúsculas:

   ~~~powershell
   git switch -c feat/registro-examenes
   ~~~

| Prefijo | Cuándo usarlo | Ejemplo |
| --- | --- | --- |
| feat/ | Nueva funcionalidad | feat/plan-estudio |
| fix/ | Corrección de un error | fix/fecha-examen |
| docs/ | Solo documentación | docs/guia-primer-arranque |
| chore/ | Configuración o mantenimiento | chore/actualizar-dependencias |

## Cómo hacer un cambio

1. Mantén pantallas y rutas dentro de src/app.
2. Coloca componentes, tipos, hooks y lógica reutilizable fuera de src/app.
3. Si necesitas una librería de Expo, consulta antes y usa npx expo install paquete.
4. Prueba el cambio en Android o emulador.
5. Antes de subirlo:

   ~~~powershell
   npx tsc --noEmit
   npm run lint
   git status
   git diff
   ~~~

## Commits claros y en español

Cada commit describe un cambio único:

~~~text
tipo: acción concreta
~~~

Ejemplos:

~~~text
feat: crear pantalla de próximos exámenes
feat: agregar selector de carrera
fix: corregir orden de los exámenes
docs: explicar instalación en Android
chore: preparar validación de TypeScript
~~~

Evita mensajes como cambios, avance, arreglo, final o prueba.

Para guardar y enviar tu trabajo:

~~~powershell
git add ruta/del/archivo
git commit -m "feat: describir el cambio"
git push -u origin nombre-de-tu-rama
~~~

## Revisión antes de integrar

1. Abre un Pull Request hacia main en GitHub.
2. Explica qué hiciste, cómo lo probaste y qué falta si hubiera pendiente.
3. Pide revisión a por lo menos una persona del equipo.
4. No integres cambios con errores de tipos, secretos, archivos generados o pantallas sin probar.

Quien revise debe comprobar que el cambio cumple la historia de usuario, funciona en pantalla pequeña, respeta el modo claro/oscuro cuando corresponda y no incluye datos sensibles.

## Acuerdo sobre información sensible

El repositorio es privado, pero privado no significa que se puedan subir secretos. Nunca agregues:

- archivos .env;
- contraseñas, tokens, API keys o cuentas de servicio;
- certificados .jks, .p8, .p12 o .pem;
- información real de estudiantes, horarios, notas o documentos.

Si una tarea necesita una cuenta externa, consulta [ACCESS_AND_SECRETS.md](docs/ACCESS_AND_SECRETS.md). Los secretos se cargan en el proveedor, no se comparten en GitHub ni por chat.

## Definición de terminado

Una tarea está lista para revisión cuando:

- cumple los criterios de aceptación;
- funciona en Android o tiene evidencia de prueba equivalente;
- npx tsc --noEmit y npm run lint no muestran errores;
- la documentación cambia si cambió la instalación, arquitectura o una decisión importante;
- el commit está en español y se entiende sin contexto adicional.
