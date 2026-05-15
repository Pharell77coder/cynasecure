import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Trash2,
  Shield,
  User,
  Fingerprint,
  Users as UsersIcon,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { toast } from "../../hooks/useToast";

import { adminUsersApi, AdminUser } from "../../api/adminUsers";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminUsersApi
      .list()
      .then((data) => setUsers(data))
      .catch(() => toast("Erreur lors du chargement des utilisateurs", "error"))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: number) => {
    try {
      await adminUsersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast("Utilisateur supprimé", "success");
    } catch (err: any) {
      toast(err.message || "Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="relative">

      {/* Glow bleu */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* HEADER */}
      <section className="relative py-10 border-b border-gray-900">
        <div className="container space-y-4">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <Fingerprint className="h-3 w-3" />
            GESTION DES UTILISATEURS
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Utilisateurs
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Gestion des comptes, rôles, accès administrateurs et permissions internes.
          </p>
        </div>
      </section>

      {/* TABLE */}
      <section className="container mt-10 mb-20">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <UsersIcon className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-white">Liste des utilisateurs</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-gray-500">Aucun utilisateur trouvé.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left bg-gray-950/40">
                  <th className="px-6 py-4 font-medium">Nom</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Rôle</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      {u.displayName}
                    </td>

                    <td className="px-6 py-4 text-gray-400">{u.email}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-mono tracking-widest border ${
                          u.role === "admin"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-gray-700/30 text-gray-400 border-gray-700"
                        }`}
                      >
                        {u.role === "admin" && <Shield size={12} />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-400"
                          onClick={() => remove(u.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
