import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, fetchCurrentUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  loginAsGuest: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jsl_token');
    const guestFlag = sessionStorage.getItem('jsl_guest');

    if (token) {
      fetchCurrentUser()
        .then(u => { setUser(u); setIsGuest(false); })
        .catch(() => { localStorage.removeItem('jsl_token'); })
        .finally(() => setLoading(false));
    } else if (guestFlag) {
      setIsGuest(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('jsl_token', token);
    sessionStorage.removeItem('jsl_guest');
    setUser(userData);
    setIsGuest(false);
  };

  const loginAsGuest = () => {
    sessionStorage.setItem('jsl_guest', 'true');
    localStorage.removeItem('jsl_token');
    setUser(null);
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem('jsl_token');
    sessionStorage.removeItem('jsl_guest');
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoggedIn: !!user, login, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
