'use client';

import React, { createContext, useEffect, useState } from 'react';

interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: Record<string, any>;
}

interface AuthContextValue {
  user: IUser | null;
  token: string | null;
  login: (user: IUser, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUser = window.localStorage.getItem('user');
    const storedToken = window.localStorage.getItem('token') || window.localStorage.getItem('accessToken');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (user: IUser, token: string) => {
    setUser(user);
    setToken(token);
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('accessToken', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem('airswift_user');
    window.localStorage.removeItem('airswift_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};