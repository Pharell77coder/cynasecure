import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

export function AdminProtectedRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
