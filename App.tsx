
import React, { useState, useEffect } from 'react';
import { AppRoute, Service, Appointment } from './types';
import { SERVICES, EMAIL_CONFIG } from './constants';
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

  // Listener para turnos del usuario
  useEffect(() => {
    if (!userPhone) {
      setMyAppointments([]);
      setIsSyncing(false);
      return;
    }
    setIsSyncing(true);
    const q = query(collection(db, "appointments"), where("userPhone", "==", userPhone.trim()));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointments: Appointment[] = [];
      snapshot.forEach((doc) => { appointments.push({ id: doc.id, ...doc.data() } as Appointment); });
      appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMyAppointments(appointments);
      setIsSyncing(false);
    }, () => setIsSyncing(false));
    return () => unsubscribe();
  }, [userPhone]);

  // Listener para todos los turnos (ocupación)
  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointments: Appointment[] = [];
      snapshot.forEach((doc) => { appointments.push({ id: doc.id, ...doc.data() } as Appointment); });
      setAllAppointments(appointments);
    });
    return () => unsubscribe();
  }, []);

  // Función para notificar al dueño por Email (vía EmailJS API)
  const notifyOwnerByEmail = async (app: Appointment) => {
    if (EMAIL_CONFIG.PUBLIC_KEY === 'TU_PUBLIC_KEY') {
      console.warn("EmailJS no configurado. El correo no se enviará.");
      return;
    }

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAIL_CONFIG.SERVICE_ID,
          template_id: EMAIL_CONFIG.TEMPLATE_ID,
          user_id: EMAIL_CONFIG.PUBLIC_KEY,
          template_params: {
            service_name: app.serviceName,
            customer_name: app.userName,
            customer_phone: app.userPhone,
            appointment_date: app.date,
            appointment_time: app.time,
            owner_email: EMAIL_CONFIG.OWNER_EMAIL
          }
        })
      });

      if (!response.ok) throw new Error('Error al enviar el email');
      console.log('Notificación de email enviada con éxito');
    } catch (error) {
      console.error('Error enviando notificación por email:', error);
    }
  };

  const handleIdentify = (name: string, phone: string) => {
    localStorage.setItem('enarmonia_user_phone', phone.trim());
    localStorage.setItem('enarmonia_user_name', name.trim());
    setUserPhone(phone.trim());
    setUserName(name.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('enarmonia_user_phone');
    localStorage.removeItem('enarmonia_user_name');
    setUserPhone(null);
    setUserName(null);
  };

  const handleConfirmAppointment = async (app: Appointment) => {
    try {
      // 1. Guardar en Base de Datos
      const docRef = await addDoc(collection(db, "appointments"), {
        serviceId: app.serviceId,
        serviceName: app.serviceName,
        date: app.date,
        time: app.time,
        userName: app.userName,
        userPhone: app.userPhone,
        createdAt: new Date().toISOString()
      });

      const fullAppointment = { ...app, id: docRef.id };

      // 2. Identificar al usuario localmente
      handleIdentify(app.userName, app.userPhone);

      // 3. Notificar automáticamente por Email (en segundo plano)
      notifyOwnerByEmail(fullAppointment);
      
    } catch (e: any) {
      console.error("Error al guardar:", e);
      throw e;
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("¿Estás seguro de cancelar?")) return;
    try { await deleteDoc(doc(db, "appointments", id)); } 
    catch (e) { console.error(e); }
  };

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME: return <Home onSelectService={(s) => { setSelectedService(s); setCurrentRoute(AppRoute.BOOKING); }} isSyncing={isSyncing} />;
      case AppRoute.BOOKING: return <Booking service={selectedService || SERVICES[0]} occupiedSlots={allAppointments} initialData={{ name: userName || '', phone: userPhone || '' }} onConfirm={handleConfirmAppointment} onCancel={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.MY_APPOINTMENTS: return <MyAppointments appointments={myAppointments} isSyncing={isSyncing} userPhone={userPhone} onIdentify={handleIdentify} onLogout={handleLogout} onDelete={handleDeleteAppointment} />;
      default: return <Home onSelectService={(s) => { setSelectedService(s); setCurrentRoute(AppRoute.BOOKING); }} isSyncing={isSyncing} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden border-x border-gray-100">
      <div className="flex-1 overflow-y-auto pb-24 relative z-10">{renderPage()}</div>
      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
