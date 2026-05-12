"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Mot de passe oublié</h2>
      {sent ? (
        <p style={{ color: 'green' }}>Un email de réinitialisation a été envoyé !</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre email"
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', color: 'black' }}
          />
          <button type="submit" style={{ width: '100%', cursor: 'pointer', padding: '10px' }}>
            Envoyer
          </button>
        </form>
      )}
      <p onClick={() => router.push('/')} style={{ cursor: 'pointer', color: 'blue', marginTop: '15px' }}>
        Retour à la connexion
      </p>
    </div>
  );
}