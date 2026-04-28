import React, { useState, useEffect } from "react";
import {
  AppRoute,
  Service,
  Appointment,
  Promotion,
  BlockedSlot,
} from "./types";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Account from "./pages/Account";
import MyAppointments from "./pages/MyAppointments";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Success from "./pages/Success"; // ✨ NUEVO
import Failure from "./pages/Failure"; // ✨ NUEVO
import Navbar from "./components/Navbar";
import AIAssistant from "./components/AIAssistant";
import { useAuth } from "./contexts/AuthContext";
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from "./firebase";

const App: React.FC = () => {
  const {
    currentUser,
    appUser,
    isAdmin,
    loading: authLoading,
    profileLoading,
    saveUserProfile,
    changeUserEmail,
    changeUserPassword,
    logout: authLogout,
  } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const mapRouteToPath = (route: AppRoute) => {
    switch (route) {
      case AppRoute.HOME:
        return "/";
      case AppRoute.SERVICES:
        return "/services";
      case AppRoute.BOOKING:
        return "/booking";
      case AppRoute.LOGIN:
        return "/login";
      case AppRoute.REGISTER:
        return "/register";
      case AppRoute.ACCOUNT:
        return "/account";
      case AppRoute.MY_APPOINTMENTS:
        return "/my-appointments";
      case AppRoute.CONTACT:
        return "/contact";
      case AppRoute.ADMIN:
        return "/admin";
      case AppRoute.SUCCESS:
        return "/success";
      case AppRoute.FAILURE:
        return "/failure";
      default:
        return "/";
    }
  };

  const mapPathnameToRoute = (pathname: string) => {
    switch (pathname) {
      case "/":
      case "":
        return AppRoute.HOME;
      case "/services":
        return AppRoute.SERVICES;
      case "/booking":
        return AppRoute.BOOKING;
      case "/login":
        return AppRoute.LOGIN;
      case "/register":
        return AppRoute.REGISTER;
      case "/account":
        return AppRoute.ACCOUNT;
      case "/my-appointments":
        return AppRoute.MY_APPOINTMENTS;
      case "/contact":
        return AppRoute.CONTACT;
      case "/admin":
        return AppRoute.ADMIN;
      case "/success":
        return AppRoute.SUCCESS;
      case "/failure":
      case "/pending":
        return AppRoute.FAILURE;
      default:
        return AppRoute.HOME;
    }
  };

  const navigate = (route: AppRoute, replace = false) => {
    const path = mapRouteToPath(route);
    setCurrentRoute(route);
    const method = replace
      ? window.history.replaceState
      : window.history.pushState;
    method.call(window.history, {}, "", path);
  };

  // ✨ Detectar ruta basada en URL pathname y cambios de historial
  useEffect(() => {
    const initializeRoute = () => {
      const pathname = window.location.pathname;
      setCurrentRoute(mapPathnameToRoute(pathname));
    };

    initializeRoute();
    window.addEventListener("popstate", initializeRoute);
    return () => window.removeEventListener("popstate", initializeRoute);
  }, []);

  useEffect(() => {
    if (authLoading) {
      setIsSyncing(true);
      return;
    }

    if (!currentUser?.uid) {
      setMyAppointments([]);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);

    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("userId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointments: Appointment[] = [];
        snapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        appointments.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setMyAppointments(appointments);
        setIsSyncing(false);
      },
      (error) => {
        console.error("Error en listener de usuario:", error);
        setIsSyncing(false);
      },
    );

    return () => unsubscribe();
  }, [authLoading, currentUser]);

  useEffect(() => {
    const servicesRef = collection(db, "services");
    const unsubscribe = onSnapshot(
      servicesRef,
      (snapshot) => {
        const loaded: Service[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Service);
        });
        loaded.sort((a, b) => a.name.localeCompare(b.name));
        setServices(loaded);
        setServicesLoading(false);
        setServiceError(null);
      },
      (error) => {
        console.error("Error al cargar servicios:", error);
        setServiceError(error.message || "Error al cargar servicios");
        setServicesLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const promotionsRef = collection(db, "promotions");
    const unsubscribe = onSnapshot(
      promotionsRef,
      (snapshot) => {
        const loaded: Promotion[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Promotion);
        });
        loaded.sort((a, b) => {
          const priorityDiff = (b.priority || 0) - (a.priority || 0);
          if (priorityDiff !== 0) return priorityDiff;
          return a.title.localeCompare(b.title);
        });
        setPromotions(loaded);
        setPromotionsLoading(false);
        setPromotionError(null);
      },
      (error) => {
        console.error("Error al cargar promociones:", error);
        setPromotionError(error.message || "Error al cargar promociones");
        setPromotionsLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedService && services.length > 0) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);

  // Siempre escuchar todos los appointments (necesario para deshabilitar slots ocupados en booking)
  useEffect(() => {
    const appointmentsRef = collection(db, "appointments");
    const unsubscribe = onSnapshot(
      appointmentsRef,
      (snapshot) => {
        const appointments: Appointment[] = [];
        snapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        setAllAppointments(appointments);
      },
      (error) => {
        console.error("Error al cargar appointments:", error);
      },
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const blockedSlotsRef = collection(db, "blocked_slots");
    const unsubscribe = onSnapshot(
      blockedSlotsRef,
      (snapshot) => {
        const blocked: BlockedSlot[] = [];
        snapshot.forEach((entry) => {
          blocked.push({ id: entry.id, ...entry.data() } as BlockedSlot);
        });
        blocked.sort((a, b) => {
          const dateDiff = a.date.localeCompare(b.date);
          if (dateDiff !== 0) return dateDiff;
          return a.time.localeCompare(b.time);
        });
        setBlockedSlots(blocked);
      },
      (error) => {
        console.error("Error al cargar bloqueos manuales:", error);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await authLogout();
      } catch (error) {
        console.error("Error al cerrar sesión autenticada:", error);
      }
    }
  };

  const handleConfirmAppointment = async (app: Appointment) => {
    try {
      const appointmentsRef = collection(db, "appointments");
      if (!currentUser?.uid) {
        throw new Error("AUTH_REQUIRED_FOR_APPOINTMENT");
      }

      await addDoc(appointmentsRef, {
        userId: currentUser.uid,
        serviceId: app.serviceId,
        serviceName: app.serviceName,
        date: app.date,
        time: app.time,
        userName: app.userName,
        userPhone: app.userPhone,
        createdAt: new Date().toISOString(),
      });
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

  const selectedServiceOrDefault = selectedService || services[0] || null;

  const renderPage = () => {
    if (
      authLoading &&
      (currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.REGISTER)
    ) {
      return (
        <div className="p-6 pt-24 text-center animate-in">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-line-subtle border-t-brand"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            Cargando acceso...
          </p>
        </div>
      );
    }

    switch (currentRoute) {
      case AppRoute.HOME:
        return (
          <Home
            services={services}
            promotions={promotions}
            onSelectService={(s) => {
              setSelectedService(s);
              navigate(AppRoute.BOOKING);
            }}
            onSeeAll={() => navigate(AppRoute.SERVICES)}
            isSyncing={servicesLoading || isSyncing}
          />
        );
      case AppRoute.SERVICES:
        return (
          <Services
            services={services}
            promotions={promotions}
            onSelectService={(s) => {
              setSelectedService(s);
              navigate(AppRoute.BOOKING);
            }}
          />
        );
      case AppRoute.BOOKING:
        return selectedServiceOrDefault ? (
          <Booking
            service={selectedServiceOrDefault}
            promotions={promotions}
            promotionsLoading={promotionsLoading}
            occupiedSlots={allAppointments.map((apt) => ({
              date: apt.date,
              time: apt.time,
            }))}
            blockedSlots={blockedSlots}
            currentUserId={currentUser?.uid || null}
            initialData={{
              name: appUser?.fullName || "",
              phone: appUser?.userPhone || "",
              email: currentUser?.email || "",
            }}
            onConfirm={handleConfirmAppointment}
            onRequireLogin={() => navigate(AppRoute.LOGIN)}
            onCancel={() => navigate(AppRoute.HOME)}
          />
        ) : (
          <div className="p-6 text-center">
            <h2 className="text-lg font-bold text-ink-strong">
              Cargando servicios...
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Espera mientras cargamos los servicios disponibles.
            </p>
          </div>
        );
      case AppRoute.LOGIN:
        return (
          <Login
            onBack={() => navigate(AppRoute.HOME)}
            onSuccess={() => navigate(AppRoute.HOME, true)}
            onGoToRegister={() => navigate(AppRoute.REGISTER)}
          />
        );
      case AppRoute.REGISTER:
        return (
          <Register
            onBack={() => navigate(AppRoute.HOME)}
            onSuccess={() => navigate(AppRoute.LOGIN, true)}
            onGoToLogin={() => navigate(AppRoute.LOGIN)}
          />
        );
      case AppRoute.ACCOUNT:
        return (
          <Account
            email={currentUser?.email || null}
            fullName={appUser?.fullName || ""}
            documentId={appUser?.documentId || ""}
            userPhone={appUser?.userPhone || ""}
            isAdmin={isAdmin}
            profileLoading={profileLoading}
            onGoToLogin={() => navigate(AppRoute.LOGIN)}
            onGoToRegister={() => navigate(AppRoute.REGISTER)}
            onGoToAppointments={() => navigate(AppRoute.MY_APPOINTMENTS)}
            onGoToAdmin={() => navigate(AppRoute.ADMIN)}
            onSaveProfile={saveUserProfile}
            onChangeEmail={changeUserEmail}
            onChangePassword={changeUserPassword}
            onLogout={handleLogout}
          />
        );
      case AppRoute.MY_APPOINTMENTS:
        return (
          <MyAppointments
            appointments={myAppointments}
            isSyncing={isSyncing}
            authEmail={currentUser?.email || null}
            onGoToLogin={() => navigate(AppRoute.LOGIN)}
            onLogout={handleLogout}
            onDelete={handleDeleteAppointment}
          />
        );
      case AppRoute.CONTACT:
        return <Contact onAdminAccess={() => navigate(AppRoute.ADMIN)} />;
      case AppRoute.ADMIN:
        if (authLoading || profileLoading) {
          return (
            <div className="p-6 pt-24 text-center animate-in">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-line-subtle border-t-brand"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                Verificando acceso...
              </p>
            </div>
          );
        }

        if (!currentUser) {
          return (
            <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
              <div className="w-full max-w-xs rounded-[2.5rem] border border-gray-100 bg-white p-10 text-center shadow-xl">
                <h2 className="mb-2 text-xl font-black text-gray-800 font-serif">
                  Acceso restringido
                </h2>
                <p className="mb-8 text-xs text-gray-500">
                  Inicia sesión con una cuenta administradora para ingresar al
                  panel.
                </p>
                <button
                  onClick={() => navigate(AppRoute.LOGIN, true)}
                  className="w-full rounded-2xl bg-gray-900 px-4 py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-95"
                >
                  Ingresar
                </button>
              </div>
            </div>
          );
        }

        if (!isAdmin) {
          return (
            <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
              <div className="w-full max-w-xs rounded-[2.5rem] border border-gray-100 bg-white p-10 text-center shadow-xl">
                <h2 className="mb-2 text-xl font-black text-gray-800 font-serif">
                  Sin permisos
                </h2>
                <p className="mb-8 text-xs text-gray-500">
                  Este panel de gestión solo está disponible para la
                  administradora.
                </p>
                <button
                  onClick={() => navigate(AppRoute.HOME, true)}
                  className="w-full rounded-2xl bg-gray-900 px-4 py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-95"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          );
        }

        return (
          <Admin
            appointments={allAppointments}
            blockedSlots={blockedSlots}
            services={services}
            servicesLoading={servicesLoading}
            serviceError={serviceError}
            promotions={promotions}
            promotionsLoading={promotionsLoading}
            promotionError={promotionError}
            onDelete={handleDeleteAppointment}
            onBack={() => navigate(AppRoute.HOME)}
          />
        );
      case AppRoute.SUCCESS: // ✨ NUEVO: página de pago exitoso
        return <Success />;
      case AppRoute.FAILURE: // ✨ NUEVO: página de pago fallido
        return <Failure />;
      default:
        return (
          <Home
            services={services}
            promotions={promotions}
            onSelectService={(s) => {
              setSelectedService(s);
              navigate(AppRoute.BOOKING);
            }}
            onSeeAll={() => navigate(AppRoute.SERVICES)}
            isSyncing={isSyncing}
          />
        );
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden border-x border-line-subtle bg-shell shadow-2xl">
      <div className="flex-1 overflow-y-auto pb-24 relative z-10">
        {renderPage()}
      </div>

      {currentRoute !== AppRoute.BOOKING && currentRoute !== AppRoute.ADMIN && (
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-action text-white shadow-2xl transition-transform active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
            <path d="M12 12L2.1 12.1" />
            <path d="m4.5 9.1 7.5 2.9" />
          </svg>
        </button>
      )}

      {currentRoute !== AppRoute.ADMIN &&
        currentRoute !== AppRoute.LOGIN &&
        currentRoute !== AppRoute.REGISTER && (
          <Navbar currentRoute={currentRoute} onNavigate={navigate} />
        )}

      <AIAssistant
        services={services}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSelectService={(s) => {
          setSelectedService(s);
          navigate(AppRoute.BOOKING);
          setIsAIModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;
