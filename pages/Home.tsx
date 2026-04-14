import React from "react";
import { Promotion, Service } from "../types";
import soledadLogo from "../assets/soledad-logo.svg";

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
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Sincronizando...
          </span>
        </div>
      )}

      {/* Hero Section */}
      <header className="text-center mb-10 pt-4 animate-in">
        <div className="w-44 max-w-full mx-auto mb-6 rounded-[2rem] border border-[#E7DDF4] bg-white shadow-xl p-4">
          <img
            src={soledadLogo}
            alt="Soledad Cedres Quiropráctica"
            className="w-full h-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-[#4A4A4A] mb-1 font-serif">
          Bienvenida
        </h1>
        <p className="text-gray-400 text-xs italic font-serif">
          Atención quiropráctica para tu bienestar diario
        </p>
      </header>

      {/* Promo Card */}
      <div className="mb-8 animate-in" style={{ animationDelay: "0.1s" }}>
        {featuredPromotion ? (
          <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-amber-50 to-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2.5 text-rose-500 shadow-sm">
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
                  <h4 className="font-bold text-base text-gray-800">
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
              <p className="text-sm leading-relaxed text-gray-600">
                {featuredPromotion.description}
              </p>

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 text-xs shadow-sm">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Beneficio
                  </p>
                  <p className="font-black text-rose-600">
                    {promotionDiscountLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Vigencia
                  </p>
                  <p className="font-bold text-gray-700">
                    {promotionDateLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePromotionAction}
                className="w-full rounded-2xl bg-gray-900 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-black"
              >
                {promotedServices.length === 1
                  ? "Reservar promoción"
                  : "Ver servicios incluidos"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl border border-white shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm text-[#A79FE1]">
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
                <h4 className="font-bold text-sm text-purple-900 mb-1">
                  Atención Profesional
                </h4>
                <p className="text-[11px] text-purple-700/70 leading-relaxed font-medium">
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
          <h2 className="text-lg font-bold text-[#4A4A4A]">Servicios</h2>
          <button
            onClick={onSeeAll}
            className="text-[10px] font-bold text-[#A79FE1] uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full"
          >
            Ver todos
          </button>
        </div>

        {services.length === 0 ? (
          <div className="rounded-[2.5rem] p-10 bg-white border border-gray-100 shadow-sm text-center text-gray-400">
            No hay servicios disponibles para mostrar.
          </div>
        ) : (
          services.slice(0, 2).map((service, idx) => (
            <div
              key={service.id}
              className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 transition-all active:scale-[0.97] animate-in"
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
                <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Inversión
                  </span>
                  <span className="text-sm font-bold text-[#A79FE1]">
                    ${service.price?.toLocaleString("es-UY")}
                  </span>
                </div>
                <button className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-xs transition-all shadow-lg hover:bg-gray-800">
                  AGENDAR AHORA
                </button>
              </div>
            </div>
          ))
        )}

        {services.length > 2 && (
          <button
            onClick={onSeeAll}
            className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors"
          >
            Ver {services.length - 2} servicios más
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center pb-12 opacity-30">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
          Soledad Cedres Quiropráctica
        </p>
      </footer>
    </div>
  );
};

export default Home;
