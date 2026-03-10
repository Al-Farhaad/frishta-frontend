import React, { createContext, useContext, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    if (token) {
      await api("/auth/logout", { method: "POST", token });
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
