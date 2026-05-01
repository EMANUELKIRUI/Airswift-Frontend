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
    const storedUser = typeof window !== 'undefined' ? window.localStorage.getItem('airswift_user') : null;
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('airswift_token') : null;

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
    window.localStorage.setItem('airswift_user', JSON.stringify(user));
    window.localStorage.setItem('airswift_token', token);
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