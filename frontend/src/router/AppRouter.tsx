import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import { PublicLayout } from "../components/layout/PublicLayout";
import { AdminLayout } from "../components/layout/AdminLayout";

import HomePage from "../pages/Home/HomePage";
import CataloguePage from "../pages/Catalogue/CataloguePage";
import ServiceDetailsPage from "../pages/Services/ServiceDetailsPage";
import CartPage from "../pages/Cart/CartPage";

import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";

import ProfilePage from "../pages/Profile/ProfilePage";
import MySubscriptionsPage from "../pages/Profile/MySubscriptionsPage";
import MyPaymentsPage from "../pages/Profile/MyPaymentsPage";
import UserDashboardPage from "../pages/Profile/UserDashboardPage";

import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import AdminServicesPage from "../pages/Admin/AdminServicesPage";
import AdminUsersPage from "../pages/Admin/AdminUsersPage";
import AdminSubscriptionsPage from "../pages/Admin/AdminSubscriptionsPage";

// 🔥 AJOUT : formulaire création / édition
import AdminServiceFormPage from "../pages/Admin/AdminServiceFormPage";

import NotFoundPage from "../pages/NotFound/NotFoundPage";

import { ProtectedRoute } from "./ProtectedRoute";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import { useAuth } from "../hooks/useAuth";

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/services/:id" element={<ServiceDetailsPage />} />
          <Route path="/panier" element={<CartPage />} />

          {/* Auth */}
          <Route
            path="/connexion"
            element={
              isAuthenticated ? <Navigate to="/profil" replace /> : <LoginPage />
            }
          />

          <Route
            path="/inscription"
            element={
              isAuthenticated ? (
                <Navigate to="/profil" replace />
              ) : (
                <RegisterPage />
              )
            }
          />

          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />

          {/* User protected */}
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mes-abonnements"
            element={
              <ProtectedRoute>
                <MySubscriptionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mes-paiements"
            element={
              <ProtectedRoute>
                <MyPaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />

            {/* SERVICES */}
            <Route path="services" element={<AdminServicesPage />} />

            {/* 🔥 AJOUT : création */}
            <Route path="services/new" element={<AdminServiceFormPage />} />

            {/* 🔥 AJOUT : édition */}
            <Route path="services/:id" element={<AdminServiceFormPage />} />

            {/* AUTRES */}
            <Route path="abonnements" element={<AdminSubscriptionsPage />} />
            <Route path="utilisateurs" element={<AdminUsersPage />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
