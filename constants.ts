export const COLORS = {
  primary: "#9066C1",
  primaryDark: "#7C56A9",
  primaryAccent: "#8C67B2",
  primaryInk: "#5F4383",
  primaryMuted: "#75539B",
  action: "#111827",
  actionHover: "#000000",
  secondary: "#FFFFFF",
  text: "#4A4A4A",
  background: "#FCF9FE",
  shell: "#FFFFFF",
  shellSubtle: "#F9FAFB",
  shellSoft: "#F3F4F6",
  surface: "#F3EDF9",
  surfaceAlt: "#F7F2FB",
  surfaceSubtle: "#F1EAF8",
  surfaceHighlight: "#F5EFFB",
  surfaceDeep: "#EEE5F8",
  inkStrong: "#1F2937",
  ink: "#374151",
  inkSoft: "#4B5563",
  inkMuted: "#6B7280",
  inkSubtle: "#9CA3AF",
  inkFaint: "#D1D5DB",
  line: "#E5E7EB",
  lineSubtle: "#F3F4F6",
  outline: "#E8DBF4",
  outlineSoft: "#E9DEF5",
  outlineStrong: "#E6D8F4",
};

const hexToRgbChannels = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
};

export const COLOR_VARIABLES = {
  "--color-brand": hexToRgbChannels(COLORS.primary),
  "--color-brand-dark": hexToRgbChannels(COLORS.primaryDark),
  "--color-brand-accent": hexToRgbChannels(COLORS.primaryAccent),
  "--color-brand-ink": hexToRgbChannels(COLORS.primaryInk),
  "--color-brand-muted": hexToRgbChannels(COLORS.primaryMuted),
  "--color-action": hexToRgbChannels(COLORS.action),
  "--color-action-hover": hexToRgbChannels(COLORS.actionHover),
  "--color-app-text": hexToRgbChannels(COLORS.text),
  "--color-app-background": hexToRgbChannels(COLORS.background),
  "--color-shell": hexToRgbChannels(COLORS.shell),
  "--color-shell-subtle": hexToRgbChannels(COLORS.shellSubtle),
  "--color-shell-soft": hexToRgbChannels(COLORS.shellSoft),
  "--color-surface": hexToRgbChannels(COLORS.surface),
  "--color-surface-alt": hexToRgbChannels(COLORS.surfaceAlt),
  "--color-surface-subtle": hexToRgbChannels(COLORS.surfaceSubtle),
  "--color-surface-highlight": hexToRgbChannels(COLORS.surfaceHighlight),
  "--color-surface-deep": hexToRgbChannels(COLORS.surfaceDeep),
  "--color-ink-strong": hexToRgbChannels(COLORS.inkStrong),
  "--color-ink": hexToRgbChannels(COLORS.ink),
  "--color-ink-soft": hexToRgbChannels(COLORS.inkSoft),
  "--color-ink-muted": hexToRgbChannels(COLORS.inkMuted),
  "--color-ink-subtle": hexToRgbChannels(COLORS.inkSubtle),
  "--color-ink-faint": hexToRgbChannels(COLORS.inkFaint),
  "--color-line": hexToRgbChannels(COLORS.line),
  "--color-line-subtle": hexToRgbChannels(COLORS.lineSubtle),
  "--color-outline": hexToRgbChannels(COLORS.outline),
  "--color-outline-soft": hexToRgbChannels(COLORS.outlineSoft),
  "--color-outline-strong": hexToRgbChannels(COLORS.outlineStrong),
} as const;

export const CONTACT_INFO = {
  address: "Almiron 5496, Montevideo, Uruguay",
  coords: { lat: -34.8876, lng: -56.1054 },
  whatsapp: "59895542465",
  instagram: "@enarmonia_estetica_y_salud",
  email: "enarmonia.estetica.salud@gmail.com",
};

export const EMAIL_CONFIG = {
  SERVICE_ID: "default_service",
  TEMPLATE_ID: "template_enarmonia",
  PUBLIC_KEY: "TU_PUBLIC_KEY",
  OWNER_EMAIL: CONTACT_INFO.email,
};

export const LOGO_URL =
  "https://raw.githubusercontent.com/StackBlitz-User-Assets/beauty-center-logo/main/logo.png";

export const ADMIN_PASSWORD = "1234"; // ✨ NUEVO: contraseña para acceder al panel de administración

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://enarmonia-backend.vercel.app"; // URL del backend, configurable vía variable de entorno
