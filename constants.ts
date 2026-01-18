
import { Service } from './types';

export const COLORS = {
  primary: '#A79FE1', 
  primaryDark: '#8A81C9',
  secondary: '#FFFFFF',
  text: '#333333',
  background: '#FDFBFF'
};

export const CONTACT_INFO = {
  address: 'Av. Luis Alberto de Herrera 1234, Montevideo, Uruguay',
  coords: { lat: -34.9011, lng: -56.1645 },
  whatsapp: '59892550000',
  instagram: '@enarmonia.estetica',
  email: 'enarmonia.estetica.salud@gmail.com'
};

export const EMAIL_CONFIG = {
  SERVICE_ID: 'default_service',
  TEMPLATE_ID: 'template_enarmonia',
  PUBLIC_KEY: 'TU_PUBLIC_KEY',
  OWNER_EMAIL: CONTACT_INFO.email
};

export const SERVICES: Service[] = [
  {
    id: 'faciales-corporales',
    name: 'Limpieza Facial Profunda',
    description: 'Extracción de impurezas, exfoliación y mascarilla nutritiva según tu tipo de piel.',
    duration: 60,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'drenaje-linfatico',
    name: 'Drenaje Linfático Manual',
    description: 'Técnica de masajes suaves para eliminar toxinas y mejorar la retención de líquidos.',
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'masajes-descontracturantes',
    name: 'Masaje Descontracturante',
    description: 'Liberación de tensiones musculares profundas en espalda y cuello.',
    duration: 50,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'peeling-quimico',
    name: 'Peeling Químico',
    description: 'Renovación celular profunda para tratar manchas, arrugas finas y textura de la piel.',
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'
  }
];

export const LOGO_URL = 'https://raw.githubusercontent.com/StackBlitz-User-Assets/beauty-center-logo/main/logo.png';
