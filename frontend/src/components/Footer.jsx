import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-sm text-gray-500">&copy; 2026 Cyna. Tous droits réservés.</p>
        <div className="flex gap-4 text-sm">
          <Link to="/contact" className="hover:text-blue-400">Contact</Link>
          <Link to="/catalogue" className="hover:text-blue-400">Catalogue</Link>
        </div>
      </div>
    </footer>
  );
}
