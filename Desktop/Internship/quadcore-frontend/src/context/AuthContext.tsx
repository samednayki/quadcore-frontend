import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LoginRequest {
  agency: string;
  user: string;
  password: string;
}

interface UserInfo {
  id: string;
  code: string;
  name: string;
  email?: string;
  // ... diğer gerekli alanlar (gerekirse genişlet)
}

interface AuthContextType {
  token: string | null;
  userInfo: UserInfo | null;
  loading: boolean;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_URL = 'http://localhost:8080/auth/login';
const LOGIN_BODY: LoginRequest = {
  agency: 'internship',
  user: 'internship',
  password: '@San2025',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(LOGIN_BODY),
      });
      const data = await response.json();
      setToken(data.body?.token || null);
      setUserInfo(data.body?.userInfo || null);
      if (data.body?.token) {
        console.log('Login successfully');
        console.log('Token:', data.body.token);
      }
    } catch (error) {
      setToken(null);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    login(); // Her zaman yeni token al
  }, []);

  useEffect(() => {
    // Token değiştiğinde localStorage'a kaydet
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, userInfo, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export {};
