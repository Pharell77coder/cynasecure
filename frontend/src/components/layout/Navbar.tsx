import { Link, NavLink, useNavigate } from "react-router-dom";
import { Shield, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import React from "react";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth() as unknown as {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: { displayName: string } | null;
    logout: () => void;
  };
  const { count } = useCart();
  const navigate = useNavigate();

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `px-1 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between gap-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">
            Cyna<span className="text-primary">Secure</span>
          </span>
        </Link>

        {/* Navigation principale */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLink}>
            Accueil
          </NavLink>

          <NavLink to="/catalogue" className={navLink}>
            Catalogue
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={navLink}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Panier */}
          <Link
            to="/panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Panier"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          {/* Liens utilisateur */}
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={navLink}>
                Dashboard
              </NavLink>

              <NavLink to="/mes-abonnements" className={navLink}>
                Mes abonnements
              </NavLink>

              <NavLink to="/mes-paiements" className={navLink}>
                Mes paiements
              </NavLink>
            </>
          )}

          {/* Auth */}
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profil")}
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.displayName}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
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
                onClick={() => navigate("/connexion")}
              >
                Connexion
              </Button>

              <Button size="sm" onClick={() => navigate("/inscription")}>
                Essai gratuit
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
