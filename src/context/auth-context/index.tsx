import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

interface User {
  id?: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string, captcha_token: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string, captcha_token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Here you could fetch the user info if needed
      // setUser(fetchUser());
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email: string, password: string, captcha_token: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha_token }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
        toast.success('Login successful! Welcome back.');
        navigate('/');
      } else {
        const errorMsg = data.message || 'Login failed';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      if (!error.message.includes('Login failed')) {
        toast.error('Network error or server is down');
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string, captcha_token: string) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation, captcha_token }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
        toast.success('Registration successful! Account created.');
        navigate('/');
      } else {
        const errorMsg = data.message || 'Registration failed';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      if (!error.message.includes('Registration failed')) {
        toast.error('Network error or server is down');
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    toast.info('You have been logged out.');
    navigate('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
