import { Service } from "./types";

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

export const SERVICES: Service[] = [
  {
    id: "faciales-corporales",
    name: "Limpieza Facial Profunda",
    description:
      "Extracción de impurezas, exfoliación y mascarilla nutritiva según tu tipo de piel.",
    duration: 60,
    price: 2500, // ✨ NUEVO: precio en UYU
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "drenaje-linfatico",
    name: "Drenaje Linfático Manual",
    description:
      "Técnica de masajes suaves para eliminar toxinas y mejorar la retención de líquidos.",
    duration: 45,
    price: 2000, // ✨ NUEVO
    image:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "masajes-descontracturantes",
    name: "Masaje Descontracturante",
    description:
      "Liberación de tensiones musculares profundas en espalda y cuello.",
    duration: 50,
    price: 2200, // ✨ NUEVO
    image:
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "peeling-quimico",
    name: "Peeling Químico",
    description:
      "Renovación celular profunda para tratar manchas, arrugas finas y textura de la piel.",
    duration: 40,
    price: 3000, // ✨ NUEVO
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
  },
];

export const LOGO_URL =
  "https://raw.githubusercontent.com/StackBlitz-User-Assets/beauty-center-logo/main/logo.png";

export const ADMIN_PASSWORD = "1234"; // ✨ NUEVO: contraseña para acceder al panel de administración

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://enarmonia-backend.vercel.app"; // URL del backend, configurable vía variable de entorno
