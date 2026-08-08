import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

import Login from './pages/Login.jsx'
import ProductManager from './pages/ProductManager.jsx'
import CategoryManager from './pages/CategoryManager.jsx'
import UserManager from './pages/UserManager.jsx'
import OrderManager from './pages/OrderManager.jsx'
import { AddressManager, PaymentMethodManager } from './pages/ReadOnlyManagers.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/produits" replace />} />
            <Route path="produits" element={<ProductManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="utilisateurs" element={<UserManager />} />
            <Route path="commandes" element={<OrderManager />} />
            <Route path="adresses" element={<AddressManager />} />
            <Route path="paiements" element={<PaymentMethodManager />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
