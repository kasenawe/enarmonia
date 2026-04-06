
import React, { useState } from 'react';
import { Appointment } from '../types';

interface AdminProps {
  appointments: Appointment[];
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
}

const Admin: React.FC<AdminProps> = ({ appointments, onDelete, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  const ADMIN_PIN = '1234';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('PIN Incorrecto');
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    onBack();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-10 shadow-xl text-center border border-gray-100 relative">
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 p-2 text-gray-300 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2 font-serif">Staff Login</h2>
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-8">Solo personal autorizado</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-2xl tracking-[1em] font-black p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all text-gray-800"
              autoFocus
              placeholder="••••"
            />
            {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.time.localeCompare(b.time);
  });

  const todayCount = appointments.filter(a => a.date === today).length;

  return (
    <div className="p-6 pb-24 animate-in min-h-screen bg-gray-50">
      <header className="mb-8 pt-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M18 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 font-serif leading-tight">Agenda</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">En Armonía Estética</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-white p-3 rounded-2xl text-gray-400 border border-gray-100 shadow-sm active:scale-90 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Para Hoy</span>
           <span className="text-2xl font-black text-[#A79FE1]">{todayCount}</span>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Agenda</span>
           <span className="text-2xl font-black text-gray-800">{appointments.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <p className="text-gray-300 font-bold text-sm">No hay turnos registrados.</p>
          </div>
        ) : (
          sortedAppointments.map((app, idx) => {
            const isToday = app.date === today;
            return (
              <div 
                key={app.id} 
                className={`bg-white rounded-3xl p-6 border shadow-sm relative overflow-hidden transition-all ${isToday ? 'border-purple-100 ring-2 ring-purple-50' : 'border-transparent'}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${isToday ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {app.date}
                      </span>
                      {isToday && <span className="text-[8px] font-black text-purple-400 uppercase animate-pulse">¡Hoy!</span>}
                    </div>
                    <h3 className="font-bold text-gray-800 text-base leading-tight">{app.serviceName}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-gray-400">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                       <span className="text-xs font-bold text-gray-600">{app.userName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900 leading-none mb-1">{app.time}</p>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">HS</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-2 border-t border-gray-50">
                  <a 
                    href={`https://wa.me/${app.userPhone.replace(/\D/g,'')}`}
                    target="_blank"
                    className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-green-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1"/><path d="M10 14.7 9 22l11-11-4.7-1"/></svg>
                    WhatsApp
                  </a>
                  <button 
                    onClick={() => onDelete(app.id)}
                    className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100 active:scale-95 transition-all border border-red-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <footer className="mt-12 text-center opacity-20">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Gestión Interna En Armonía</p>
      </footer>
    </div>
  );
};

export default Admin;
