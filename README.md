# En Armonía - Estética y Salud 🌿

Esta es una aplicación web moderna diseñada para la gestión de turnos y servicios del centro de estética "En Armonía". La plataforma ofrece una experiencia de usuario fluida, permitiendo a los clientes explorar servicios, agendar citas en tiempo real y recibir recomendaciones personalizadas a través de un asistente con Inteligencia Artificial.

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

- **Google Gemini API (@google/genai)**: Utilizado para el asistente virtual que recomienda servicios basados en las necesidades del cliente.

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

1.  **Catálogo de Servicios**: Presentación detallada de tratamientos faciales, corporales y masajes.
2.  **Sistema de Reservas con Pago**: Los clientes pueden agendar citas pagando online de forma segura con Mercado Pago.
3.  **Validación de Disponibilidad**: Sistema en tiempo real que previene doble-booking.
4.  **Identificación de Usuario**: Sistema basado en nombre y teléfono (almacenado en `LocalStorage`) para que los clientes vean sus turnos sin necesidad de contraseñas complejas.
5.  **Asistente IA**: Chatbot integrado que utiliza el modelo **Gemini 3 Flash** para asesorar a los clientes sobre qué tratamiento les conviene más.
6.  **Panel Admin**: Acceso restringido (vía link oculto en contacto) para visualizar y cancelar todos los turnos del centro.
7.  **Diseño Mobile-First**: Optimizado para ser utilizado como una Web App en dispositivos móviles.

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
```

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

- **Base de Datos**: La colección principal en Firestore es `appointments`. Cada documento contiene:
  - `serviceId`, `serviceName`, `date`, `time`, `userName`, `userPhone`, `createdAt`.
- **Estilos**: Se utiliza una configuración de Tailwind personalizada en `index.html` y `index.css`. El color primario es `#A79FE1` (Lavanda).
- **IA**: El asistente está configurado en `components/AIAssistant.tsx`. Puedes ajustar las `systemInstruction` para cambiar su personalidad o conocimientos.

---

Desarrollado con ❤️ para **En Armonía**.
