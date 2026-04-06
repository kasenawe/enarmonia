export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // ✨ NUEVO: precio del servicio
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
  price: number; // ✨ NUEVO: precio pagado
  paid: boolean; // ✨ NUEVO: si está pagado
  paymentId?: string; // ✨ NUEVO: ID del pago en MP
  createdAt: string;
}

export interface OccupiedSlot {
  date: string;
  time: string;
}

export enum AppRoute {
  HOME = "home",
  SERVICES = "services",
  BOOKING = "booking",
  MY_APPOINTMENTS = "my-appointments",
  CONTACT = "contact",
  ADMIN = "admin",
  SUCCESS = "success", // ✨ NUEVO: página de pago exitoso
  FAILURE = "failure", // ✨ NUEVO: página de pago fallido
}
