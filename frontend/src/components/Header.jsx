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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="shrink-0 text-xl font-bold text-white">Cynasecure</Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/catalogue" className={linkClass}>Catalogue</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        </nav>

        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 md:block">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un service..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </form>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/panier" className="relative text-gray-300 hover:text-blue-500">
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link to="/compte" className="text-sm font-medium text-gray-300 hover:text-blue-500">
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
