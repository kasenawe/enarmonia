import React from "react";
import { Promotion, Service } from "../types";
import soledadLogo from "../assets/soledad-logo.svg";
import { getServicePricing } from "../utils/promotionPricing";

interface HomeProps {
  services: Service[];
  promotions: Promotion[];
  onSelectService: (service: Service) => void;
  onSeeAll: () => void;
  isSyncing: boolean;
}

const Home: React.FC<HomeProps> = ({
  services,
  promotions,
  onSelectService,
  onSeeAll,
  isSyncing,
}) => {
  const today = new Date();
  const featuredPromotion = promotions
    .filter((promotion) => {
      if (!promotion.featured || !promotion.isActive) return false;
      const startsAt = promotion.startDate
        ? new Date(`${promotion.startDate}T00:00:00`)
        : null;
      const endsAt = promotion.endDate
        ? new Date(`${promotion.endDate}T23:59:59`)
        : null;

      if (startsAt && startsAt > today) return false;
      if (endsAt && endsAt < today) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    })[0];

  const promotedServices = featuredPromotion
    ? services.filter(
        (service) =>
          featuredPromotion.appliesToAllServices ||
          featuredPromotion.serviceIds.includes(service.id),
      )
    : [];

  const promotionDiscountLabel = featuredPromotion
    ? featuredPromotion.discountType === "percentage"
      ? `${featuredPromotion.discountValue}% OFF`
      : `$${featuredPromotion.discountValue.toLocaleString("es-UY")} OFF`
    : "";

  const promotionDateLabel = featuredPromotion
    ? featuredPromotion.endDate
      ? `Válida hasta ${new Date(
          `${featuredPromotion.endDate}T00:00:00`,
        ).toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "short",
        })}`
      : "Promoción disponible por tiempo limitado"
    : "";

  const handlePromotionAction = () => {
    if (!featuredPromotion) return;
    if (promotedServices.length === 1) {
      onSelectService(promotedServices[0]);
      return;
    }
    onSeeAll();
  };

  return (
    <div className="p-6">
      {/* Sync Status Overlay Indicator */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-line-subtle bg-shell/80 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-ink-subtle">
            Sincronizando...
          </span>
        </div>
      )}

      {/* Hero Section */}
      <header className="text-center mb-10 pt-4 animate-in">
        <div className="w-44 max-w-full mx-auto mb-6 rounded-[2rem] border border-outline-strong bg-shell shadow-xl p-4">
          <img
            src={soledadLogo}
            alt="Soledad Cedres Quiropráctica"
            className="w-full h-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-app-text mb-1 font-serif">
          Bienvenida
        </h1>
        <p className="text-xs italic font-serif text-ink-subtle">
          Atención quiropráctica para tu bienestar diario
        </p>
      </header>

      {/* Promo Card */}
      <div className="mb-8 animate-in" style={{ animationDelay: "0.1s" }}>
        {featuredPromotion ? (
          <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-amber-50 to-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-shell/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-shell p-2.5 text-rose-500 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41 11 3.83a2 2 0 0 0-2.83 0L3.83 8.17a2 2 0 0 0 0 2.83l9.59 9.59a2 2 0 0 0 2.83 0L20.59 16a2 2 0 0 0 0-2.59Z" />
                    <path d="m7 7 0.01 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">
                    Promoción destacada
                  </p>
                  <h4 className="text-base font-bold text-ink-strong">
                    {featuredPromotion.title}
                  </h4>
                </div>
              </div>
              <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                {featuredPromotion.badgeText || promotionDiscountLabel}
              </span>
            </div>

            {featuredPromotion.image && (
              <img
                src={featuredPromotion.image}
                alt={featuredPromotion.title}
                className="h-40 w-full object-cover"
              />
            )}

            <div className="space-y-4 p-5">
              <p className="text-sm leading-relaxed text-ink-soft">
                {featuredPromotion.description}
              </p>

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-shell/80 px-4 py-3 text-xs shadow-sm">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-subtle">
                    Beneficio
                  </p>
                  <p className="font-black text-rose-600">
                    {promotionDiscountLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-subtle">
                    Vigencia
                  </p>
                  <p className="font-bold text-ink">{promotionDateLabel}</p>
                </div>
              </div>

              <button
                onClick={handlePromotionAction}
                className="w-full rounded-2xl bg-action py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-action-hover"
              >
                {promotedServices.length === 1
                  ? "Reservar promoción"
                  : "Ver servicios incluidos"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-outline-soft bg-gradient-to-r from-surface-highlight to-surface-deep p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-shell p-2.5 text-brand shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-bold text-brand-ink">
                  Atención Profesional
                </h4>
                <p className="text-[11px] font-medium leading-relaxed text-brand-muted/80">
                  Sesiones orientadas a mejorar tu movilidad, aliviar tensiones
                  y acompañar tu bienestar integral.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services List Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-lg font-bold text-app-text">Servicios</h2>
          <button
            onClick={onSeeAll}
            className="rounded-full bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand"
          >
            Ver todos
          </button>
        </div>

        {services.length === 0 ? (
          <div className="rounded-[2.5rem] border border-line-subtle bg-shell p-10 text-center text-ink-subtle shadow-sm">
            No hay servicios disponibles para mostrar.
          </div>
        ) : (
          services.slice(0, 2).map((service, idx) => {
            const pricing = getServicePricing(service, promotions);

            return (
              <div
                key={service.id}
                className="group animate-in overflow-hidden rounded-[2.5rem] border border-line-subtle bg-shell shadow-sm transition-all active:scale-[0.97]"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                onClick={() => onSelectService(service)}
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  {pricing.appliedPromotion && (
                    <div className="absolute top-4 left-4 rounded-full bg-rose-500 px-3 py-1 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        {pricing.appliedPromotion.badgeText ||
                          pricing.appliedPromotion.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <div className="text-white">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {service.duration} min
                        </span>
                      </div>
                      <h3 className="text-base font-bold leading-tight">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-ink-subtle">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                      Inversión
                    </span>
                    {pricing.appliedPromotion ? (
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-ink-faint line-through">
                          ${pricing.basePrice.toLocaleString("es-UY")}
                        </p>
                        <p className="text-sm font-black text-rose-600">
                          ${pricing.finalPrice.toLocaleString("es-UY")}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-brand">
                        ${pricing.basePrice.toLocaleString("es-UY")}
                      </span>
                    )}
                  </div>
                  <button className="w-full rounded-2xl bg-action py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-action-hover">
                    AGENDAR AHORA
                  </button>
                </div>
              </div>
            );
          })
        )}

        {services.length > 2 && (
          <button
            onClick={onSeeAll}
            className="w-full rounded-3xl border-2 border-dashed border-line bg-shell-subtle py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-subtle transition-colors hover:bg-shell-soft"
          >
            Ver {services.length - 2} servicios más
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center pb-12 opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-muted">
          Soledad Cedres Quiropráctica
        </p>
      </footer>
    </div>
  );
};

export default Home;
