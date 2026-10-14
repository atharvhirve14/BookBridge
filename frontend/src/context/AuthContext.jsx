import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { errorMessage, getToken, setToken } from "@/lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user ?? null);
    } catch (err) {
      // A rejected token means the session is over; a network error keeps the token for later.
      if (err?.response?.status === 401) setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(errorMessage(err, "Login failed."));
    }
  }, []);
  const register = useCallback(async (input) => {
    try {
      const { data } = await api.post("/auth/register", input);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(errorMessage(err, "Registration failed."));
    }
  }, []);
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
