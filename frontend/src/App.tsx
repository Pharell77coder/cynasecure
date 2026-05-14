import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AppRouter } from "./router/AppRouter";
import { Toast } from "./components/ui/Toast";
import React from "react";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
        <Toast />
      </CartProvider>
    </AuthProvider>
  );
}
