import React, { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../contexts/AuthContext";

interface LoginProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onSuccess, onGoToRegister }) => {
  const {
    currentUser,
    login,
    resendVerificationEmail,
    resetPassword,
    loading,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<
    string | null
  >(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && currentUser?.emailVerified) {
      onSuccess();
    }
  }, [currentUser, loading, onSuccess]);

  const getErrorMessage = (error: unknown) => {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as any).code)
        : null;

    if (errorCode === "auth/email-not-verified") {
      return "Tu cuenta aún no está verificada. Revisa tu correo para activar el acceso.";
    }

    if (!(error instanceof FirebaseError)) {
      return "No se pudo iniciar sesión. Intenta nuevamente.";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Ingresa un email válido.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email o contraseña incorrectos.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Vuelve a intentar más tarde.";
      case "auth/email-not-verified":
        return "Tu cuenta aún no está verificada. Revisa tu correo para activar el acceso.";
      default:
        return "No se pudo iniciar sesión. Intenta nuevamente.";
    }
  };

  const getResetErrorMessage = (error: unknown) => {
    if (!(error instanceof FirebaseError)) {
      return "No se pudo enviar el correo de recuperación. Intenta nuevamente.";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Ingresa un email válido.";
      case "auth/missing-email":
        return "Debes ingresar un email para continuar.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Vuelve a intentar más tarde.";
      default:
        return "No se pudo enviar el correo de recuperación. Intenta nuevamente.";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setVerificationFeedback(null);
    setShowResendVerification(false);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(normalizedEmail, password);
      onSuccess();
    } catch (error: any) {
      if (error?.code === "auth/email-not-verified") {
        setShowResendVerification(true);
      }
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setVerificationFeedback(null);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Ingresa el email de la cuenta que quieres verificar.");
      return;
    }

    if (password.length < 6) {
      setError("Ingresa también la contraseña para reenviar verificación.");
      return;
    }

    setIsResendingVerification(true);
    try {
      await resendVerificationEmail(normalizedEmail, password);
      setVerificationFeedback(
        "Te reenviamos el correo de verificación. Revisa tu bandeja de entrada y spam.",
      );
      setShowResendVerification(false);
    } catch (resendError) {
      setError(getErrorMessage(resendError));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError(null);
    setResetFeedback(null);

    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setResetError("Ingresa un email válido.");
      return;
    }

    setIsResetSubmitting(true);
    try {
      await resetPassword(normalizedEmail);
      setResetFeedback(
        "Si el correo existe en nuestra base, enviamos un enlace para restablecer tu contraseña.",
      );
    } catch (error) {
      setResetError(getResetErrorMessage(error));
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-background p-6 pt-10 animate-in">
      <div className="rounded-[2.5rem] border border-line-subtle bg-shell p-8 shadow-xl">
        <button
          onClick={onBack}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-shell-soft hover:text-ink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface text-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-ink-strong">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Accede con tu email y contraseña para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
            />
          </div>

          <div>
            <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caracteres"
              autoComplete="current-password"
              className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {verificationFeedback && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {verificationFeedback}
            </div>
          )}

          {showResendVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingVerification || loading}
              className="w-full rounded-2xl border border-line-subtle bg-shell py-4 text-sm font-bold text-ink-strong transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isResendingVerification
                ? "REENVIANDO..."
                : "REENVIAR VERIFICACIÓN"}
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {isSubmitting ? "INGRESANDO..." : "INGRESAR"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setShowResetPassword((prev) => !prev);
              setResetError(null);
              setResetFeedback(null);
              setResetEmail((prev) => prev || email);
            }}
            className="text-sm font-bold text-ink-subtle transition-colors hover:text-brand"
          >
            {showResetPassword
              ? "Ocultar recuperación"
              : "¿Olvidaste tu contraseña?"}
          </button>
        </div>

        {showResetPassword && (
          <form onSubmit={handleResetPassword} className="mt-5 space-y-3">
            <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
              Email para recuperación
            </label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
            />

            {resetError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {resetError}
              </div>
            )}

            {resetFeedback && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {resetFeedback}
              </div>
            )}

            <button
              type="submit"
              disabled={isResetSubmitting || loading}
              className="w-full rounded-2xl border border-line-subtle bg-shell py-4 text-sm font-bold text-ink-strong transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isResetSubmitting
                ? "ENVIANDO..."
                : "ENVIAR CORREO DE RECUPERACIÓN"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-ink-muted">¿Aún no tienes cuenta?</p>
          <button
            onClick={onGoToRegister}
            className="mt-2 text-sm font-bold text-brand transition-colors hover:text-brand-dark"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
