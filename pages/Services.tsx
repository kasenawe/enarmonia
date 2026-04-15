import React from "react";
import { Promotion, Service } from "../types";
import { getServicePricing } from "../utils/promotionPricing";

interface ServicesProps {
  services: Service[];
  promotions: Promotion[];
  onSelectService: (service: Service) => void;
}

const Services: React.FC<ServicesProps> = ({
  services,
  promotions,
  onSelectService,
}) => {
  return (
    <div className="p-6 pb-20 animate-in">
      <header className="mb-10 pt-4">
        <h2 className="text-3xl font-bold text-app-text mb-2 font-serif">
          Nuestros Servicios
        </h2>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-subtle">
          Quiropráctica y bienestar físico
        </p>
      </header>

      <div className="space-y-8">
        {services.length === 0 ? (
          <div className="rounded-[2rem] border border-line-subtle bg-shell p-10 text-center text-ink-subtle shadow-sm">
            No hay servicios disponibles en este momento.
          </div>
        ) : (
          services.map((service, idx) => {
            const pricing = getServicePricing(service, promotions);

            return (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-[2rem] border border-line-subtle bg-shell shadow-sm transition-all active:scale-[0.98]"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => onSelectService(service)}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  <div className="absolute top-4 right-4 rounded-full bg-shell/90 px-3 py-1 shadow-lg backdrop-blur-md">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-ink-strong">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {service.duration} min
                    </span>
                  </div>

                  {pricing.appliedPromotion && (
                    <div className="absolute top-4 left-4 rounded-full bg-rose-500 px-3 py-1 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        {pricing.appliedPromotion.badgeText ||
                          pricing.appliedPromotion.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold leading-tight text-ink-strong">
                    {service.name}
                  </h3>
                  <p className="mb-6 text-xs font-medium leading-relaxed text-ink-subtle">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">
                        Inversión en ti
                      </span>
                      {pricing.appliedPromotion ? (
                        <>
                          <span className="text-[11px] font-bold text-ink-faint line-through">
                            ${pricing.basePrice.toLocaleString("es-UY")}
                          </span>
                          <span className="text-base font-black text-rose-600">
                            ${pricing.finalPrice.toLocaleString("es-UY")}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-brand">
                          ${pricing.basePrice.toLocaleString("es-UY")}
                        </span>
                      )}
                    </div>
                    <button className="rounded-xl bg-action px-6 py-3 text-xs font-bold text-white shadow-lg transition-colors active:bg-action-hover">
                      RESERVAR
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-12 rounded-[2.5rem] border border-outline bg-surface-alt p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-shell text-brand shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h4 className="mb-2 text-sm font-bold text-ink-strong">
          ¿No sabes qué elegir?
        </h4>
        <p className="mb-4 text-[11px] leading-relaxed text-ink-subtle">
          Realizamos una evaluación inicial para recomendarte el servicio más
          adecuado según tus molestias y objetivos.
        </p>
        <button className="border-b-2 border-brand/20 pb-1 text-[10px] font-bold uppercase tracking-widest text-brand">
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  );
};

export default Services;
