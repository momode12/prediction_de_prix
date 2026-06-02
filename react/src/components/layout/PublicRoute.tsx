import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="container mt-5 text-center">Chaîrgement...</div>;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/predictions" replace />;
};