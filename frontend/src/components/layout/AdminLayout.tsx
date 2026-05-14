import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar premium */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1">

        {/* Topbar */}
        <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard Administrateur
          </h1>

          {/* Right section (avatar, actions) */}
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600 hover:text-gray-900 transition">
              Centre d’aide
            </button>

            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
