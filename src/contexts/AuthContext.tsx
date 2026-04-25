import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const authStorageKey = "i9tmg-calculus-auth-session";

const adminUser: AuthUser = {
  username: "adminadmin",
  name: "Administrador i9TMG",
  role: "admin",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession());

  const login = (username: string, password: string) => {
    // Autenticação apenas demonstrativa. Para produção, migrar autenticação para backend com hash de senha e JWT seguro.
    const normalizedUsername = username.trim();
    const validAdminPassword = password === "77$3ekX#" || password === "admin";

    if (normalizedUsername === adminUser.username && validAdminPassword) {
      setUser(adminUser);
      window.localStorage.setItem(authStorageKey, JSON.stringify(adminUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(authStorageKey);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

function readSession() {
  try {
    const raw = window.localStorage.getItem(authStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed.username && parsed.role) return parsed;
  } catch {
    return null;
  }

  return null;
}
