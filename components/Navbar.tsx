
import React from 'react';
import { AppRoute } from '../types';
import { Home, Calendar, User, Sparkles } from 'lucide-react';

// Simplified icons since we don't have lucide-react installed in standard way, 
// using SVG directly for better control.
const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  )
};

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-3 px-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
      <button 
        onClick={() => onNavigate(AppRoute.HOME)}
        className={`flex flex-col items-center gap-1 ${currentRoute === AppRoute.HOME ? 'text-[#A79FE1]' : 'text-gray-400'}`}
      >
        <Icons.Home />
        <span className="text-[10px] font-medium uppercase tracking-wider">Inicio</span>
      </button>
      
      <button 
        onClick={() => onNavigate(AppRoute.HOME)}
        className={`flex flex-col items-center gap-1 ${currentRoute === AppRoute.BOOKING ? 'text-[#A79FE1]' : 'text-gray-400'}`}
      >
        <Icons.Sparkles />
        <span className="text-[10px] font-medium uppercase tracking-wider">Servicios</span>
      </button>

      <button 
        onClick={() => onNavigate(AppRoute.MY_APPOINTMENTS)}
        className={`flex flex-col items-center gap-1 ${currentRoute === AppRoute.MY_APPOINTMENTS ? 'text-[#A79FE1]' : 'text-gray-400'}`}
      >
        <Icons.Calendar />
        <span className="text-[10px] font-medium uppercase tracking-wider">Mis Turnos</span>
      </button>
    </nav>
  );
};

export default Navbar;
