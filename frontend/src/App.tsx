import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AppRouter } from "./router/AppRouter";
import { Toast } from "./components/ui/Toast";
import { SmoothScrollProvider } from "./providers/SmoothScrollProvider";
import { useTranslation } from "react-i18next";
import React from "react";

function LangSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language.split("-")[0];
  }, [i18n.language]);
  return null;
}

export default function App() {
  return (
    <SmoothScrollProvider>
      <AuthProvider>
        <CartProvider>
          <LangSync />
          <AppRouter />
          <Toast />
        </CartProvider>
      </AuthProvider>
    </SmoothScrollProvider>
  );
}
