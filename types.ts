
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price?: number;
  image: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO string
  time: string;
  userName: string;
  userPhone: string;
}

export interface OccupiedSlot {
  date: string;
  time: string;
}

export enum AppRoute {
  HOME = 'home',
  SERVICES = 'services',
  BOOKING = 'booking',
  MY_APPOINTMENTS = 'my-appointments',
  CONTACT = 'contact'
}
