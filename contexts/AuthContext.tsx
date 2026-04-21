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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (!user) {
        setAppUser(null);
        setProfileLoading(false);
        return;
      }

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

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
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

    return credentials;
  };

  const saveUserPhone = async (userPhone: string) => {
    if (!currentUser?.uid) {
      throw new Error("AUTH_REQUIRED");
    }

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        uid: currentUser.uid,
        email: currentUser.email || appUser?.email || "",
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
