import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { PageTransition } from "../../components/ui/PageTransition";
import React from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  const isLogin = pathname === "/connexion";
  const isRegister = pathname === "/inscription";

  return (
    <PageTransition>
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md p-8">

        {/* Logo */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <img
            src="/favicon.ico"
            alt="CynaSecure"
            className="h-10 w-10 object-contain"
          />
        </div>

        {/* Titre */}
        <h1 className="mt-6 text-center text-2xl font-bold">
          Bienvenue sur CynaSecure
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Connectez-vous ou créez votre compte
        </p>

        {/* Onglets */}
        <div className="mt-6 grid grid-cols-2 rounded-lg bg-muted p-1">
          <Link
            to="/connexion"
            className={`rounded-md py-2 text-center text-sm font-semibold transition-colors ${
              isLogin
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Connexion
          </Link>

          <Link
            to="/inscription"
            className={`rounded-md py-2 text-center text-sm font-semibold transition-colors ${
              isRegister
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inscription
          </Link>
        </div>

        {/* Contenu */}
        <div className="mt-6">{children}</div>
      </Card>
    </div>
    </PageTransition>
  );
}
