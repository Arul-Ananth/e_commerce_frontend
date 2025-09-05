import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ApiService from "../api/ApiService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      ApiService.setAuthToken(token);
    } else {
      ApiService.clearAuthToken();
    }
  }, [token]);

  const isAuthenticated = !!token;

  const login = useCallback(async (credentials) => {
    // credentials: { email, password }
    const { token: newToken, user: userInfo } = await ApiService.login(credentials);
    setToken(newToken);
    setUser(userInfo ?? null);
    localStorage.setItem("auth_token", newToken);
    if (userInfo) localStorage.setItem("auth_user", JSON.stringify(userInfo));
    ApiService.setAuthToken(newToken);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    ApiService.clearAuthToken();
  }, []);

  const value = useMemo(() => ({ isAuthenticated, user, login, logout }), [isAuthenticated, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}