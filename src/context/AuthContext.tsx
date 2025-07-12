import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { socket } from '../lib/socket';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and get user data
    // const token = localStorage.getItem('token');
    // if (token) {
    //   api.getMe().then((response) => {
    //     if (response.success && response.data) {
    //       setUser(response.data);
    //       socket.connect(token);
    //     } else {
    //       localStorage.removeItem('token');
    //     }
    //     setLoading(false);
    //   });
    // } else {
    //   setLoading(false);
    // }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      if (result.success && result.data) {
        const { token, data: userData } = result.data;
        localStorage.setItem("token", token);
        setUser(userData);
        socket.connect(token);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await api.register(email, password, name);
      if (result.success && result.data) {
        const { token, data: userData } = result.data;
        localStorage.setItem("token", token);
        setUser(userData);
        socket.connect(token);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    socket.disconnect();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};