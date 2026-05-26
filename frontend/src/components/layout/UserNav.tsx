import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Shield, ShoppingBag, UserCircle } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/mes-abonnements", label: "Abonnements", icon: Shield },
  { to: "/mes-commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/profil", label: "Mon profil", icon: UserCircle },
];

export function UserNav() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/60 backdrop-blur-sm">
      <div className="container">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
