import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = 'http://localhost:5000';

export default function AuthContainer() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/compte';

  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  // Vérification d'email : détecte /verify-email?token=... au chargement
  const [verifyStatus, setVerifyStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [verifyMessage, setVerifyMessage] = useState('');

  useEffect(() => {
    if (window.location.pathname !== '/verify-email') return;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setVerifyStatus('error');
      setVerifyMessage('Lien de vérification invalide (token manquant).');
      return;
    }

    setVerifyStatus('loading');
    fetch(`${API_URL}/api/users/verify/${token}`)
      .then(async (response) => {
        const data = await response.json();
        setVerifyStatus(response.ok ? 'success' : 'error');
        setVerifyMessage(data.message);
      })
      .catch(() => {
        setVerifyStatus('error');
        setVerifyMessage('Impossible de contacter le serveur.');
      });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ text: '', isError: false });
    setName('');
    setEmail('');
    setPassword('');
  };

  // Inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage({ text: `📧 ${data.message} Allez sur l'interface Maildev (http://localhost:1080) pour voir l'email de confirmation !`, isError: false });
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Connexion (passe par AuthContext pour établir la session)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Demande Mot de Passe Oublié
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const response = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage({ text: "📧 Email de réinitialisation envoyé ! Consultez votre boîte Maildev.", isError: false });
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Page affichée quand on arrive via le lien du mail de confirmation
  if (verifyStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl text-center">
          {verifyStatus === 'loading' && (
            <p className="text-gray-300">Vérification de votre compte en cours...</p>
          )}
          {verifyStatus === 'success' && (
            <>
              <p className="text-green-400 font-semibold mb-4">{verifyMessage}</p>
              <button
                onClick={() => { window.history.replaceState({}, '', '/login'); setVerifyStatus(null); }}
                className="text-blue-400 hover:underline"
              >
                Aller à la connexion
              </button>
            </>
          )}
          {verifyStatus === 'error' && (
            <>
              <p className="text-red-400 font-semibold mb-4">{verifyMessage}</p>
              <button
                onClick={() => { window.history.replaceState({}, '', '/'); setVerifyStatus(null); }}
                className="text-blue-400 hover:underline"
              >
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">

        {activeTab !== 'forgot' && (
          <div className="flex border-b border-gray-800 mb-6">
            <button onClick={() => handleTabChange('login')} className={`flex-1 pb-3 text-center font-semibold ${activeTab === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
              Connexion
            </button>
            <button onClick={() => handleTabChange('register')} className={`flex-1 pb-3 text-center font-semibold ${activeTab === 'register' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
              Inscription
            </button>
          </div>
        )}

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${message.isError ? 'bg-red-950/40 border-red-500/50 text-red-400' : 'bg-green-950/40 border-green-500/50 text-green-400'}`}>
            {message.text}
          </div>
        )}

        {/* CONNEXION */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => handleTabChange('forgot')} className="text-xs text-blue-400 hover:underline">Mot de passe oublié ?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        )}

        {/* INSCRIPTION */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom complet</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition">
              {loading ? 'Création...' : "S'inscrire"}
            </button>
          </form>
        )}

        {/* MOT DE PASSE OUBLIÉ */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Récupération de compte</h3>
            <p className="text-sm text-gray-400 mb-4">Saisissez votre adresse email pour recevoir un lien de réinitialisation.</p>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Votre Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => handleTabChange('login')} className="text-sm text-gray-400 hover:underline">Retour</button>
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
