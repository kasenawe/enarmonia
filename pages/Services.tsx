
import React from 'react';
import { SERVICES } from '../constants';
import { Service } from '../types';

interface ServicesProps {
  onSelectService: (service: Service) => void;
}

const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  return (
    <div className="p-6 pb-20 animate-in">
      <header className="mb-10 pt-4">
        <h2 className="text-3xl font-bold text-[#4A4A4A] mb-2 font-serif">Nuestros Tratamientos</h2>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">Cuidado facial y corporal</p>
      </header>

      <div className="space-y-8">
        {SERVICES.map((service, idx) => (
          <div 
            key={service.id}
            className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm transition-all active:scale-[0.98]"
            style={{ animationDelay: `${idx * 0.1}s` }}
            onClick={() => onSelectService(service)}
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tighter flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {service.duration} min
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{service.name}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Inversión en ti</span>
                  <span className="text-sm font-bold text-[#A79FE1]">Consultar precio</span>
                </div>
                <button 
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-gray-200 active:bg-black transition-colors"
                >
                  RESERVAR
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-[#A79FE1]/5 rounded-[2.5rem] border border-[#A79FE1]/10 text-center">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-[#A79FE1]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h4 className="text-gray-800 font-bold text-sm mb-2">¿No sabes qué elegir?</h4>
        <p className="text-gray-400 text-[11px] leading-relaxed mb-4">Realizamos un diagnóstico previo para recomendarte el tratamiento ideal según tu tipo de piel.</p>
        <button className="text-[#A79FE1] font-bold text-[10px] uppercase tracking-widest border-b-2 border-[#A79FE1]/20 pb-1">
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  );
};

export default Services;
