import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Service } from "../types";

interface AIAssistantProps {
  services: Service[];
  onSelectService: (service: Service) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  services,
  onSelectService,
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const servicesContext =
        services.length > 0
          ? services.map((s) => `- ${s.name}: ${s.description}`).join("\n")
          : "No hay servicios cargados en este momento.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `Eres la asistente virtual de "Soledad Cedres Quiropráctica". 
          Tu objetivo es recomendar uno de nuestros servicios basándote en las molestias, necesidades u objetivos del cliente.
          Nuestros servicios son:
          ${servicesContext}
          
          Responde de forma amable, elegante y breve (máximo 3 frases). Si recomiendas un servicio, menciona su nombre exacto.
          Al final, invita cordialmente a agendarlo.`,
        },
      });

      const modelResponse =
        response.text || "Lo siento, no pude procesar tu consulta.";
      setMessages((prev) => [...prev, { role: "model", text: modelResponse }]);

      const mentionedService = services.find((s) =>
        modelResponse.toLowerCase().includes(s.name.toLowerCase()),
      );
      if (mentionedService) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `¿Te gustaría agendar ${mentionedService.name} ahora?`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Ups, tengo problemas técnicos. Por favor intenta más tarde.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-shell w-full max-w-md h-[80vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden animate-in">
        <div className="bg-brand p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-shell/20 rounded-full flex items-center justify-center">
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
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 12L2.1 12.1" />
                <path d="m4.5 9.1 7.5 2.9" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Asistente Soledad Cedres Quiropráctica
              </h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                Consultoría IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-shell/10 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-shell-subtle/50 p-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="px-10 text-xs font-medium leading-relaxed text-ink-subtle">
                ¡Hola! Soy tu asistente virtual. Cuéntame cómo te sientes hoy,
                qué molestias tienes o qué te gustaría trabajar y te orientaré
                con el servicio más adecuado.
              </p>
            </div>
          )}
          {messages.map((m, i) => {
            const mentionedService =
              m.role === "model" &&
              services.find((s) =>
                m.text.includes(`¿Te gustaría agendar ${s.name} ahora?`),
              );

            return (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-brand text-white rounded-tr-none"
                      : "bg-shell text-ink rounded-tl-none border border-line-subtle"
                  }`}
                >
                  {m.text}
                </div>
                {mentionedService && (
                  <button
                    onClick={() => onSelectService(mentionedService)}
                    className="mt-2 bg-action text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all"
                  >
                    Agendar {mentionedService.name}
                  </button>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-tl-none border border-line-subtle bg-shell p-4">
                <div className="h-1 w-1 animate-bounce rounded-full bg-ink-faint"></div>
                <div className="h-1 w-1 animate-bounce rounded-full bg-ink-faint [animation-delay:0.2s]"></div>
                <div className="h-1 w-1 animate-bounce rounded-full bg-ink-faint [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line-subtle bg-shell p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ej: Tengo tensión cervical y dolor lumbar..."
              className="flex-1 rounded-2xl border-none bg-shell-subtle p-4 text-xs font-medium text-ink-strong outline-none transition-all focus:ring-2 focus:ring-brand/20"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="rounded-2xl bg-action p-4 text-white transition-all active:scale-95 disabled:opacity-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
