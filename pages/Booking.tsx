
import React, { useState } from 'react';
import { Service, Appointment } from '../types';

interface BookingProps {
  service: Service;
  occupiedSlots: { date: string, time: string }[];
  initialData: { name: string, phone: string };
  onConfirm: (appointment: Appointment) => Promise<void>;
  onCancel: () => void;
}

const Booking: React.FC<BookingProps> = ({ service, occupiedSlots, initialData, onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userName, setUserName] = useState(initialData.name);
  const [userPhone, setUserPhone] = useState(initialData.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return {
      iso: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      num: d.getDate(),
      month: months[d.getMonth()],
      full: `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`
    };
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const isSlotOccupied = (date: string, time: string) => {
    return occupiedSlots.some(slot => slot.date === date && slot.time === time);
  };

  const getSelectedDateDisplay = () => {
    const dateObj = dates.find(d => d.iso === selectedDate);
    return dateObj ? dateObj.full : selectedDate;
  };

  const constructWhatsAppUrl = () => {
    const message = `*Nuevo Turno - En Armonía*\n\n` +
                    `🔹 *Servicio:* ${service.name}\n` +
                    `📅 *Fecha:* ${getSelectedDateDisplay()}\n` +
                    `⏰ *Hora:* ${selectedTime} hs\n\n` +
                    `👤 *Cliente:* ${userName}\n` +
                    `📱 *Teléfono:* ${userPhone}\n\n` +
                    `_Enviado desde la App En Armonía_`;
    
    return `https://wa.me/59892550000?text=${encodeURIComponent(message)}`;
  };

  const handleNextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const appointment: Appointment = {
          id: '', 
          serviceId: service.id,
          serviceName: service.name,
          date: selectedDate,
          time: selectedTime,
          userName: userName.trim(),
          userPhone: userPhone.trim()
        };
        
        await onConfirm(appointment);
        setIsSubmitting(false);
        setShowSuccess(true);
      } catch (error: any) {
        setIsSubmitting(false);
        alert("Hubo un problema al guardar tu turno.");
      }
    }
  };

  if (showSuccess) {
    return (
      <div className="p-6 pt-12 text-center animate-in">
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 to-emerald-400"></div>
          
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <h2 className="text-3xl font-black text-gray-800 mb-4 leading-tight">¡Turno Agendado!</h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed px-2">
            Tu reserva ha sido registrada. <br/>
            <span className="font-bold text-gray-700">Para finalizar, enviá la confirmación por WhatsApp al centro.</span>
          </p>
          
          <div className="space-y-4">
            <a 
              href={constructWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-green-100 active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1"/><path d="m22 2-7.5 7.5"/><path d="M10 14.7 9 22l11-11-4.7-1"/><path d="M15.5 15.5 19 19"/></svg>
              ENVIAR WHATSAPP
            </a>
            
            <button 
              onClick={onCancel} // Vuelve al inicio
              className="w-full py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cerrar y volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          disabled={isSubmitting}
          onClick={step > 1 ? () => setStep(step - 1) : onCancel} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-xl font-bold text-[#4A4A4A]">
          {step === 3 ? 'Confirmar Datos' : 'Agendar Turno'}
        </h2>
      </div>

      <div className="flex gap-2 mb-8 px-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-gray-900' : 'bg-gray-100'}`}></div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm mb-8 min-h-[380px] flex flex-col justify-center">
        {step === 1 && (
          <div className="animate-in">
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Paso 1: Fecha y Hora</h4>
            <div className="flex overflow-x-auto gap-3 pb-6 mb-6 -mx-2 px-2 scroll-smooth">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => { setSelectedDate(d.iso); setSelectedTime(''); }}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                    selectedDate === d.iso 
                      ? 'border-gray-900 bg-gray-900 text-white shadow-xl scale-105' 
                      : 'border-transparent bg-gray-50 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold mb-1 opacity-60">{d.day}</span>
                  <span className="text-xl font-black leading-none">{d.num}</span>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="animate-in">
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => {
                    const occupied = isSlotOccupied(selectedDate, t);
                    return (
                      <button
                        key={t}
                        disabled={occupied}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          occupied 
                            ? 'bg-gray-100 border-transparent text-gray-300 cursor-not-allowed line-through' 
                            : selectedTime === t 
                              ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                              : 'border-transparent bg-gray-50 text-gray-500 hover:border-gray-200'
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
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-2">Paso 2: Tu Información</h4>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 ml-1 uppercase">Nombre Completo</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 ml-1 uppercase">Teléfono / WhatsApp</label>
                <input 
                  type="tel" 
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="Ej: 099 123 456"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in space-y-6">
            <div className="text-center">
               <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               </div>
               <h3 className="text-xl font-bold text-gray-800">Casi listo</h3>
               <p className="text-gray-400 text-[11px] px-8 mt-1">Revisa que los datos sean correctos.</p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Servicio</span>
                 <span className="font-bold text-gray-800 text-right">{service.name}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Fecha</span>
                 <span className="font-bold text-gray-800">{getSelectedDateDisplay()}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Hora</span>
                 <span className="font-bold text-gray-900">{selectedTime} HS</span>
               </div>
               <div className="pt-2 border-t border-gray-200/50 flex flex-col gap-1">
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">A nombre de</span>
                 <span className="font-bold text-gray-800 text-sm">{userName} ({userPhone})</span>
               </div>
            </div>
          </div>
        )}
      </div>

      <button 
        disabled={
          isSubmitting ||
          (step === 1 && (!selectedDate || !selectedTime)) ||
          (step === 2 && (userName.trim().length < 3 || userPhone.trim().length < 7))
        }
        onClick={handleNextStep}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          ((step === 1 && (!selectedDate || !selectedTime)) || (step === 2 && (userName.trim().length < 3 || userPhone.trim().length < 7)))
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
            : 'bg-gray-900 hover:bg-black'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>PROCESANDO...</span>
          </>
        ) : (
          step === 3 ? 'FINALIZAR RESERVA' : 'CONTINUAR'
        )}
      </button>
    </div>
  );
};

export default Booking;
