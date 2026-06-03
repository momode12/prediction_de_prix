import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react"
import { User, LoginPayload, RegisterPayload, TOKEN_KEYS } from "@/types"
import AuthService from "@/services/auth.service"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // ── Fonction pour vider l’authentification
  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS)
    localStorage.removeItem(TOKEN_KEYS.REFRESH)
    localStorage.removeItem(TOKEN_KEYS.USER)
    setUser(null)
  }, [])

  // ── Hydratation depuis localStorage
  useEffect(() => {
    const hydrateAuth = () => {
      const stored = localStorage.getItem(TOKEN_KEYS.USER)
      const token = localStorage.getItem(TOKEN_KEYS.ACCESS)

      if (stored && token) {
        try {
          const parsed = JSON.parse(stored)
          setUser(parsed) // OK car appelé dans une fonction
        } catch {
          clearAuth()
        }
      }
      setIsLoading(false)
    }

    hydrateAuth()
  }, [clearAuth])

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await AuthService.login(payload)
    if (!data.user.is_verified) {
      throw new Error("EMAIL_NOT_VERIFIED")
    }
    setUser(data.user)
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(data.user))
    localStorage.setItem(TOKEN_KEYS.ACCESS, data.access_token)
    localStorage.setItem(TOKEN_KEYS.REFRESH, data.refresh_token)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await AuthService.register(payload)
  }, [])

  const logout = useCallback(() => {
    AuthService.logout()
    clearAuth()
  }, [clearAuth])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(updatedUser))
  }, [])

  // ── useMemo pour éviter le re-render du context à chaque render
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      clearAuth,
    }),
    [user, isLoading, login, register, logout, updateUser, clearAuth]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext doit être utilisé dans AuthProvider")
  }
  return context
}
