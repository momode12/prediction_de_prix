import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { PrivateRoute, PublicRoute } from "@/components/layout"
import { LoginPage, RegisterPage, VerifyEmailPage } from "@/pages/auth"
import { ProfilePage } from "@/pages/account"
import { PredictionPage } from "@/pages/predictions"
import { OAuthCallbackPage } from "@/pages/auth"
import { AdminPage } from "@/pages/admin"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Routes publiques (redirigent vers /predictions si connecté) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          </Route>

          {/* ── Vérification email (accessible sans auth) */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          {/* ── Routes privées (redirigent vers /login si non connecté) */}
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/predictions" element={<PredictionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* ── Redirect racine */}
          <Route path="/" element={<Navigate to="/predictions" replace />} />

          {/* ── 404 */}
          <Route path="*" element={<Navigate to="/predictions" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRouter