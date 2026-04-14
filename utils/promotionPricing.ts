import { Promotion, PromotionDiscountType, Service } from "../types";

export interface AppliedPromotionSnapshot {
  id: string;
  title: string;
  badgeText: string;
  discountType: PromotionDiscountType;
  discountValue: number;
}

export interface ResolvedServicePricing {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedPromotion: AppliedPromotionSnapshot | null;
}

const toDateBoundary = (date: string, endOfDay = false) => {
  if (!date) return null;
  return new Date(`${date}T${endOfDay ? "23:59:59" : "00:00:00"}`);
};

export const isPromotionActive = (
  promotion: Promotion,
  now: Date = new Date(),
) => {
  if (!promotion.isActive) return false;

  const startDate = toDateBoundary(promotion.startDate);
  const endDate = toDateBoundary(promotion.endDate, true);

  if (startDate && startDate > now) return false;
  if (endDate && endDate < now) return false;

  return true;
};

export const promotionAppliesToService = (
  promotion: Promotion,
  serviceId: string,
) => {
  return (
    promotion.appliesToAllServices || promotion.serviceIds.includes(serviceId)
  );
};

export const getHighestPriorityPromotion = (
  promotions: Promotion[],
  serviceId: string,
  now: Date = new Date(),
) => {
  return promotions
    .filter(
      (promotion) =>
        isPromotionActive(promotion, now) &&
        promotionAppliesToService(promotion, serviceId),
    )
    .sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    })[0];
};

const calculateDiscountAmount = (basePrice: number, promotion: Promotion) => {
  if (promotion.discountType === "percentage") {
    return Math.round((basePrice * promotion.discountValue) / 100);
  }

  return Math.round(promotion.discountValue);
};

export const getServicePricing = (
  service: Service,
  promotions: Promotion[],
  now: Date = new Date(),
): ResolvedServicePricing => {
  const basePrice = Math.max(0, Math.round(Number(service.price) || 0));
  const promotion = getHighestPriorityPromotion(promotions, service.id, now);

  if (!promotion) {
    return {
      basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      appliedPromotion: null,
    };
  }

  const rawDiscountAmount = calculateDiscountAmount(basePrice, promotion);
  const discountAmount = Math.min(basePrice, Math.max(0, rawDiscountAmount));
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return {
    basePrice,
    discountAmount,
    finalPrice,
    appliedPromotion: {
      id: promotion.id,
      title: promotion.title,
      badgeText: promotion.badgeText,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
    },
  };
};
