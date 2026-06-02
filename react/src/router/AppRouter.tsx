import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PrivateRoute } from '../components/layout/PrivateRoute';
import { PublicRoute } from '../components/layout/PublicRoute';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { ProfilePage } from '../pages/account/ProfilePage';
import { PredictForm } from '../pages/predictions/PredictForm';
import { PredictionList } from '../pages/predictions/PredictionList';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Routes Publiques */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route path="/auth/verify/:token" element={<VerifyEmailPage />} />

        {/* Routes Privées */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/predictions" replace />} />
          <Route path="/predictions" element={<PredictionList />} />
          <Route path="/predictions/new" element={<PredictForm />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};