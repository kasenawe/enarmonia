import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { COLOR_VARIABLES } from "./constants";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

Object.entries(COLOR_VARIABLES).forEach(([name, value]) => {
  document.documentElement.style.setProperty(name, value);
});

// const hexToRgbChannels = (hex: string) => {
//   const sanitized = hex.replace("#", "");
//   const normalized =
//     sanitized.length === 3
//       ? sanitized
//           .split("")
//           .map((char) => char + char)
//           .join("")
//       : sanitized;

//   const red = Number.parseInt(normalized.slice(0, 2), 16);
//   const green = Number.parseInt(normalized.slice(2, 4), 16);
//   const blue = Number.parseInt(normalized.slice(4, 6), 16);

//   return `${red} ${green} ${blue}`;
// };

// const configuredAppEnv = (import.meta.env.VITE_APP_ENV || "")
//   .trim()
//   .toLowerCase();
// const firebaseProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || "")
//   .trim()
//   .toLowerCase();
// const inferredStaging = firebaseProjectId.includes("staging");
// const isNonProductionEnv =
//   (configuredAppEnv && configuredAppEnv !== "production") || inferredStaging;

// if (isNonProductionEnv) {
//   // Paleta visual para distinguir staging/qa de producción.
//   const nonProdPalette: Record<string, string> = {
//     "--color-brand": hexToRgbChannels("#D97706"),
//     "--color-brand-dark": hexToRgbChannels("#B45309"),
//     "--color-brand-accent": hexToRgbChannels("#F59E0B"),
//     "--color-brand-muted": hexToRgbChannels("#9A3412"),
//     "--color-action": hexToRgbChannels("#D97706"),
//     "--color-action-hover": hexToRgbChannels("#B45309"),
//     "--color-app-background": hexToRgbChannels("#FFF7ED"),
//     "--color-shell": hexToRgbChannels("#FFFBF5"),
//     "--color-shell-soft": hexToRgbChannels("#FFF3E0"),
//     "--color-line-subtle": hexToRgbChannels("#FED7AA"),
//     "--color-outline": hexToRgbChannels("#FDBA74"),
//   };

//   Object.entries(nonProdPalette).forEach(([name, value]) => {
//     document.documentElement.style.setProperty(name, value);
//   });
// }

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
