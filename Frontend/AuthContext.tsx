import React, { createContext, useState, ReactNode } from 'react';
import { AuthResponseDto } from './types';
import * as api from './services/api';

interface AuthContextType {
  user: AuthResponseDto | null;
  setUser?: (user: AuthResponseDto | null) => void;
  login: (email: string, pass: string) => Promise<AuthResponseDto | null>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<AuthResponseDto | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: undefined,
  login: async () => null,
  logout: () => {},
  register: async () => null,
});

const STORAGE_KEY = "smartfix_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponseDto | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const saveUser = (userData: AuthResponseDto) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const updateUser = (userData: AuthResponseDto | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('token');
  };

  const login = async (email: string, pass: string) => {
    try {
      const data = await api.login(email, pass);
      if (data) saveUser(data);
      return data;
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const data = await api.register(name, email, pass);
      if (data) saveUser(data);
      return data;
    } catch (err) {
      console.error("Register error:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};