import React, { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../contexts/AuthContext";

interface RegisterProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onBack,
  onSuccess,
  onGoToLogin,
}) => {
  const { currentUser, register, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      onSuccess();
    }
  }, [currentUser, loading, onSuccess]);

  const getErrorMessage = (error: unknown) => {
    if (!(error instanceof FirebaseError)) {
      return "No se pudo crear la cuenta. Intenta nuevamente.";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Ingresa un email válido.";
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con ese email.";
      case "auth/weak-password":
        return "La contraseña es demasiado débil.";
      case "auth/operation-not-allowed":
      case "auth/configuration-not-found":
        return "Firebase Auth no tiene habilitado el registro por email y contraseña.";
      case "auth/invalid-api-key":
        return "La configuración de Firebase Auth es inválida.";
      case "auth/network-request-failed":
        return "No se pudo conectar con Firebase. Revisa tu red e intenta nuevamente.";
      default:
        return `No se pudo crear la cuenta. ${error.code}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(normalizedEmail, password);
      onSuccess();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <line x1="20" x2="20" y1="8" y2="14" />
              <line x1="23" x2="17" y1="11" y2="11" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-ink-strong">Crear cuenta</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Regístrate con email y contraseña para acceder a tu cuenta.
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
              autoComplete="new-password"
              className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
            />
          </div>

          <div>
            <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className="w-full rounded-2xl border-2 border-transparent bg-shell-subtle p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand focus:bg-shell"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {isSubmitting ? "CREANDO CUENTA..." : "CREAR CUENTA"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-ink-muted">¿Ya tienes cuenta?</p>
          <button
            onClick={onGoToLogin}
            className="mt-2 text-sm font-bold text-brand transition-colors hover:text-brand-dark"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
