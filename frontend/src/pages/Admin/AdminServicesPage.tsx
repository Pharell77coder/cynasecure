import React, { useEffect, useState } from "react";
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH SERVICES
  useEffect(() => {
    servicesApi
      .getAll()
      .then((data) => setServices(data))
      .catch(() => toast("Erreur lors du chargement des services", "error"))
      .finally(() => setLoading(false));
  }, []);

  // DELETE SERVICE
  const remove = async (id: string) => {
    try {
      await servicesApi.remove(id);
      setServices((prev) => prev.filter((s) => String(s.id) !== id));
      toast("Service supprimé", "success");
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
            <FolderTree className="h-3 w-3" />
            GESTION DES SERVICES
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Catalogue des services
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Administration complète des services, catégories, prix et disponibilité.
            Cette console vous permet de gérer l’ensemble du catalogue en temps réel.
          </p>
        </div>
      </section>

      {/* ACTION BUTTON */}
      <div className="container flex justify-end mt-8">
        <Link to="/admin/services/new">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500">
            <Plus size={18} /> Nouveau service
          </Button>
        </Link>
      </div>

      {/* TABLE */}
      <section className="container mt-8 mb-20">
        <Card className="bg-gray-900 border-gray-800 p-0 overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-white">Liste des services</h2>
          </div>

          {/* Loading */}
          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : services.length === 0 ? (
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
                {services.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <Package size={16} className="text-blue-500" />
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
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-400"
                          onClick={() => remove(String(s.id))}
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
        </Card>
      </section>
    </div>
  );
}
