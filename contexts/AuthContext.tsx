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
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
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
  register: (
    email: string,
    password: string,
    userPhone?: string,
  ) => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  saveUserPhone: (userPhone: string) => Promise<void>;
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
        setCurrentUser(null);
        setAppUser(null);
        setProfileLoading(false);

        try {
          await signOut(auth);
        } catch (error) {
          console.error("Error signing out unverified user:", error);
        }

        return;
      }

      setCurrentUser(user);

      setProfileLoading(true);

      unsubscribeProfile = onSnapshot(
        doc(db, "users", user.uid),
        (userSnapshot) => {
          if (userSnapshot.exists()) {
            setAppUser({ uid: user.uid, ...userSnapshot.data() } as AppUser);
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
      await sendEmailVerification(credentials.user);
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

  const register = async (email: string, password: string, userPhone = "") => {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await setDoc(doc(db, "users", credentials.user.uid), {
      uid: credentials.user.uid,
      email: credentials.user.email || email,
      role: "client",
      userPhone: userPhone.trim(),
      createdAt: new Date().toISOString(),
    });

    await sendEmailVerification(credentials.user);
    await signOut(auth);

    return credentials;
  };

  const saveUserPhone = async (userPhone: string) => {
    const authenticatedUser = auth.currentUser;

    if (!currentUser?.uid || !authenticatedUser?.uid) {
      throw new Error("AUTH_REQUIRED");
    }

    if (currentUser.uid !== authenticatedUser.uid) {
      throw new Error("AUTH_STATE_MISMATCH");
    }

    await setDoc(
      doc(db, "users", authenticatedUser.uid),
      {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email || appUser?.email || "",
        role: appUser?.role || "client",
        userPhone: userPhone.trim(),
      },
      { merge: true },
    );
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
      saveUserPhone,
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
