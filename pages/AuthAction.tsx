import React, { useEffect, useRef, useState } from "react";
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../firebase";

type Mode = "verifyEmail" | "resetPassword" | "unknown";
type Status = "loading" | "form" | "success" | "error";

const AuthAction: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get("mode") || "unknown") as Mode;
  const oobCode = params.get("oobCode") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    if (!oobCode) {
      setErrorMsg("El enlace es inválido o ya fue utilizado.");
      setStatus("error");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => setStatus("success"))
        .catch((err) => {
          const code: string = err?.code || "";
          if (
            code === "auth/invalid-action-code" ||
            code === "auth/expired-action-code"
          ) {
            setErrorMsg(
              "El enlace de verificación ya fue usado o expiró. Iniciá sesión y solicitá uno nuevo desde tu cuenta.",
            );
          } else {
            setErrorMsg(
              "No se pudo verificar el correo. Intentá de nuevo más tarde.",
            );
          }
          setStatus("error");
        });
    } else if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => setStatus("form"))
        .catch(() => {
          setErrorMsg(
            "El enlace para restablecer la contraseña ya fue usado o expiró. Solicitá uno nuevo desde la pantalla de inicio de sesión.",
          );
          setStatus("error");
        });
    } else {
      setErrorMsg("Acción desconocida. El enlace puede ser inválido.");
      setStatus("error");
    }
  }, [mode, oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
    } catch {
      setErrorMsg(
        "No se pudo cambiar la contraseña. El enlace puede haber expirado.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  if (status === "loading") {
    return (
      <div className="p-6 pt-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mode === "verifyEmail" && status === "success") {
    return (
      <div className="p-6 pt-12 text-center animate-in">
        <div className="relative overflow-hidden rounded-[3rem] border border-line-subtle bg-shell p-10 shadow-xl max-w-md mx-auto">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 to-emerald-400" />
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-black text-ink-strong">
            ¡Correo verificado!
          </h2>
          <p className="mb-8 text-sm text-ink-muted">
            Tu dirección de correo electrónico fue verificada correctamente. Ya
            podés iniciar sesión.
          </p>
          <button
            onClick={goToLogin}
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-action py-5 text-sm font-black text-white shadow-xl transition-all active:scale-95"
          >
            INICIAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  if (mode === "resetPassword" && status === "form") {
    return (
      <div className="p-6 pt-12 animate-in">
        <div className="relative overflow-hidden rounded-[3rem] border border-line-subtle bg-shell p-10 shadow-xl max-w-md mx-auto">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primaryDark" />
          <h2 className="mb-2 text-2xl font-black text-ink-strong text-center">
            Nueva contraseña
          </h2>
          <p className="mb-8 text-sm text-ink-muted text-center">
            Elegí una contraseña nueva para tu cuenta.
          </p>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1 uppercase tracking-wider">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-line-subtle bg-white px-4 py-3 text-sm text-ink-strong outline-none focus:border-primary"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1 uppercase tracking-wider">
                Confirmá la contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-line-subtle bg-white px-4 py-3 text-sm text-ink-strong outline-none focus:border-primary"
                placeholder="Repetí tu nueva contraseña"
                required
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center rounded-[1.5rem] bg-action py-5 text-sm font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {submitting ? "GUARDANDO..." : "CAMBIAR CONTRASEÑA"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "resetPassword" && status === "success") {
    return (
      <div className="p-6 pt-12 text-center animate-in">
        <div className="relative overflow-hidden rounded-[3rem] border border-line-subtle bg-shell p-10 shadow-xl max-w-md mx-auto">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 to-emerald-400" />
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-black text-ink-strong">
            ¡Contraseña cambiada!
          </h2>
          <p className="mb-8 text-sm text-ink-muted">
            Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión
            con tu nueva contraseña.
          </p>
          <button
            onClick={goToLogin}
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-action py-5 text-sm font-black text-white shadow-xl transition-all active:scale-95"
          >
            INICIAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  // error fallback
  return (
    <div className="p-6 pt-12 text-center animate-in">
      <div className="relative overflow-hidden rounded-[3rem] border border-red-100 bg-shell p-10 shadow-xl max-w-md mx-auto">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-300 to-rose-400" />
        <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-black text-ink-strong">
          Enlace inválido
        </h2>
        <p className="mb-8 text-sm text-ink-muted">{errorMsg}</p>
        <button
          onClick={goToLogin}
          className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-action py-5 text-sm font-black text-white shadow-xl transition-all active:scale-95"
        >
          IR AL INICIO DE SESIÓN
        </button>
      </div>
    </div>
  );
};

export default AuthAction;
