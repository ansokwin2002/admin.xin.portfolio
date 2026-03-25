import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import React from 'react';
import { useAuth } from 'src/context/auth-context';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string; 
  budget: string;
  message: string;
  created_at: string;
}

export interface ContactContextProps {
  messages: ContactMessage[];
  todayCount: number;
  isLoading: boolean;
  fetchContacts: () => Promise<void>;
  error: string | null;
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
}

export const ContactContext = createContext<ContactContextProps | undefined>(undefined);

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const fetchContacts = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        const contactData = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);
        
        // Only update state if data actually changed to prevent unnecessary re-renders
        // A simple way is to check length and latest ID if they are sorted
        setMessages(contactData);
        
        const count = contactData.filter((msg: any) => isToday(msg.created_at)).length;
        setTodayCount(count);
        setError(null);
      } else {
        setError('Failed to fetch contacts');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch contacts', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    if (token) {
      fetchContacts();
      // Auto refresh every 5 seconds for "real-time" feel
      const interval = setInterval(fetchContacts, 5000);
      return () => clearInterval(interval);
    }
  }, [token, fetchContacts]);

  const value: ContactContextProps = {
    messages,
    todayCount,
    isLoading,
    fetchContacts,
    error,
    setMessages
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};
