import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Layout from './components/Layout.jsx'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Checkout from './pages/Checkout.jsx'
import Account from './pages/Account.jsx'
import LoginForm from './pages/LoginForm.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import ProductManager from './pages/admin/ProductManager.jsx'
import CategoryManager from './pages/admin/CategoryManager.jsx'
import UserManager from './pages/admin/UserManager.jsx'
import OrderManager from './pages/admin/OrderManager.jsx'
import { AddressManager, PaymentMethodManager } from './pages/admin/AdminReadOnlyManagers.jsx'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Layout>
            <Routes>
              {/* Pages publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Pages nécessitant une connexion */}
              <Route element={<ProtectedRoute />}>
                <Route path="/paiement" element={<Checkout />} />
                <Route path="/compte" element={<Account />} />
              </Route>

              {/* Back office (réservé aux admins) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="produits" element={<ProductManager />} />
                  <Route path="categories" element={<CategoryManager />} />
                  <Route path="utilisateurs" element={<UserManager />} />
                  <Route path="commandes" element={<OrderManager />} />
                  <Route path="adresses" element={<AddressManager />} />
                  <Route path="paiements" element={<PaymentMethodManager />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
