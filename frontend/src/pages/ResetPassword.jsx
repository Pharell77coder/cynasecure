import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api.js';
import Button from '../components/Button.jsx';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setStatus('loading');
    try {
      await authService.resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigate('/connexion'), 2500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl">
          <h1 className="text-xl font-bold text-white">Mot de passe réinitialisé ✅</h1>
          <p className="mt-2 text-sm text-gray-400">Vous allez être redirigé vers la connexion...</p>
          <Link to="/connexion" className="mt-4 block text-blue-400 hover:underline">Se connecter maintenant</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-white">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-gray-400">Choisissez un nouveau mot de passe pour votre compte.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Nouveau mot de passe</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Confirmer le mot de passe</label>
            <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
          </div>

          {errorMessage && <div className="rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-sm text-red-400">{errorMessage}</div>}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={status === 'loading'}>
            Réinitialiser mon mot de passe
          </Button>
        </form>

        <Link to="/connexion" className="mt-6 block text-center text-sm text-blue-400 hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
