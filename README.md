# Soledad Cedres Quiropráctica

## Manual para uso diario

Si necesitas una guía pensada para la dueña del negocio, sin lenguaje técnico, consulta [docs/Manual-Usuario-Final.md](docs/Manual-Usuario-Final.md).

Esta es una aplicación web para la gestión de turnos y servicios de Soledad Cedres Quiropráctica. La plataforma permite explorar prestaciones, agendar citas en tiempo real y recibir orientación inicial mediante un asistente con Inteligencia Artificial.

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

### Inteligencia Artificial

- **Google Gemini API (@google/genai)**: Utilizado para el asistente virtual que orienta al cliente según sus molestias, necesidades u objetivos.

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
├── firestore.rules      # Reglas de seguridad de Firestore
├── constants.ts         # Datos estáticos (servicios, info de contacto, colores)
├── types.ts             # Definiciones de interfaces y enums de TypeScript
├── firebase.ts          # Configuración e inicialización de Firebase/Auth/Firestore
├── App.tsx              # Lógica principal de enrutamiento y estado global
├── index.tsx            # Punto de entrada de la aplicación
└── firebase.json        # Configuración para desplegar reglas de Firestore
```

---

## ✨ Características Principales

1.  **Catálogo de Servicios**: Presentación detallada de las prestaciones disponibles.
2.  **Sistema de Reservas con Pago Dual**: Los clientes pueden elegir entre pagar con **Mercado Pago** (checkout online, con recargo del 8.73%) o por **transferencia bancaria** (sin recargo, con 4 horas para acreditar). El turno queda pendiente hasta que la administradora confirme la transferencia desde el panel.
3.  **Validación de Disponibilidad**: Sistema en tiempo real que previene doble-booking usando `occupied_slots` (colección pública mínima sin datos personales).
4.  **Cuentas de Usuario**: Registro e inicio de sesión con Firebase Auth usando nombre, documento, email, teléfono y contraseña.
5.  **Cuenta del Cliente**: Vista `Cuenta` con acceso a historial de turnos, cierre de sesión, y edición de perfil completo: nombre, documento, teléfono, email y contraseña.
6.  **Mis Turnos Protegido**: El historial de citas se consulta por `userId` y está disponible para usuarios autenticados; las reservas de invitados quedan visibles solo para admin.
7.  **Reserva como Invitado**: Los usuarios pueden reservar sin cuenta. En el paso 2 se recopila nombre, teléfono y email. Las citas se guardan con `bookingMode: "guest"` para distinguirlas en el admin.
8.  **Perfil de Contacto Reutilizable**: El nombre, documento y teléfono del usuario se autocompletan en la reserva desde su perfil, y siguen siendo editables por turno.
9.  **Distinción Cuenta / Invitado en Admin**: Cada tarjeta de turno en el panel admin muestra un badge: "Cuenta" (verde) para usuarios registrados o "Invitado" (ámbar) para reservas sin cuenta, usando el campo `bookingMode`.
10. **Bloqueo Manual de Horarios**: La administradora puede bloquear y desbloquear horarios manualmente desde el panel, con validación contra turnos ya agendados.
11. **Bloqueo Masivo por Rango**: En admin, la dueña puede bloquear períodos completos (por ejemplo vacaciones) por rango de fechas y opcionalmente por rango horario, evitando el bloqueo uno a uno.
12. **Horario Configurable por la Dueña**: El horario de atención se define en `settings/schedule` (días laborales, hora de inicio/fin, intervalo de slots y descansos), y Booking se adapta en tiempo real.
13. **Promociones Autogestionables**: La dueña puede crear, editar, pausar y destacar promociones desde el panel admin, con vigencia y servicios asociados.
14. **Panel Admin por Rol**: El acceso administrativo depende del rol `admin` en Firestore; además, incluye gestión de usuarios y promoción segura de cuentas a admin mediante backend protegido.
15. **Historia Clínica Digital**: Nueva pestaña en Admin para registrar la ficha de ingreso del paciente y la evolución por sesión, vinculable al usuario y opcionalmente al turno.
16. **Asistente IA**: Chatbot integrado que utiliza el modelo **Gemini 3 Flash** para orientar a los clientes sobre qué servicio les conviene más.
17. **Filtros y Búsqueda en Turnos**: Admin puede buscar por nombre/teléfono/email/servicio, filtrar por estado temporal (hoy/próximos/pasados), modo de reserva (cuenta/invitado), estado de pago (pagado/sin pago), **método de pago (MP/transferencia)**, **estado de pago de transferencia (pendiente/pagada/vencida)** y rango de fechas. Carga incremental de 20 turnos para mejor rendimiento.
18. **Ficha de Contacto Expandible en Turnos**: Cada turno tiene acceso a un modal con información de contacto de la paciente (teléfono, email y documento cuando fue proporcionado), sin sobrecargar visualmente la tarjeta principal.
19. **Diseño Mobile-First**: Optimizado para ser utilizado como una Web App en dispositivos móviles.

---

## ⚙️ Configuración y Desarrollo

### Requisitos Previos

- Node.js (v18 o superior)
- Una cuenta de Firebase con un proyecto creado.
- Firebase Auth habilitado con proveedor Email/Password.
- Una API Key de Google AI Studio (Gemini).

### Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave de Gemini:

```env
GEMINI_API_KEY=tu_clave_aqui
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_unsigned_upload_preset
VITE_BACKEND_URL=https://tu-backend.vercel.app
```

### Subida de Imágenes (Cloudinary)

El panel admin usa Cloudinary para subir imágenes de servicios sin depender de Firebase Storage.

1. Crea una cuenta en Cloudinary (plan gratuito).
2. Ve a **Settings > Upload**.
3. Crea un **Upload Preset** con modo **Unsigned**.
4. Configura `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET` en `.env.local`.

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
- `settings`: lectura pública para consumir configuración operativa (por ejemplo `settings/schedule`); escritura solo admin.
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
  - `occupied_slots`: `appointmentId`, `serviceId`, `date`, `time`, `duration` (minutos), `createdAt`, `expiresAt` (solo en slots de transferencia; el frontend lo usa para ignorar slots vencidos sin esperar al cron).
  - `blocked_slots`: `date`, `time`, `createdAt`.
  - `settings/schedule`: `workDays`, `startTime`, `endTime`, `slotIntervalMinutes`, `breaks` (`[{ start, end }]`) para configurar agenda dinámica.
  - `services`: `name`, `description`, `duration`, `price`, `image`.
  - `promotions`: `title`, `description`, `badgeText`, `discountType`, `discountValue`, `featured`, `isActive`, `appliesToAllServices`, `serviceIds`, `startDate`, `endDate`, `priority`, `image`.
  - `clinical_profiles`: `patientId`, `intakeDate`, datos de identificación y contacto, motivo de consulta, zonas de dolor, antecedentes de salud, `initialDiagnosis`, `treatmentStartDate`, `createdAt/updatedAt`, `createdBy/updatedBy`.
  - `clinical_sessions`: `patientId`, `appointmentId` (opcional), `sessionDate`, `painLevel`, `clinicalObservations`, `techniquesApplied`, `recommendations`, `sessionNumber`, `createdAt/updatedAt`, `createdBy/updatedBy`.
- **Autenticación**: `AuthProvider` centraliza sesión, perfil Firestore reactivo, y expone `updateProfile()`, `updateEmail()` (con reautenticación) y `updatePassword()`.
- **Reserva**: `appointments.userName`, `appointments.userPhone`, `appointments.userEmail` y `appointments.userDocumentId` (si fue provisto) guardan el snapshot exacto del turno. `bookingMode: "account"` identifica reservas de usuarios registrados; `"guest"` identifica reservas sin cuenta. El backend (`create-payment.js`) acepta `userId` y `documentId` como opcionales.
- **Disponibilidad**: Booking consume `occupied_slots` + `blocked_slots`; `appointments` completas quedan restringidas por reglas para proteger datos personales.
- **Migración inicial de disponibilidad**: tras desplegar backend/rules por primera vez, ejecutar una vez `/api/backfill-occupied-slots` (admin) para sincronizar turnos históricos en `occupied_slots`.
- **Estilos**: Se utiliza una configuración de Tailwind personalizada en `index.html` y `index.css`. El color primario ya se gestiona desde tokens semánticos definidos en `constants.ts`.
- **IA**: El asistente está configurado en `components/AIAssistant.tsx`. Puedes ajustar las `systemInstruction` para cambiar su personalidad o conocimientos.

---

Desarrollado para **Soledad Cedres Quiropráctica**.
