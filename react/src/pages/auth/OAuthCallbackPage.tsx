import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { TOKEN_KEYS } from "@/types"
import { useAuthContext } from "@/context/AuthContext"

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updateUser } = useAuthContext()

  useEffect(() => {
    const access_token = searchParams.get("access_token")
    const refresh_token = searchParams.get("refresh_token")
    const userRaw = searchParams.get("user")
    const error = searchParams.get("error")

    if (error) {
      navigate(`/login?error=${error}`)
      return
    }

    if (!access_token || !refresh_token || !userRaw) {
      navigate("/login")
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw))

      // ── Stocker les tokens
      localStorage.setItem(TOKEN_KEYS.ACCESS, access_token)
      localStorage.setItem(TOKEN_KEYS.REFRESH, refresh_token)
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user))

      // ── Mettre à jour le context
      updateUser(user)

      // ── Rediriger
      navigate("/predictions", { replace: true })
    } catch {
      navigate("/login")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50
                    via-white to-primary-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2
          size={48}
          className="animate-spin text-primary-600 mx-auto mb-4"
        />
        <p className="text-gray-600 font-medium">
          Connexion en cours...
        </p>
      </div>
    </div>
  )
}

export default OAuthCallbackPage