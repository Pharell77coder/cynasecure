"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          router.push('/dashboard');
        } else {
          alert("Inscrit ! Vous pouvez vous connecter.");
          setIsLogin(true);
        }
      } else {
        alert(data.error || "Erreur lors de l'opération");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
      <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          required
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', color: 'black' }}
        />
        <input 
          type="password" 
          placeholder="Mot de passe" 
          required
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', color: 'black' }}
        />
        <button type="submit" style={{ width: '100%', cursor: 'pointer', padding: '10px' }}>
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue', marginTop: '15px' }}>
        {isLogin ? "Pas de compte ? S'inscrire ici" : "Déjà un compte ? Se connecter"}
      </p>
{isLogin && (
  <p onClick={() => router.push('/forgot-password')} style={{ cursor: 'pointer', color: 'red', marginTop: '15px' }}>
    Mot de passe oublié ?
  </p>
)}
    </div>
  );
};

export default Auth;