# KODA · accesos necesarios

## Requeridos ahora

| Servicio | Acción de la persona propietaria | Uso |
| --- | --- | --- |
| GitHub | El responsable invita a cada integrante al repositorio privado sebastianrosasq/KODA. Cada integrante usa su propia cuenta; no se comparten contraseñas. | Código, issues y CI. |
| Expo Go | Tener Expo Go en un Android físico para el Sprint 1. La cuenta Expo se pedirá antes de generar builds con EAS. | Desarrollo y EAS Build. |

## Requeridos por sprint

| Sprint | Servicio | Dato que no debes compartir por chat |
| --- | --- | --- |
| S2 | Supabase | Contraseña de base, service_role y tokens personales. |
| S5 | Firebase | Archivo de cuenta de servicio FCM v1. |
| S6 | Google AI Studio / Gemini API | API key del proyecto y configuración de cuotas. |
| S8 | Google Play Console | Credenciales, identidad, claves de firma y cuenta de pagos. |

## Cómo entregar acceso de forma segura

1. Inicia sesión tú mismo cuando el navegador o CLI la abra.
2. Crea proyectos separados: koda-dev, koda-staging y koda-prod cuando lleguemos a ese punto.
3. Entrega claves solo por el panel de secretos del servicio o configurándolas localmente; nunca las pegues en chat ni en Git.
4. Para Gemini, usa un proyecto propio de KODA, revisa cuotas y una clave de servidor. La función de Supabase la guardará como secreto bajo `GEMINI_API_KEY`.

La instalación no necesita secretos: [GETTING_STARTED.md](GETTING_STARTED.md).

La APK no contendrá una clave de Gemini.
