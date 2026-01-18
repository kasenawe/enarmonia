
import React, { useState, useEffect } from 'react';
import { AppRoute, Service, Appointment } from './types';
import { COLORS, SERVICES } from './constants';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from local storage
  useEffect(() => {
    const saved = localStorage.getItem('en_armonia_appointments');
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading appointments", e);
      }
    }
  }, []);

  const saveAppointment = (app: Appointment) => {
    const newAppointments = [...appointments, app];
    setAppointments(newAppointments);
    localStorage.setItem('en_armonia_appointments', JSON.stringify(newAppointments));
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
            onConfirm={(app) => {
              saveAppointment(app);
              setCurrentRoute(AppRoute.MY_APPOINTMENTS);
            }}
            onCancel={() => setCurrentRoute(AppRoute.HOME)}
          />
        );
      case AppRoute.MY_APPOINTMENTS:
        return <MyAppointments appointments={appointments} />;
      default:
        return <Home onSelectService={navigateToBooking} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Background decoration */}
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
