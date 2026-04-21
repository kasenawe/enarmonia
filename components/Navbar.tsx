import React from "react";
import { AppRoute } from "../types";
import { useAuth } from "../contexts/AuthContext";

const Icons = {
  Home: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Calendar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Sparkles: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  ),
  Map: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  User: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { currentUser } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around rounded-t-3xl border-t border-line-subtle bg-shell/95 px-2 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <button
        onClick={() => onNavigate(AppRoute.HOME)}
        className={`flex flex-col items-center gap-1.5 transition-all ${currentRoute === AppRoute.HOME ? "text-brand" : "text-ink-faint"}`}
      >
        <Icons.Home />
        <span className="text-[8px] font-bold uppercase tracking-widest">
          Inicio
        </span>
      </button>

      <button
        onClick={() => onNavigate(AppRoute.SERVICES)}
        className={`flex flex-col items-center gap-1.5 transition-all ${currentRoute === AppRoute.SERVICES ? "text-brand" : "text-ink-faint"}`}
      >
        <Icons.Sparkles />
        <span className="text-[8px] font-bold uppercase tracking-widest">
          Servicios
        </span>
      </button>

      <button
        onClick={() => onNavigate(AppRoute.MY_APPOINTMENTS)}
        className={`flex flex-col items-center gap-1.5 transition-all ${currentRoute === AppRoute.MY_APPOINTMENTS ? "text-brand" : "text-ink-faint"}`}
      >
        <Icons.Calendar />
        <span className="text-[8px] font-bold uppercase tracking-widest">
          Turnos
        </span>
      </button>

      <button
        onClick={() => onNavigate(AppRoute.CONTACT)}
        className={`flex flex-col items-center gap-1.5 transition-all ${currentRoute === AppRoute.CONTACT ? "text-brand" : "text-ink-faint"}`}
      >
        <Icons.Map />
        <span className="text-[8px] font-bold uppercase tracking-widest">
          Contacto
        </span>
      </button>

      <button
        onClick={() =>
          onNavigate(currentUser ? AppRoute.ACCOUNT : AppRoute.LOGIN)
        }
        className={`flex flex-col items-center gap-1.5 transition-all ${currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.REGISTER || currentRoute === AppRoute.ACCOUNT ? "text-brand" : "text-ink-faint"}`}
      >
        <Icons.User />
        <span className="text-[8px] font-bold uppercase tracking-widest">
          {currentUser ? "Cuenta" : "Ingresar"}
        </span>
      </button>
    </nav>
  );
};

export default Navbar;
