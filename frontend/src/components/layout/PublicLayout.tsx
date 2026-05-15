import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import React from "react";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Navigation principale */}
      <Navbar />

      {/* Contenu public */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
