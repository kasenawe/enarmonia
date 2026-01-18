
import React from 'react';
import { SERVICES } from '../constants';
import { Service } from '../types';

interface HomeProps {
  onSelectService: (service: Service) => void;
  onSeeAll: () => void;
  isSyncing: boolean;
}

const Home: React.FC<HomeProps> = ({ onSelectService, onSeeAll, isSyncing }) => {
  return (
    <div className="p-6">
      {/* Sync Status Overlay Indicator */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sincronizando...</span>
        </div>
      )}

      {/* Hero Section */}
      <header className="text-center mb-10 pt-4 animate-in">
        <div className="w-28 h-28 mx-auto mb-6 relative">
           <div className="absolute inset-0 bg-gradient-to-br from-[#A79FE1] to-[#D4CFF1] rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center p-2 overflow-hidden rotate-3">
              <div className="relative z-10 text-white text-center -rotate-3">
                <span className="font-serif italic text-xs block leading-tight">En</span>
                <span className="font-bold text-base block leading-none tracking-tighter">ARMONÍA</span>
                <span className="text-[7px] uppercase tracking-[0.2em] mt-1 block font-medium">Estética y Salud</span>
              </div>
           </div>
        </div>
        <h1 className="text-2xl font-extrabold text-[#4A4A4A] mb-1 font-serif">Bienvenida</h1>
        <p className="text-gray-400 text-xs italic font-serif">Tu espacio de equilibrio y bienestar</p>
      </header>

      {/* Promo Card */}
      <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl border border-white shadow-sm animate-in" style={{animationDelay: '0.1s'}}>
        <div className="flex items-start gap-4">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm text-[#A79FE1]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h4 className="font-bold text-sm text-purple-900 mb-1">Cuidado Profesional</h4>
            <p className="text-[11px] text-purple-700/70 leading-relaxed font-medium">
              Especialistas en <b>Dermocosmiatría</b> para brindarte los mejores resultados en tu piel.
            </p>
          </div>
        </div>
      </div>

      {/* Services List Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-lg font-bold text-[#4A4A4A]">Tratamientos</h2>
          <button 
            onClick={onSeeAll}
            className="text-[10px] font-bold text-[#A79FE1] uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full"
          >
            Ver todos
          </button>
        </div>
        
        {SERVICES.slice(0, 2).map((service, idx) => (
          <div 
            key={service.id}
            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 transition-all active:scale-[0.97] animate-in"
            style={{animationDelay: `${0.2 + idx * 0.1}s`}}
            onClick={() => onSelectService(service)}
          >
            <div className="h-44 overflow-hidden relative">
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div className="text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{service.duration} min</span>
                  </div>
                  <h3 className="text-base font-bold leading-tight">{service.name}</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-400 text-xs leading-relaxed mb-5 line-clamp-2">
                {service.description}
              </p>
              <button className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-xs transition-all shadow-lg hover:bg-gray-800">
                AGENDAR AHORA
              </button>
            </div>
          </div>
        ))}

        {SERVICES.length > 2 && (
          <button 
            onClick={onSeeAll}
            className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors"
          >
            Ver {SERVICES.length - 2} tratamientos más
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center pb-12 opacity-30">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">En Armonía 2024</p>
      </footer>
    </div>
  );
};

export default Home;
