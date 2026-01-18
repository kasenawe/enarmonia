
import React from 'react';
import { CONTACT_INFO } from '../constants';

const Contact: React.FC = () => {
  return (
    <div className="p-6 pb-20 animate-in">
      <header className="mb-10 pt-4">
        <h2 className="text-3xl font-bold text-[#4A4A4A] mb-2 font-serif">Encuéntranos</h2>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">Contacto y Ubicación</p>
      </header>

      {/* Map Placeholder */}
      <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-gray-100 mb-8 border border-gray-100 shadow-sm">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
           <div className="w-12 h-12 bg-[#A79FE1]/20 text-[#A79FE1] rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
           </div>
           <p className="text-gray-600 font-bold text-xs mb-2">{CONTACT_INFO.address}</p>
           <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-[#A79FE1] uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-md"
           >
             Abrir en Google Maps
           </a>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1"/><path d="m22 2-7.5 7.5"/><path d="M10 14.7 9 22l11-11-4.7-1"/><path d="M15.5 15.5 19 19"/></svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">WhatsApp</h4>
            <p className="text-sm font-bold text-gray-800">{CONTACT_INFO.whatsapp}</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-[#A79FE1] rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Instagram</h4>
            <p className="text-sm font-bold text-gray-800">{CONTACT_INFO.instagram}</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Horarios</h4>
            <p className="text-sm font-bold text-gray-800">Lun a Vie: 09:00 - 19:00 hs</p>
          </div>
        </div>
      </div>

      <div className="mt-12 p-10 bg-gray-900 rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <h3 className="text-xl font-bold mb-3">¿Tienes dudas?</h3>
        <p className="text-white/60 text-xs leading-relaxed mb-8">Escríbenos directamente y te asesoramos de forma personalizada.</p>
        <a 
          href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
          className="inline-block px-8 py-4 bg-[#A79FE1] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-purple-900/20 active:scale-95 transition-all"
        >
          Enviar Mensaje
        </a>
      </div>
    </div>
  );
};

export default Contact;
