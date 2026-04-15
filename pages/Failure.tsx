import React from "react";

const Failure: React.FC = () => {
  return (
    <div className="p-6 pt-12 text-center animate-in">
      <div className="relative overflow-hidden rounded-[3rem] border border-line-subtle bg-shell p-10 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-300 to-red-400"></div>

        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
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
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>

        <h2 className="mb-4 text-3xl font-black leading-tight text-ink-strong">
          Pago No Completado
        </h2>

        <div className="flex items-center justify-center gap-2 mb-6 bg-red-50 py-2 px-4 rounded-full w-fit mx-auto">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
          <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
            Pago Rechazado
          </span>
        </div>

        <p className="mb-10 px-2 text-sm leading-relaxed text-ink-muted">
          El pago no pudo ser procesado. No te preocupes, no se ha realizado
          ningún cargo. <br />
          <span className="font-bold text-ink">
            Puedes intentar nuevamente o contactarnos si necesitas ayuda.
          </span>
        </p>

        <div className="space-y-4">
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
            href="https://wa.me/59895542465"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-[1.5rem] font-black text-sm shadow-xl active:scale-95 transition-all"
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
              <path d="M15.5 15.5 19 19" />
            </svg>
            CONTACTAR SOPORTE
          </a>
        </div>
      </div>
    </div>
  );
};

export default Failure;
