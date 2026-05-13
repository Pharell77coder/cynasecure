"use client";
import Auth from "./Auth"; // On importe maintenant Auth au lieu de login[cite: 2]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* On utilise le composant Auth ici */}
      <Auth /> 
    </main>
  );
}