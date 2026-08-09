import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/api.js';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    authService.confirmEmail(token)
      .then((data) => { setStatus('success'); setMessage(data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.message); });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl">
        {status === 'loading' && <p className="text-gray-300">Confirmation en cours...</p>}
        {status === 'success' && (
          <>
            <p className="mb-4 font-semibold text-green-400">{message}</p>
            <Link to="/connexion" className="text-blue-400 hover:underline">Se connecter</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="mb-4 font-semibold text-red-400">{message}</p>
            <Link to="/connexion" className="text-blue-400 hover:underline">Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
