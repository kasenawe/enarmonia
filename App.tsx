
import React, { useState, useEffect } from 'react';
import { AppRoute, Service, Appointment } from './types';
import { COLORS, SERVICES } from './constants';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import Navbar from './components/Navbar';
import { db } from './firebase';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // 1. Escuchar TODOS los turnos en tiempo real (para disponibilidad global)
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

  // 2. Cargar mis turnos locales (para la sección "Mis Turnos")
  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem('my_booking_ids') || '[]');
    const myOnes = allAppointments.filter(app => savedIds.includes(app.id));
    setMyAppointments(myOnes);
  }, [allAppointments]);

  const handleConfirmAppointment = async (app: Appointment) => {
    try {
      // Guardar en Firestore (Nube - Global)
      const docRef = await addDoc(collection(db, "appointments"), {
        serviceId: app.serviceId,
        serviceName: app.serviceName,
        date: app.date,
        time: app.time,
        userName: app.userName,
        userPhone: app.userPhone,
        createdAt: new Date().toISOString()
      });

      // Guardar ID localmente para saber cuáles son "mis" turnos
      const savedIds = JSON.parse(localStorage.getItem('my_booking_ids') || '[]');
      localStorage.setItem('my_booking_ids', JSON.stringify([...savedIds, docRef.id]));
      
      setCurrentRoute(AppRoute.MY_APPOINTMENTS);
    } catch (e) {
      console.error("Error al guardar turno: ", e);
      alert("Hubo un error al conectar con el servidor. Verifica tu configuración de Firebase.");
    }
  };

  const navigateToBooking = (service: Service) => {
    setSelectedService(service);
    setCurrentRoute(AppRoute.BOOKING);
  };

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <Home onSelectService={navigateToBooking} />;
      case AppRoute.BOOKING:
        return (
          <Booking 
            service={selectedService || SERVICES[0]} 
            occupiedSlots={allAppointments} // Enviamos todos los turnos para bloquear horarios
            onConfirm={handleConfirmAppointment}
            onCancel={() => setCurrentRoute(AppRoute.HOME)}
          />
        );
      case AppRoute.MY_APPOINTMENTS:
        return <MyAppointments appointments={myAppointments} />;
      default:
        return <Home onSelectService={navigateToBooking} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full -ml-24 -mb-24 opacity-50 z-0"></div>

      <div className="flex-1 overflow-y-auto pb-20 relative z-10">
        {renderPage()}
      </div>

      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
