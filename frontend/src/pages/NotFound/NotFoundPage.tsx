import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import React from "react";

export default function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold">Page introuvable</h1>

      <p className="mt-2 max-w-md text-muted-foreground">
        La page que vous cherchez n’existe pas ou a été déplacée.
      </p>

      <Link to="/" className="mt-6">
        <Button size="lg">Retour à l’accueil</Button>
      </Link>
    </div>
  );
}
