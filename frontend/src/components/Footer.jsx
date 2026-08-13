import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Footer() {
  const { user } = useContext(AuthContext);

  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">C</span>
              <span className="font-bold text-white">Cynasecure</span>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-600">Secure your future</p>
            <p className="mt-4 text-sm text-gray-500">
              Solutions de sécurité SaaS pour les entreprises. SOC, EDR et XDR accessibles en ligne.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Produits</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalogue" className="hover:text-blue-400">Catalogue</Link></li>
              <li><Link to="/catalogue?cat=soc" className="hover:text-blue-400">Cyna SOC</Link></li>
              <li><Link to="/catalogue?cat=edr" className="hover:text-blue-400">Cyna EDR</Link></li>
              <li><Link to="/catalogue?cat=xdr" className="hover:text-blue-400">Cyna XDR</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Compte</h4>
            <ul className="space-y-2 text-sm">
              {user ? (
                <>
                  <li><Link to="/compte" className="hover:text-blue-400">Mon compte</Link></li>
                  <li><Link to="/commandes" className="hover:text-blue-400">Mes commandes</Link></li>
                  <li><Link to="/panier" className="hover:text-blue-400">Mon panier</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/connexion" className="hover:text-blue-400">Se connecter</Link></li>
                  <li><Link to="/inscription" className="hover:text-blue-400">S'inscrire</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
              <li><Link to="/a-propos" className="hover:text-blue-400">À propos</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-blue-400">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-blue-400">Conditions d'utilisation</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Cyna. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
