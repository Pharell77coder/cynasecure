import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const TABS = [
  { to: '/produits', label: 'Produits' },
  { to: '/categories', label: 'Catégories' },
  { to: '/utilisateurs', label: 'Utilisateurs' },
  { to: '/commandes', label: 'Commandes' },
  { to: '/adresses', label: 'Adresses' },
  { to: '/paiements', label: 'Paiements' }
];

export default function Layout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-white">Cynasecure · Back office</span>
            <nav className="flex gap-6 overflow-x-auto">
              {TABS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap text-sm font-medium transition ${
                      isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.username}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-800"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
