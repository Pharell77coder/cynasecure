import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const validatePassword = (pwd) => [
  { ok: pwd.length >= 8, label: '8 caractères minimum' },
  { ok: /[A-Z]/.test(pwd), label: 'Une majuscule' },
  { ok: /[a-z]/.test(pwd), label: 'Une minuscule' },
  { ok: /[0-9]/.test(pwd), label: 'Un chiffre' },
  { ok: /[^A-Za-z0-9]/.test(pwd), label: 'Un caractère spécial' }
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register } = useContext(AuthContext);
  const rules = validatePassword(password);
  const allValid = rules.every((r) => r.ok);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) {
      setError('Le mot de passe ne respecte pas les règles de sécurité.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">C</div>
          <div className="rounded-lg border border-green-500/50 bg-green-950/40 p-4 text-sm text-green-400">
            ✅ Un e-mail de confirmation a été envoyé à <strong>{email}</strong> (Maildev sur{' '}
            <a href="http://localhost:1080" className="underline">localhost:1080</a>).
          </div>
          <Link to="/connexion" className="mt-6 block">
            <Button variant="primary" fullWidth>Retour à la connexion</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">C</div>
        <h1 className="text-xl font-bold text-white">Créer un compte</h1>
        <p className="mt-1 text-sm text-gray-400">Rejoignez Cyna et sécurisez votre entreprise</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Nom complet</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Adresse e-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Mot de passe</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none" />
            {password && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {rules.map((r, i) => (
                  <span key={i} className={r.ok ? 'text-green-400' : 'text-gray-500'}>
                    {r.ok ? '✓' : '○'} {r.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <div className="rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-sm text-red-400">{error}</div>}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={!allValid}>
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Déjà un compte ? <Link to="/connexion" className="text-blue-400 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
