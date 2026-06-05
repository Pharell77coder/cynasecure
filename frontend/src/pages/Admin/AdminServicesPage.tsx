import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Package,
  Pencil,
  Trash2,
  Plus,
  FolderTree,
  Database,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatPrice } from "../../lib/utils";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";

import { servicesApi, type Service } from "../../api/services";
import { Pagination } from "../../components/ui/Pagination";

export default function AdminServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page    = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Number(searchParams.get("perPage") || 20);

  const [items, setItems]     = useState<Service[]>([]);
  const [total, setTotal]     = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    servicesApi
      .adminList(page, perPage)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => toast("Erreur lors du chargement des services", "error"))
      .finally(() => setLoading(false));
  }, [page, perPage]);

  const remove = async (id: string) => {
    try {
      await servicesApi.remove(id);
      setItems((prev) => prev.filter((s) => String(s.id) !== id));
      setTotal((t) => t - 1);
      toast("Service supprimé", "success");
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
            <FolderTree className="h-3 w-3" aria-hidden="true" />
            GESTION DES SERVICES
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Catalogue des services
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Administration complète des services, catégories, prix et disponibilité.
            Cette console vous permet de gérer l'ensemble du catalogue en temps réel.
          </p>
        </div>
      </section>

      <div className="container flex justify-end mt-8">
        <Link to="/admin/services/new">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500">
            <Plus size={18} aria-hidden="true" /> Nouveau service
          </Button>
        </Link>
      </div>

      <section className="container mt-8 mb-20">
        <Card className="bg-gray-900 border-gray-800 p-0 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <h2 className="font-semibold text-white">Liste des services</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-gray-500">Aucun service trouvé.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left bg-gray-950/40">
                  <th className="px-6 py-4 font-medium">Nom</th>
                  <th className="px-6 py-4 font-medium">Catégorie</th>
                  <th className="px-6 py-4 font-medium">Prix mensuel</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <Package size={16} className="text-blue-500" aria-hidden="true" />
                      {s.name}
                    </td>

                    <td className="px-6 py-4 text-gray-400">{s.category}</td>

                    <td className="px-6 py-4 text-gray-400">
                      {formatPrice(s.priceMonthly)}/mois
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/services/${s.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-300 hover:text-blue-400"
                            aria-label={`Modifier ${s.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-400"
                          onClick={() => remove(String(s.id))}
                          aria-label={`Supprimer ${s.name}`}
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
        </Card>
      </section>
    </div>
  );
}
