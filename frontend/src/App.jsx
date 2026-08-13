import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Product from './pages/Product.jsx'
import Search from './pages/Search.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Account from './pages/Account.jsx'
import Orders from './pages/Orders.jsx'
import Contact from './pages/Contact.jsx'
import About from './pages/About.jsx'
import LegalNotice from './pages/LegalNotice.jsx'
import Terms from './pages/Terms.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ConfirmEmail from './pages/ConfirmEmail.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/produits/:id" element={<Product />} />
            <Route path="/recherche" element={<Search />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/cgu" element={<Terms />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/confirmation-email/:token" element={<ConfirmEmail />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Pages nécessitant une connexion */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/compte" element={<Account />} />
              <Route path="/commandes" element={<Orders />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  )
}
