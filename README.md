# Soledad Cedres Quiropráctica

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
- **Firebase SDK (v10+)**: Implementación modular para optimizar el tamaño del bundle.
- **Vercel Functions**: Backend serverless para integración de pagos.
- **Mercado Pago**: Procesamiento seguro de pagos online.

### Inteligencia Artificial

- **Google Gemini API (@google/genai)**: Utilizado para el asistente virtual que orienta al cliente según sus molestias, necesidades u objetivos.

---

## 🛠️ Estructura del Proyecto

```text
├── components/          # Componentes reutilizables (Navbar, Asistente IA, etc.)
├── pages/               # Vistas principales de la aplicación
│   ├── Home.tsx         # Landing page con servicios destacados
│   ├── Services.tsx     # Catálogo completo de servicios
│   ├── Booking.tsx      # Formulario de reserva con validación de horarios
│   ├── MyAppointments.tsx # Gestión de turnos del usuario (vía teléfono)
│   ├── Contact.tsx      # Información de contacto y acceso admin
│   └── Admin.tsx        # Panel de administración de turnos
├── constants.ts         # Datos estáticos (servicios, info de contacto, colores)
├── types.ts             # Definiciones de interfaces y enums de TypeScript
├── firebase.ts          # Configuración e inicialización de Firebase
├── App.tsx              # Lógica principal de enrutamiento y estado global
└── main.tsx             # Punto de entrada de la aplicación
```

---

## ✨ Características Principales

1.  **Catálogo de Servicios**: Presentación detallada de las prestaciones disponibles.
2.  **Sistema de Reservas con Pago**: Los clientes pueden agendar citas pagando online de forma segura con Mercado Pago.
3.  **Validación de Disponibilidad**: Sistema en tiempo real que previene doble-booking.
4.  **Identificación de Usuario**: Sistema basado en nombre y teléfono (almacenado en `LocalStorage`) para que los clientes vean sus turnos sin necesidad de contraseñas complejas.
5.  **Promociones Autogestionables**: La dueña puede crear, editar, pausar y destacar promociones desde el panel admin, con vigencia y servicios asociados.
6.  **Asistente IA**: Chatbot integrado que utiliza el modelo **Gemini 3 Flash** para orientar a los clientes sobre qué servicio les conviene más.
7.  **Panel Admin**: Acceso restringido (vía link oculto en contacto) para visualizar turnos, gestionar servicios y administrar promociones.
8.  **Diseño Mobile-First**: Optimizado para ser utilizado como una Web App en dispositivos móviles.

---

## ⚙️ Configuración y Desarrollo

### Requisitos Previos

- Node.js (v18 o superior)
- Una cuenta de Firebase con un proyecto creado.
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

### Ejecución en Local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📝 Notas para Desarrolladores

- **Base de Datos**: La app usa tres colecciones principales en Firestore:
  - `appointments`: `serviceId`, `serviceName`, `date`, `time`, `userName`, `userPhone`, `createdAt`, `price`, `paid`.
  - `services`: `name`, `description`, `duration`, `price`, `image`.
  - `promotions`: `title`, `description`, `badgeText`, `discountType`, `discountValue`, `featured`, `isActive`, `appliesToAllServices`, `serviceIds`, `startDate`, `endDate`, `priority`, `image`.
- **Estilos**: Se utiliza una configuración de Tailwind personalizada en `index.html` y `index.css`. El color primario es `#A79FE1` (Lavanda).
- **IA**: El asistente está configurado en `components/AIAssistant.tsx`. Puedes ajustar las `systemInstruction` para cambiar su personalidad o conocimientos.

---

Desarrollado para **Soledad Cedres Quiropráctica**.
