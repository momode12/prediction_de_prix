import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Button, PasswordInput } from "@/components/ui";
import { Navbar } from "@/components/layout";
import { UpdateProfilePayload, ChangePasswordPayload } from "@/types";

// ════════════════════════════════════════
// TYPES LOCAUX
// ════════════════════════════════════════
type ProfileForm = UpdateProfilePayload;
type ProfileErrors = Partial<ProfileForm>;

type PasswordForm = ChangePasswordPayload;

// ════════════════════════════════════════
// COMPOSANT SECTION
// ════════════════════════════════════════
const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="card shadow-sm">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
      <div
        className="w-9 h-9 bg-primary-50 rounded-lg
                      flex items-center justify-center text-primary-600"
      >
        {icon}
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

// ════════════════════════════════════════
// PAGE PROFIL
// ════════════════════════════════════════
const ProfilePage = () => {
  const {
    user,
    loading,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  } = useAuth();

  // ── Form profil
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    username: user?.username ?? "",
    email: user?.email ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  // ── Form password
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    old_password: "",
    new_password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<PasswordForm & { confirm_password: string }>
  >({});

  // ════════════════════════════════════════
  // VALIDATION PROFIL
  // ════════════════════════════════════════
  const validateProfile = (): boolean => {
    const errors: ProfileErrors = {};
    if (!profileForm.username)
      errors.username = "Le nom d'utilisateur est obligatoire.";
    else if ((profileForm.username?.length ?? 0) < 3)
      errors.username = "Minimum 3 caractères.";
    if (!profileForm.email) errors.email = "L'email est obligatoire.";
    else if (!/\S+@\S+\.\S+/.test(profileForm.email ?? ""))
      errors.email = "Email invalide.";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ════════════════════════════════════════
  // VALIDATION PASSWORD
  // ════════════════════════════════════════
  const validatePassword = (): boolean => {
    const errors: Partial<PasswordForm & { confirm_password: string }> = {};
    if (!passwordForm.old_password)
      errors.old_password = "L'ancien mot de passe est obligatoire.";
    if (!passwordForm.new_password)
      errors.new_password = "Le nouveau mot de passe est obligatoire.";
    else if (passwordForm.new_password.length < 6)
      errors.new_password = "Minimum 6 caractères.";
    if (!confirmPassword)
      errors.confirm_password = "Confirmez le nouveau mot de passe.";
    else if (passwordForm.new_password !== confirmPassword)
      errors.confirm_password = "Les mots de passe ne correspondent pas.";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleProfileSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!validateProfile()) return;
    await handleUpdateProfile(profileForm);
  };

  const handlePasswordSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!validatePassword()) return;
    await handleChangePassword(passwordForm);
    setPasswordForm({ old_password: "", new_password: "" });
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header page */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez vos informations personnelles et votre sécurité
          </p>
        </div>

        <div className="space-y-6">
          {/* ════════════════════════════════════════
              SECTION 1 — APERÇU COMPTE
          ════════════════════════════════════════ */}
          <div
            className="card shadow-sm bg-gradient-to-r
                          from-primary-600 to-primary-700 text-white border-0"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 bg-white/20 rounded-2xl
                              flex items-center justify-center flex-shrink-0"
              >
                <span className="text-white text-2xl font-bold uppercase">
                  {user?.username?.charAt(0) ?? "U"}
                </span>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{user?.username}</h2>
                <p className="text-primary-100 text-sm truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {user?.is_verified ? (
                    <>
                      <CheckCircle size={14} className="text-green-300" />
                      <span className="text-xs text-green-300 font-medium">
                        Email vérifié
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-yellow-300" />
                      <span className="text-xs text-yellow-300 font-medium">
                        Email non vérifié
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Badge */}
              <div
                className="hidden sm:flex items-center gap-1.5
                              bg-white/15 px-3 py-1.5 rounded-full"
              >
                <Shield size={14} />
                <span className="text-xs font-medium">Compte actif</span>
              </div>
            </div>

            {/* Dates */}
            <div
              className="mt-4 pt-4 border-t border-white/20
                            grid grid-cols-2 gap-4"
            >
              <div>
                <p className="text-xs text-primary-200">Membre depuis</p>
                <p className="text-sm font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-200">Dernière mise à jour</p>
                <p className="text-sm font-medium">
                  {user?.updated_at
                    ? new Date(user.updated_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              SECTION 2 — MODIFIER PROFIL
          ════════════════════════════════════════ */}
          <Section title="Informations personnelles" icon={<User size={18} />}>
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-4"
              noValidate
            >
              {/* Username uniquement */}
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
                    value={profileForm.username ?? ""}
                    onChange={handleProfileChange}
                    disabled={loading}
                    className={`input-field pl-9 ${
                      profileErrors.username
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />
                </div>
                {profileErrors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {profileErrors.username}
                  </p>
                )}
              </div>

              {/* Email — lecture seule */}
              <div>
                <label className="label">Adresse email</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2
                   text-gray-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="input-field pl-9 bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  L'adresse email ne peut pas être modifiée.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  size="md"
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Section>

          {/* ════════════════════════════════════════
              SECTION 3 — CHANGER MOT DE PASSE
          ════════════════════════════════════════ */}
          <Section title="Changer le mot de passe" icon={<Lock size={18} />}>
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
              noValidate
            >
              <PasswordInput
                id="old_password"
                name="old_password"
                value={passwordForm.old_password}
                onChange={handlePasswordChange}
                placeholder="Ancien mot de passe"
                label="Ancien mot de passe"
                error={passwordErrors.old_password}
                disabled={loading}
              />

              <PasswordInput
                id="new_password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                label="Nouveau mot de passe"
                error={passwordErrors.new_password}
                disabled={loading}
              />

              <PasswordInput
                id="confirm_new_password"
                name="confirm_new_password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordErrors((prev) => ({
                    ...prev,
                    confirm_password: undefined,
                  }));
                }}
                placeholder="Confirmer le nouveau mot de passe"
                label="Confirmer le mot de passe"
                error={passwordErrors.confirm_password}
                disabled={loading}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  size="md"
                >
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </form>
          </Section>

          {/* ════════════════════════════════════════
              SECTION 4 — ZONE DANGER
          ════════════════════════════════════════ */}
          <Section title="Zone de danger" icon={<Trash2 size={18} />}>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div
                className="flex flex-col sm:flex-row
                              sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Supprimer mon compte
                  </h3>
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                    Cette action est irréversible. Votre compte et toutes vos
                    prédictions seront définitivement supprimés.
                  </p>
                </div>
                <Button
                  variant="danger"
                  loading={loading}
                  onClick={handleDeleteAccount}
                  className="flex-shrink-0"
                >
                  <Trash2 size={15} />
                  Supprimer le compte
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
