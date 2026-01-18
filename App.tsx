
import React, { useState, useEffect } from 'react';
import { AppRoute, Service, Appointment } from './types';
import { SERVICES } from './constants';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import Navbar from './components/Navbar';
import { db } from './firebase';
import { collection, onSnapshot, query, addDoc, where, deleteDoc, doc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Identidad del usuario
  const [userPhone, setUserPhone] = useState<string | null>(localStorage.getItem('enarmonia_user_phone'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('enarmonia_user_name'));

  // 1. Escuchar los turnos del usuario identificado en tiempo real
  useEffect(() => {
    if (!userPhone) {
      setMyAppointments([]);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    const q = query(
      collection(db, "appointments"), 
      where("userPhone", "==", userPhone.trim())
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const appointments: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMyAppointments(appointments);
        setDbError(null);
        setIsSyncing(false);
      },
      (error) => {
        console.error("Error en Firestore:", error);
        setIsSyncing(false);
        setDbError("Error de conexión. Revisa los permisos.");
      }
    );

    return () => unsubscribe();
  }, [userPhone]);

  // 2. Listener para slots ocupados (necesario para el calendario de Booking)
  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAllAppointments(appointments);
    });
    return () => unsubscribe();
  }, []);

  const handleIdentify = (name: string, phone: string) => {
    const cleanPhone = phone.trim();
    localStorage.setItem('enarmonia_user_phone', cleanPhone);
    localStorage.setItem('enarmonia_user_name', name.trim());
    setUserPhone(cleanPhone);
    setUserName(name.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('enarmonia_user_phone');
    localStorage.removeItem('enarmonia_user_name');
    setUserPhone(null);
    setUserName(null);
    setMyAppointments([]);
  };

  const handleConfirmAppointment = async (app: Appointment) => {
    try {
      await addDoc(collection(db, "appointments"), {
        serviceId: app.serviceId,
        serviceName: app.serviceName,
        date: app.date,
        time: app.time,
        userName: app.userName,
        userPhone: app.userPhone,
        createdAt: new Date().toISOString()
      });

      handleIdentify(app.userName, app.userPhone);
      setCurrentRoute(AppRoute.MY_APPOINTMENTS);
    } catch (e: any) {
      console.error("Error al guardar:", e);
      throw e;
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "appointments", id));
      // La lista se actualizará sola gracias al listener de onSnapshot
    } catch (e) {
      console.error("Error al borrar:", e);
      alert("No se pudo eliminar el turno. Intenta de nuevo.");
    }
  };

  const navigateToBooking = (service: Service) => {
    setSelectedService(service);
    setCurrentRoute(AppRoute.BOOKING);
  };

  const renderPage = () => {
    if (dbError && currentRoute !== AppRoute.MY_APPOINTMENTS) {
      return (
        <div className="p-10 text-center animate-in">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/></svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Error de Conexión</h3>
          <p className="text-xs text-gray-500 mb-6">{dbError}</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg">Reintentar</button>
        </div>
      );
    }

    switch (currentRoute) {
      case AppRoute.HOME:
        return <Home onSelectService={navigateToBooking} isSyncing={isSyncing} />;
      case AppRoute.BOOKING:
        return (
          <Booking 
            service={selectedService || SERVICES[0]} 
            occupiedSlots={allAppointments}
            initialData={{ name: userName || '', phone: userPhone || '' }}
            onConfirm={handleConfirmAppointment}
            onCancel={() => setCurrentRoute(AppRoute.HOME)}
          />
        );
      case AppRoute.MY_APPOINTMENTS:
        return (
          <MyAppointments 
            appointments={myAppointments} 
            isSyncing={isSyncing}
            userPhone={userPhone}
            onIdentify={handleIdentify}
            onLogout={handleLogout}
            onDelete={handleDeleteAppointment}
          />
        );
      default:
        return <Home onSelectService={navigateToBooking} isSyncing={isSyncing} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden border-x border-gray-100">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full -mr-32 -mt-32 opacity-30 z-0"></div>
      
      <div className="flex-1 overflow-y-auto pb-24 relative z-10">
        {renderPage()}
      </div>

      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
