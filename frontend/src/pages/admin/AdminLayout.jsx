import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { to: '/admin/produits', label: 'Produits' },
  { to: '/admin/categories', label: 'Catégories' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs' },
  { to: '/admin/commandes', label: 'Commandes' },
  { to: '/admin/adresses', label: 'Adresses' },
  { to: '/admin/paiements', label: 'Paiements' }
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto">
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
      <Outlet />
    </div>
  );
}
