# Monetización responsable de KODA

Actualizado: 14 de octubre de 2026. Esta es una decisión de producto, no un checkout activo.

## Decisión

KODA empieza como un producto **B2C freemium** para estudiantes de educación superior en Perú. La versión gratis debe resolver el problema completo de organizar y estudiar: carrera/ciclo, plan, recordatorios, flashcards manuales, simulacros, chat de estudio y análisis con los límites operativos actuales (3 PDF y 5 audios por día).

La primera oferta pagada a validar es **KODA Plus a S/ 9.90/mes** o **S/ 79.90/año**. Antes de cobrar, se probará con una lista de espera y entrevistas; el precio es una hipótesis, no una promesa al usuario. Plus desbloquearía analítica avanzada de preparación, más capacidad de procesamiento de materiales según costos reales, reportes exportables y simulacros reforzados. No se promete IA “ilimitada”: esa frase no protege el costo ni comunica un uso justo.

## Por qué este modelo

- Quizlet tiene un plan gratuito y niveles pagos que separan funciones y límites de uso; su página oficial muestra Plus anual desde USD 35.99 y Plus Unlimited anual desde USD 44.99 al momento de esta revisión. [Quizlet Upgrade](https://quizlet.com/upgrade?source=footer)
- Knowt mantiene gratuitas las tarjetas y modos de estudio, y reserva la generación/análisis de IA para Ultra. Su ayuda publica USD 149.99/año o USD 24.99/mes para estudiantes. [Knowt — plan gratuito y Ultra](https://help.knowt.com/en/articles/16905163-what-s-included-in-the-free-plan-for-students)
- RemNote separa el estudio base de los créditos de IA y también ofrece licencias institucionales; documenta descuentos educativos del 25%. [RemNote Pro FAQ](https://help.remnote.com/en/articles/6084981-remnote-pro-frequently-asked-questions)

La oportunidad diferencial de KODA no es vender tarjetas genéricas: es traducir el sílabo, ciclo y fechas reales de instituciones peruanas en un plan que el estudiante controla. El precio inicial propuesto queda deliberadamente muy por debajo de las referencias globales, mientras se mide disposición de pago local y costo real por análisis.

## Privacidad y universidades

No se venderán datos personales, historiales, archivos, notas individuales ni perfiles de estudiantes a universidades. La vía B2B futura es una **licencia institucional opcional**, contratada por la institución y con consentimiento explícito del alumno para cualquier dato adicional. Los reportes agregados deben tener umbral mínimo de cohorte, no incluir identificadores y pasar revisión legal de protección de datos antes de publicarse.

## Pasarela y arquitectura antes de vender

No se debe activar un botón de pago hasta contar con RUC/entidad cobradora, términos de suscripción y reembolsos, política de privacidad actualizada, soporte y un proveedor contratado. Para Perú, Izipay Online declara integración para tarjetas Visa, Mastercard, Amex y Diners, documentación para web/app y abonos al siguiente día útil; se evaluará junto con otra pasarela local en un proceso comercial, no se asumirá una comisión sin cotización vigente. [Izipay Online](https://www.izipay.pe/izipay-online/)

Cuando exista esa autorización, la implementación seguirá este orden:

1. Tablas `billing_customers`, `subscriptions`, `payment_events` y `entitlements`; nunca guardar números de tarjeta en Supabase.
2. Checkout alojado por la pasarela, identificador de compra idempotente y webhook con verificación de firma en una Edge Function.
3. El webhook, no la aplicación móvil, concede o revoca `entitlements`.
4. Pantalla de estado, cancelación, comprobante y soporte; pruebas de pago aprobado, rechazado, duplicado, reembolso y renovación.
5. Publicar solo después de medición de conversión, costo de IA por usuario y revisión legal/tributaria.

La app muestra hoy una pantalla informativa de KODA Plus sin botón de cobro para comunicar el plan sin engañar ni iniciar una transacción.

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
