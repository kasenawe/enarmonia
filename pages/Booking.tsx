import React, { useEffect, useRef, useState } from "react";
import {
  Service,
  Appointment,
  Promotion,
  BlockedSlot,
  OccupiedSlot,
  Schedule,
} from "../types";
import {
  CONTACT_INFO,
  BACKEND_URL,
  MP_SURCHARGE_PERCENT,
  TRANSFER_BANK_INFO,
  TRANSFER_DUE_HOURS,
  DEFAULT_SCHEDULE,
} from "../constants";
import { getServicePricing } from "../utils/promotionPricing";
import {
  generateTimeSlots,
  slotOverlapsOccupied,
  slotOverlapsBlocked,
  getScheduleSegmentForDay,
  normalizeSchedule,
} from "../utils/scheduleUtils";
import PhoneInput from "../components/PhoneInput";

interface BookingProps {
  service: Service;
  schedule?: Schedule;
  promotions: Promotion[];
  promotionsLoading: boolean;
  occupiedSlots: OccupiedSlot[];
  blockedSlots: BlockedSlot[];
  currentUserId: string | null;
  initialData: { name: string; phone: string; email: string };
  onConfirm: (appointment: Appointment) => Promise<void>;
  onRequireLogin: () => void;
  onCancel: () => void;
}

const Booking: React.FC<BookingProps> = ({
  service,
  schedule: scheduleProp,
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
  const [userDocumentId, setUserDocumentId] = useState("");

  const formatCI = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length < 2) return digits;
    return digits.slice(0, -1) + "-" + digits.slice(-1);
  };
  const [paymentMethod, setPaymentMethod] = useState<"mp" | "transfer" | "">(
    "mp",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Transfer pending state
  const [transferPending, setTransferPending] = useState<{
    appointmentId: string;
    dueAt: string;
    totalAmount: number;
  } | null>(null);
  const timeSectionRef = useRef<HTMLDivElement | null>(null);
  const pricing = getServicePricing(service, promotions);

  // Surcharge calculation (always computed in frontend for display, backend recalculates authoritatively)
  const mpSurcharge = Math.round(
    pricing.finalPrice * (MP_SURCHARGE_PERCENT / 100),
  );
  const totalWithSurcharge = pricing.finalPrice + mpSurcharge;
  const displayTotal =
    paymentMethod === "mp" ? totalWithSurcharge : pricing.finalPrice;

  useEffect(() => {
    setUserName((currentName) => currentName || initialData.name);
  }, [initialData.name]);

  useEffect(() => {
    setUserPhone((currentPhone) => currentPhone || initialData.phone);
  }, [initialData.phone]);

  useEffect(() => {
    setUserEmail((currentEmail) => currentEmail || initialData.email);
  }, [initialData.email]);

  useEffect(() => {
    if (!selectedDate || step !== 1) return;
    requestAnimationFrame(() => {
      timeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [selectedDate, step]);

  const schedule: Schedule = normalizeSchedule(
    scheduleProp ?? DEFAULT_SCHEDULE,
  );
  const serviceDuration = service.duration ?? 60;

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

  const dates = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);

    const segment = getScheduleSegmentForDay(schedule, d.getDay());
    if (!segment.enabled) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;

    return {
      iso,
      dayIndex: d.getDay(),
      day: days[d.getDay()],
      num: d.getDate(),
      month: months[d.getMonth()],
      full: `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`,
    };
  }).filter(Boolean) as {
    iso: string;
    dayIndex: number;
    day: string;
    num: number;
    month: string;
    full: string;
  }[];

  const getTimeSlotsForDate = (date: string) => {
    const dateObj = new Date(`${date}T12:00:00`);
    const segment = getScheduleSegmentForDay(schedule, dateObj.getDay());
    return generateTimeSlots(segment, serviceDuration);
  };

  const isSlotOccupied = (date: string, time: string) => {
    return slotOverlapsOccupied(date, time, serviceDuration, occupiedSlots);
  };

  const isSlotBlocked = (date: string, time: string) => {
    const dateObj = new Date(`${date}T12:00:00`);
    const segment = getScheduleSegmentForDay(schedule, dateObj.getDay());

    return slotOverlapsBlocked(
      date,
      time,
      serviceDuration,
      blockedSlots,
      segment.slotIntervalMinutes,
    );
  };

  const isSlotUnavailable = (date: string, time: string) => {
    return isSlotOccupied(date, time) || isSlotBlocked(date, time);
  };

  const getSelectedDateDisplay = () => {
    const dateObj = dates.find((d) => d.iso === selectedDate);
    return dateObj ? dateObj.full : selectedDate;
  };

  const selectedDateSlots = selectedDate
    ? getTimeSlotsForDate(selectedDate)
    : [];

  const availableSlotsForSelectedDate = selectedDate
    ? selectedDateSlots.filter((time) => !isSlotUnavailable(selectedDate, time))
        .length
    : 0;

  const firstAvailableSlot = dates
    .flatMap((dateOption) =>
      getTimeSlotsForDate(dateOption.iso).map((timeOption) => ({
        date: dateOption.iso,
        time: timeOption,
      })),
    )
    .find((slot) => !isSlotUnavailable(slot.date, slot.time));

  const handleSelectFirstAvailable = () => {
    if (!firstAvailableSlot) return;
    setSelectedDate(firstAvailableSlot.date);
    setSelectedTime(firstAvailableSlot.time);
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
      return;
    }

    if (!paymentMethod) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(BACKEND_URL + "/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId || null,
          serviceId: service.id,
          paymentMethod,
          customerData: {
            name: userName.trim(),
            phone: userPhone.trim(),
            email: userEmail.trim().toLowerCase(),
            documentId: userDocumentId.trim() || undefined,
          },
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar la reserva");
      }

      const data = await response.json();

      if (paymentMethod === "mp") {
        window.location.href = data.initPoint;
      } else {
        // Transfer: show pending screen
        setTransferPending({
          appointmentId: data.appointmentId,
          dueAt: data.dueAt,
          totalAmount: data.pricing.totalAmount,
        });
      }
    } catch (error: any) {
      setIsSubmitting(false);
      alert("Hubo un problema al procesar la reserva. Inténtalo de nuevo.");
      console.error("Error:", error);
    }
  };

  // Transfer pending screen
  if (transferPending) {
    const dueDate = new Date(transferPending.dueAt);
    const dueDateStr = dueDate.toLocaleDateString("es-UY", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
    const dueTimeStr = dueDate.toLocaleTimeString("es-UY", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const whatsappMsg = encodeURIComponent(
      `*Comprobante de transferencia*\n\n` +
        `Servicio: ${service.name}\n` +
        `Fecha: ${getSelectedDateDisplay()}\n` +
        `Hora: ${selectedTime} hs\n` +
        `Turno ID: ${transferPending.appointmentId}\n` +
        `Monto: $${transferPending.totalAmount.toLocaleString("es-UY")} UYU\n\n` +
        `Adjunto comprobante de transferencia.`,
    );

    return (
      <div className="p-6 pb-20 animate-in">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-200 bg-shell p-8 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 to-yellow-400"></div>

          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>

          <h2 className="mb-1 text-center text-2xl font-black text-ink-strong">
            Reserva recibida
          </h2>
          <p className="mb-6 text-center text-[11px] font-medium text-ink-subtle">
            Pendiente de confirmación de pago
          </p>

          {/* Turno resumen */}
          <div className="mb-6 rounded-2xl border border-line-subtle bg-shell-subtle p-5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                Servicio
              </span>
              <span className="font-bold text-ink-strong">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                Fecha
              </span>
              <span className="font-bold text-ink-strong">
                {getSelectedDateDisplay()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                Hora
              </span>
              <span className="font-bold text-action">{selectedTime} HS</span>
            </div>
            <div className="flex justify-between border-t border-line/50 pt-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                Total a transferir
              </span>
              <span className="font-black text-lg text-ink-strong">
                ${transferPending.totalAmount.toLocaleString("es-UY")} UYU
              </span>
            </div>
          </div>

          {/* Datos bancarios */}
          <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-100 p-5">
            <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-amber-700">
              Datos para la transferencia
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-subtle">Banco</span>
                <span className="font-bold text-ink-strong">
                  {TRANSFER_BANK_INFO.bank}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-subtle">
                  {TRANSFER_BANK_INFO.accountType}
                </span>
                <span className="font-bold text-ink-strong">
                  {TRANSFER_BANK_INFO.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-subtle">Titular</span>
                <span className="font-bold text-ink-strong">
                  {TRANSFER_BANK_INFO.holder}
                </span>
              </div>
            </div>
          </div>

          {/* Vencimiento */}
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">
              Vencimiento del pago
            </p>
            <p className="text-sm font-bold text-red-700">
              {dueDateStr} a las {dueTimeStr}
            </p>
            <p className="mt-1 text-[10px] text-red-400">
              Pasado ese horario el turno se libera
            </p>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all mb-3"
          >
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
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1" />
              <path d="m22 2-7.5 7.5" />
              <path d="M10 14.7 9 22l11-11-4.7-1" />
            </svg>
            ENVIAR COMPROBANTE POR WHATSAPP
          </a>

          <button
            onClick={onCancel}
            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-ink-subtle"
          >
            Volver al inicio
          </button>
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

      <div className="mb-6 px-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
        <span className={step >= 1 ? "text-action" : ""}>1. Fecha y Hora</span>
        <span className={step >= 2 ? "text-action" : ""}>2. Datos</span>
        <span className={step >= 3 ? "text-action" : ""}>3. Pago</span>
      </div>

      <div className="mb-8 flex min-h-[380px] flex-col justify-center rounded-[2rem] border border-line-subtle bg-shell p-7 shadow-sm">
        {step === 1 && (
          <div className="animate-in">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                Paso 1: Fecha y Hora
              </h4>
              <button
                type="button"
                onClick={handleSelectFirstAvailable}
                disabled={!firstAvailableSlot}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 disabled:opacity-40"
              >
                Primer horario
              </button>
            </div>

            <p className="mb-4 text-[11px] text-ink-muted">
              Desliza para ver mas fechas disponibles.
            </p>

            <div className="relative mb-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-shell to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-shell to-transparent z-10" />
              <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scroll-smooth">
                {dates.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setSelectedDate(d.iso);
                      setSelectedTime("");
                    }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.5rem] h-24 rounded-2xl border-2 transition-all ${
                      selectedDate === d.iso
                        ? "border-action bg-action text-white shadow-xl scale-105"
                        : "border-transparent bg-shell-subtle text-ink-subtle"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold mb-1 opacity-70">
                      {d.day}
                    </span>
                    <span className="text-xl font-black leading-none">
                      {d.num}
                    </span>
                    <span className="mt-1 text-[9px] uppercase font-bold opacity-70">
                      {d.month}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div ref={timeSectionRef} className="animate-in space-y-4">
                <div className="rounded-2xl border border-line-subtle bg-shell-subtle px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
                    Disponibilidad para
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink-strong">
                      {getSelectedDateDisplay()}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-action">
                      {availableSlotsForSelectedDate} libres
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {selectedDateSlots.map((t) => {
                    const unavailable = isSlotUnavailable(selectedDate, t);
                    return (
                      <button
                        key={t}
                        disabled={unavailable}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          unavailable
                            ? "bg-shell-soft border-shell-soft text-ink-subtle/70 cursor-not-allowed"
                            : selectedTime === t
                              ? "border-action bg-action text-white shadow-md"
                              : "border-transparent bg-shell-subtle text-ink-muted hover:border-line"
                        }`}
                      >
                        <span className="block">{t}</span>
                        {unavailable && (
                          <span className="mt-0.5 block text-[8px] uppercase tracking-widest">
                            No disp.
                          </span>
                        )}
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
                <PhoneInput
                  value={userPhone}
                  onChange={setUserPhone}
                  placeholder="99 123 456"
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
              <div>
                <label className="ml-1 mb-2 block text-[10px] font-bold uppercase text-ink-subtle">
                  Documento (opcional)
                </label>
                <input
                  type="text"
                  value={userDocumentId}
                  onChange={(e) => setUserDocumentId(formatCI(e.target.value))}
                  placeholder="Ej: 3984010-8"
                  inputMode="numeric"
                  className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm font-medium text-ink-strong outline-none transition-all focus:border-action focus:bg-shell"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
              Paso 3: Método de Pago
            </h4>

            {/* Method selector */}
            <div className="grid grid-cols-2 gap-3">
              {/* Mercado Pago */}
              <button
                type="button"
                onClick={() => setPaymentMethod("mp")}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
                  paymentMethod === "mp"
                    ? "border-action bg-action/5"
                    : "border-line-subtle bg-shell-subtle"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    paymentMethod === "mp" ? "text-action" : "text-ink-subtle"
                  }
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    paymentMethod === "mp" ? "text-action" : "text-ink-subtle"
                  }`}
                >
                  Mercado Pago
                </span>
                {paymentMethod === "mp" && (
                  <span className="text-[9px] text-ink-muted leading-tight">
                    Recargo {MP_SURCHARGE_PERCENT}%
                  </span>
                )}
              </button>

              {/* Transferencia */}
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
                  paymentMethod === "transfer"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-line-subtle bg-shell-subtle"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    paymentMethod === "transfer"
                      ? "text-emerald-600"
                      : "text-ink-subtle"
                  }
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    paymentMethod === "transfer"
                      ? "text-emerald-700"
                      : "text-ink-subtle"
                  }`}
                >
                  Transferencia
                </span>
                {paymentMethod === "transfer" && (
                  <span className="text-[9px] text-emerald-600 font-bold leading-tight">
                    Sin recargo
                  </span>
                )}
              </button>
            </div>

            {/* Price breakdown */}
            <div className="rounded-2xl border border-line-subtle bg-shell-subtle p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                  Servicio
                </span>
                <span className="font-bold text-ink-strong text-right">
                  {service.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                  Fecha / Hora
                </span>
                <span className="font-bold text-ink-strong">
                  {getSelectedDateDisplay()} – {selectedTime} hs
                </span>
              </div>
              <div className="border-t border-line/50 pt-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                    Subtotal
                  </span>
                  <span className="font-bold text-ink">
                    ${pricing.finalPrice.toLocaleString("es-UY")}
                  </span>
                </div>
                {paymentMethod === "mp" && (
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                      Recargo MP ({MP_SURCHARGE_PERCENT}%)
                    </span>
                    <span className="font-bold text-amber-600">
                      +${mpSurcharge.toLocaleString("es-UY")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-line/70 pt-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                    Total
                  </span>
                  <span
                    className={`font-black text-lg ${
                      paymentMethod === "transfer"
                        ? "text-emerald-600"
                        : "text-ink-strong"
                    }`}
                  >
                    ${displayTotal.toLocaleString("es-UY")} UYU
                  </span>
                </div>
              </div>
            </div>

            {/* Info banner per method */}
            {paymentMethod === "mp" && (
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-blue-800 font-bold text-[11px] mb-0.5">
                  Pago con Mercado Pago
                </p>
                <p className="text-blue-600 text-[10px] leading-relaxed">
                  Serás redirigido a Mercado Pago. Tu turno se confirma
                  automáticamente al aprobarse el pago.
                </p>
              </div>
            )}
            {paymentMethod === "transfer" && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-emerald-800 font-bold text-[11px] mb-0.5">
                  Pago por transferencia
                </p>
                <p className="text-emerald-700 text-[10px] leading-relaxed">
                  Recibirás los datos bancarios para transferir. Tendrás{" "}
                  {TRANSFER_DUE_HOURS} horas para enviar el comprobante por
                  WhatsApp.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        disabled={
          isSubmitting ||
          (step === 1 && (!selectedDate || !selectedTime)) ||
          (step === 2 &&
            (userName.trim().length < 3 ||
              userPhone.replace(/\D/g, "").length < 8 ||
              !userEmail.trim().includes("@"))) ||
          (step === 3 && (!paymentMethod || promotionsLoading))
        }
        onClick={handleNextStep}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          (step === 1 && (!selectedDate || !selectedTime)) ||
          (step === 2 &&
            (userName.trim().length < 3 ||
              userPhone.replace(/\D/g, "").length < 8 ||
              !userEmail.trim().includes("@"))) ||
          (step === 3 && (!paymentMethod || promotionsLoading))
            ? "bg-shell-soft text-ink-faint cursor-not-allowed shadow-none"
            : paymentMethod === "transfer"
              ? "bg-emerald-600 hover:bg-emerald-700"
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
          ) : paymentMethod === "transfer" ? (
            "CONFIRMAR POR TRANSFERENCIA"
          ) : (
            "PAGAR CON MERCADO PAGO"
          )
        ) : (
          "CONTINUAR"
        )}
      </button>
    </div>
  );
};

export default Booking;
