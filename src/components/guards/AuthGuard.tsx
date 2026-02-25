import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from 'src/context/auth-context';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth/auth2/login" />;
  }

  return <>{children}</>;
};

export default AuthGuard;
