import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PrivateRoute: React.FC = () => {
  const auth = useAuth() as any;
  const isLoading = auth?.isLoading ?? false;
  const isAuthenticated = auth?.isAuthenticated ?? false;

  if (isLoading) return <div className="container mt-5 text-center">Chargement...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};