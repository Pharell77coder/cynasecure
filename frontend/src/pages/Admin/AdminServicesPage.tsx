import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Package, Pencil, Trash2, Plus } from "lucide-react";
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
    <div className="space-y-12">

      {/* HERO HEADER */}
      <section className="relative py-14 mb-10 bg-gradient-to-br from-[#0A1A2F] to-black text-white rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
            Services
          </h1>
          <p className="mt-2 text-slate-300">
            Gestion complète du catalogue, des catégories et des prix.
          </p>
        </div>
      </section>

      {/* ACTION BUTTON */}
      <div className="flex justify-end">
        <Link to="/admin/services/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Nouveau service
          </Button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Liste des services</h2>
        </div>

        {loading ? (
          <p className="p-6 text-slate-600">Chargement…</p>
        ) : services.length === 0 ? (
          <p className="p-6 text-slate-600">Aucun service trouvé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
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
                  transition={{ duration: 0.3 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <Package size={16} className="text-blue-500" />
                    {s.name}
                  </td>

                  <td className="px-6 py-4 text-slate-700">{s.category}</td>

                  <td className="px-6 py-4 text-slate-700">
                    {formatPrice(s.priceMonthly)}/mois
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/services/${s.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(String(s.id))}
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
