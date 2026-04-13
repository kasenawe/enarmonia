export const COLORS = {
  primary: "#A79FE1",
  primaryDark: "#8A81C9",
  secondary: "#FFFFFF",
  text: "#333333",
  background: "#FDFBFF",
};

export const CONTACT_INFO = {
  address: "Almiron 5496, Montevideo, Uruguay",
  coords: { lat: -34.8876, lng: -56.1054 },
  whatsapp: "59895542465",
  instagram: "@enarmonia_estetica_y_salud",
  email: "enarmonia.estetica.salud@gmail.com",
};

export const EMAIL_CONFIG = {
  SERVICE_ID: "default_service",
  TEMPLATE_ID: "template_enarmonia",
  PUBLIC_KEY: "TU_PUBLIC_KEY",
  OWNER_EMAIL: CONTACT_INFO.email,
};

export const LOGO_URL =
  "https://raw.githubusercontent.com/StackBlitz-User-Assets/beauty-center-logo/main/logo.png";

export const ADMIN_PASSWORD = "1234"; // ✨ NUEVO: contraseña para acceder al panel de administración

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://enarmonia-backend.vercel.app"; // URL del backend, configurable vía variable de entorno
