import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User, UserCredential } from "firebase/auth";
import type { AppUser } from "../types";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth, db, doc, onSnapshot, setDoc } from "../firebase";

interface AuthContextValue {
  currentUser: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    documentId: string;
    userPhone?: string;
  }) => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  saveUserProfile: (payload: {
    fullName: string;
    documentId: string;
    userPhone: string;
  }) => Promise<void>;
  changeUserEmail: (payload: {
    newEmail: string;
    currentPassword: string;
  }) => Promise<void>;
  changeUserPassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (!user) {
        setCurrentUser(null);
        setAppUser(null);
        setProfileLoading(false);
        return;
      }

      if (!user.emailVerified) {
        // No llamamos signOut aquí para evitar una race condition con register():
        // register() crea el doc en Firestore y luego hace signOut por sí mismo.
        // Si hacemos signOut aquí concurrentemente, el setDoc falla por permission-denied
        // y la promesa de register() queda colgada.
        setCurrentUser(null);
        setAppUser(null);
        setProfileLoading(false);
        return;
      }

      setCurrentUser(user);

      setProfileLoading(true);

      unsubscribeProfile = onSnapshot(
        doc(db, "users", user.uid),
        (userSnapshot) => {
          if (userSnapshot.exists()) {
            const profileData = {
              uid: user.uid,
              ...userSnapshot.data(),
            } as AppUser;

            setAppUser(profileData);

            if (user.email && profileData.email !== user.email) {
              void setDoc(
                doc(db, "users", user.uid),
                { email: user.email },
                { merge: true },
              ).catch((syncError) => {
                console.error(
                  "Error syncing auth email to profile:",
                  syncError,
                );
              });
            }
          } else {
            setAppUser(null);
          }
          setProfileLoading(false);
        },
        (error) => {
          console.error("Error loading user profile:", error);
          setAppUser(null);
          setProfileLoading(false);
        },
      );
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);

    if (!credentials.user.emailVerified) {
      await signOut(auth);

      const verificationError = new Error("EMAIL_NOT_VERIFIED") as Error & {
        code?: string;
      };
      verificationError.code = "auth/email-not-verified";
      throw verificationError;
    }

    return credentials;
  };

  const resendVerificationEmail = async (email: string, password: string) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);

    if (!credentials.user.emailVerified) {
      await sendEmailVerification(credentials.user);
    }

    await signOut(auth);
  };

  const register = async ({
    email,
    password,
    fullName,
    documentId,
    userPhone = "",
  }: {
    email: string;
    password: string;
    fullName: string;
    documentId: string;
    userPhone?: string;
  }) => {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await setDoc(doc(db, "users", credentials.user.uid), {
      uid: credentials.user.uid,
      email: credentials.user.email || email,
      role: "client",
      fullName: fullName.trim(),
      documentId: documentId.trim(),
      userPhone: userPhone.trim(),
      createdAt: new Date().toISOString(),
    });

    await sendEmailVerification(credentials.user);
    await signOut(auth);

    return credentials;
  };

  const getAuthenticatedUser = () => {
    const authenticatedUser = auth.currentUser;

    if (!currentUser?.uid || !authenticatedUser?.uid) {
      throw new Error("AUTH_REQUIRED");
    }

    if (currentUser.uid !== authenticatedUser.uid) {
      throw new Error("AUTH_STATE_MISMATCH");
    }

    return authenticatedUser;
  };

  const saveUserProfile = async ({
    fullName,
    documentId,
    userPhone,
  }: {
    fullName: string;
    documentId: string;
    userPhone: string;
  }) => {
    const authenticatedUser = getAuthenticatedUser();

    await setDoc(
      doc(db, "users", authenticatedUser.uid),
      {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email || appUser?.email || "",
        role: appUser?.role || "client",
        fullName: fullName.trim(),
        documentId: documentId.trim(),
        userPhone: userPhone.trim(),
      },
      { merge: true },
    );
  };

  const reauthenticateUser = async (currentPassword: string) => {
    const authenticatedUser = getAuthenticatedUser();
    const email = authenticatedUser.email;

    if (!email) {
      throw new Error("AUTH_EMAIL_MISSING");
    }

    const credential = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(authenticatedUser, credential);

    return authenticatedUser;
  };

  const changeUserEmail = async ({
    newEmail,
    currentPassword,
  }: {
    newEmail: string;
    currentPassword: string;
  }) => {
    const authenticatedUser = await reauthenticateUser(currentPassword);
    await verifyBeforeUpdateEmail(authenticatedUser, newEmail.trim());
  };

  const changeUserPassword = async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const authenticatedUser = await reauthenticateUser(currentPassword);
    await firebaseUpdatePassword(authenticatedUser, newPassword);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = useMemo(
    () => ({
      currentUser,
      appUser,
      isAdmin: appUser?.role === "admin",
      loading,
      profileLoading,
      login,
      resendVerificationEmail,
      register,
      resetPassword,
      saveUserProfile,
      changeUserEmail,
      changeUserPassword,
      logout,
    }),
    [appUser, currentUser, loading, profileLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
