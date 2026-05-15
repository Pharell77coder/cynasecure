import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import React from "react";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-6 text-center">

      {/* Glow bleu */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">

        {/* Icône */}
        <div className="flex items-center justify-center w-20 h-20 border border-blue-500/30 bg-blue-500/10 mb-6">
          <ShieldAlert className="h-10 w-10 text-blue-400" />
        </div>

        {/* Code 404 */}
        <p className="text-8xl font-black text-white tracking-tight">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-white">
          Page introuvable
        </h1>

        <p className="mt-3 max-w-md text-gray-400 leading-relaxed">
          Cette ressource n’existe pas ou a été déplacée.  
          Aucun indicateur de compromission détecté, mais la page reste introuvable.
        </p>

        <Link to="/" className="mt-8">
          <Button
            size="lg"
            className="gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l’accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
