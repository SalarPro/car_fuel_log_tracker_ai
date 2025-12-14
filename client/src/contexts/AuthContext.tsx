import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserSettings } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userSettings: UserSettings | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setUserSettings({
            currency: data.currency || 'IQD',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          // Create default settings
          const now = new Date();
          await setDoc(settingsRef, {
            currency: 'IQD',
            createdAt: Timestamp.fromDate(now),
            updatedAt: Timestamp.fromDate(now),
          });
          setUserSettings({
            currency: 'IQD',
            createdAt: now,
            updatedAt: now,
          });
        }
      } else {
        setUserSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document with default settings
    const settingsRef = doc(db, 'users', userCredential.user.uid, 'settings', 'preferences');
    const now = new Date();
    await setDoc(settingsRef, {
      currency: 'IQD',
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserSettings(null);
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) return;
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    const now = new Date();
    const updatedSettings = {
      ...userSettings,
      ...settings,
      updatedAt: now,
    };
    // Write to Firestore with Timestamp
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.fromDate(now),
    }, { merge: true });
    setUserSettings(updatedSettings as UserSettings);
  };

  return (
    <AuthContext.Provider value={{ user, userSettings, loading, signIn, signUp, signOut, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
