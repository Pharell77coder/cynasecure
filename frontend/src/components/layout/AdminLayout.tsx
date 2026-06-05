import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "./Navbar";
import { HelpCircle } from "lucide-react";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">

      {/* Skip-link */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:font-semibold"
      >
        Passer au contenu d'administration
      </a>

      {/* Glow bleu subtil */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}

      {/* Barre de navigation globale */}
      <Navbar />

      {/* Structure principale */}
      <div className="flex flex-1 relative">

        {/* Sidebar admin */}
        <AdminSidebar />

        {/* Zone de contenu */}
        <div className="flex flex-col flex-1 relative z-10">

          {/* En-tête interne */}
          <header className="h-16 border-b border-gray-900 bg-gray-950/80 backdrop-blur-xl flex items-center justify-between px-6">
            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                Console d’administration
              </p>
              <p className="text-xs text-gray-500 font-mono tracking-widest">
                PRIVILÈGES ÉLEVÉS
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors" aria-label="Ouvrir le centre d’aide">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Centre d’aide
              </button>

              <div className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-sm font-medium text-gray-400">
                A
              </div>
            </div>
          </header>

          {/* Contenu dynamique */}
          <main id="admin-main" className="flex-1 p-10 relative">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}
