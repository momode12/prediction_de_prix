import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Navbar } from "@/components/layout";
import {
  Users,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui";
import api from "@/lib/api";
import Swal from "sweetalert2";

// ════════════════════════════════════════
// ⚠️ ADMIN USERNAME — changer par le tien
// ════════════════════════════════════════
const ADMIN_USERNAME = "heritiana_julien";

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════
interface AdminUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const AdminPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Bloquer si pas admin
  // ── Bloquer si pas admin + charger les users
  useEffect(() => {
    if (!user) return;

    if (user.username !== ADMIN_USERNAME) {
      navigate("/predictions", { replace: true });
      return;
    }

    // ── Admin confirmé → charger les users
    const load = async () => {
      setFetching(true);
      try {
        const { data } = await api.get("/auth/admin/users");
        setUsers(data.users ?? []);
      } catch {
        Toast.fire({ icon: "error", title: "Erreur lors du chargement." });
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [user]);

  // ── Charger les users
  const fetchUsers = async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/auth/admin/users");
      setUsers(data.users ?? []);
    } catch {
      Toast.fire({ icon: "error", title: "Erreur lors du chargement." });
    } finally {
      setFetching(false);
    }
  };

  // ── Supprimer un user
  const handleDelete = async (userId: string, username: string) => {
    const result = await Swal.fire({
      title: `Supprimer ${username} ?`,
      text: "Toutes ses données seront supprimées définitivement.",
      icon: "warning",
      confirmButtonText: "Oui, supprimer",
      confirmButtonColor: "#dc2626",
      showCancelButton: true,
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await api.delete(`/auth/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      Toast.fire({ icon: "success", title: "Utilisateur supprimé." });
    } catch {
      Toast.fire({ icon: "error", title: "Erreur lors de la suppression." });
    } finally {
      setLoading(false);
    }
  };

  // ── Filtrage
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  if (user?.username !== ADMIN_USERNAME) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center
                        sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-primary-600 rounded-xl
                            flex items-center justify-center"
            >
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Administration
              </h1>
              <p className="text-gray-500 text-sm">
                {users.length} utilisateur{users.length > 1 ? "s" : ""}{" "}
                enregistré
                {users.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            disabled={fetching}
          >
            <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
            Actualiser
          </Button>
        </div>

        {/* ── Barre de recherche */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2
                       text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par username ou email..."
            className="input-field pl-9 max-w-md"
          />
        </div>

        {/* ── Skeleton */}
        {fetching && (
          <div className="space-y-3">
            {["s1", "s2", "s3"].map((k) => (
              <div key={k} className="card animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table users */}
        {!fetching && (
          <div className="card shadow-sm overflow-hidden p-0">
            {/* Header table */}
            <div
              className="grid grid-cols-12 gap-4 px-6 py-3
                            bg-gray-50 border-b border-gray-100
                            text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              <div className="col-span-1">#</div>
              <div className="col-span-3">Utilisateur</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-1">Vérifié</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Users size={36} className="text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">
                  Aucun utilisateur trouvé
                </p>
              </div>
            )}

            {filtered.map((u, index) => (
              <div
                key={u.id}
                className={`
                  grid grid-cols-12 gap-4 px-6 py-4 items-center
                  border-b border-gray-50 last:border-0
                  hover:bg-gray-50 transition-colors duration-150
                  ${u.username === ADMIN_USERNAME ? "bg-primary-50/30" : ""}
                `}
              >
                {/* Index */}
                <div className="col-span-1">
                  <span className="text-xs text-gray-400 font-mono">
                    {index + 1}
                  </span>
                </div>

                {/* Avatar + username */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div
                    className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    flex-shrink-0 text-white text-sm font-bold uppercase
                    ${
                      u.username === ADMIN_USERNAME
                        ? "bg-primary-600"
                        : "bg-gray-400"
                    }
                  `}
                  >
                    {u.username.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.username}
                    </p>
                    {u.username === ADMIN_USERNAME && (
                      <span className="text-xs text-primary-600 font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-4 min-w-0">
                  <p className="text-sm text-gray-600 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Actif */}
                <div className="col-span-2">
                  <span
                    className={`
                    inline-flex items-center gap-1 px-2 py-1
                    rounded-full text-xs font-medium
                    ${
                      u.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                  >
                    {u.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Vérifié */}
                <div className="col-span-1">
                  {u.is_verified ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : (
                    <XCircle size={18} className="text-gray-300" />
                  )}
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                  {u.username !== ADMIN_USERNAME && (
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={loading}
                      className="p-2 rounded-lg text-gray-400
                                 hover:text-red-600 hover:bg-red-50
                                 transition-all duration-200
                                 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
