
import React from 'react';
import { SERVICES } from '../constants';
import { Service } from '../types';

interface HomeProps {
  onSelectService: (service: Service) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectService }) => {
  return (
    <div className="p-6">
      {/* Hero Section */}
      <header className="text-center mb-10 pt-4">
        <div className="w-32 h-32 mx-auto mb-4 relative">
           {/* Logo Mock */}
           <div className="absolute inset-0 bg-[#A79FE1] rounded-full border-4 border-white shadow-lg flex items-center justify-center p-2 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&q=80&w=200" 
                alt="Logo En Armonía" 
                className="w-full h-full object-cover rounded-full opacity-30 absolute grayscale"
              />
              <div className="relative z-10 text-white text-center">
                <span className="font-serif italic text-sm block leading-tight">En</span>
                <span className="font-bold text-lg block leading-none tracking-tighter">ARMONÍA</span>
                <span className="text-[8px] uppercase tracking-widest mt-1 block">Estética y Salud</span>
              </div>
           </div>
        </div>
        <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">Bienvenida</h1>
        <p className="text-gray-500 text-sm italic font-serif">Tu espacio de bienestar y equilibrio</p>
        <div className="mt-4 p-4 bg-purple-50 rounded-2xl text-xs text-purple-700 leading-relaxed">
          Somos expertos en <span className="font-semibold">Dermocosmiatría y Cosmetología</span>. Cuidamos tu piel con los tratamientos más avanzados.
        </div>
      </header>

      {/* Services List */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-[#4A4A4A] flex items-center gap-2">
          Nuestros Servicios
          <div className="h-[1px] flex-1 bg-gray-100"></div>
        </h2>
        
        {SERVICES.map((service) => (
          <div 
            key={service.id}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-[0.98]"
            onClick={() => onSelectService(service)}
          >
            <div className="h-40 overflow-hidden relative">
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-1 rounded-full mb-1 inline-block">
                  {service.duration} min
                </span>
                <h3 className="text-lg font-bold">{service.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <button 
                className="w-full py-3 bg-[#A79FE1] hover:bg-[#8A81C9] text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-100"
              >
                Agendar Turno
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Footer Info */}
      <footer className="mt-12 text-center pb-8 border-t border-gray-50 pt-8">
        <p className="text-gray-400 text-xs mb-2">© 2024 En Armonía Estética y Salud</p>
        <div className="flex justify-center gap-4 text-gray-400">
           {/* Mock social icons */}
           <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center">
              <span className="text-[10px] font-bold">IG</span>
           </div>
           <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center">
              <span className="text-[10px] font-bold">WA</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
