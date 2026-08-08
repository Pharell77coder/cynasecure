import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de réinitialisation invalide (token manquant).');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setStatus('error');
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setStatus('success');
      setMessage(data.message);

      // Redirection automatique vers la connexion après quelques secondes
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-2">Réinitialisation du mot de passe</h2>
        <p className="text-sm text-gray-400 mb-6">Choisissez un nouveau mot de passe pour votre compte.</p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium border ${
              status === 'error'
                ? 'bg-red-950/40 border-red-500/50 text-red-400'
                : 'bg-green-950/40 border-green-500/50 text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        {token && status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition"
            >
              {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <p className="text-sm text-gray-400 text-center">
            Redirection vers la connexion...{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              Cliquez ici si rien ne se passe.
            </Link>
          </p>
        )}

        {!token && (
          <div className="text-center">
            <Link to="/login" className="text-blue-400 hover:underline">
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}