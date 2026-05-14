import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

export function AdminProtectedRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  // Non connecté → redirection vers login
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  // Connecté mais pas admin → redirection vers accueil
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // OK → accès aux routes admin
  return <Outlet />;
}
