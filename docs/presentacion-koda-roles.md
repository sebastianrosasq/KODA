# KODA — guion de presentación por roles

**Duración sugerida:** 8 a 10 minutos.  
**Regla del equipo:** no memoricen cada palabra. Entiendan la idea de su bloque y usen la aplicación como evidencia mientras hablan.

## Mensaje central

KODA es una aplicación móvil que ayuda a estudiantes a convertir sus evaluaciones, disponibilidad, cursos y materiales en un plan de estudio accionable. La IA no reemplaza al estudiante: acelera la preparación mediante resúmenes, preguntas, tarjetas y práctica.

## Orden recomendado de exposición

1. Problema y propuesta de valor — **Gianfranco**
2. Investigación, experiencia y diseño — **Daniela y Heidi**
3. Proceso ágil — **Leonardo**
4. Arquitectura y demostración funcional — **Sebastián**
5. Calidad, resultados y cierre — **Oscar**

---

## Gianfranco — Product Owner

**Responsabilidad:** definir el problema, priorizar funcionalidades y sostener la propuesta de negocio.

### Intervención 1 — problema y usuario (40–50 s)

> “Partimos de un problema cotidiano: muchos estudiantes sí quieren estudiar, pero no tienen una forma clara de ordenar cursos, fechas de evaluación, horarios disponibles y material. Terminan revisando tarde o sin saber qué priorizar. KODA centraliza esa información y la transforma en acciones concretas.”

**Mientras habla:** mostrar la pantalla de Inicio y luego Plan.

### Intervención 2 — solución y alcance (40–50 s)

> “Priorizamos cuatro resultados: que el estudiante pueda registrar evaluaciones, organizar su semana, convertir un material en recursos de repaso y ver su avance. No quisimos llenar la aplicación de funciones aisladas; cada pantalla conduce al siguiente paso del estudio.”

**Idea que debe entender:** producto no significa “tener muchas pantallas”; significa resolver una necesidad con un flujo coherente.

### Si el profesor pregunta

| Pregunta | Respuesta corta y entendible |
| --- | --- |
| ¿Por qué este problema? | Porque el problema no es solamente falta de contenido: es falta de organización y priorización cuando un estudiante lleva varios cursos. |
| ¿Quién es el usuario inicial? | Estudiantes de institutos y universidades con varias evaluaciones, cursos y tiempos variables durante la semana. |
| ¿Cómo medirían si funciona? | Mediríamos planes creados y completados, materiales revisados, tarjetas practicadas y retención semanal de estudiantes. |
| ¿Cómo ganará dinero? | El plan gratuito conserva las funciones esenciales y anuncios no invasivos; KODA Plus elimina anuncios y habilitará beneficios de mayor uso. Los pagos reales son una siguiente fase, no una promesa ya implementada. |

---

## Daniela — UX/UI: flujo y experiencia

**Responsabilidad:** convertir las necesidades del estudiante en pantallas comprensibles y recorridos simples.

### Intervención 1 — decisiones de experiencia (40–50 s)

> “Diseñamos KODA para una tarea rápida en el celular. Primero el estudiante ve qué debe hacer hoy; después puede organizar la semana, registrar una evaluación y finalmente repasar. Mantuvimos navegación inferior constante, textos cortos y estados vacíos que explican cuál es la siguiente acción.”

**Mientras habla:** recorrer Inicio → Plan → botón `Añadir` de evaluación.

### Intervención 2 — diseño visual (35–45 s)

> “Usamos contraste oscuro, acentos morados y tarjetas con jerarquía visual para que la información importante destaque sin saturar. También sustituimos los avisos nativos por confirmaciones coherentes con la estética de KODA, especialmente para acciones sensibles como eliminar datos.”

**Idea que debe entender:** UX define el orden y facilidad del flujo; UI define cómo se ve y comunica visualmente.

### Si el profesor pregunta

| Pregunta | Respuesta corta y entendible |
| --- | --- |
| ¿Por qué la pantalla de Inicio no está llena de datos? | En móvil se prioriza la decisión inmediata: qué debo hacer hoy. El detalle está disponible sin bloquear la primera lectura. |
| ¿Cómo evitaron que el plan sea confuso? | Separamos disponibilidad, evaluaciones y temas. La app explica qué falta antes de intentar generar bloques. |
| ¿Cómo consideran accesibilidad? | Contrastamos texto y fondo, evitamos depender solo del color y usamos animaciones cortas que respetan la preferencia de movimiento reducido. |

---

## Heidi — UX/UI: estudio activo y consistencia

**Responsabilidad:** diseñar los momentos de repaso, materiales y práctica; validar que la experiencia sea consistente.

### Intervención 1 — estudio activo (40–50 s)

> “No queríamos que KODA fuera solo un lector de PDFs. El flujo convierte material en recursos de estudio activo: el estudiante puede obtener un análisis, elegir cuántas flashcards generar y practicar. Así pasa de guardar un archivo a recuperar información y comprobar qué recuerda.”

**Mientras habla:** mostrar Materiales → análisis ya listo → Flashcards o Simulacros.

### Intervención 2 — consistencia (35–45 s)

> “La misma lógica visual se mantiene entre Plan, Repaso y Progreso: tarjetas, botones principales y mensajes de estado. Eso reduce la carga de aprendizaje; una vez que el estudiante entiende una parte, reconoce cómo actuar en las demás.”

**Idea que debe entender:** las flashcards no son decoración; usan recuperación activa, una técnica más útil que releer pasivamente.

### Si el profesor pregunta

| Pregunta | Respuesta corta y entendible |
| --- | --- |
| ¿Para qué sirve elegir el número de tarjetas? | El estudiante ajusta la práctica a su tiempo. Se limita a seis por material para mantener calidad y una sesión manejable. |
| ¿La IA puede equivocarse? | Sí. Por eso se presenta como apoyo y el estudiante conserva el material original y puede revisar, editar o contrastar las respuestas. |
| ¿Por qué permitir preguntas sin PDF? | KODA también sirve para dudas rápidas. Cuando existe material, la respuesta se contextualiza; cuando no, se responde de manera general y directa. |

---

## Leonardo — Scrum Master

**Responsabilidad:** ordenar el trabajo en iteraciones, eliminar bloqueos y mantener foco en lo prioritario.

### Intervención 1 — forma de trabajo (35–45 s)

> “Organizamos el desarrollo por incrementos: primero cuentas y perfil académico; luego planificación; después materiales, IA, repaso y calidad visual. En cada bloque priorizamos una parte demostrable para no esperar al final y descubrir problemas demasiado tarde.”

### Intervención 2 — manejo de riesgos (35–45 s)

> “En las revisiones encontramos errores de carga de archivos, textos que salían de sus contenedores, duplicados al crear eventos y flujos de navegación. Los convertimos en tareas concretas y se corrigieron antes de preparar esta versión.”

**Mientras habla:** señalar el flujo completo en el teléfono, sin abrir pantallas técnicas.

### Si el profesor pregunta

| Pregunta | Respuesta corta y entendible |
| --- | --- |
| ¿Por qué Scrum o iteraciones? | Porque permite validar una función completa, recibir observaciones y corregir antes de añadir la siguiente. |
| ¿Qué fue lo más prioritario? | Que el usuario pueda entrar, definir su contexto académico y crear un plan útil. La IA es valiosa, pero no compensa un flujo base roto. |
| ¿Qué aprendieron? | A reducir alcance: una función útil, probada y conectada al flujo vale más que muchas opciones sin terminar. |

---

## Sebastián — Desarrollo y arquitectura

**Responsabilidad:** implementar la aplicación móvil, integrar el backend, persistencia y lógica principal.

### Intervención 1 — arquitectura (55–65 s)

> “KODA se implementó como una aplicación móvil con Expo y React Native. Para los datos usamos Supabase: autenticación para las cuentas, base de datos para el perfil, cursos, planes y progreso, y almacenamiento para documentos y fotos. Esto permite que la información sea del usuario y no se pierda al cerrar la app.”

**Mientras habla:** iniciar sesión y mostrar Perfil con cursos; no hace falta mostrar código.

### Intervención 2 — decisiones técnicas (45–55 s)

> “La lógica evita errores comunes: detecta cursos y eventos duplicados, limita los archivos y la cantidad de tarjetas, maneja estados de carga y muestra confirmaciones antes de acciones destructivas. También preparamos la eliminación de cuenta para retirar los datos asociados, no solo cerrar sesión.”

**Mientras habla:** mostrar Añadir curso propio o una confirmación de eliminación sin confirmar el borrado real.

### Si el profesor pregunta

| Pregunta | Respuesta corta y entendible |
| --- | --- |
| ¿Por qué Expo/React Native? | Permite desarrollar una sola base de código para Android e iOS y compilar versiones instalables con rapidez. |
| ¿Por qué Supabase? | Resuelve autenticación, base de datos y archivos en una misma arquitectura, reduciendo complejidad para un MVP. |
| ¿Cómo protegen los datos? | Cada cuenta trabaja con sus propios registros; los archivos y datos se vinculan al usuario. Además existe consentimiento antes de usar IA con material y opción de eliminar cuenta. |
| ¿Funciona en iOS? | La base de código es multiplataforma. Para publicar en iOS se debe hacer una compilación iOS y cumplir la configuración y revisión de Apple. |

---

## Oscar — QA

**Responsabilidad:** probar recorridos reales, detectar fallos y verificar que las correcciones no rompan otra pantalla.

### Intervención 1 — qué se probó (40–50 s)

> “Probamos los flujos completos, no solo botones aislados: registro e inicio de sesión, edición de carrera y ciclo, creación y eliminación de evaluaciones, cursos propios, carga de materiales, generación de recursos y cierre de sesión. También revisamos pantallas pequeñas para detectar problemas de texto y navegación.”

### Intervención 2 — resultados (35–45 s)

> “Los hallazgos se convirtieron en mejoras: control de duplicados, mensajes claros de éxito o error, corrección de la navegación inferior, avisos visuales consistentes y validaciones antes de guardar. Además se ejecutaron controles automáticos de calidad: lint, pruebas y verificación de tipos.”

**Mientras habla:** mostrar una acción válida y una inválida, por ejemplo intentar añadir un curso duplicado.

### Si el profesor pregunta

| Pregunta | Respuesta corta y entendible |
| --- | --- |
| ¿Cómo verifican una corrección? | Repetimos el caso que falló, probamos casos cercanos y revisamos que el flujo completo continúe funcionando. |
| ¿Qué falta probar? | Pruebas con más estudiantes reales, distintos modelos de celular, red lenta y documentos de tamaños/formats variados. |
| ¿Qué es un caso límite? | Un ejemplo es un curso duplicado, un nombre muy largo, un archivo no compatible o crear un evento dos veces. Son situaciones que suelen revelar errores. |

---

## Cierre conjunto (20–30 s)

> “KODA ya demuestra un flujo funcional: conoce al estudiante, organiza su semana, transforma material en práctica y acompaña su avance. La siguiente fase es validar el producto con estudiantes reales, terminar la verificación de más mallas curriculares y medir qué funciones generan más valor antes de ampliar la monetización.”

## Recomendaciones para la demostración

1. Usen una cuenta de prueba ya preparada: carrera, cursos, una evaluación y un análisis existente.
2. Mantengan internet estable y el teléfono cargado. Lleven capturas de respaldo por si una función de IA tarda.
3. No digan que los pagos o anuncios ya están activos: expliquen que son parte del modelo de negocio diseñado.
4. Si aparece un error en vivo, no improvisen ni culpen a alguien: “lo registramos como hallazgo y tenemos evidencia del flujo previsto”.
5. Cada persona debe explicar su decisión, no recitar tecnología. La aplicación abierta es la evidencia.
