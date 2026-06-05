import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

import { adminUsersApi, type AdminUser } from "../../api/adminUsers";
import { Pagination } from "../../components/ui/Pagination";

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page    = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Number(searchParams.get("perPage") || 20);

  const [items, setItems]     = useState<AdminUser[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminUsersApi
      .list(page, perPage)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => toast("Erreur lors du chargement des utilisateurs", "error"))
      .finally(() => setLoading(false));
  }, [page, perPage]);

  const remove = async (id: number) => {
    try {
      await adminUsersApi.remove(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
      setTotal((t) => t - 1);
      toast("Utilisateur supprimé", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de la suppression", "error");
    }
  };

  const setPage = (p: number) => setSearchParams((prev) => { prev.set("page", String(p)); return prev; });
  const setPerPage = (pp: number) => setSearchParams({ page: "1", perPage: String(pp) });

  return (
    <div className="relative">

      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />


      <section className="relative py-10 border-b border-gray-900">
        <div className="container space-y-4">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <Fingerprint className="h-3 w-3" aria-hidden="true" />
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

      <section className="container mt-10 mb-20">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <UsersIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <h2 className="font-semibold text-white">Liste des utilisateurs</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : items.length === 0 ? (
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
                {items.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <User size={16} className="text-blue-500" aria-hidden="true" />
                      {u.displayName}
                    </td>

                    <td className="px-6 py-4 text-gray-400">{u.email}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-mono tracking-widest border ${
                          u.roles?.includes("ROLE_ADMIN")
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-gray-700/30 text-gray-400 border-gray-700"
                        }`}
                      >
                        {u.roles?.includes("ROLE_ADMIN") && <Shield size={12} aria-hidden="true" />}
                        {u.roles?.includes("ROLE_ADMIN") ? "ADMIN" : "USER"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-400"
                          onClick={() => remove(u.id)}
                          aria-label={`Supprimer ${u.displayName}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && (
            <div className="px-6 pb-4 border-t border-gray-800 pt-3">
              <Pagination
                page={page}
                total={total}
                perPage={perPage}
                onChange={setPage}
                onPerPageChange={setPerPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
