
import React, { useState } from 'react';
import { Appointment } from '../types';

interface MyAppointmentsProps {
  appointments: Appointment[];
  isSyncing: boolean;
  userPhone: string | null;
  onIdentify: (name: string, phone: string) => void;
  onLogout: () => void;
  onDelete: (id: string) => Promise<void>;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ appointments, isSyncing, userPhone, onIdentify, onLogout, onDelete }) => {
  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
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
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-purple-50 text-[#A79FE1] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Mis Reservas</h2>
          <p className="text-gray-400 text-xs mb-8 leading-relaxed">Ingresá tu teléfono para ver tus turnos y agendar más rápido.</p>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tu Nombre</label>
              <input 
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Ej: Maria Lopez"
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#A79FE1] outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tu Teléfono</label>
              <input 
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="Ej: 099123456"
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-[#A79FE1] outline-none transition-all"
              />
            </div>
            <button 
              disabled={inputPhone.length < 7 || inputName.length < 3}
              onClick={() => onIdentify(inputName, inputPhone)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-20 disabled:shadow-none mt-4"
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
          <h2 className="text-2xl font-black text-[#4A4A4A]">Mis Turnos</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sesión: {userPhone}</p>
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
          <div className="w-8 h-8 border-4 border-gray-100 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-gray-300 uppercase">Sincronizando...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-24 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold text-sm">No tienes citas próximas.</p>
          <p className="text-[10px] text-gray-300 px-10 mt-2 uppercase tracking-widest font-bold">¡Vuelve al inicio para agendar tu primer tratamiento!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app, idx) => (
            <div 
              key={app.id} 
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden animate-in"
              style={{animationDelay: `${idx * 0.1}s`}}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{app.serviceName}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Turno Confirmado</span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-base font-black text-gray-900">{app.time} HS</p>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{app.date}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span className="text-[11px] text-gray-500 font-bold">{app.userName}</span>
                </div>

                <button 
                  disabled={deletingId === app.id}
                  onClick={() => handleDelete(app.id)}
                  className={`p-2 rounded-xl transition-all ${deletingId === app.id ? 'opacity-30' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                  title="Cancelar turno"
                >
                  {deletingId === app.id ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  )}
                </button>
              </div>
            </div>
          ))}

          <div className="p-5 bg-gray-900 rounded-[2rem] text-[10px] text-white/50 leading-relaxed flex gap-4 items-start shadow-xl shadow-gray-200">
             <div className="mt-1 text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12" y1="8" y2="8"/></svg>
             </div>
             <p className="font-medium">
               <span className="text-white font-bold">Importante:</span> Presentarse 10 min antes. Avisar cancelaciones vía WhatsApp.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
