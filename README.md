# Soledad Cedres Quiropráctica

## Manual para uso diario

Si necesitas una guía pensada para la dueña del negocio, sin lenguaje técnico, consulta [docs/Manual-Usuario-Final.md](docs/Manual-Usuario-Final.md).

Esta es una aplicación web para la gestión de turnos y servicios de Soledad Cedres Quiropráctica. La plataforma permite explorar prestaciones y agendar citas en tiempo real.

## 🚀 Tecnologías Utilizadas

### Frontend

- **React 19**: Biblioteca principal para la interfaz de usuario.
- **TypeScript**: Para un desarrollo robusto y tipado estático.
- **Vite**: Herramienta de construcción (build tool) ultra rápida.
- **Tailwind CSS**: Framework de utilidades CSS para un diseño responsivo y moderno.
- **Lucide React**: Set de iconos elegantes y ligeros.
- **Google Fonts**: Tipografías _Montserrat_ (cuerpo) y _Playfair Display_ (títulos).

### Backend & Base de Datos

- **Firebase Firestore**: Base de Datos NoSQL en tiempo real para almacenar citas y servicios.
- **Firebase Auth**: Autenticación con email y contraseña para clientes y administradora.
- **Firebase SDK (v10+)**: Implementación modular para Firestore, Auth y Storage.
- **Vercel Functions**: Backend serverless para integración de pagos.
- **Mercado Pago**: Procesamiento seguro de pagos online.

### Inteligencia Artificial (estado actual)

- **Asistente IA temporalmente inhabilitado**: la UI del asistente está oculta hasta nueva activación.
- **Integración preparada en backend**: existe un endpoint `/api/ai-chat` para retomar el asistente en el futuro con Gemini desde servidor.

---

## 🛠️ Estructura del Proyecto

```text
├── components/          # Componentes reutilizables (Navbar, Asistente IA, etc.)
├── contexts/            # Contextos globales, incluyendo autenticación
├── pages/               # Vistas principales de la aplicación
│   ├── Home.tsx         # Landing page con servicios destacados
│   ├── Services.tsx     # Catálogo completo de servicios
│   ├── Booking.tsx      # Reserva con validación de horarios, pago y modo invitado/opcional con cuenta
│   ├── Login.tsx        # Inicio de sesión con Firebase Auth
│   ├── Register.tsx     # Registro de usuarios con nombre, documento, email y contraseña
│   ├── Account.tsx      # Resumen de cuenta y accesos rápidos
│   ├── MyAppointments.tsx # Historial de turnos del usuario autenticado
│   ├── Contact.tsx      # Información de contacto y acceso admin
│   └── Admin.tsx        # Panel de gestión para administradora
├── firestore-seeds/     # Ejemplos de documentos para colección users
├── utils/
│   ├── scheduleUtils.ts # Generación de horarios y solapamientos de disponibilidad
│   ├── blockRules.ts    # Fechas, días ISO, intervalos y excepciones de bloqueos
│   └── blockForm.ts     # Validación, carga para edición y creación de reglas semanales
├── tests/              # Pruebas de disponibilidad y handlers de Admin/Booking
├── docs/Manual-Usuario-Final.md # Instrucciones de uso diario para la dueña
├── firestore.rules      # Reglas de seguridad de Firestore
├── constants.ts         # Valores por defecto (servicios, contacto fallback, colores)
├── types.ts             # Definiciones de interfaces y enums de TypeScript
├── firebase.ts          # Configuración e inicialización de Firebase/Auth/Firestore
├── App.tsx              # Lógica principal de enrutamiento y estado global
├── index.tsx            # Punto de entrada de la aplicación
└── firebase.json        # Configuración para desplegar reglas de Firestore
```

---

## ✨ Características Principales

1.  **Catálogo de Servicios**: Presentación detallada de las prestaciones disponibles.
2.  **Orden Manual de Servicios**: Desde Admin, la dueña puede reordenar el catálogo con controles de subir/bajar. El orden se guarda en Firestore y se respeta en Home, Servicios y Booking.
3.  **Sistema de Reservas con Pago Dual**: Los clientes pueden elegir entre pagar con **Mercado Pago** (checkout online, con recargo del 8.73%) o por **transferencia bancaria** (sin recargo, con 4 horas para acreditar). El turno queda pendiente hasta que la administradora confirme la transferencia desde el panel.
4.  **Validación de Disponibilidad**: Booking consulta en tiempo real `occupied_slots` (colección pública mínima sin datos personales) y `blocked_slots`. El backend vuelve a validar solapamientos antes de crear reservas o preferencias de pago; ver [Bloqueos semanales](#bloqueos-semanales) para el modelo y su validación.
5.  **Cuentas de Usuario**: Registro e inicio de sesión con Firebase Auth usando nombre, documento, email, teléfono y contraseña.
6.  **Cuenta del Cliente**: Vista `Cuenta` con acceso a historial de turnos, cierre de sesión, y edición de perfil completo: nombre, documento, teléfono, email y contraseña.
7.  **Mis Turnos Protegido**: El historial de citas se consulta por `userId` y está disponible para usuarios autenticados; las reservas de invitados quedan visibles solo para admin. Las cancelaciones de clientas se gestionan por WhatsApp/administración (no autogestionadas desde la app).
8.  **Reserva como Invitado**: Los usuarios pueden reservar sin cuenta. En el paso 2 se recopila nombre, teléfono y email. Las citas se guardan con `bookingMode: "guest"` para distinguirlas en el admin.
9.  **Perfil de Contacto Reutilizable**: El nombre, documento y teléfono del usuario se autocompletan en la reserva desde su perfil, y siguen siendo editables por turno.
10. **Distinción Cuenta / Invitado en Admin**: Cada tarjeta de turno en el panel admin muestra un badge: "Cuenta" (verde) para usuarios registrados o "Invitado" (ámbar) para reservas sin cuenta, usando el campo `bookingMode`.
11. **Bloqueo Manual de Horarios**: La administradora puede bloquear y desbloquear horarios manualmente desde el panel, con validación contra turnos ya agendados.
12. **Bloqueos Semanales por Rango**: En admin, la dueña puede elegir fechas, horario y varios días de la semana, o marcar Todos los días. Puede editar una regla, desbloquear parte del rango o eliminarla completa, manteniendo los bloqueos anteriores y los turnos existentes.
13. **Horario Configurable por la Dueña**: El horario de atención se define en `settings/schedule` con tres bloques independientes (`weekdays` para lunes-viernes, `saturday` y `sunday`), cada uno con su hora de inicio/fin, intervalo de slots y descansos. El intervalo es configurable (por ejemplo 60 o 30 minutos) y Booking se adapta en tiempo real.
14. **Promociones Autogestionables**: La dueña puede crear, editar, pausar y destacar promociones desde el panel admin, con vigencia y servicios asociados.
15. **Panel Admin por Rol**: El acceso administrativo depende del rol `admin` en Firestore; además, incluye gestión de usuarios y promoción segura de cuentas a admin mediante backend protegido.
16. **Historia Clínica Digital**: Nueva pestaña en Admin para registrar la ficha de ingreso del paciente y la evolución por sesión, vinculable al usuario y opcionalmente al turno. El selector de paciente es un combobox con búsqueda en tiempo real por nombre, documento o email, apto para volúmenes altos de pacientes. La lista de sesiones usa carga incremental (20 por página), botón "Cargar más" y filtros por texto, nivel de dolor y rango de fechas.
17. **Asistente IA (temporalmente inhabilitado)**: la funcionalidad quedó pausada por decisión operativa y se reactivará cuando el negocio lo requiera.
18. **Filtros y Búsqueda en Turnos**: Admin puede buscar por nombre/teléfono/email/servicio, filtrar por estado temporal (hoy/próximos/pasados), modo de reserva (cuenta/invitado), estado de pago (pagado/sin pago), **método de pago (MP/transferencia)**, **estado de pago de transferencia (pendiente/pagada/vencida)** y rango de fechas. Carga incremental de 20 turnos para mejor rendimiento.
19. **Recuperación de Slot en Contingencia**: Existe una acción de recuperación para turnos `paid_transfer`, pero queda oculta por defecto y solo se muestra si se detecta inconsistencia (turno pago sin registro en `occupied_slots`).
20. **Ficha de Contacto Expandible en Turnos**: Cada turno tiene acceso a un modal con información de contacto de la paciente (teléfono, email y documento cuando fue proporcionado), sin sobrecargar visualmente la tarjeta principal.
21. **Diseño Mobile-First**: Optimizado para ser utilizado como una Web App en dispositivos móviles.
22. **Contacto Público Editable**: La dueña puede editar dirección, WhatsApp, email e Instagram desde Admin (`settings/contact`) y decidir qué datos se muestran en la pantalla de Contacto (por ejemplo ocultar Instagram hasta su lanzamiento).
23. **Cupones Personales de Un Uso**: La administradora puede asignar cupones de descuento personalizados a clientas específicas desde la pestaña Usuarios del panel admin. El cupón se aplica automáticamente en el paso de pago de la próxima reserva de esa clienta, sin que ella necesite ingresar ningún código. Una vez completado el pago queda marcado como usado y no puede reutilizarse. Soporta descuento por monto fijo o porcentaje, fecha de vencimiento y restricción a servicios específicos.
24. **Transparencia de Importes en MP**: En tarjetas de turnos (admin y clienta), los pagos con Mercado Pago muestran el total abonado real y el recargo MP desglosado cuando corresponde.
25. **Servicios Deshabilitables sin Borrado**: Desde Admin se puede deshabilitar temporalmente un servicio para ocultarlo en Home, Servicios y Booking sin eliminar su ficha ni afectar historial. También se puede volver a habilitar cuando sea necesario.

---

## ⚙️ Configuración y Desarrollo

### Requisitos Previos

- Node.js (v18 o superior)
- Una cuenta de Firebase con un proyecto creado.
- Firebase Auth habilitado con proveedor Email/Password.
- (Opcional) API Key de Google AI Studio (Gemini), solo si se reactiva el asistente IA.

### Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (desarrollo local):

```env
VITE_BACKEND_URL=https://tu-backend.vercel.app
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_unsigned_upload_preset
VITE_CLOUDINARY_FOLDER_PREFIX=enarmonia
VITE_APP_ENV=production
VITE_ENV_LABEL=
```

Para entorno de pruebas (staging), crea `.env.staging` con los valores del proyecto Firebase de staging y ejecuta:

```bash
npm run dev -- --mode staging
```

Notas:

- la API key de Gemini (si se usa) se configura en el backend, no en el frontend.
- comprobar la configuración efectiva de Firebase y del backend antes de iniciar pruebas; el modo de desarrollo no garantiza aislamiento de servicios.
- en Vercel, cada proyecto (prod/stg) debe tener sus propias variables para evitar cruces entre entornos.
- para diferenciar entornos visualmente, configura en staging `VITE_APP_ENV=staging` y opcionalmente `VITE_ENV_LABEL=STG`.
- además, en entornos no productivos se aplica automáticamente una paleta visual cálida para distinguir staging/qa de producción.

### Emails de autenticacion

Los correos de verificacion y recuperacion de contrasena se envian desde backend con marca propia.

- Endpoint backend: `/api/send-auth-email`
- Remitente configurado por `NOTIFY_FROM_EMAIL` (backend)
- Link de accion: apunta al frontend en `/auth/action` (handler propio, UI en espanol)

### Subida de Imágenes (Cloudinary)

El panel admin usa Cloudinary para subir imágenes de servicios sin depender de Firebase Storage.

1. Crea una cuenta en Cloudinary (plan gratuito).
2. Ve a **Settings > Upload**.
3. Crea un **Upload Preset** con modo **Unsigned**.
4. Configura `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET` en `.env.local`.
5. (Opcional recomendado) Configura `VITE_CLOUDINARY_FOLDER_PREFIX` para separar entornos, por ejemplo `enarmonia` en producción y `enarmonia-stg` en staging.

### Configuración de Pagos

Para habilitar los pagos con Mercado Pago:

1. **Backend**: Despliega el backend en Vercel (ver `enarmonia_backend/README.md`)
2. **Mercado Pago**: Crea cuenta de desarrollador y obtén tu Access Token
3. **Firebase**: Configura Service Account para el backend
4. **URLs**: Actualiza las URLs de redirección en Mercado Pago

### Seguridad de Firestore

La app utiliza reglas basadas en rol almacenado en `users/{uid}`.

- `users`: lectura del dueño o admin; creación inicial del propio perfil cliente y edición de datos de contacto propios como `userPhone`.
- `services`: lectura pública; escritura solo admin.
- `promotions`: lectura pública; escritura solo admin.
- `blocked_slots`: lectura pública para deshabilitar horarios en reservas; escritura solo admin.
- `occupied_slots`: lectura pública para deshabilitar horarios ocupados sin exponer datos sensibles; escritura solo admin/backend.
- `appointments`: lectura del dueño o admin; creación/actualización/eliminación solo admin o backend autorizado según el flujo.
- `settings`: lectura pública para consumir configuración operativa (por ejemplo `settings/schedule` y `settings/contact`); escritura solo admin.
- `clinical_profiles`: ficha de ingreso y antecedentes clínicos por paciente (`patientId` como ID de documento), acceso solo admin.
- `clinical_sessions`: evolución clínica por sesión con vínculo opcional a `appointmentId`, acceso solo admin.

Para desplegar reglas:

```bash
firebase deploy --only firestore:rules
```

### Ejecución en Local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📝 Notas para Desarrolladores

- **Base de Datos**: La app usa colecciones principales en Firestore:
  - `users`: `uid`, `fullName`, `documentId` (formato CI uruguaya `XXXXXXX-X`), `email`, `role`, `userPhone` (formato E.164, ej: `+59899123456`), `createdAt`.
  - `appointments`: `userId` (opcional), `serviceId`, `serviceName`, `date`, `time`, `userName`, `userPhone`, `userEmail`, `userDocumentId` (opcional, formato `XXXXXXX-X`), `bookingMode` (`"account"` | `"guest"`), `createdAt`, `price`, `paid`, `basePrice`, `discountAmount`, `appliedPromotion`, `paymentMethod` (`"mp"` | `"transfer"`), `paymentStatus` (`"paid_mp"` | `"pending_transfer"` | `"paid_transfer"` | `"expired_transfer"` | `"cancelled"`), `subtotalAmount`, `mpSurchargeAmount`, `totalAmount`, `mpFeePercent`, `paymentDueAt` (solo transferencia), `paymentValidatedAt`, `paymentValidatedBy`.
  - Nota de importes: `price` representa el subtotal final del servicio (tras promociones/cupones, sin recargo MP). El total efectivamente cobrado al cliente se guarda en `totalAmount` y el recargo en `mpSurchargeAmount`.
  - `occupied_slots`: `appointmentId`, `serviceId`, `date`, `time`, `duration` (minutos), `createdAt`, `expiresAt` (solo en slots de transferencia; el frontend lo usa para ignorar slots vencidos sin esperar al cron).
  - `blocked_slots`: registros individuales con `date`, `time`, `createdAt`, o reglas con `endDate`, `endTime`, `allDay`, `weekdays`, `weeklySlots` y `excludedSlots`. Ver el [modelo y compatibilidad de Firestore](https://github.com/kasenawe/enarmonia_backend#modelo-de-bloqueos-en-firestore).
  - `settings/schedule`: `weekdays`, `saturday` y `sunday` (cada bloque con `enabled`, `startTime`, `endTime`, `slotIntervalMinutes`, `breaks`) para configurar agenda dinámica separada entre semana, sábado y domingo.
  - `settings/contact`: `address`, `whatsapp`, `instagram`, `email` y flags de visibilidad (`showAddress`, `showWhatsapp`, `showInstagram`, `showEmail`) para controlar qué se publica en la sección Contacto.
  - `services`: `name`, `description`, `duration`, `price`, `image`, `isActive` (opcional, `true` por defecto; si es `false`, no se muestra en reservas públicas).
  - `promotions`: `title`, `description`, `badgeText`, `discountType`, `discountValue`, `featured`, `isActive`, `appliesToAllServices`, `serviceIds`, `startDate`, `endDate`, `priority`, `image`.
  - `clinical_profiles`: `patientId`, `intakeDate`, datos de identificación y contacto, motivo de consulta, zonas de dolor, antecedentes de salud, `initialDiagnosis`, `treatmentStartDate`, `createdAt/updatedAt`, `createdBy/updatedBy`.
  - `clinical_sessions`: `patientId`, `appointmentId` (opcional), `sessionDate`, `painLevel`, `clinicalObservations`, `techniquesApplied`, `recommendations`, `sessionNumber`, `createdAt/updatedAt`, `createdBy/updatedBy`.
- **Autenticación**: `AuthProvider` centraliza sesión, perfil Firestore reactivo, y expone `updateProfile()`, `updateEmail()` (con reautenticación) y `updatePassword()`.
- **Reserva**: `appointments.userName`, `appointments.userPhone`, `appointments.userEmail` y `appointments.userDocumentId` (si fue provisto) guardan el snapshot exacto del turno. `bookingMode: "account"` identifica reservas de usuarios registrados; `"guest"` identifica reservas sin cuenta. El backend (`create-payment.js`) acepta `userId` y `documentId` como opcionales.
- **Disponibilidad**: Booking consume `occupied_slots` + `blocked_slots`; `appointments` completas quedan restringidas por reglas para proteger datos personales.
- **Validación de solapamientos**: la reserva no se valida solo por hora exacta; se valida por rango horario (`inicio + duración`) para evitar superposiciones al usar intervalos de 30 minutos u otros intervalos configurables.
- **Migración inicial de disponibilidad**: tras desplegar backend/rules por primera vez, ejecutar una vez `/api/backfill-occupied-slots` (admin) para sincronizar turnos históricos en `occupied_slots`.
- **Estilos**: Se utiliza una configuración de Tailwind personalizada en `index.html` y `index.css`. El color primario ya se gestiona desde tokens semánticos definidos en `constants.ts`.
- **IA**: El componente `components/AIAssistant.tsx` existe pero la funcionalidad esta deshabilitada en `App.tsx` por el momento.

### Bloqueos semanales

Las instrucciones para crear, editar y quitar bloqueos están en la [sección Bloqueos del manual de uso](docs/Manual-Usuario-Final.md#5-sección-bloqueos).

- `App.tsx` escucha `blocked_slots`, `occupied_slots` y `settings/schedule`, y entrega la disponibilidad a Admin y Booking. Invitados y usuarios con cuenta usan la misma pantalla de reserva y el endpoint `/api/create-payment`; el callback `onConfirm` recibido por Booking no es el flujo efectivo de persistencia.
- Admin guarda cada rango en **un documento**, con selección múltiple de lunes a domingo y opción Todos los días. Al editar conserva el ID, `createdAt` y las excepciones, y recalcula los horarios y conflictos para los parámetros elegidos.
- `blockForm.ts` valida fechas reales, orden del rango, horas `HH:MM` y días ISO únicos entre 1 (lunes) y 7 (domingo). Rechaza selección vacía y rangos sin horarios efectivos. Todos los días conserva el comportamiento del bloqueo tradicional.
- Al guardar, `weeklySlots` conserva los horarios laborales habilitados, descansos e intervalos vigentes. La selección semanal filtra esos horarios: no habilita días de atención cerrados. Los cambios posteriores de agenda no reescriben el bloqueo; editarlo recalcula esa configuración.
- `excludedSlots` conserva los horarios omitidos por turnos, ocupaciones u otros bloqueos existentes. Las reservas no se cancelan ni modifican. Desbloquear parte de una regla agrega excepciones usando sus horarios guardados; Desbloquear en la tarjeta elimina la regla completa. Los documentos antiguos siguen admitiendo eliminación individual o por rango.
- Las fechas `YYYY-MM-DD` son inclusivas y las horas representan horas locales de agenda. **Hasta hora incluye el turno que comienza a esa hora**: 14:00–18:00 también bloquea el turno de las 18:00. Cada intervalo individual usa `[inicio, inicio + duración)`, por lo que un servicio que empieza antes también puede solaparse.
- El cálculo del día semanal y el recorrido de fechas usan medianoche UTC y getters/setters UTC únicamente como aritmética de calendario; no convierten las reservas a instantes UTC ni cambian la zona horaria global. Las pantallas mantienen el calendario local existente. No mezclar los días ISO de las reglas con `Date.getDay()` (domingo=0) al mantener esta lógica.
- `scheduleUtils.ts` y `blockRules.ts` comprueban fecha dentro del rango, día seleccionado, excepciones y solapamiento horario. Booking deshabilita los horarios afectados y vuelve a comprobar antes de enviar la reserva. El backend verifica las mismas reglas y devuelve 409 ante conflictos, incluso si el cliente tiene información desactualizada.

La colección es pública y solo admite escrituras de administradores según las reglas existentes: no agregar datos personales a reglas o excepciones. El backend usa Firebase Admin para la validación efectiva. No se necesitan migraciones, índices, variables de entorno ni dependencias nuevas; los registros antiguos sin selección semanal se interpretan como todos los días de su rango (una fecha si no tienen `endDate`). La documentación técnica del backend privado detalla los contratos y las consideraciones de integración; su acceso requiere permisos del proyecto.

### Pruebas y verificación de agenda

```bash
npm test
npm run lint
npm run build
```

`npm run lint` ejecuta `tsc --noEmit`. Las pruebas usan el runner de Node y el TypeScript instalado, sin dependencias adicionales ni credenciales. Cubren lunes/jueves, martes/viernes, todos los días, compatibilidad antigua, límites de fechas y horas, cambios de semana/año, año bisiesto, fechas de DST, excepciones, serialización y validaciones. También ejecutan los handlers reales de Admin y Booking con hooks y persistencia simulados para verificar creación, edición, desbloqueo parcial, eliminación y disponibilidad pública antes de confirmar. No sustituyen pruebas visuales en navegador ni integración con un emulador Firestore.

Para mantenimiento, mantener alineadas `utils/blockRules.ts` y `lib/blockRules.js` del backend y ejecutar las suites de ambos repositorios. Repetirlas con `TZ=UTC` y `TZ=America/Montevideo` para detectar desplazamientos de calendario; configurar `TZ` en el entorno del proceso de Node según el shell utilizado.

Antes de desplegar, verificar en un entorno de prueba autorizado:

1. Crear un rango futuro que incluya varias semanas, 14:00–18:00, solo lunes y jueves. Confirmar un único documento, listado con días correctos y persistencia al recargar. Con intervalo de 60 minutos, esos días deben bloquear también las 18:00; martes y viernes, fechas fuera del rango y horarios posteriores al último intervalo deben quedar libres si no hay otras restricciones.
2. Editar a martes/viernes y comprobar el mismo ID y la disponibilidad actualizada. Probar Todos los días, selección vacía, fines de semana habilitados/deshabilitados, descansos y servicios de distinta duración que se solapen desde antes del bloqueo.
3. Desbloquear una sola fecha y comprobar que la semana siguiente sigue bloqueada. Eliminar la regla completa. Verificar además un bloqueo antiguo y que las reservas previas del rango conservan sus datos y estados.
4. Llegar al paso de pago y agregar un bloqueo antes de enviar `/api/create-payment`: la UI o el backend deben rechazar la nueva reserva. Repetir como invitado y usuario, con transferencia y MP en sandbox de pagos. Completar los escenarios de checkout y concurrencia definidos en la documentación técnica privada antes de integrar cambios relacionados.
5. Revisar en móvil/escritorio y con zonas UTC y America/Montevideo. Los días semanales y las fechas del bloqueo deben coincidir.

### Compatibilidad de despliegue

Actualizar primero el backend que interpreta reglas recurrentes y después el frontend que permite crearlas. Los clientes deben recargar la versión compatible: el frontend antiguo no muestra las recurrencias, aunque el backend actualizado rechaza esas reservas. No volver a lectores antiguos mientras existan reglas nuevas sin un plan de compatibilidad. Ver el [orden seguro de despliegue y mantenimiento](https://github.com/kasenawe/enarmonia_backend#compatibilidad-de-despliegue-y-mantenimiento).

---

Desarrollado para **Soledad Cedres Quiropráctica**.

## Autor

Desarrollado por [Maximiliano Quintana](https://github.com/kasenawe)
