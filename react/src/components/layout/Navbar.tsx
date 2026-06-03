import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react"
import useAuth from "@/hooks/useAuth"

const Navbar = () => {
  const { user, handleLogout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    {
      to: "/predictions",
      label: "Prédictions",
      icon: <TrendingUp size={18} />,
    },
    {
      to: "/profile",
      label: "Mon compte",
      icon: <User size={18} />,
    },
  ]

  const isActive = (path: string) =>
    location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo */}
          <Link
            to="/predictions"
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg
                            flex items-center justify-center
                            group-hover:bg-primary-700 transition-colors">
              <Home size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Immo<span className="text-primary-600">Mada</span>
            </span>
          </Link>

          {/* ── Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive(link.to)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop user + logout */}
          <div className="hidden md:flex items-center gap-3">
            {/* Avatar + nom */}
            <div className="flex items-center gap-2 px-3 py-1.5
                            bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-7 h-7 bg-primary-600 rounded-full
                              flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase">
                  {user?.username?.charAt(0) ?? "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.username}
              </span>
            </div>

            {/* Bouton logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                         text-sm font-medium text-gray-600
                         hover:bg-red-50 hover:text-red-600
                         transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Déconnecter</span>
            </button>
          </div>

          {/* ── Mobile burger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-600
                       hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3
                          mb-2 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-primary-600 rounded-full
                            flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold uppercase">
                {user?.username?.charAt(0) ?? "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isActive(link.to)
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={() => {
              setMenuOpen(false)
              handleLogout()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5
                       rounded-lg text-sm font-medium text-red-600
                       hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar