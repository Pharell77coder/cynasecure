import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Trash2, Plus, Shield, User } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";

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
    <div className="space-y-12">

      {/* HERO HEADER */}
      <section className="relative py-14 mb-10 bg-gradient-to-br from-[#0A1A2F] to-black text-white rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
            Utilisateurs
          </h1>
          <p className="mt-2 text-slate-300">
            Gestion des comptes, rôles et accès administrateurs.
          </p>
        </div>
      </section>


      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Liste des utilisateurs</h2>
        </div>

        {loading ? (
          <p className="p-6 text-slate-600">Chargement…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-slate-600">Aucun utilisateur trouvé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
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
                  transition={{ duration: 0.3 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    {u.displayName}
                  </td>

                  <td className="px-6 py-4 text-slate-700">{u.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role === "admin" && <Shield size={14} />}
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(u.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
