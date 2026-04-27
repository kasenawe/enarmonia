export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // ✨ NUEVO: precio del servicio
  image: string;
}

export type PromotionDiscountType = "percentage" | "fixed";

export type UserRole = "admin" | "client";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  userPhone?: string;
  createdAt?: string;
}

export type PainDurationUnit = "days" | "weeks" | "months" | "years";

export type PainZone =
  | "neck"
  | "upperBack"
  | "midBack"
  | "lowerBack"
  | "shoulder"
  | "arm"
  | "hip"
  | "leg"
  | "other";

export interface ClinicalHealthHistory {
  hypertension: boolean;
  diabetes: boolean;
  heartProblems: boolean;
  osteoporosis: boolean;
  surgeries: string;
  accidents: string;
  currentMedication: string;
}

export interface ClinicalProfile {
  patientId: string;
  intakeDate: string;
  fullName: string;
  documentId: string;
  birthDate: string;
  phone: string;
  email: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  chiefComplaint: string;
  painZones: PainZone[];
  painZoneOther: string;
  painDurationUnit: PainDurationUnit | "";
  painIntensity: number;
  worseFactors: string;
  reliefFactors: string;
  healthHistory: ClinicalHealthHistory;
  initialDiagnosis: string;
  treatmentStartDate: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ClinicalSession {
  id: string;
  patientId: string;
  appointmentId?: string;
  sessionNumber?: number;
  sessionDate: string;
  painLevel: number;
  clinicalObservations: string;
  techniquesApplied: string;
  recommendations: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

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
  userId?: string;
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

export interface BlockedSlot {
  id: string;
  date: string;
  time: string;
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
  LOGIN = "login",
  REGISTER = "register",
  ACCOUNT = "account",
  MY_APPOINTMENTS = "my-appointments",
  CONTACT = "contact",
  ADMIN = "admin",
  SUCCESS = "success", // ✨ NUEVO: página de pago exitoso
  FAILURE = "failure", // ✨ NUEVO: página de pago fallido
}
