import React, { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import PhoneInput from "../components/PhoneInput";

interface AccountProps {
  email: string | null;
  fullName: string;
  documentId: string;
  userPhone: string;
  isAdmin: boolean;
  profileLoading: boolean;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onGoToAppointments: () => void;
  onGoToAdmin: () => void;
  onSaveProfile: (payload: {
    fullName: string;
    documentId: string;
    userPhone: string;
  }) => Promise<void>;
  onChangeEmail: (payload: {
    newEmail: string;
    currentPassword: string;
  }) => Promise<void>;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  onLogout: () => void;
}

const Account: React.FC<AccountProps> = ({
  email,
  fullName,
  documentId,
  userPhone,
  isAdmin,
  profileLoading,
  onGoToLogin,
  onGoToRegister,
  onGoToAppointments,
  onGoToAdmin,
  onSaveProfile,
  onChangeEmail,
  onChangePassword,
  onLogout,
}) => {
  const [fullNameValue, setFullNameValue] = useState(fullName);
  const [documentValue, setDocumentValue] = useState(documentId);
  const [phoneValue, setPhoneValue] = useState(userPhone);

  const formatCI = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length < 2) return digits;
    return digits.slice(0, -1) + "-" + digits.slice(-1);
  };
  const [emailValue, setEmailValue] = useState(email || "");
  const [emailPasswordValue, setEmailPasswordValue] = useState("");
  const [currentPasswordValue, setCurrentPasswordValue] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setFullNameValue(fullName);
  }, [fullName]);

  useEffect(() => {
    setDocumentValue(documentId);
  }, [documentId]);

  useEffect(() => {
    setPhoneValue(userPhone);
  }, [userPhone]);

  useEffect(() => {
    setEmailValue(email || "");
  }, [email]);

  const getFirebaseErrorMessage = (error: unknown, fallback: string) => {
    if (!(error instanceof FirebaseError)) {
      return fallback;
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "Ingresa un email válido.";
      case "auth/email-already-in-use":
        return "Ese email ya está en uso por otra cuenta.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "La contraseña actual no es correcta.";
      case "auth/requires-recent-login":
        return "Por seguridad, vuelve a iniciar sesión e intenta nuevamente.";
      case "auth/weak-password":
        return "La nueva contraseña es demasiado débil.";
      default:
        return fallback;
    }
  };

  const handleSaveProfile = async () => {
    const normalizedName = fullNameValue.trim();
    const normalizedDocument = documentValue.trim();
    const normalizedPhone = phoneValue.trim();

    if (normalizedName.length < 3) {
      setProfileError("Ingresa tu nombre y apellido.");
      setProfileFeedback(null);
      return;
    }

    if (normalizedDocument.length < 5) {
      setProfileError("Ingresa un documento válido.");
      setProfileFeedback(null);
      return;
    }

    if (normalizedPhone && normalizedPhone.replace(/\D/g, "").length < 8) {
      setProfileError("Ingresa un teléfono válido o déjalo vacío.");
      setProfileFeedback(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileFeedback(null);

    try {
      await onSaveProfile({
        fullName: normalizedName,
        documentId: normalizedDocument,
        userPhone: normalizedPhone,
      });
      setProfileFeedback("Datos personales guardados correctamente.");
    } catch (error) {
      console.error(error);
      setProfileError("No se pudieron guardar tus datos. Intenta nuevamente.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangeEmail = async () => {
    const normalizedEmail = emailValue.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setEmailError("Ingresa un email válido.");
      setEmailFeedback(null);
      return;
    }

    if (!emailPasswordValue) {
      setEmailError("Ingresa tu contraseña actual para confirmar el cambio.");
      setEmailFeedback(null);
      return;
    }

    setIsSavingEmail(true);
    setEmailError(null);
    setEmailFeedback(null);

    try {
      await onChangeEmail({
        newEmail: normalizedEmail,
        currentPassword: emailPasswordValue,
      });
      setEmailPasswordValue("");
      setEmailFeedback(
        "Te enviamos un enlace al nuevo email para confirmar el cambio. Hasta verificarlo, tu email actual sigue vigente.",
      );
    } catch (error) {
      console.error(error);
      setEmailError(
        getFirebaseErrorMessage(
          error,
          "No se pudo iniciar el cambio de email. Intenta nuevamente.",
        ),
      );
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPasswordValue) {
      setPasswordError("Ingresa tu contraseña actual.");
      setPasswordFeedback(null);
      return;
    }

    if (newPasswordValue.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      setPasswordFeedback(null);
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      setPasswordFeedback(null);
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordFeedback(null);

    try {
      await onChangePassword({
        currentPassword: currentPasswordValue,
        newPassword: newPasswordValue,
      });
      setCurrentPasswordValue("");
      setNewPasswordValue("");
      setConfirmPasswordValue("");
      setPasswordFeedback("Contraseña actualizada correctamente.");
    } catch (error) {
      console.error(error);
      setPasswordError(
        getFirebaseErrorMessage(
          error,
          "No se pudo actualizar la contraseña. Intenta nuevamente.",
        ),
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const isProfileUnchanged =
    fullNameValue.trim() === fullName.trim() &&
    documentValue.trim() === documentId.trim() &&
    phoneValue.trim() === userPhone.trim();

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
          <p className="mt-2 text-sm text-ink-muted">
            Gestiona tus datos de acceso y perfil.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-line-subtle bg-shell-subtle p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
            Datos personales
          </p>
          <div className="space-y-3">
            <input
              value={fullNameValue}
              onChange={(e) => setFullNameValue(e.target.value)}
              placeholder="Nombre y apellido"
              autoComplete="name"
              className="w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
            />
            <input
              value={documentValue}
              onChange={(e) => setDocumentValue(formatCI(e.target.value))}
              placeholder="Ej: 3984010-8"
              autoComplete="off"
              inputMode="numeric"
              className="w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
            />
          </div>

          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
            Teléfono para reservas
          </p>
          <PhoneInput
            value={phoneValue}
            onChange={setPhoneValue}
            placeholder="99 123 456"
          />
          <p className="mt-2 text-xs text-ink-muted">
            Se usará como valor inicial en la reserva, pero podrás editarlo en
            cada turno.
          </p>
          {profileError && (
            <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {profileError}
            </div>
          )}
          {profileFeedback && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {profileFeedback}
            </div>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile || profileLoading || isProfileUnchanged}
            className="mt-4 w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {isSavingProfile ? "GUARDANDO..." : "GUARDAR DATOS PERSONALES"}
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-line-subtle bg-shell-subtle p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
            Email de acceso
          </p>
          <input
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className="w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
          />
          <input
            type="password"
            value={emailPasswordValue}
            onChange={(e) => setEmailPasswordValue(e.target.value)}
            placeholder="Contraseña actual"
            autoComplete="current-password"
            className="mt-3 w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
          />
          <p className="mt-2 text-xs text-ink-muted">
            Para cambiar el email te pediremos confirmar tu contraseña actual y
            verificar el nuevo correo.
          </p>
          {emailError && (
            <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {emailError}
            </div>
          )}
          {emailFeedback && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {emailFeedback}
            </div>
          )}
          <button
            onClick={handleChangeEmail}
            disabled={
              isSavingEmail ||
              profileLoading ||
              emailValue.trim().toLowerCase() ===
                (email || "").trim().toLowerCase()
            }
            className="mt-4 w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {isSavingEmail ? "ENVIANDO..." : "CAMBIAR EMAIL"}
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-line-subtle bg-shell-subtle p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
            Contraseña
          </p>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPasswordValue}
              onChange={(e) => setCurrentPasswordValue(e.target.value)}
              placeholder="Contraseña actual"
              autoComplete="current-password"
              className="w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
            />
            <input
              type="password"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
              className="w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
            />
            <input
              type="password"
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              autoComplete="new-password"
              className="w-full rounded-2xl border-2 border-transparent bg-shell p-4 text-sm text-ink-strong outline-none transition-all focus:border-brand"
            />
          </div>
          {passwordError && (
            <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {passwordError}
            </div>
          )}
          {passwordFeedback && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {passwordFeedback}
            </div>
          )}
          <button
            onClick={handleChangePassword}
            disabled={isSavingPassword || profileLoading}
            className="mt-4 w-full rounded-2xl bg-action py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {isSavingPassword ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
          </button>
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
