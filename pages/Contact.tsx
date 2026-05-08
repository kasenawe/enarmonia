import React, { useEffect, useMemo, useState } from "react";
import { CONTACT_INFO } from "../constants";
import type { ContactSettings, Schedule } from "../types";
import { DEFAULT_SCHEDULE } from "../constants";
import { db, doc, onSnapshot } from "../firebase";
import { normalizeSchedule } from "../utils/scheduleUtils";

interface ContactProps {
  onAdminAccess?: () => void;
}

const Contact: React.FC<ContactProps> = ({ onAdminAccess }) => {
  const [contactInfo, setContactInfo] = useState<ContactSettings>(CONTACT_INFO);
  const [schedule, setSchedule] = useState<Schedule>(
    normalizeSchedule(DEFAULT_SCHEDULE),
  );

  useEffect(() => {
    const contactDoc = doc(db, "settings", "contact");
    const unsubscribe = onSnapshot(
      contactDoc,
      (snapshot) => {
        if (!snapshot.exists()) {
          setContactInfo(CONTACT_INFO);
          return;
        }

        const data = snapshot.data();
        setContactInfo({
          address: String(data.address || CONTACT_INFO.address),
          whatsapp: String(data.whatsapp || CONTACT_INFO.whatsapp),
          instagram: String(data.instagram || CONTACT_INFO.instagram),
          email: String(data.email || CONTACT_INFO.email),
          showAddress:
            typeof data.showAddress === "boolean"
              ? data.showAddress
              : CONTACT_INFO.showAddress,
          showWhatsapp:
            typeof data.showWhatsapp === "boolean"
              ? data.showWhatsapp
              : CONTACT_INFO.showWhatsapp,
          showInstagram:
            typeof data.showInstagram === "boolean"
              ? data.showInstagram
              : CONTACT_INFO.showInstagram,
          showEmail:
            typeof data.showEmail === "boolean"
              ? data.showEmail
              : CONTACT_INFO.showEmail,
        });
      },
      () => {
        setContactInfo(CONTACT_INFO);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const scheduleDoc = doc(db, "settings", "schedule");
    const unsubscribe = onSnapshot(
      scheduleDoc,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSchedule(normalizeSchedule(DEFAULT_SCHEDULE));
          return;
        }

        setSchedule(normalizeSchedule(snapshot.data()));
      },
      () => {
        setSchedule(normalizeSchedule(DEFAULT_SCHEDULE));
      },
    );

    return () => unsubscribe();
  }, []);

  const scheduleText = useMemo(() => {
    const weekdayText = schedule.weekdays.enabled
      ? `Lun a Vie: ${schedule.weekdays.startTime} - ${schedule.weekdays.endTime} hs`
      : "Lun a Vie: Cerrado";

    const saturdayText = schedule.saturday.enabled
      ? `Sáb: ${schedule.saturday.startTime} - ${schedule.saturday.endTime} hs`
      : "Sáb: Cerrado";

    const sundayText = schedule.sunday.enabled
      ? `Dom: ${schedule.sunday.startTime} - ${schedule.sunday.endTime} hs`
      : "Dom: Cerrado";

    return `${weekdayText} · ${saturdayText} · ${sundayText}`;
  }, [schedule]);

  const hasAddress = contactInfo.showAddress && Boolean(contactInfo.address);
  const hasWhatsapp =
    contactInfo.showWhatsapp && Boolean(contactInfo.whatsapp.trim());
  const hasInstagram =
    contactInfo.showInstagram && Boolean(contactInfo.instagram.trim());
  const hasEmail = contactInfo.showEmail && Boolean(contactInfo.email.trim());

  return (
    <div className="p-6 pb-32 animate-in">
      <header className="mb-10 pt-4">
        <h2 className="text-3xl font-bold text-app-text mb-2 font-serif">
          Encuéntranos
        </h2>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-subtle">
          Contacto y Ubicación
        </p>
      </header>

      {hasAddress && (
        <div className="relative mb-8 w-full aspect-video overflow-hidden rounded-[2.5rem] border border-line-subtle bg-shell-soft shadow-sm">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand">
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="mb-2 text-xs font-bold text-ink-soft">
              {contactInfo.address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-shell px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand shadow-md"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {hasWhatsapp && (
          <div className="flex items-center gap-4 rounded-3xl border border-line-subtle bg-shell p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
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
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1" />
                <path d="m22 2-7.5 7.5" />
                <path d="M10 14.7 9 22l11-11-4.7-1" />
                <path d="M15.5 15.5 19 19" />
              </svg>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-subtle">
                WhatsApp
              </h4>
              <p className="text-sm font-bold text-ink-strong">
                {contactInfo.whatsapp}
              </p>
            </div>
          </div>
        )}

        {hasInstagram && (
          <div className="flex items-center gap-4 rounded-3xl border border-line-subtle bg-shell p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-brand">
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
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-subtle">
                Instagram
              </h4>
              <p className="text-sm font-bold text-ink-strong">
                {contactInfo.instagram}
              </p>
            </div>
          </div>
        )}

        {hasEmail && (
          <div className="flex items-center gap-4 rounded-3xl border border-line-subtle bg-shell p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-brand">
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
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-subtle">
                Email
              </h4>
              <p className="text-sm font-bold text-ink-strong">
                {contactInfo.email}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 rounded-3xl border border-line-subtle bg-shell p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-shell-subtle text-ink-subtle">
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-subtle">
              Horarios
            </h4>
            <p className="text-sm font-bold text-ink-strong">{scheduleText}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-12 overflow-hidden rounded-[3rem] bg-action p-10 text-center text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-shell/5"></div>
        <h3 className="text-xl font-bold mb-3">¿Tienes dudas?</h3>
        <p className="mb-8 text-xs leading-relaxed text-shell/60">
          Escríbenos directamente y te asesoramos de forma personalizada.
        </p>
        {hasWhatsapp && (
          <a
            href={`https://wa.me/${contactInfo.whatsapp}`}
            className="inline-block rounded-2xl bg-brand px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand/10 transition-all active:scale-95"
          >
            Enviar Mensaje
          </a>
        )}
        {!hasWhatsapp && hasEmail && (
          <a
            href={`mailto:${contactInfo.email}`}
            className="inline-block rounded-2xl bg-brand px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand/10 transition-all active:scale-95"
          >
            Enviar Email
          </a>
        )}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onAdminAccess}
          className="py-4 text-[8px] font-bold uppercase tracking-[0.4em] text-ink-faint opacity-40 transition-opacity hover:opacity-100"
        >
          &bull; Acceso Staff &bull;
        </button>
      </div>
    </div>
  );
};

export default Contact;
