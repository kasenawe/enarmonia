
import React, { useState, useEffect } from 'react';
import { AppRoute, Service, Appointment } from './types';
import { SERVICES, EMAIL_CONFIG } from './constants';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
// Fix: Importamos db y las funciones de firestore desde nuestro archivo local para resolver errores de exportación
import { 
  db,
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc 
} from './firebase';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Identidad del usuario
  const [userPhone, setUserPhone] = useState<string | null>(localStorage.getItem('enarmonia_user_phone'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('enarmonia_user_name'));

  // Listeners de Firestore con sintaxis modular
  useEffect(() => {
    if (!userPhone) { setMyAppointments([]); setIsSyncing(false); return; }
    setIsSyncing(true);
    
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("userPhone", "==", userPhone.trim()));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointments: Appointment[] = [];
      snapshot.forEach((doc) => { 
        appointments.push({ id: doc.id, ...doc.data() } as Appointment); 
      });
      appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMyAppointments(appointments);
      setIsSyncing(false);
    }, (error) => {
      console.error("Error en listener de usuario:", error);
      setIsSyncing(false);
    });
    
    return () => unsubscribe();
  }, [userPhone]);

  useEffect(() => {
    const appointmentsRef = collection(db, "appointments");
    const unsubscribe = onSnapshot(appointmentsRef, (snapshot) => {
      const appointments: Appointment[] = [];
      snapshot.forEach((doc) => { 
        appointments.push({ id: doc.id, ...doc.data() } as Appointment); 
      });
      setAllAppointments(appointments);
    }, (error) => {
      console.error("Error en listener global:", error);
    });
    return () => unsubscribe();
  }, []);

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
      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, {
        serviceId: app.serviceId,
        serviceName: app.serviceName,
        date: app.date,
        time: app.time,
        userName: app.userName,
        userPhone: app.userPhone,
        createdAt: new Date().toISOString()
      });
      handleIdentify(app.userName, app.userPhone);
    } catch (e: any) {
      console.error("Error al guardar:", e);
      throw e;
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("¿Estás seguro de cancelar?")) return;
    try {
      const appointmentDoc = doc(db, "appointments", id);
      await deleteDoc(appointmentDoc);
    } catch (e) {
      console.error("Error al eliminar:", e);
    }
  };

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME: 
        return <Home onSelectService={(s) => { setSelectedService(s); setCurrentRoute(AppRoute.BOOKING); }} onSeeAll={() => setCurrentRoute(AppRoute.SERVICES)} isSyncing={isSyncing} />;
      case AppRoute.SERVICES:
        return <Services onSelectService={(s) => { setSelectedService(s); setCurrentRoute(AppRoute.BOOKING); }} />;
      case AppRoute.BOOKING: 
        return <Booking service={selectedService || SERVICES[0]} occupiedSlots={allAppointments} initialData={{ name: userName || '', phone: userPhone || '' }} onConfirm={handleConfirmAppointment} onCancel={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.MY_APPOINTMENTS: 
        return <MyAppointments appointments={myAppointments} isSyncing={isSyncing} userPhone={userPhone} onIdentify={handleIdentify} onLogout={handleLogout} onDelete={handleDeleteAppointment} />;
      case AppRoute.CONTACT:
        return <Contact />;
      default: 
        return <Home onSelectService={(s) => { setSelectedService(s); setCurrentRoute(AppRoute.BOOKING); }} onSeeAll={() => setCurrentRoute(AppRoute.SERVICES)} isSyncing={isSyncing} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden border-x border-gray-100">
      <div className="flex-1 overflow-y-auto pb-24 relative z-10">{renderPage()}</div>
      
      {/* Botón flotante IA */}
      {currentRoute !== AppRoute.BOOKING && (
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-2xl z-40 active:scale-90 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="m4.5 9.1 7.5 2.9"/></svg>
        </button>
      )}

      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      
      <AIAssistant 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onSelectService={(s) => { setSelectedService(s); setCurrentRoute(AppRoute.BOOKING); setIsAIModalOpen(false); }} 
      />
    </div>
  );
};

export default App;
