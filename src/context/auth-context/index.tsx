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
  verifyPassword: (password: string) => Promise<boolean>;
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
    // Try to load user from localStorage if it exists
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setUser({ name: 'Admin', email: storedEmail });
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'access_token') {
        if (!event.newValue) {
          // Token was removed (Logout)
          setToken(null);
          setUser(null);
          toast.info('Session ended in another tab.');
          navigate('/admin/auth/login');
        } else {
          // Token was added (Login)
          setToken(event.newValue);
          const newEmail = localStorage.getItem('user_email');
          if (newEmail) setUser({ name: 'Admin', email: newEmail });
          toast.success('You have logged in from another tab.');
          navigate('/admin');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    if (token) {
      // Here you could fetch the user info if needed
      // setUser(fetchUser());
    }
    setIsLoading(false);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
        localStorage.setItem('user_email', email);
        setUser({ name: 'Admin', email });
        toast.success('Login successful! Welcome back.');
        navigate('/admin');
      } else {
        const errorMsg = data.message || 'Login failed';
        // We throw the message so AuthLogin can handle it (show as inline error)
        throw new Error(errorMsg);
      }
    } catch (error: any) {
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
        localStorage.setItem('user_email', email);
        setUser({ name, email });
        toast.success('Registration successful! Account created.');
        navigate('/admin');
      } else {
        const errorMsg = data.message || 'Registration failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    const email = user?.email || localStorage.getItem('user_email') || 'admin@info.com';
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha_token: 'verified' }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    toast.info('You have been logged out.');
    navigate('/admin/auth/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, register, verifyPassword, logout, isLoading }}>
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
