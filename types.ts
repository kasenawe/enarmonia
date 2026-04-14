export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // ✨ NUEVO: precio del servicio
  image: string;
}

export type PromotionDiscountType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  image: string;
  featured: boolean;
  isActive: boolean;
  appliesToAllServices: boolean;
  serviceIds: string[];
  startDate: string;
  endDate: string;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppliedPromotion {
  id: string;
  title: string;
  badgeText: string;
  discountType: PromotionDiscountType;
  discountValue: number;
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
  basePrice?: number;
  discountAmount?: number;
  paid: boolean; // ✨ NUEVO: si está pagado
  paymentId?: string; // ✨ NUEVO: ID del pago en MP
  appliedPromotion?: AppliedPromotion | null;
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
