import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User } from "@/types";
import { loginRequest, registerRequest, meRequest } from "@/api/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("hf_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("hf_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const freshUser = await meRequest();
      setUser(freshUser);
      localStorage.setItem("hf_user", JSON.stringify(freshUser));
    } catch {
      localStorage.removeItem("hf_token");
      localStorage.removeItem("hf_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { user: u, token } = await loginRequest(email, password);
    localStorage.setItem("hf_token", token);
    localStorage.setItem("hf_user", JSON.stringify(u));
    setUser(u);
  }

  async function register(name: string, email: string, password: string) {
    const { user: u, token } = await registerRequest(name, email, password);
    localStorage.setItem("hf_token", token);
    localStorage.setItem("hf_user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("hf_token");
    localStorage.removeItem("hf_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
