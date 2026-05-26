import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Activity,
  LogOut,
  MessageSquare,
  CreditCard,
  Home,
  Tag,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import React from "react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/admin/home", icon: Home, label: "Page d'accueil" },
  { to: "/admin/services", icon: Package, label: "Services" },
  { to: "/admin/abonnements", icon: Activity, label: "Abonnements" },
  { to: "/admin/paiements", icon: CreditCard, label: "Paiements" },
  { to: "/admin/utilisateurs", icon: Users, label: "Utilisateurs" },
  { to: "/admin/contact", icon: MessageSquare, label: "Messages contact" },
  { to: "/admin/promos", icon: Tag, label: "Codes promo" },
];

export function AdminSidebar() {
  const { logout, user } = useAuth();

  if (!user || !user.role?.toUpperCase().includes("ADMIN")) {
    return null;
  }

  return (
    <aside className="w-64 shrink-0 bg-gray-950 border-r border-gray-900 flex flex-col min-h-screen relative">

      {/* Glow bleu subtil */}
      <div
        className="absolute top-0 left-0 w-[300px] h-[300px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Header admin */}
      <div className="px-6 py-8 border-b border-gray-900 relative">
        <div className="flex items-center gap-3">

          {/* Favicon à la place de l’icône Lucide */}
          <img
            src="/favicon.ico"
            alt="Admin"
            className="h-5 w-5 object-contain"
          />

          <h2 className="text-lg font-bold tracking-tight text-white">
            Console Admin
          </h2>
        </div>

        <p className="text-xs text-gray-500 mt-1 font-mono tracking-widest">
          PRIVILÈGES ÉLEVÉS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 relative">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 rounded-none text-sm font-medium tracking-wide transition-colors border border-transparent",
                isActive
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-900",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="px-4 py-6 border-t border-gray-900">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-none text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
