import { useState, ChangeEvent } from "react"
import { Link } from "react-router-dom"
import { Mail, User } from "lucide-react"
import useAuth from "@/hooks/useAuth"
import { Button, PasswordInput } from "@/components/ui"
import { RegisterPayload } from "@/types"

interface RegisterForm extends RegisterPayload {
  confirm_password: string
}

type RegisterErrors = Partial<RegisterForm>

const RegisterPage = () => {
  const { handleRegister, loading } = useAuth()

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  const [errors, setErrors] = useState<RegisterErrors>({})

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {}

    if (!form.username)
      newErrors.username = "Le nom d'utilisateur est obligatoire."
    else if (form.username.length < 3)
      newErrors.username = "Minimum 3 caractères."

    if (!form.email)
      newErrors.email = "L'email est obligatoire."
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email invalide."

    if (!form.password)
      newErrors.password = "Le mot de passe est obligatoire."
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 caractères."

    if (!form.confirm_password)
      newErrors.confirm_password = "Confirmez votre mot de passe."
    else if (form.password !== form.confirm_password)
      newErrors.confirm_password = "Les mots de passe ne correspondent pas."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    await handleRegister({
      username: form.username,
      email: form.email,
      password: form.password,
    })
  }

  const handleGoogle = () => {
    globalThis.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/google`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50
                    via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">I</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Immo<span className="text-primary-600">Mada</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Créez votre compte gratuitement
          </p>
        </div>

        {/* ── Card */}
        <div className="card shadow-xl border-0">

          {/* ── Bouton Google */}
          <button
            onClick={handleGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-3
                       border border-gray-300 rounded-lg px-4 py-2.5
                       text-sm font-medium text-gray-700
                       hover:bg-gray-50 transition-all duration-200 mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38
                   30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43
                   13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58
                   2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36
                   7.09-17.65z"/>
              <path fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59
                   l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56
                   10.78l7.97-6.19z"/>
              <path fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15
                   1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98
                   6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            S'inscrire avec Google
          </button>

          {/* ── Séparateur */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OU</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2
                             text-gray-400 pointer-events-none"
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="rakoto"
                  disabled={loading}
                  className={`input-field pl-9 ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2
                             text-gray-400 pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="rakoto@gmail.com"
                  disabled={loading}
                  className={`input-field pl-9 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <PasswordInput
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 caractères"
              label="Mot de passe"
              error={errors.password}
              disabled={loading}
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Confirmer le mot de passe"
              label="Confirmer le mot de passe"
              error={errors.confirm_password}
              disabled={loading}
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-2"
            >
              Créer mon compte
            </Button>
          </form>

          {/* ── Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-primary-600 font-medium hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage