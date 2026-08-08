import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide (token manquant).');
      return;
    }

    fetch(`http://localhost:5000/api/users/verify/${token}`)
      .then(async (response) => {
        const data = await response.json();
        setStatus(response.ok ? 'success' : 'error');
        setMessage(data.message);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Impossible de contacter le serveur.');
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl text-center">
        {status === 'loading' && (
          <p className="text-gray-300">Vérification de votre compte en cours...</p>
        )}
        {status === 'success' && (
          <>
            <p className="text-green-400 font-semibold mb-4">{message}</p>
            <Link to="/login" className="text-blue-400 hover:underline">
              Aller à la connexion
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-400 font-semibold mb-4">{message}</p>
            <Link to="/login" className="text-blue-400 hover:underline">
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}