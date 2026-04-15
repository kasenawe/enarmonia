import React, { useState } from "react";
import { Appointment } from "../types";

interface MyAppointmentsProps {
  appointments: Appointment[];
  isSyncing: boolean;
  userPhone: string | null;
  onIdentify: (name: string, phone: string) => void;
  onLogout: () => void;
  onDelete: (id: string) => Promise<void>;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({
  appointments,
  isSyncing,
  userPhone,
  onIdentify,
  onLogout,
  onDelete,
}) => {
  const [inputName, setInputName] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (!userPhone) {
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
          <p className="mb-8 text-xs leading-relaxed text-ink-subtle">
            Ingresá tu teléfono para ver tus turnos y agendar más rápido.
          </p>

          <div className="space-y-4 text-left">
            <div>
              <label className="ml-1 text-[10px] font-bold uppercase text-ink-subtle">
                Tu Nombre
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Ej: Maria Lopez"
                className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
              />
            </div>
            <div>
              <label className="ml-1 text-[10px] font-bold uppercase text-ink-subtle">
                Tu Teléfono
              </label>
              <input
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="Ej: 099123456"
                className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
              />
            </div>
            <button
              disabled={inputPhone.length < 7 || inputName.length < 3}
              onClick={() => onIdentify(inputName, inputPhone)}
              className="mt-4 w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-20 disabled:shadow-none"
            >
              VER MIS TURNOS
            </button>
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
            Sesión: {userPhone}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-[10px] font-bold text-red-400 uppercase border-b border-red-100 pb-0.5"
        >
          Cerrar Sesión
        </button>
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
                        ${(app.basePrice || app.price)?.toLocaleString("es-UY")}
                      </p>
                      <p className="text-sm font-black text-rose-600">
                        ${app.price?.toLocaleString("es-UY")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-black text-brand">
                      ${app.price?.toLocaleString("es-UY")}
                    </p>
                  )}
                </div>

                <button
                  disabled={deletingId === app.id}
                  onClick={() => handleDelete(app.id)}
                  className={`p-2 rounded-xl transition-all ${deletingId === app.id ? "opacity-30" : "text-ink-faint hover:text-red-500 hover:bg-red-50"}`}
                  title="Cancelar turno"
                >
                  {deletingId === app.id ? (
                    <div className="w-4 h-4 border-2 border-ink-faint border-t-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  )}
                </button>
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
                        ${(app.basePrice || app.price)?.toLocaleString("es-UY")}
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
                        Total
                      </p>
                      <p className="font-black text-action">
                        ${app.price?.toLocaleString("es-UY")}
                      </p>
                    </div>
                  </div>
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
