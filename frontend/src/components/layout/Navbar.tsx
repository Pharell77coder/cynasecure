import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  Fingerprint,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { contactApi } from "../../api/contact";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";

const LANGS = ["fr", "en", "es"] as const;
type Lang = typeof LANGS[number];

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth() as unknown as {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: { displayName: string } | null;
    logout: () => void;
  };

  const { count } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [open, setOpen]     = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setUnread(0); return; }
    contactApi.user.unreadCount()
      .then((r) => setUnread(r.count))
      .catch(() => {});
  }, [isAuthenticated]);

  const changeLang = (lang: Lang) => {
    i18n.changeLanguage(lang);
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? "text-blue-400" : "text-gray-400 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between" aria-label="Navigation principale">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="CynaSecure — Accueil">
          <img
            src="/favicon.ico"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            CynaSecure
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkStyle}>
            {t("nav.home")}
          </NavLink>

          <NavLink to="/catalogue" className={linkStyle}>
            {t("nav.solutions")}
          </NavLink>

          <NavLink to="/contact" className={linkStyle}>
            <span className="relative">
              {t("nav.contact")}
              {unread > 0 && (
                <span className="absolute -top-2 -right-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white px-1" aria-label={`${unread} message(s) non lu(s)`}>
                  {unread}
                </span>
              )}
            </span>
          </NavLink>

          {isAuthenticated && !isAdmin && (
            <NavLink to="/dashboard" className={linkStyle}>
              {t("nav.dashboard")}
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={linkStyle}>
              {t("nav.admin")}
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Language selector */}
          <div className="hidden md:flex items-center gap-1" role="group" aria-label={t("nav.langLabel")}>
            {LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLang(lang)}
                aria-pressed={i18n.language.startsWith(lang)}
                className={`font-mono text-xs px-1.5 py-0.5 transition-colors ${
                  i18n.language.startsWith(lang)
                    ? "text-blue-400"
                    : "text-gray-600 hover:text-gray-300"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Panier */}
          <Link
            to="/panier"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:text-white transition"
            aria-label={t("nav.cart")}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white px-1" aria-label={`${count} article(s)`}>
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
                className="border-gray-700 text-gray-300 hover:bg-gray-800 min-h-[44px]"
                onClick={() => navigate("/profil")}
                aria-label={`Profil de ${user?.displayName}`}
              >
                <Fingerprint className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{user?.displayName}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400 h-11 w-11"
                onClick={logout}
                aria-label={t("nav.logout")}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hidden sm:flex min-h-[44px]"
                onClick={() => navigate("/connexion")}
              >
                {t("nav.login")}
              </Button>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white min-h-[44px]"
                onClick={() => navigate("/inscription")}
              >
                {t("nav.register")}
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white h-11 w-11 flex items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-800 bg-gray-950">
          <div className="container py-4 flex flex-col gap-4">

            <NavLink to="/" end className={linkStyle} onClick={() => setOpen(false)}>
              {t("nav.home")}
            </NavLink>

            <NavLink to="/catalogue" className={linkStyle} onClick={() => setOpen(false)}>
              {t("nav.solutions")}
            </NavLink>

            <NavLink to="/contact" className={linkStyle} onClick={() => setOpen(false)}>
              <span className="relative inline-flex items-center gap-2">
                {t("nav.contact")}
                {unread > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white px-1" aria-label={`${unread} non lu(s)`}>
                    {unread}
                  </span>
                )}
              </span>
            </NavLink>

            {isAuthenticated && !isAdmin && (
              <NavLink to="/dashboard" className={linkStyle} onClick={() => setOpen(false)}>
                {t("nav.dashboard")}
              </NavLink>
            )}

            {isAdmin && (
              <NavLink to="/admin" className={linkStyle} onClick={() => setOpen(false)}>
                {t("nav.admin")}
              </NavLink>
            )}

            {/* Language selector mobile */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800" role="group" aria-label={t("nav.langLabel")}>
              <span className="text-xs text-gray-600 font-mono">{t("nav.langLabel")} :</span>
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { changeLang(lang); setOpen(false); }}
                  aria-pressed={i18n.language.startsWith(lang)}
                  className={`font-mono text-xs px-1.5 py-0.5 transition-colors ${
                    i18n.language.startsWith(lang)
                      ? "text-blue-400"
                      : "text-gray-600 hover:text-gray-300"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
