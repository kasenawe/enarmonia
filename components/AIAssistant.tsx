
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SERVICES } from '../constants';
import { Service } from '../types';

interface AIAssistantProps {
  onSelectService: (service: Service) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onSelectService, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Correct initialization using process.env.API_KEY as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const servicesContext = SERVICES.map(s => `- ${s.name}: ${s.description}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Eres la asistente virtual de "En Armonía", un centro de estética profesional. 
          Tu objetivo es recomendar uno de nuestros servicios basándote en lo que el cliente necesita.
          Nuestros servicios son:
          ${servicesContext}
          
          Responde de forma amable, elegante y breve (máximo 3 frases). Si recomiendas un servicio, menciona su nombre exacto.
          Al final, invita cordialmente a agendarlo.`,
        },
      });

      // Fix: response.text is a property, not a method
      const modelResponse = response.text || 'Lo siento, no pude procesar tu consulta.';
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);

      // Extra: Check if a service was mentioned to offer a shortcut
      const mentionedService = SERVICES.find(s => modelResponse.toLowerCase().includes(s.name.toLowerCase()));
      if (mentionedService) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `¿Te gustaría agendar ${mentionedService.name} ahora?` 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Ups, tengo problemas técnicos. Por favor intenta más tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[80vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-[#A79FE1] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="m4.5 9.1 7.5 2.9"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-sm">Asistente En Armonía</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Consultoría IA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Chat Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-xs font-medium px-10 leading-relaxed">
                ¡Hola! Soy tu asistente virtual. Cuéntame cómo te sientes hoy o qué buscas mejorar en tu piel y te recomendaré el tratamiento ideal.
              </p>
            </div>
          )}
          {messages.map((m, i) => {
            // Check for service shortcuts in AI messages
            const mentionedService = m.role === 'model' && SERVICES.find(s => m.text.includes(`¿Te gustaría agendar ${s.name} ahora?`));

            return (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-[#A79FE1] text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                }`}>
                  {m.text}
                </div>
                {mentionedService && (
                  <button 
                    onClick={() => onSelectService(mentionedService)}
                    className="mt-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all"
                  >
                    Agendar {mentionedService.name}
                  </button>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ej: Tengo ojeras y cansancio..."
              className="flex-1 p-4 bg-gray-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-[#A79FE1]/20 outline-none transition-all font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gray-900 text-white p-4 rounded-2xl active:scale-95 transition-all disabled:opacity-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
