# Monetización responsable de KODA

Actualizado: 14 de octubre de 2026. Esta es una decisión de producto, no un checkout activo.

## Decisión

KODA empieza como un producto **B2C freemium** para estudiantes de educación superior en Perú. La versión gratis debe resolver el problema completo de organizar y estudiar: carrera/ciclo, plan, recordatorios, flashcards manuales, simulacros y chat de estudio. No habrá publicidad invasiva ni venta de datos personales.

La primera oferta pagada a validar es **KODA Plus a S/ 9.90/mes** o **S/ 79.90/año**. Antes de cobrar, se probará con una lista de espera y entrevistas; el precio es una hipótesis, no una promesa al usuario. No se promete IA “ilimitada”: esa frase no protege el costo ni comunica un uso justo.

## Qué queda gratis y qué sería Plus

| Área | Gratis durante beta | Propuesta KODA Plus que se validará |
| --- | --- | --- |
| Organización | Carrera/ciclo, cursos, agenda, exámenes, temas, bloques y recordatorios. | Plan adaptativo: detección de semanas de riesgo, redistribución sugerida y comparativo de carga. |
| Repaso | Flashcards manuales, repaso espaciado y simulacros desde tarjetas. | Simulacros por objetivo, historial de errores por tema y reportes exportables. |
| Chat IA | Chat de repaso directo, sin límite de mensajes impuesto por KODA en la beta. | Modos guiados de examen, explicación paso a paso y seguimiento de objetivos; no una respuesta más larga sin valor. |
| Materiales | El límite actual de beta: 3 PDF y 5 audios analizados por día, más sílabos con agenda revisable. | Bolsas mensuales de análisis claramente mostradas antes de comprar y capacidad adicional definida después de medir costo real. Nunca “IA ilimitada”. |
| Datos | Sin anuncios y sin venta de datos. Exportación y eliminación de cuenta. | Lo mismo: pagar no cambia la privacidad. |

Los límites de beta no constituyen una promesa comercial permanente. Antes del lanzamiento pagado se publicará un límite mensual, el costo por material y una política de uso justo. La funcionalidad esencial para organizarse y estudiar no se bloquea tras un pago.

## Por qué este modelo

- Quizlet tiene un plan gratuito y niveles pagos que separan funciones y límites de uso; su página oficial muestra Plus anual desde USD 35.99 y Plus Unlimited anual desde USD 44.99 al momento de esta revisión. [Quizlet Upgrade](https://quizlet.com/upgrade?source=footer)
- Knowt mantiene gratuitas las tarjetas y modos de estudio, y reserva la generación/análisis de IA para Ultra. Su ayuda publica USD 149.99/año o USD 24.99/mes para estudiantes. [Knowt — plan gratuito y Ultra](https://help.knowt.com/en/articles/16905163-what-s-included-in-the-free-plan-for-students)
- RemNote separa el estudio base de los créditos de IA y también ofrece licencias institucionales; documenta descuentos educativos del 25%. [RemNote Pro FAQ](https://help.remnote.com/en/articles/6084981-remnote-pro-frequently-asked-questions)

La oportunidad diferencial de KODA no es vender tarjetas genéricas: es traducir el sílabo, ciclo y fechas reales de instituciones peruanas en un plan que el estudiante controla. El precio inicial propuesto queda deliberadamente muy por debajo de las referencias globales, mientras se mide disposición de pago local y costo real por análisis.

## Privacidad y universidades

No se venderán datos personales, historiales, archivos, notas individuales ni perfiles de estudiantes a universidades. La vía B2B futura es una **licencia institucional opcional**, contratada por la institución y con consentimiento explícito del alumno para cualquier dato adicional. Los reportes agregados deben tener umbral mínimo de cohorte, no incluir identificadores y pasar revisión legal de protección de datos antes de publicarse.

## Cobro y arquitectura antes de vender

No se debe activar un botón de pago hasta contar con RUC/entidad cobradora, términos de suscripción y reembolsos, política de privacidad actualizada, soporte y un proveedor contratado.

Para la APK distribuida por Google Play, Plus es una suscripción digital y se debe cobrar con **Google Play Billing**: Google exige ese sistema para funciones y suscripciones digitales vendidas dentro de una app distribuida por Play. [Política de pagos de Google Play](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en-en) La app no debe enlazar una pasarela externa desde ese flujo peruano sin revisar los programas y regiones que Google permita en ese momento.

Para una web independiente, Izipay es una alternativa local a cotizar: sus canales oficiales documentan tarjetas y métodos como Yape/Plin, pero requiere afiliación, credenciales y condiciones comerciales vigentes. [Izipay Developers](https://developers.izipay.pe/api/) No se asume una comisión ni se guarda una tarjeta en Supabase.

Cuando exista esa autorización, la implementación seguirá este orden:

1. Tablas `billing_customers`, `subscriptions`, `payment_events` y `entitlements`; nunca guardar números de tarjeta en Supabase.
2. Google Play Billing para la APK y, solo en web, checkout alojado por una pasarela aprobada; cada compra lleva identificador idempotente y webhook con verificación de firma en una Edge Function.
3. El webhook, no la aplicación móvil, concede o revoca `entitlements`.
4. Pantalla de estado, cancelación, comprobante y soporte; pruebas de pago aprobado, rechazado, duplicado, reembolso y renovación.
5. Publicar solo después de medición de conversión, costo de IA por usuario y revisión legal/tributaria.

La app muestra hoy un botón informativo de KODA Plus que abre “Próximamente”; no inicia checkout, no guarda tarjetas ni concede beneficios de pago. Así se puede validar interés sin simular una compra.

## Publicidad: decisión actual

No se integran SDKs publicitarios ni anuncios en esta versión. Interrumpir una sesión de repaso o condicionar la respuesta académica a ver publicidad dañaría el valor principal de KODA. Si después de medir el producto se evalúan anuncios, solo se consideraría una opción **voluntaria y claramente etiquetada** —por ejemplo, un anuncio recompensado para un análisis adicional—, nunca anuncios entre tarjetas, simulacros, recordatorios o resultados.

Antes de ese experimento se deberá revisar consentimiento, privacidad, edad de los usuarios, costo por análisis y las políticas vigentes de la red publicitaria. Google documenta que los anuncios recompensados deben mostrar una recompensa declarada y entregarla cuando se complete la visualización; eso no se implementa todavía. [Google AdMob: anuncios recompensados](https://developers.google.com/admob/android/rewarded)

## Experimento de los próximos 30 días

| Hipótesis | Señal de éxito | Acción |
| --- | --- | --- |
| El plan y el sílabo generan hábito | 35% de usuarios con 3 sesiones en 7 días | Mantener onboarding y recordatorios |
| Plus tiene demanda a S/ 9.90 | 8% de usuarios activos se unen a lista de espera | Preparar checkout y beta cerrada |
| El análisis es sostenible | Margen positivo después de proveedor IA, almacenamiento y soporte | Ajustar cupos Plus antes de cobrar |
| Una institución pagaría | 2 conversaciones con coordinadores y una carta de intención | Prototipo B2B sin datos identificables |

## Métricas mínimas

- Activación: perfil académico + primer examen o primer sílabo en 24 horas.
- Retención: D7, D30 y sesiones de repaso por semana.
- Valor: temas aplicados desde sílabo, material analizado y simulacros terminados.
- Negocio: interés en Plus, conversión, cancelación, costo de IA/material y margen bruto.
- Seguridad: errores de carga, fallos de análisis y solicitudes de eliminación/exportación.
