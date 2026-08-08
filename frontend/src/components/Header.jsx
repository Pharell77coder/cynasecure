import { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useContext(AuthContext);
  const { count } = useContext(CartContext);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-blue-500' : 'text-ink/80 hover:text-blue-500'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <h1 className="text-xl font-bold">Cynasecure</h1>
            </Link>
          </div>

          <nav className="hidden items-center space-x-6 md:flex">
            <NavLink to="/catalogue" className={linkClass}>Catalogue</NavLink>
            {isAdmin && <NavLink to="/admin/produits" className={linkClass}>Back office</NavLink>}
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            <Link to="/paiement" className="relative text-ink/80 hover:text-blue-500">
              🛒
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <Link to="/compte" className="text-sm font-medium text-ink/80 hover:text-blue-500">
                {user.username}
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
              >
                Se connecter
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="text-ink md:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>

        {open && (
          <nav className="mt-3 flex flex-col space-y-3 border-t border-ink/10 pt-3 md:hidden">
            <NavLink to="/catalogue" className={linkClass} onClick={() => setOpen(false)}>Catalogue</NavLink>
            <NavLink to="/paiement" className={linkClass} onClick={() => setOpen(false)}>Panier ({count})</NavLink>
            {user ? (
              <NavLink to="/compte" className={linkClass} onClick={() => setOpen(false)}>Mon compte</NavLink>
            ) : (
              <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Se connecter</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/produits" className={linkClass} onClick={() => setOpen(false)}>Back office</NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
