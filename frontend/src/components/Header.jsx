import { useState, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-blue-500' : 'text-gray-300 hover:text-blue-500'}`;

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/recherche?q=${encodeURIComponent(search.trim())}`);
  };

  const initials = user ? user.username.slice(0, 1).toUpperCase() : null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">C</span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-white">Cynasecure</span>
            <span className="hidden text-[10px] uppercase tracking-wide text-gray-500 sm:block">Secure your future</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={linkClass}>Accueil</NavLink>
          <NavLink to="/catalogue" className={linkClass}>Catalogue</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        </nav>

        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 md:block">
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 focus-within:border-blue-500">
            <span className="text-gray-500">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un service SaaS..."
              className="w-full bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
        </form>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/panier" className="relative text-gray-300 hover:text-blue-500" aria-label="Panier">
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link to="/compte" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-blue-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {initials}
              </span>
              {user.username}
            </Link>
          ) : (
            <Link to="/connexion" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
              Se connecter
            </Link>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="text-white md:hidden" aria-label="Menu">☰</button>
      </div>

      {open && (
        <div className="border-t border-gray-800 px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
            />
          </form>
          <nav className="flex flex-col space-y-3">
            <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>Accueil</NavLink>
            <NavLink to="/catalogue" className={linkClass} onClick={() => setOpen(false)}>Catalogue</NavLink>
            <NavLink to="/panier" className={linkClass} onClick={() => setOpen(false)}>Panier ({cartCount})</NavLink>
            <NavLink to="/contact" className={linkClass} onClick={() => setOpen(false)}>Contact</NavLink>
            {user ? (
              <NavLink to="/compte" className={linkClass} onClick={() => setOpen(false)}>Mon compte</NavLink>
            ) : (
              <NavLink to="/connexion" className={linkClass} onClick={() => setOpen(false)}>Se connecter</NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
