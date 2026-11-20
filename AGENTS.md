# Instrucciones para agentes — enarmonia

## Alcance y referencias

- Este repositorio contiene el frontend de Soledad Cedres Quiropráctica: React 19, TypeScript, Vite y Tailwind. `App.tsx` maneja navegación y suscripciones; `pages/` contiene las vistas; `contexts/AuthContext.tsx` gestiona Auth/perfil; `firebase.ts` centraliza el SDK cliente; `types.ts` define los contratos locales.
- El frontend lee Firestore y realiza escrituras administrativas permitidas por reglas. Delega reservas y pagos a `enarmonia_backend` mediante `BACKEND_URL` de `constants.ts` (`VITE_BACKEND_URL`). No mover credenciales ni lógica privilegiada al navegador.
- Leer [README.md](README.md): configuración, modelo de datos, «Bloqueos semanales», «Pruebas y verificación de agenda» y compatibilidad. La guía funcional es [docs/Manual-Usuario-Final.md](docs/Manual-Usuario-Final.md), especialmente Turnos, Bloqueos, Horario e Historia clínica.
- Para contratos HTTP, estados de pago y concurrencia, consultar [README del backend](../enarmonia_backend/README.md) y sus handlers reales. Si no está disponible el checkout hermano, usar los enlaces al backend del README. No copiar aquí el manual ni esquemas extensos.
- Ante discrepancias entre documentación y código, comprobar el flujo, informar la diferencia y no inventar garantías. Revisar instrucciones adicionales en el directorio afectado antes de editar.

## Forma de trabajo y Git

- Comprobar `git status` y la rama antes de editar. Preservar cambios ajenos y su staging; no usar reset/clean ni sobrescribir trabajo preexistente.
- Convenciones de ramas: `feature/` para nuevas funcionalidades, `fix/` para correcciones de errores, `docs/` para cambios exclusivamente documentales y `refactor/` para refactorizaciones. Usar descripciones en inglés, por ejemplo `docs/agent-guidelines`.
- Flujo de integración: trabajar en la rama del tipo correspondiente, validar e integrar a `staging`; promover a `main` solo después de verificar staging y contar con autorización para la integración. No editar directamente `main` ni `staging`.
- No utilizar el prefijo `codex/` para nuevas ramas. Si una restricción de la herramienta obliga a utilizarlo, informar explícitamente la restricción en lugar de asumir que puede evitarse.
- Nombres de ramas y mensajes de commit en inglés. Mantener los prefijos observados (`feat:`, `fix:`, `docs:`, `chore:`), el estilo del archivo y la UI en español. No introducir librerías, reestructuraciones ni cambios de configuración fuera del alcance solicitado.
- Cambios pequeños y revisables. No incluir `.env*` privados, credenciales, datos clínicos/personales, `node_modules/` ni `dist/`. Revisar el diff antes de entregar; no hacer pushes, merges ni despliegues por iniciativa propia.
- Antes de modificar reservas, bloqueos, pagos, permisos o datos clínicos, inspeccionar el flujo completo afectado en ambos repositorios: UI, solicitud, validación, persistencia, notificaciones y lectura posterior. Actualizar la documentación pertinente cuando cambie el comportamiento.
- Pedir autorización explícita antes de operaciones destructivas, migraciones remotas o despliegues (incluidos reglas/índices Firebase). Un procedimiento del README no constituye autorización para ejecutarlo.

## Comandos y validación

Desde la raíz, con las dependencias del lockfile instaladas:

```sh
npm test
npm run lint
npm run build
```

- `npm run lint` es el typecheck `tsc --noEmit`; no hay script separado `typecheck` ni un linter de estilo configurado. El build de Vite no sustituye el typecheck.
- Desarrollo: `npm run dev` (puerto 3000); staging local: `npm run dev -- --mode staging`. Estos comandos pueden conectar con servicios reales: verificar primero el entorno.
- Antes de integrar cambios funcionales, pasar las tres comprobaciones; informar fallos y checks pendientes sin atribuirlos al cambio sin evidencia. Para documentación sola, revisar enlaces, comandos, coherencia y `git diff --check`; no hace falta arrancar la app ni contactar servicios.
- Si cambia disponibilidad/calendario, ejecutar también `npm test` en el backend y repetir ambas suites con `TZ=UTC` y `TZ=America/Montevideo` en el entorno del proceso. Seguir la verificación manual del README, incluyendo móvil/escritorio, invitados/cuentas y duraciones distintas.
- Las pruebas de `tests/*.test.cjs` cargan TypeScript y simulan hooks/persistencia. No prueban reglas Firestore, navegador ni checkout real. En cambios de pagos o datos reales, nunca considerar suficientes los mocks: verificar integración en emulador o staging autorizado y Mercado Pago sandbox según corresponda. Si no se puede, declarar la validación pendiente y no presentar el cambio como listo para producción. No usar pagos ni datos personales reales para QA.

## Reservas, bloqueos y pagos

- Revisar `pages/Booking.tsx`, `pages/Admin.tsx`, `utils/scheduleUtils.ts`, `utils/blockForm.ts`, `utils/blockRules.ts` y los handlers del backend. Mantener alineados `utils/blockRules.ts` y `enarmonia_backend/lib/blockRules.js`; revisar también ambos cálculos de promociones antes de cambiar precios.
- Preservar registros antiguos, reglas semanales y `excludedSlots`. Las fechas son de calendario `YYYY-MM-DD`, las horas locales de agenda `HH:MM`, y los días ISO van de lunes=1 a domingo=7. La aritmética UTC de fechas no convierte la agenda a timestamps UTC.
- El final de una franja incluye el inicio de ese último slot; evaluar solapamientos por la duración completa. Las reglas guardan intervalos y excepciones: cambiar el horario laboral no las recalcula automáticamente. No cancelar reservas previas ni borrar excepciones para simplificar cambios.
- `occupied_slots` es la proyección pública mínima de disponibilidad; no sustituirla por lectura pública de `appointments`. No introducir datos privados de pacientes en `occupied_slots`, `blocked_slots` ni `settings`; conservar solo el contacto público previsto en `settings/contact`.
- La UI es orientativa; el backend vuelve a validar y calcula el importe. Una redirección a `/success` no acredita un pago. Preservar la distinción entre subtotal (`price`), recargo y `totalAmount`, y entre reserva invitada y de cuenta.
- Transferencia crea turno pendiente y ocupación con vencimiento a cuatro horas; confirmación, cancelación y expiración deben conservar la coherencia entre turno, slot y cupón. MP materializa turno/slot al aprobarse el pago en el webhook.
- Los cambios de concurrencia, retenciones y reconciliación de pagos requieren una tarea independiente autorizada y validación integral de ambos repositorios. Consultar la documentación técnica privada antes de modificar estos flujos.
- Leer el orden de compatibilidad del README: backend compatible antes del frontend que escribe reglas nuevas; no volver a lectores antiguos ni convertir datos automáticamente. La lectura completa de bloqueos y el crecimiento de excepciones tienen límites de costo/tamaño documentados.

## Seguridad y entornos

- Revisar `firestore.rules` y `firestore.indexes.json` al cambiar accesos/consultas. Auth de la UI no reemplaza autorización en reglas/backend. Historias clínicas son solo admin; historial de turnos, dueño o admin. No ampliar accesos para resolver un error de permisos.
- Validar identidad y autorización en cada frontera de confianza; los roles y permisos requieren comprobaciones específicas. Consultar las instrucciones y el registro de riesgos del backend privado antes de cambiar controles de acceso. No publicar hallazgos internos pendientes, ejemplos de abuso ni detalles de credenciales en este repositorio.
- Firebase Admin en el backend elude las reglas cliente. Revisar el contrato y la autorización efectiva del servidor antes de modificar llamadas administrativas; no considerar que ocultar un control en la UI protege la operación.
- Nunca exponer tokens MP, claves privadas Firebase, Resend o Gemini en el bundle, logs o commits. Las variables `VITE_*` son públicas; revisar también las sustituciones de build antes de configurar variables. El asistente está oculto y no debe reactivarse incidentalmente.
- Separar desarrollo local, staging y producción por proyectos Firebase, URL de backend y credenciales de pago; no inferir aislamiento por el nombre de rama, el modo Vite o la etiqueta visual. Confirmar los destinos efectivos antes de iniciar pruebas con escrituras.
- Comprobar la configuración efectiva de `firebase.ts`, `constants.ts` y `.firebaserc`: la falta de variables no garantiza aislamiento. Seleccionar explícitamente el entorno autorizado; no cambiar destinos ni valores por defecto incidentalmente.
- Usar los ejemplos de entorno del repositorio como referencia, sin imprimir archivos privados. Mantener separados también los recursos Cloudinary y las URLs de callbacks/webhook según el README.
