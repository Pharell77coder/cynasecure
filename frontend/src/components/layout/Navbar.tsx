import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  Fingerprint,
  Menu,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import React, { useState } from "react";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth() as unknown as {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: { displayName: string } | null;
    logout: () => void;
  };

  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? "text-blue-400" : "text-gray-400 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/favicon.ico"
            alt="CynaSecure"
            className="h-6 w-6 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            CynaSecure
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkStyle}>
            Accueil
          </NavLink>

          <NavLink to="/catalogue" className={linkStyle}>
            Solutions
          </NavLink>

          {/* ✔️ Tableau de bord visible uniquement pour les USERS */}
          {isAuthenticated && !isAdmin && (
            <NavLink to="/dashboard" className={linkStyle}>
              Tableau de bord
            </NavLink>
          )}

          {/* ✔️ Espace Admin visible uniquement pour les admins */}
          {isAdmin && (
            <NavLink to="/admin" className={linkStyle}>
              Espace Admin
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">

          {/* Panier */}
          <Link
            to="/panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:text-white transition"
            aria-label="Panier"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white px-1">
                {count}
              </span>
            )}
          </Link>

          {/* Authenticated user actions */}
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => navigate("/profil")}
              >
                <Fingerprint className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.displayName}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400"
                onClick={logout}
                aria-label="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => navigate("/connexion")}
              >
                Se connecter
              </Button>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => navigate("/inscription")}
              >
                Créer un compte
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950">
          <div className="container py-4 flex flex-col gap-4">

            <NavLink to="/" end className={linkStyle}>
              Accueil
            </NavLink>

            <NavLink to="/catalogue" className={linkStyle}>
              Solutions
            </NavLink>

            {/* ✔️ Tableau de bord visible uniquement pour les USERS */}
            {isAuthenticated && !isAdmin && (
              <NavLink to="/dashboard" className={linkStyle}>
                Tableau de bord
              </NavLink>
            )}

            {/* ✔️ Espace Admin visible uniquement pour les admins */}
            {isAdmin && (
              <NavLink to="/admin" className={linkStyle}>
                Espace Admin
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
