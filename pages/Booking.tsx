
import React, { useState } from 'react';
import { Service, Appointment } from '../types';

interface BookingProps {
  service: Service;
  occupiedSlots: { date: string, time: string }[];
  onConfirm: (appointment: Appointment) => void;
  onCancel: () => void;
}

const Booking: React.FC<BookingProps> = ({ service, occupiedSlots, onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  
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

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const isSlotOccupied = (date: string, time: string) => {
    return occupiedSlots.some(slot => slot.date === date && slot.time === time);
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
    else {
      const appointment: Appointment = {
        id: '', // Firestore generará el ID
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        userName,
        userPhone
      };
      
      // Enviar a WhatsApp
      const message = `Hola En Armonía! Me gustaría confirmar un turno para:
- Servicio: ${service.name}
- Fecha: ${selectedDate}
- Hora: ${selectedTime}hs
- Nombre: ${userName}
- Tel: ${userPhone}`;
      
      const whatsappUrl = `https://wa.me/59892550000?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      onConfirm(appointment);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-xl font-bold text-[#4A4A4A]">Agendar Turno</h2>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#A79FE1]' : 'bg-gray-100'}`}></div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 min-h-[400px]">
        {step === 1 && (
          <div className="animate-in">
            <h4 className="font-semibold text-sm mb-4">1. Seleccioná una fecha</h4>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => { setSelectedDate(d.iso); setSelectedTime(''); }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                    selectedDate === d.iso 
                      ? 'border-[#A79FE1] bg-[#A79FE1] text-white shadow-lg' 
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
              <div className="animate-in">
                <h4 className="font-semibold text-sm mb-4">2. Horarios disponibles</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => {
                    const occupied = isSlotOccupied(selectedDate, t);
                    return (
                      <button
                        key={t}
                        disabled={occupied}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all relative ${
                          occupied 
                            ? 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed' 
                            : selectedTime === t 
                              ? 'border-[#A79FE1] bg-[#A79FE1] text-white shadow-md' 
                              : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-purple-200'
                        }`}
                      >
                        {t}
                        {occupied && <span className="absolute top-1 right-1 text-[8px] font-bold text-gray-300">OCUPADO</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in">
            <h4 className="font-semibold text-sm mb-2">3. Tus datos de contacto</h4>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: María García"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#A79FE1] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Teléfono / WhatsApp</label>
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
          <div className="text-center py-4 animate-in">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h4 className="text-xl font-bold text-[#4A4A4A] mb-2">¡Todo listo!</h4>
            <p className="text-gray-500 text-sm mb-6">Confirmaremos tu turno globalmente y te redirigiremos a WhatsApp.</p>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha:</span>
                <span className="font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hora:</span>
                <span className="font-semibold">{selectedTime} hs</span>
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
            ? 'bg-gray-200 cursor-not-allowed'
            : 'bg-[#A79FE1] hover:bg-[#8A81C9]'
        }`}
      >
        {step === 3 ? 'Confirmar y Finalizar' : 'Siguiente'}
      </button>
    </div>
  );
};

export default Booking;
