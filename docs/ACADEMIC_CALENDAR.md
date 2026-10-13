# Calendario académico peruano: corte 2026

KODA no inventa la fecha de un examen. Cada institución publica su propio calendario, con diferentes nombres de periodo, duración y, a veces, calendarios distintos por modalidad. Este inventario mantiene una fuente oficial por institución y separa lo confirmado de aquello que aún no se debe usar para dar una fecha al estudiante.

## Hallazgo principal

`2026-II` **no significa lo mismo para todas las instituciones**. Por ejemplo, el pregrado de UPC inicia el 24 de agosto, PUCP y UPN el 17 de agosto, UCV a distancia el 1 de septiembre y CIBERTEC trabaja con inicios modulares. Por eso KODA guarda un `period_code`, modalidad y eventos concretos en vez de aplicar una regla universal.

| Institución | Periodo oficial encontrado | Información útil confirmada | Estado en KODA |
| --- | --- | --- | --- |
| TECSUP | 2026-1 | El reglamento indica que el calendario y las matrículas regular/extraordinaria se publican oportunamente; el detalle para alumnos está en su portal. | Fuente registrada; sin fechas públicas que precargar. |
| UCSM | 2026-I / 2026-II | Publica una programación académico-administrativa y un cronograma de matrícula por escuela. | Fuente registrada; falta extracción oficial del detalle 2026-II. |
| UCSP | 2026-02 | La guía de ingresantes confirma el inicio en agosto de 2026. | Fuente registrada; no se publicaron en abierto las ventanas de evaluación de pregrado. |
| UNSA | 2026-A | Matrícula del 23 al 31 de marzo; clases del 6 de abril al 31 de julio. | Eventos oficiales cargables; cada escuela debe confirmar fechas de evaluaciones. |
| IDAT | 2026 | No se encontró un calendario pregrado único y público que detalle matrícula y evaluaciones. | Fuente pendiente; no estimar exámenes. |
| CERTUS | 2026-2 | Un periodo único de 16 semanas, con módulo 1 del 24 de agosto al 18 de octubre y módulo 2 del 19 de octubre al 13 de diciembre. | Eventos de módulos verificables; examen específico no se infiere. |
| ISIL | 2026 | No se encontró un cronograma de pregrado público, único y versionado. | Fuente pendiente; no estimar exámenes. |
| SENATI | 2026 | No se encontró un cronograma nacional público que aplique de igual forma a todas las sedes y especialidades. | Fuente pendiente; no estimar exámenes. |
| CIBERTEC | 2026-43 | Periodo modular: módulo I del 6 de julio al 30 de agosto y módulo II del 7 de septiembre al 1 de noviembre. | Eventos de módulos verificables; matrícula y evaluación dependen de modalidad. |
| UTP | 2026 / ciclo 1-marzo | Inicio de clases el 23 de marzo y fin el 26 de julio. | Calendario de admisión confirmado; faltan ventanas públicas de evaluaciones para la malla de pregrado. |
| UPC | 2026-2 | Matrícula 17–22 de agosto; clases 24 de agosto; parciales 11–18 de octubre; finales 6–15 de diciembre. | Periodo y ventanas de evaluación verificadas. |
| PUCP | 2026-2 | Matrícula 4–6 de agosto, extemporánea 10–11 de agosto, clases 17 de agosto–12 de diciembre; primeros exámenes 5–17 de octubre. | Periodo y primera ventana de evaluación verificados. |
| UNMSM | 2026-II | Matrícula regular 10–14 de agosto, extemporánea 7–11 de septiembre y evaluación parcial 12–17 de octubre. | Periodo y parcial verificados; cada facultad puede añadir hitos internos. |
| UCV | 2026-II a distancia | Matrícula 15 de junio–31 de agosto; clases 1 de septiembre–21 de diciembre; evaluación opcional 19–22 de diciembre. | Periodo y eventos oficiales verificados. |
| UPN | 2026-2 / pregrado tradicional B | Turnos de matrícula del 8 al 12 de agosto; inicio de clases el 17 de agosto. | Inicio y matrícula verificados; finales se toman del PDF anual por modalidad. |

## Frecuencia de exámenes

No hay una frecuencia uniforme que se pueda aplicar a las 15 instituciones:

- UPC, PUCP y UNMSM publican ventanas institucionales de parcial/final; KODA puede sugerirlas **solo cuando estén registradas como oficiales**.
- CERTUS y CIBERTEC organizan el avance en dos módulos de alrededor de ocho semanas. El fin de módulo no se etiqueta como “examen” sin una fuente que lo afirme.
- TECSUP, UCSM, UCSP, UNSA, IDAT, ISIL, SENATI y UTP no exponen en una fuente pública única una fecha de examen válida para cada carrera, sede y modalidad. KODA pedirá la fecha real al estudiante y no la reemplazará por una suposición.

## Política de actualización

Las tablas `institution_academic_periods` e `institution_academic_calendar_events` almacenan:

- la fuente oficial, fecha de revisión y modalidad;
- matrícula, inicio y fin de clases, y ventanas de evaluación cuando existen;
- una marca `is_estimated`, que debe mantenerse en `false` para datos publicados y en `true` únicamente para una sugerencia visible como aproximada.

El siguiente paso no será hacer scraping indiscriminado: muchos cronogramas son PDF, portales autenticados o cambian por sede. Se definirá una fuente pública autorizada por institución, se revisará en cada cambio de periodo y cualquier extracción automática quedará como **pendiente de revisión humana** antes de notificar fechas. Así se evita mandar a un estudiante una fecha falsa.

## Fuentes oficiales consultadas

- [Reglamento y matrícula TECSUP](https://www.tecsup.edu.pe/wp-content/uploads/2024/07/reglamento-institucional.pdf)
- [Matrícula UCSM](https://ucsm.edu.pe/alumnos/)
- [Guía de matrícula UCSP](https://admcomercial.ucsp.edu.pe/Content/GuiaPostulante/guia_postulante_238.pdf)
- [Cronograma académico UNSA 2026](https://www.unsa.edu.pe/vice_acade/cronograma-de-actividades-academicas-2026/)
- [Matrícula CERTUS](https://www.certus.edu.pe/matricula/)
- [Calendario modular CIBERTEC](https://explora.cibertec.edu.pe/es_ES/notas/%C2%BFcuando-inicia-y-termina-el-modulo-academico)
- [Resolución UTP 2026 ciclo 1](https://www.utp.edu.pe/web/sites/default/files/2026-05/RRN%C2%BA-0070-2026-R-UTP-Proceso-de-Admision-y-Calendario-de-Admision-2026-1-v3_PT.pdf)
- [Calendario anual UPC 2026](https://www.upc.edu.pe/servicios/contacto-para-alumnos-upc/calendario/documentos/Calendario-Anual-2026-Pregrado.pdf)
- [Matrícula PUCP 2026-2](https://estudiante.pucp.edu.pe/tramite/matricula/)
- [Cronograma UNMSM 2026](https://viceacademico.unmsm.edu.pe/wp-content/uploads/2026/02/Gu%C3%ADa-del-estudiante-de-pregrado-2026.pdf)
- [Cronograma UCV 2026](https://webadminportal.ucv.edu.pe/uploads/files/transparencia_01-04-24/2025/octubre_2025/RCUN_0404-2025-UCV_Cronograma_Acadeemico_y_Pagos_2026_%281%29_20251003173731.pdf)
- [Matrícula UPN 2026-2](https://estudiante.upn.edu.pe/matricula-upn)
