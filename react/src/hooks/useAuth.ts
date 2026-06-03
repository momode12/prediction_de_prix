import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { useAuthContext } from "@/context/AuthContext"
import AuthService from "@/services/auth.service"
import {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/types"

// ════════════════════════════════════════
// SWEETALERT2 CONFIG GLOBALE
// ════════════════════════════════════════
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, register, logout, updateUser, clearAuth } =
    useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // ════════════════════════════════════════
  // REGISTER
  // ════════════════════════════════════════
const handleRegister = async (payload: RegisterPayload) => {
    setLoading(true)
    try {
        await register(payload)
        // ── Stocker email pour resend
        sessionStorage.setItem("pending_email", payload.email)
        navigate("/verify-email")
    } catch (error: any) {
        const msg =
            error?.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(" ")
                : error?.response?.data?.message ?? "Erreur lors de l'inscription."
        Toast.fire({ icon: "error", title: msg })
    } finally {
        setLoading(false)
    }
}

  // ════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════
  const handleLogin = async (payload: LoginPayload) => {
    setLoading(true)
    try {
      await login(payload)
      Toast.fire({ icon: "success", title: "Connexion réussie !" })
      navigate("/predictions")
    } catch (error: any) {
      if (error?.message === "EMAIL_NOT_VERIFIED") {
        Swal.fire({
          icon: "warning",
          title: "Email non vérifié",
          text: "Veuillez vérifier votre adresse email avant de vous connecter.",
          confirmButtonText: "Renvoyer l'email",
          confirmButtonColor: "#0284c7",
          showCancelButton: true,
          cancelButtonText: "Fermer",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await AuthService.resendVerification()
              Toast.fire({
                icon: "success",
                title: "Email de vérification renvoyé !",
              })
            } catch {
              Toast.fire({ icon: "error", title: "Erreur lors de l'envoi." })
            }
          }
        })
        return
      }

      const msg =
        error?.response?.data?.message ?? "Email ou mot de passe incorrect."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  // ════════════════════════════════════════
  // LOGOUT
  // ════════════════════════════════════════
  const handleLogout = () => {
    Swal.fire({
      title: "Déconnexion",
      text: "Voulez-vous vraiment vous déconnecter ?",
      icon: "question",
      confirmButtonText: "Oui, déconnecter",
      confirmButtonColor: "#0284c7",
      showCancelButton: true,
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        navigate("/login")
        Toast.fire({ icon: "success", title: "Déconnecté avec succès." })
      }
    })
  }

  // ════════════════════════════════════════
  // UPDATE PROFIL
  // ════════════════════════════════════════
  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    setLoading(true)
    try {
      const data = await AuthService.updateProfile(payload)
      updateUser(data.user)
      Toast.fire({ icon: "success", title: "Profil mis à jour !" })
    } catch (error: any) {
      const msg =
        error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(" ")
          : error?.response?.data?.message ?? "Erreur lors de la mise à jour."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  // ════════════════════════════════════════
  // CHANGE PASSWORD
  // ════════════════════════════════════════
  const handleChangePassword = async (payload: ChangePasswordPayload) => {
    setLoading(true)
    try {
      await AuthService.changePassword(payload)
      Toast.fire({ icon: "success", title: "Mot de passe mis à jour !" })
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Erreur lors du changement."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  // ════════════════════════════════════════
  // DELETE COMPTE
  // ════════════════════════════════════════
  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Supprimer le compte ?",
      text: "Cette action est irréversible. Toutes vos données seront supprimées.",
      icon: "warning",
      confirmButtonText: "Oui, supprimer",
      confirmButtonColor: "#dc2626",
      showCancelButton: true,
      cancelButtonText: "Annuler",
    })

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      await AuthService.deleteAccount()
      clearAuth()
      navigate("/login")
      Toast.fire({ icon: "success", title: "Compte supprimé définitivement." })
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Erreur lors de la suppression."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  // ════════════════════════════════════════
  // RESEND VERIFICATION
  // ════════════════════════════════════════
const handleResendVerification = async () => {
    setLoading(true)
    try {
        const email = sessionStorage.getItem("pending_email") ?? undefined
        await AuthService.resendVerification(email)
        Toast.fire({
            icon: "success",
            title: "Email de vérification renvoyé !",
        })
    } catch (error: any) {
        const msg =
            error?.response?.data?.message ?? "Erreur lors de l'envoi."
        Toast.fire({ icon: "error", title: msg })
    } finally {
        setLoading(false)
    }
}

  return {
    user,
    isAuthenticated,
    isLoading,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
    handleResendVerification,
  }
}

export default useAuth