import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import {
  type CurrentUser,
  login as apiLogin,
  logout as apiLogout,
  fetchCurrentUser,
} from '@/lib/authService';
import { onAuthFailure } from '@/lib/apiClient';
import { isAuthenticated } from '@/lib/authService';

type AuthContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const unsubscribe = onAuthFailure(() => {
      setUser(null);
    });
    return unsubscribe;
  }, [loadUser]);

  const login = useCallback(async (username: string, password: string) => {
    const me = await apiLogin(username, password);
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    isSuperAdmin: user?.isSuperuser ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthLoadingScreen() {
  return (
    <div className="h-screen bg-bg-base flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-brand-primary/15 ring-1 ring-brand-primary/40 flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-brand-primary" />
      </div>
      <div className="flex items-center gap-2 text-ink-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading session…
      </div>
    </div>
  );
}
