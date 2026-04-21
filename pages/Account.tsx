import React from "react";

interface AccountProps {
  email: string | null;
  isAdmin: boolean;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onGoToAppointments: () => void;
  onGoToAdmin: () => void;
  onLogout: () => void;
}

const Account: React.FC<AccountProps> = ({
  email,
  isAdmin,
  onGoToLogin,
  onGoToRegister,
  onGoToAppointments,
  onGoToAdmin,
  onLogout,
}) => {
  if (!email) {
    return (
      <div className="min-h-screen bg-app-background p-6 pt-10 animate-in">
        <div className="rounded-[2.5rem] border border-line-subtle bg-shell p-8 shadow-xl">
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
            <h1 className="text-2xl font-black text-ink-strong">Cuenta</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Inicia sesión o crea una cuenta para ver tus turnos y gestionar tu
              acceso.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onGoToLogin}
              className="w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98]"
            >
              INGRESAR
            </button>
            <button
              onClick={onGoToRegister}
              className="w-full rounded-2xl border border-line-subtle bg-shell py-4 text-sm font-bold text-ink-strong transition-all active:scale-[0.98]"
            >
              CREAR CUENTA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background p-6 pt-10 animate-in">
      <div className="rounded-[2.5rem] border border-line-subtle bg-shell p-8 shadow-xl">
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
          <h1 className="text-2xl font-black text-ink-strong">Mi cuenta</h1>
          <p className="mt-2 text-sm text-ink-muted">{email}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onGoToAppointments}
            className="flex w-full items-center justify-between rounded-2xl border border-line-subtle bg-shell-subtle px-5 py-4 text-left transition-all active:scale-[0.98]"
          >
            <span>
              <span className="block text-sm font-bold text-ink-strong">
                Mis turnos
              </span>
              <span className="mt-1 block text-xs text-ink-muted">
                Revisa tus reservas y cancelaciones.
              </span>
            </span>
            <span className="text-brand">›</span>
          </button>

          {isAdmin && (
            <button
              onClick={onGoToAdmin}
              className="flex w-full items-center justify-between rounded-2xl border border-line-subtle bg-shell-subtle px-5 py-4 text-left transition-all active:scale-[0.98]"
            >
              <span>
                <span className="block text-sm font-bold text-ink-strong">
                  Panel de gestión
                </span>
                <span className="mt-1 block text-xs text-ink-muted">
                  Accede a servicios, bloqueos, promociones y usuarios.
                </span>
              </span>
              <span className="text-brand">›</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full rounded-2xl border border-red-100 bg-red-50 py-4 text-sm font-bold text-red-600 transition-all active:scale-[0.98]"
          >
            CERRAR SESION
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
