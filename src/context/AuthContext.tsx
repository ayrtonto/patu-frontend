"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Definimos la estructura del usuario según tu base de datos
interface User {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  telefono: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void; // 1. Agregado al "contrato" de TypeScript
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("patu_token");
    const storedUser = localStorage.getItem("patu_user");
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("patu_token", token);
    localStorage.setItem("patu_user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("patu_token");
    localStorage.removeItem("patu_user");
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("patu_user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    // 2. Agregado 'updateUser' al objeto value que se provee a la app
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};