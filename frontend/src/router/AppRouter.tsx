import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";

import { PublicLayout } from "../components/layout/PublicLayout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import { ScrollRestorer } from "../components/ui/ScrollRestorer";
import { useAuth } from "../hooks/useAuth";
import { Loader } from "../components/ui/Loader";

const HomePage = lazy(() => import("../pages/Home/HomePage"));
const CataloguePage = lazy(() => import("../pages/Catalogue/CataloguePage"));
const ServiceDetailsPage = lazy(() => import("../pages/Services/ServiceDetailsPage"));
const CartPage = lazy(() => import("../pages/Cart/CartPage"));
const CheckoutPage = lazy(() => import("../pages/Checkout/CheckoutPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));

const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/Auth/ForgotPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/Auth/VerifyEmailPage"));
const TwoFactorPage = lazy(() => import("../pages/Auth/TwoFactorPage"));
const VerifyEmailChangePage = lazy(() => import("../pages/Auth/VerifyEmailChangePage"));

const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const MySubscriptionsPage = lazy(() => import("../pages/Profile/MySubscriptionsPage"));
const MyOrdersPage = lazy(() => import("../pages/Profile/MyOrdersPage"));
const UserDashboardPage = lazy(() => import("../pages/Profile/UserDashboardPage"));

const AProposPage = lazy(() => import("../pages/Legal/AProposPage"));
const MentionsLegalesPage = lazy(() => import("../pages/Legal/MentionsLegalesPage"));
const CguPage = lazy(() => import("../pages/Legal/CguPage"));
const ConfidentialitePage = lazy(() => import("../pages/Legal/ConfidentialitePage"));

const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));

const AdminDashboardPage = lazy(() => import("../pages/Admin/AdminDashboardPage"));
const AdminServicesPage = lazy(() => import("../pages/Admin/AdminServicesPage"));
const AdminServiceFormPage = lazy(() => import("../pages/Admin/AdminServiceFormPage"));
const AdminUsersPage = lazy(() => import("../pages/Admin/AdminUsersPage"));
const AdminSubscriptionsPage = lazy(() => import("../pages/Admin/AdminSubscriptionsPage"));
const AdminPaiementsPage = lazy(() => import("../pages/Admin/AdminPaiementsPage"));
const AdminHomePage = lazy(() => import("../pages/Admin/AdminHomePage"));
const AdminContactPage = lazy(() => import("../pages/Admin/AdminContactPage"));
const AdminPromoPage = lazy(() => import("../pages/Admin/AdminPromoPage"));

export function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <BrowserRouter>
      <ScrollRestorer />
      <Suspense fallback={<Loader />}>
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
                isLoading ? null : isAuthenticated ? <Navigate to="/profil" replace /> : <LoginPage />
              }
            />

            <Route
              path="/inscription"
              element={
                isLoading ? null : isAuthenticated ? (
                  <Navigate to="/profil" replace />
                ) : (
                  <RegisterPage />
                )
              }
            />

            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/verifier-email" element={<VerifyEmailPage />} />
            <Route path="/2fa" element={<TwoFactorPage />} />
            <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />

            <Route path="/contact" element={<ContactPage />} />

            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Pages légales */}
            <Route path="/a-propos" element={<AProposPage />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="/cgv" element={<CguPage />} />
            <Route path="/confidentialite" element={<ConfidentialitePage />} />

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
              path="/mes-commandes"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
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

              <Route path="services/new" element={<AdminServiceFormPage />} />
              <Route path="services/:id" element={<AdminServiceFormPage />} />

              {/* AUTRES */}
              <Route path="abonnements" element={<AdminSubscriptionsPage />} />
              <Route path="paiements" element={<AdminPaiementsPage />} />
              <Route path="home" element={<AdminHomePage />} />
              <Route path="contact" element={<AdminContactPage />} />
              <Route path="utilisateurs" element={<AdminUsersPage />} />
              <Route path="promos" element={<AdminPromoPage />} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
