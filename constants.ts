
import { Service } from './types';

export const COLORS = {
  primary: '#A79FE1', // Lavender from logo
  primaryDark: '#8A81C9',
  secondary: '#FFFFFF',
  text: '#333333',
  background: '#FDFBFF'
};

// Configuración para Notificaciones por Email (EmailJS)
// El dueño debe registrarse en emailjs.com (es gratis) y obtener estos IDs
export const EMAIL_CONFIG = {
  SERVICE_ID: 'default_service', // Reemplazar con el Service ID de EmailJS
  TEMPLATE_ID: 'template_enarmonia', // Reemplazar con el Template ID de EmailJS
  PUBLIC_KEY: 'TU_PUBLIC_KEY', // Reemplazar con la Public Key de EmailJS
  OWNER_EMAIL: 'enarmonia.estetica.salud@gmail.com' // Email donde llegarán los avisos
};

export const SERVICES: Service[] = [
  {
    id: 'faciales-corporales',
    name: 'Tratamientos Faciales y Corporales',
    description: 'Limpieza profunda, hidratación, rejuvenecimiento y tratamientos reductores adaptados a tu piel.',
    duration: 60,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'piernas-cansadas',
    name: 'Tratamiento Piernas Cansadas',
    description: 'Drenaje linfático y masajes descongestivos para mejorar la circulación y aliviar la pesadez.',
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'masajes',
    name: 'Masajes Terapéuticos',
    description: 'Relajantes, descontracturantes y circulatorios realizados por profesionales en cosmetología.',
    duration: 50,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800'
  }
];

export const LOGO_URL = 'https://raw.githubusercontent.com/StackBlitz-User-Assets/beauty-center-logo/main/logo.png';
