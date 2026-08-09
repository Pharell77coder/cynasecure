import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { authService } from '../services/api.js';
import Button from '../components/Button.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/compte';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await authService.forgotPassword(email);
      setResetSent(true);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  if (forgot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">C</div>
          <h1 className="text-xl font-bold text-white">Mot de passe oublié</h1>

          {resetSent ? (
            <div className="mt-4 rounded-lg border border-green-500/50 bg-green-950/40 p-3 text-sm text-green-400">
              ✅ Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation vient de lui être envoyé.
            </div>
          ) : (
            <form onSubmit={handleForgot} className="mt-4 space-y-4">
              <p className="text-sm text-gray-400">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Adresse e-mail</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
              </div>
              {forgotError && <div className="rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-sm text-red-400">{forgotError}</div>}
              <Button type="submit" variant="primary" size="lg" fullWidth loading={forgotLoading}>
                Envoyer le lien
              </Button>
            </form>
          )}

          <button onClick={() => { setForgot(false); setResetSent(false); setForgotError(''); }}
            className="mt-4 text-sm text-blue-400 hover:underline">
            ← Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">C</div>
        <h1 className="text-xl font-bold text-white">Connexion</h1>
        <p className="mt-1 text-sm text-gray-400">Accédez à vos services Cyna</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Adresse e-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm text-gray-400">Mot de passe</label>
              <button type="button" onClick={() => setForgot(true)} className="text-xs text-blue-400 hover:underline">
                Mot de passe oublié ?
              </button>
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
          </div>

          {error && <div className="rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-sm text-red-400">{error}</div>}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Pas encore de compte ? <Link to="/inscription" className="text-blue-400 hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
