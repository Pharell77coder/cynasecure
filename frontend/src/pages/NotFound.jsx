import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <div className="text-sm font-semibold text-blue-500">404</div>
    <h1 className="mt-2 text-3xl font-bold text-white">Page introuvable</h1>
    <p className="mt-3 max-w-md text-gray-400">La page que vous cherchez n'existe pas ou a été déplacée.</p>
    <div className="mt-8 flex gap-3">
      <Link to="/"><Button variant="primary" size="lg">Retour à l'accueil</Button></Link>
      <Link to="/catalogue"><Button variant="outline" size="lg">Voir le catalogue</Button></Link>
    </div>
    <div className="mt-8 space-x-4 text-sm text-gray-500">
      <Link to="/connexion" className="hover:text-blue-400 hover:underline">Se connecter</Link>
      <Link to="/contact" className="hover:text-blue-400 hover:underline">Contacter le support</Link>
      <Link to="/recherche" className="hover:text-blue-400 hover:underline">Rechercher un service</Link>
    </div>
  </div>
);

export default NotFound;
