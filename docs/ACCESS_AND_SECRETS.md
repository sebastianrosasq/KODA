# KODA · accesos necesarios

## Requeridos ahora

| Servicio | Acción de la persona propietaria | Uso |
| --- | --- | --- |
| GitHub | Autorizar GitHub CLI o crear el repositorio remoto `KODA` bajo `sebastianrosasq`. | Código, issues y CI. |
| Expo | Crear/iniciar sesión en una cuenta Expo y tener Expo Go en un Android físico. | Desarrollo y EAS Build. |

## Requeridos por sprint

| Sprint | Servicio | Dato que no debes compartir por chat |
| --- | --- | --- |
| S2 | Supabase | Contraseña de base, `service_role` y tokens personales. |
| S5 | Firebase | Archivo de cuenta de servicio FCM v1. |
| S6 | OpenAI Platform | API key del proyecto y datos de facturación. |
| S8 | Google Play Console | Credenciales, identidad, claves de firma y cuenta de pagos. |

## Cómo entregar acceso de forma segura

1. Inicia sesión tú mismo en la cuenta correspondiente cuando el navegador o CLI la abra.
2. Crea proyectos con nombres separados: `koda-dev`, `koda-staging` y `koda-prod` cuando lleguemos a ese punto.
3. Entrega claves únicamente por el panel de secretos del servicio o configurándolas localmente; nunca las pegues en el chat ni en un archivo rastreado por Git.
4. Para OpenAI, usa un proyecto propio de KODA, límites de gasto, alertas y una clave con vencimiento. La función de servidor la guardará como secreto.

La documentación oficial de OpenAI exige guardar las claves en servidor y nunca exponerlas en una aplicación cliente. La APK no contendrá una clave de OpenAI.
