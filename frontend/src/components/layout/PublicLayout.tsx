import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import React from "react";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
