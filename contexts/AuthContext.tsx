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
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db, doc, getDoc, setDoc } from "../firebase";

interface AuthContextValue {
  currentUser: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (!user) {
        setAppUser(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));

        if (userSnapshot.exists()) {
          setAppUser({ uid: user.uid, ...userSnapshot.data() } as AppUser);
        } else {
          setAppUser(null);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setAppUser(null);
      } finally {
        setProfileLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await setDoc(doc(db, "users", credentials.user.uid), {
      uid: credentials.user.uid,
      email: credentials.user.email || email,
      role: "client",
      createdAt: new Date().toISOString(),
    });

    return credentials;
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
