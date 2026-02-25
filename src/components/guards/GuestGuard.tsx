import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from 'src/context/auth-context';

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default GuestGuard;
