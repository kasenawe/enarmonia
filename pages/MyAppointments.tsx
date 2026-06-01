import React from "react";
import { Appointment } from "../types";
import { BOOKING_POLICY_MESSAGES, CONTACT_INFO } from "../constants";

interface MyAppointmentsProps {
  appointments: Appointment[];
  isSyncing: boolean;
  authEmail: string | null;
  onGoToLogin: () => void;
  onLogout: () => void;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({
  appointments,
  isSyncing,
  authEmail,
  onGoToLogin,
  onLogout,
}) => {
  const hasAccountSession = Boolean(authEmail);
  const sessionLabel = authEmail || "Usuario autenticado";

  const getAppointmentTotal = (app: Appointment) => {
    if (app.paymentMethod === "mp" && typeof app.totalAmount === "number") {
      return app.totalAmount;
    }

    return app.price;
  };

  const getAppointmentSummaryBase = (app: Appointment) => {
    if (typeof app.basePrice === "number") return app.basePrice;
    return app.price;
  };

  if (!hasAccountSession) {
    return (
      <div className="p-6 pt-12 animate-in">
        <div className="rounded-[2.5rem] border border-line-subtle bg-shell p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface text-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-black text-ink-strong">
            Mis Reservas
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-ink-subtle">
            Please login to see your appointments
          </p>

          <div className="mb-8 rounded-[2rem] border border-outline bg-surface p-5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
              Acceso de cuenta
            </p>
            <h3 className="mt-2 text-lg font-black text-ink-strong">
              Inicia sesión para continuar
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Tus turnos se muestran solo para usuarios autenticados.
            </p>

            <div className="mt-4">
              <button
                onClick={onGoToLogin}
                className="w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98]"
              >
                INGRESAR
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-in">
      <div className="flex justify-between items-end mb-8 pt-4">
        <div>
          <h2 className="text-2xl font-black text-app-text">Mis Turnos</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
            Cuenta: {sessionLabel}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-[10px] font-bold text-red-400 uppercase border-b border-red-100 pb-0.5"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-2">
          Politicas de turnos
        </p>
        <ul className="space-y-1 text-[10px] leading-relaxed text-amber-800">
          <li>- {BOOKING_POLICY_MESSAGES.reschedule}</li>
          <li>- {BOOKING_POLICY_MESSAGES.lateArrival}</li>
          <li>- {BOOKING_POLICY_MESSAGES.cancellations}</li>
        </ul>
        <a
          href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-800"
        >
          Solicitar por WhatsApp
        </a>
      </div>

      {isSyncing ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-line-subtle border-t-brand"></div>
          <p className="text-[10px] font-bold uppercase text-ink-faint">
            Sincronizando...
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-line-subtle bg-shell-subtle/50 py-24 text-center">
          <p className="text-sm font-bold text-ink-subtle">
            No tienes citas próximas.
          </p>
          <p className="mt-2 px-10 text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            ¡Vuelve al inicio para agendar tu primer tratamiento!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app, idx) => (
            <div
              key={app.id}
              className="relative overflow-hidden rounded-3xl border border-line-subtle bg-shell p-6 shadow-sm animate-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="mb-1 text-sm font-bold leading-tight text-ink-strong">
                    {app.serviceName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">
                      {app.paid ? "Pagado ✓" : "Pendiente Pago"}
                    </span>
                  </div>
                  {app.appliedPromotion && (
                    <div className="mt-2 inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-rose-600">
                      {app.appliedPromotion.badgeText ||
                        app.appliedPromotion.title}
                    </div>
                  )}
                  {app.appliedCoupon && (
                    <div className="mt-2 ml-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                      {app.appliedCoupon.title}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-action">
                    {app.time} HS
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                    {app.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-line-subtle pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-shell-subtle text-ink-subtle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-ink-muted">
                    {app.userName}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase text-ink-subtle">
                    Total
                  </p>
                  {app.discountAmount ? (
                    <div>
                      <p className="text-[10px] font-bold text-ink-faint line-through">
                        ${getAppointmentSummaryBase(app)?.toLocaleString("es-UY")}
                      </p>
                      <p className="text-sm font-black text-rose-600">
                        ${getAppointmentTotal(app)?.toLocaleString("es-UY")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-black text-brand">
                      ${getAppointmentTotal(app)?.toLocaleString("es-UY")}
                    </p>
                  )}
                </div>

              </div>

              {(app.discountAmount || app.basePrice) && (
                <div className="mt-4 rounded-2xl border border-line-subtle bg-shell-subtle p-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
                    <span>Resumen de pago</span>
                    {app.discountAmount ? (
                      <span className="text-rose-500">
                        Ahorro ${app.discountAmount.toLocaleString("es-UY")}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                        Base
                      </p>
                      <p className="font-bold text-ink">
                        ${getAppointmentSummaryBase(app)?.toLocaleString("es-UY")}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                        Descuento
                      </p>
                      <p className="font-bold text-rose-600">
                        -${(app.discountAmount || 0).toLocaleString("es-UY")}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-ink-subtle">
                        {app.paymentMethod === "mp" ? "Total abonado" : "Total"}
                      </p>
                      <p className="font-black text-action">
                        ${getAppointmentTotal(app)?.toLocaleString("es-UY")}
                      </p>
                    </div>
                  </div>
                  {app.paymentMethod === "mp" && typeof app.mpSurchargeAmount === "number" && app.mpSurchargeAmount > 0 && (
                    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
                      <div className="flex items-center justify-between font-bold uppercase tracking-widest">
                        <span>Recargo MP</span>
                        <span>+${app.mpSurchargeAmount.toLocaleString("es-UY")}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-start gap-4 rounded-[2rem] bg-action p-5 text-[10px] leading-relaxed text-shell/50 shadow-xl">
            <div className="mt-1 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12" y1="8" y2="8" />
              </svg>
            </div>
            <p className="font-medium">
              <span className="text-white font-bold">Importante:</span>{" "}
              Presentarse 10 min antes. Avisar cancelaciones vía WhatsApp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
