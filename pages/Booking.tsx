import React, { useEffect, useState } from "react";
import { Service, Appointment, Promotion, BlockedSlot } from "../types";
import { CONTACT_INFO, BACKEND_URL } from "../constants";
import { getServicePricing } from "../utils/promotionPricing";

interface BookingProps {
  service: Service;
  promotions: Promotion[];
  promotionsLoading: boolean;
  occupiedSlots: { date: string; time: string }[];
  blockedSlots: BlockedSlot[];
  currentUserId: string | null;
  initialData: { name: string; phone: string; email: string };
  onConfirm: (appointment: Appointment) => Promise<void>;
  onRequireLogin: () => void;
  onCancel: () => void;
}

const Booking: React.FC<BookingProps> = ({
  service,
  promotions,
  promotionsLoading,
  occupiedSlots,
  blockedSlots,
  currentUserId,
  initialData,
  onConfirm,
  onRequireLogin,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userName, setUserName] = useState(initialData.name);
  const [userPhone, setUserPhone] = useState(initialData.phone);
  const [userEmail, setUserEmail] = useState(initialData.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pricing = getServicePricing(service, promotions);

  useEffect(() => {
    setUserName((currentName) => currentName || initialData.name);
  }, [initialData.name]);

  useEffect(() => {
    setUserPhone((currentPhone) => currentPhone || initialData.phone);
  }, [initialData.phone]);

  useEffect(() => {
    setUserEmail((currentEmail) => currentEmail || initialData.email);
  }, [initialData.email]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Convertir a fecha local sin UTC offset
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;

    return {
      iso,
      day: days[d.getDay()],
      num: d.getDate(),
      month: months[d.getMonth()],
      full: `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`,
    };
  });

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const isSlotOccupied = (date: string, time: string) => {
    return occupiedSlots.some(
      (slot) => slot.date === date && slot.time === time,
    );
  };

  const isSlotBlocked = (date: string, time: string) => {
    return blockedSlots.some(
      (slot) => slot.date === date && slot.time === time,
    );
  };

  const isSlotUnavailable = (date: string, time: string) => {
    return isSlotOccupied(date, time) || isSlotBlocked(date, time);
  };

  const getSelectedDateDisplay = () => {
    const dateObj = dates.find((d) => d.iso === selectedDate);
    return dateObj ? dateObj.full : selectedDate;
  };

  const constructWhatsAppUrl = () => {
    const message =
      `*Nuevo Turno - Soledad Cedres Quiropráctica*\n\n` +
      `🔹 *Servicio:* ${service.name}\n` +
      `📅 *Fecha:* ${getSelectedDateDisplay()}\n` +
      `⏰ *Hora:* ${selectedTime} hs\n\n` +
      `👤 *Cliente:* ${userName}\n` +
      `📱 *Teléfono:* ${userPhone}\n\n` +
      `_Enviado desde la App Soledad Cedres Quiropráctica_`;

    return `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const handleNextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // ✨ NUEVO: Paso 3 ahora es PAGO
      setIsSubmitting(true);
      try {
        // Llamar al backend para crear preferencia de pago
        const response = await fetch(BACKEND_URL + "/api/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId || null,
            serviceId: service.id,
            customerData: {
              name: userName.trim(),
              phone: userPhone.trim(),
              email: userEmail.trim().toLowerCase(),
            },
            date: selectedDate,
            time: selectedTime,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear preferencia de pago");
        }

        const { initPoint } = await response.json();

        // Redirigir a Mercado Pago
        window.location.href = initPoint;
      } catch (error: any) {
        setIsSubmitting(false);
        alert("Hubo un problema al procesar el pago. Inténtalo de nuevo.");
        console.error("Error:", error);
      }
    }
  };

  if (showSuccess) {
    return (
      <div className="p-6 pt-12 text-center animate-in">
        <div className="relative overflow-hidden rounded-[3rem] border border-line-subtle bg-shell p-10 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 to-emerald-400"></div>

          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="mb-4 text-3xl font-black leading-tight text-ink-strong">
            ¡Turno Agendado!
          </h2>

          <div className="flex items-center justify-center gap-2 mb-6 bg-blue-50 py-2 px-4 rounded-full w-fit mx-auto">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
              Aviso enviado al centro por Email
            </span>
          </div>

          <p className="mb-10 px-2 text-sm leading-relaxed text-ink-muted">
            Tu reserva ha sido registrada con éxito. <br />
            <span className="font-bold text-ink">
              Opcional: puedes reforzar tu aviso por WhatsApp si lo deseas.
            </span>
          </p>

          <div className="space-y-4">
            <a
              href={constructWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-green-100 active:scale-95 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1" />
                <path d="m22 2-7.5 7.5" />
                <path d="M10 14.7 9 22l11-11-4.7-1" />
                <path d="M15.5 15.5 19 19" />
              </svg>
              REFORZAR POR WHATSAPP
            </a>

            <button
              onClick={onCancel}
              className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-ink-subtle transition-colors hover:text-ink-soft"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12">
      {!currentUserId && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
          <p className="text-xs font-bold uppercase tracking-widest">
            Reserva como invitado
          </p>
          <p className="mt-1 text-sm text-blue-700">
            Puedes reservar sin cuenta. Si prefieres ver y gestionar tus turnos
            luego, inicia sesión antes de pagar.
          </p>
          <button
            onClick={onRequireLogin}
            className="mt-3 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700"
          >
            INICIAR SESION
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 pt-4">
        <button
          disabled={isSubmitting}
          onClick={step > 1 ? () => setStep(step - 1) : onCancel}
          className="rounded-full p-2 transition-colors hover:bg-shell-soft disabled:opacity-30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-app-text">
          {step === 3 ? "Pago Seguro" : "Agendar Turno"}
        </h2>
      </div>

      <div className="flex gap-2 mb-8 px-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-action" : "bg-shell-soft"}`}
          ></div>
        ))}
      </div>

      <div className="mb-8 flex min-h-[380px] flex-col justify-center rounded-[2rem] border border-line-subtle bg-shell p-7 shadow-sm">
        {step === 1 && (
          <div className="animate-in">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-ink-subtle">
              Paso 1: Fecha y Hora
            </h4>
            <div className="flex overflow-x-auto gap-3 pb-6 mb-6 -mx-2 px-2 scroll-smooth">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => {
                    setSelectedDate(d.iso);
                    setSelectedTime("");
                  }}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                    selectedDate === d.iso
                      ? "border-action bg-action text-white shadow-xl scale-105"
                      : "border-transparent bg-shell-subtle text-ink-subtle"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold mb-1 opacity-60">
                    {d.day}
                  </span>
                  <span className="text-xl font-black leading-none">
                    {d.num}
                  </span>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="animate-in">
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => {
                    const unavailable = isSlotUnavailable(selectedDate, t);
                    return (
                      <button
                        key={t}
                        disabled={unavailable}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          unavailable
                            ? "bg-shell-soft border-transparent text-ink-faint cursor-not-allowed line-through"
                            : selectedTime === t
                              ? "border-action bg-action text-white shadow-md"
                              : "border-transparent bg-shell-subtle text-ink-muted hover:border-line"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-subtle">
              Paso 2: Tu Información
            </h4>
            <div className="space-y-5">
              <div>
                <label className="ml-1 mb-2 block text-[10px] font-bold uppercase text-ink-subtle">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm font-medium text-ink-strong outline-none transition-all focus:border-action focus:bg-shell"
                />
              </div>
              <div>
                <label className="ml-1 mb-2 block text-[10px] font-bold uppercase text-ink-subtle">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="Ej: 099 123 456"
                  className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm font-medium text-ink-strong outline-none transition-all focus:border-action focus:bg-shell"
                />
              </div>
              <div>
                <label className="ml-1 mb-2 block text-[10px] font-bold uppercase text-ink-subtle">
                  Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm font-medium text-ink-strong outline-none transition-all focus:border-action focus:bg-shell"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ink-strong">Pago Seguro</h3>
              <p className="mt-1 px-8 text-[11px] text-ink-subtle">
                {promotionsLoading
                  ? "Verificando promociones vigentes antes de cobrar."
                  : "Completa tu reserva pagando de forma segura."}
              </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-line-subtle bg-shell-subtle p-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                  Servicio
                </span>
                <span className="text-right font-bold text-ink-strong">
                  {service.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                  Fecha
                </span>
                <span className="font-bold text-ink-strong">
                  {getSelectedDateDisplay()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                  Hora
                </span>
                <span className="font-bold text-action">{selectedTime} HS</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-line/50 pt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                  Cliente
                </span>
                <span className="text-sm font-bold text-ink-strong">
                  {userName} ({userPhone})
                </span>
                <span className="text-xs text-ink-muted">{userEmail}</span>
              </div>
              <div className="border-t border-line/50 pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                      Precio base
                    </span>
                    <span className="font-bold text-ink">
                      ${pricing.basePrice.toLocaleString("es-UY")}
                    </span>
                  </div>
                  {pricing.appliedPromotion && (
                    <>
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <span className="text-rose-500 font-bold uppercase tracking-widest text-[9px]">
                          Promoción aplicada
                        </span>
                        <span className="text-right font-bold text-rose-600">
                          {pricing.appliedPromotion.badgeText ||
                            pricing.appliedPromotion.title}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                          Descuento
                        </span>
                        <span className="font-bold text-rose-600">
                          -${pricing.discountAmount.toLocaleString("es-UY")}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center border-t border-line/70 pt-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                      Total a Pagar
                    </span>
                    <span className="font-black text-green-600 text-lg">
                      ${pricing.finalPrice.toLocaleString("es-UY")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {promotionsLoading && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-amber-700 text-[11px] leading-relaxed font-medium">
                  Estamos validando promociones activas antes de enviarte a
                  Mercado Pago.
                </p>
              </div>
            )}

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-800 font-bold text-xs mb-1">
                    Pago 100% Seguro
                  </p>
                  <p className="text-blue-600 text-[10px] leading-relaxed">
                    Serás redirigido a Mercado Pago para completar el pago de
                    forma segura. Tu turno se confirmará automáticamente una vez
                    aprobado el pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        disabled={
          isSubmitting ||
          (step === 1 && (!selectedDate || !selectedTime)) ||
          (step === 2 &&
            (userName.trim().length < 3 ||
              userPhone.trim().length < 7 ||
              !userEmail.trim().includes("@"))) ||
          (step === 3 && promotionsLoading)
        }
        onClick={handleNextStep}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          (step === 1 && (!selectedDate || !selectedTime)) ||
          (step === 2 &&
            (userName.trim().length < 3 ||
              userPhone.trim().length < 7 ||
              !userEmail.trim().includes("@"))) ||
          (step === 3 && promotionsLoading)
            ? "bg-shell-soft text-ink-faint cursor-not-allowed shadow-none"
            : "bg-action hover:bg-action-hover"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>PROCESANDO...</span>
          </>
        ) : step === 3 ? (
          promotionsLoading ? (
            "VERIFICANDO PROMOCIONES..."
          ) : (
            "PROCEDER AL PAGO"
          )
        ) : (
          "CONTINUAR"
        )}
      </button>
    </div>
  );
};

export default Booking;
