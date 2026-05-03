import React from "react";
import { CONTACT_INFO } from "../constants";

const Success: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const method = params.get("method"); // "transfer" or null (mp)

  if (method === "transfer") {
    // Transfer success is handled inside Booking.tsx (transferPending screen)
    // This route should not normally be reached for transfers, but just in case:
    return (
      <div className="p-6 pt-12 text-center animate-in">
        <div className="relative overflow-hidden rounded-[3rem] border border-amber-200 bg-shell p-10 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 to-yellow-400"></div>
          <h2 className="mb-4 text-2xl font-black text-ink-strong">Reserva pendiente</h2>
          <p className="mb-8 text-sm text-ink-muted">
            Tu reserva está pendiente de confirmación de pago por transferencia.
            Revisá tu WhatsApp para los datos bancarios.
          </p>
          <a
            href="/"
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-action py-5 text-sm font-black text-white shadow-xl transition-all active:scale-95"
          >
            VOLVER AL INICIO
          </a>
        </div>
      </div>
    );
  }

  // MP success (default)
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
          ¡Pago Exitoso!
        </h2>

        <div className="flex items-center justify-center gap-2 mb-6 bg-green-50 py-2 px-4 rounded-full w-fit mx-auto">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">
            Turno Confirmado
          </span>
        </div>

        <p className="mb-10 px-2 text-sm leading-relaxed text-ink-muted">
          Tu pago ha sido procesado correctamente y tu turno está confirmado.{" "}
          <br />
          <span className="font-bold text-ink">
            Recibirás un mensaje de confirmación por WhatsApp.
          </span>
        </p>

        <div className="space-y-4">
          <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-[#25D366] py-4 text-sm font-black text-white shadow-xl transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1" />
              <path d="m22 2-7.5 7.5" />
              <path d="M10 14.7 9 22l11-11-4.7-1" />
            </svg>
            CONTACTAR POR WHATSAPP
          </a>

          <a
            href="/"
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-action py-5 text-sm font-black text-white shadow-xl transition-all active:scale-95"
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            VOLVER AL INICIO
          </a>

          <a
            href="/my-appointments"
            className="block w-full py-4 text-center text-[10px] font-bold uppercase tracking-widest text-ink-subtle transition-colors hover:text-ink-soft"
          >
            Ver Mis Turnos
          </a>
        </div>
      </div>
    </div>
  );
};

export default Success;

