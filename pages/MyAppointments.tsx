
import React from 'react';
import { Appointment } from '../types';

interface MyAppointmentsProps {
  appointments: Appointment[];
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ appointments }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#4A4A4A] mb-8 pt-4">Mis Turnos</h2>

      {appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
          <p className="text-gray-400 font-medium">Aún no tenés turnos agendados.</p>
          <p className="text-[10px] text-gray-300 px-10 mt-2 italic">Explorá nuestros servicios y agendate un momento para vos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#A79FE1]"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[#4A4A4A]">{app.serviceName}</h3>
                  <span className="inline-block px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase mt-1">Confirmado</span>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-[#A79FE1]">{app.time} hs</p>
                   <p className="text-[10px] font-medium text-gray-400">{app.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">{app.userName}</span>
              </div>

              <button className="absolute bottom-4 right-4 text-gray-300 hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}

          <div className="p-4 bg-blue-50 rounded-2xl text-[11px] text-blue-600 leading-relaxed flex gap-3 items-start">
             <div className="mt-0.5">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12" y1="8" y2="8"/></svg>
             </div>
             <p>Recordá presentarte 10 minutos antes de tu cita. Si necesitás cancelar, por favor hacelo con al menos 24 horas de anticipación.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
