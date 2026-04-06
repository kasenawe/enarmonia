import React from "react";

const Success: React.FC = () => {
  return (
    <div className="p-6 pt-12 text-center animate-in">
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden">
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

        <h2 className="text-3xl font-black text-gray-800 mb-4 leading-tight">
          ¡Pago Exitoso!
        </h2>

        <div className="flex items-center justify-center gap-2 mb-6 bg-green-50 py-2 px-4 rounded-full w-fit mx-auto">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">
            Turno Confirmado
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-10 leading-relaxed px-2">
          Tu pago ha sido procesado correctamente y tu turno está confirmado.{" "}
          <br />
          <span className="font-bold text-gray-700">
            Recibirás un mensaje de confirmación por WhatsApp.
          </span>
        </p>

        <div className="space-y-4">
          <a
            href="/"
            className="flex items-center justify-center gap-3 w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm shadow-xl active:scale-95 transition-all"
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
            className="w-full py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors block text-center"
          >
            Ver Mis Turnos
          </a>
        </div>
      </div>
    </div>
  );
};

export default Success;
