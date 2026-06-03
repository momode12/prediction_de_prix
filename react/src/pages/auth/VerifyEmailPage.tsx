import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom"
import { MailCheck, MailX, Loader2 } from "lucide-react"
import AuthService from "@/services/auth.service"
import useAuth from "@/hooks/useAuth"
import { Button } from "@/components/ui"

const VerifyEmailPage = () => {
  const { token } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleResendVerification, loading } = useAuth()

  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const isVerifiedParam = searchParams.get("verified") === "true"

// ── État initialisé depuis l'URL directement


useEffect(() => {
  // ── Cas 1 : vient du lien email avec ?verified=true
  if (isVerifiedParam) {
    setTimeout(() => navigate("/login"), 3000)
    return
  }

  // ── Cas 2 : erreur dans l'URL
  if (searchParams.get("error")) return

  // ── Cas 3 : token dans URL → vérifier via API
  if (token) {
    const verify = async () => {
      setVerifying(true)
      try {
        await AuthService.verifyEmail(token)
        setVerified(true)
        setTimeout(() => navigate("/login"), 3000)
      } catch (err: any) {
        setVerified(false)
        setErrorMsg(
          err?.response?.data?.message ?? "Lien invalide ou expiré."
        )
      } finally {
        setVerifying(false)
      }
    }
    verify()
  }
}, [token])

  // ════════════════════════════════════════
  // LOADING
  // ════════════════════════════════════════
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50
                      via-white to-primary-50 flex items-center justify-center p-4">
        <div className="card shadow-xl border-0 w-full max-w-md text-center">
          <Loader2
            size={48}
            className="animate-spin text-primary-600 mx-auto mb-4"
          />
          <h2 className="text-lg font-semibold text-gray-900">
            Vérification en cours...
          </h2>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // SUCCÈS
  // ════════════════════════════════════════
  if (verified === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50
                      via-white to-primary-50 flex items-center justify-center p-4">
        <div className="card shadow-xl border-0 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full
                          flex items-center justify-center mx-auto mb-6">
            <MailCheck size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email vérifié !
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            Votre compte est maintenant actif.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            Redirection automatique vers le login dans 3 secondes...
          </p>
          <Link to="/login">
            <Button variant="primary" fullWidth size="lg">
              Aller au login maintenant
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // ERREUR LIEN
  // ════════════════════════════════════════
  if (verified === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50
                      via-white to-primary-50 flex items-center justify-center p-4">
        <div className="card shadow-xl border-0 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full
                          flex items-center justify-center mx-auto mb-6">
            <MailX size={40} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lien invalide
          </h1>
          <p className="text-gray-500 text-sm mb-8">{errorMsg}</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              fullWidth
              loading={loading}
              onClick={handleResendVerification}
            >
              Renvoyer l'email de vérification
            </Button>
            <Link to="/login">
              <Button variant="secondary" fullWidth>
                Retour au login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // PAGE ATTENTE (après inscription, pas de token)
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50
                    via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card shadow-xl border-0 text-center">

          <div className="w-20 h-20 bg-primary-50 rounded-full
                          flex items-center justify-center mx-auto mb-6">
            <MailCheck size={40} className="text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérifiez votre email
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Un email de confirmation vous a été envoyé.
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>

          {/* Étapes */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
            {[
              "Ouvrez votre boîte email",
              "Cherchez un email de ImmoMada",
              "Cliquez sur le bouton de vérification",
              "Connectez-vous à votre compte",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-600 rounded-full
                                flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-600">{step}</span>
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            fullWidth
            loading={loading}
            onClick={handleResendVerification}
            className="mb-3"
          >
            Renvoyer l'email
          </Button>

          <Link to="/login">
            <Button variant="ghost" fullWidth>
              Retour au login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage