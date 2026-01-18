
import { Service } from './types';

export const COLORS = {
  primary: '#A79FE1', // Lavender from logo
  primaryDark: '#8A81C9',
  secondary: '#FFFFFF',
  text: '#333333',
  background: '#FDFBFF'
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
    image: 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&q=80&w=800'
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
// Using a placeholder that resembles the provided logo if the specific image path isn't used
