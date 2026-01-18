
import React, { useState } from 'react';
import { Service, Appointment } from '../types';
import { COLORS } from '../constants';

interface BookingProps {
  service: Service;
  onConfirm: (appointment: Appointment) => void;
  onCancel: () => void;
}

const Booking: React.FC<BookingProps> = ({ service, onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Generate some mock dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      num: d.getDate(),
      month: d.toLocaleDateString('es-ES', { month: 'short' })
    };
  });

  // Mock time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
    else {
      onConfirm({
        id: Math.random().toString(36).substr(2, 9),
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        userName,
        userPhone
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-xl font-bold text-[#4A4A4A]">Agendar Turno</h2>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-[#A79FE1]' : 'bg-gray-100'}`}></div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <img src={service.image} className="w-full h-full object-cover" alt={service.name} />
          </div>
          <div>
            <h3 className="font-bold text-sm">{service.name}</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{service.duration} minutos</p>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h4 className="font-semibold text-sm mb-4">Seleccioná una fecha</h4>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                    selectedDate === d.iso 
                      ? 'border-[#A79FE1] bg-[#A79FE1] text-white shadow-lg shadow-purple-100' 
                      : 'border-gray-50 bg-gray-50 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold">{d.day}</span>
                  <span className="text-lg font-bold">{d.num}</span>
                  <span className="text-[10px] uppercase">{d.month}</span>
                </button>
              ))}
            </div>

            {selectedDate && (
              <>
                <h4 className="font-semibold text-sm mb-4">Seleccioná un horario</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                        selectedTime === t 
                          ? 'border-[#A79FE1] bg-[#A79FE1] text-white' 
                          : 'border-gray-50 bg-gray-50 text-gray-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm mb-2">Tus datos de contacto</h4>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Nombre Completo</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: María García"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#A79FE1] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Teléfono / WhatsApp</label>
              <input 
                type="tel" 
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Ej: 11 1234 5678"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#A79FE1] outline-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h4 className="text-xl font-bold text-[#4A4A4A] mb-2">¡Todo listo!</h4>
            <p className="text-gray-500 text-sm mb-6">Por favor confirma los detalles de tu turno.</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha:</span>
                <span className="font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hora:</span>
                <span className="font-semibold">{selectedTime} hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Paciente:</span>
                <span className="font-semibold">{userName}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <button 
        disabled={
          (step === 1 && (!selectedDate || !selectedTime)) ||
          (step === 2 && (!userName || !userPhone))
        }
        onClick={handleNextStep}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
          ((step === 1 && (!selectedDate || !selectedTime)) || (step === 2 && (!userName || !userPhone)))
            ? 'bg-gray-200 cursor-not-allowed shadow-none'
            : 'bg-[#A79FE1] shadow-purple-100 hover:scale-[1.02]'
        }`}
      >
        {step === 3 ? 'Confirmar Turno' : 'Siguiente'}
      </button>

      <p className="text-center text-[10px] text-gray-400 mt-6 px-8">
        Al confirmar, se enviará una solicitud de reserva al centro. Te contactaremos por WhatsApp para la confirmación final.
      </p>
    </div>
  );
};

export default Booking;
