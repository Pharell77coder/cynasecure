import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
} from "lucide-react";

import { apiFetch } from "../../api/apiFetch";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { toast } from "../../hooks/useToast";

interface PromoCode {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxUses: number | null;
  usedCount: number;
  minAmount: number | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  appliesTo: string;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: "",
  maxUses: "",
  minAmount: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
  appliesTo: "all",
};

export default function AdminPromoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page    = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Number(searchParams.get("perPage") || 20);

  const [items, setItems]       = useState<PromoCode[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<PromoCode | null>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ items: PromoCode[]; total: number }>(`/api/admin/promos?page=${page}&perPage=${perPage}`)
      .then((data) => { setItems(data.items); setTotal(data.total); })
      .catch(() => toast("Erreur lors du chargement des codes promo", "error"))
      .finally(() => setLoading(false));
  }, [page, perPage]);

  const openCreate = async () => {
    const res = await apiFetch<{ code: string }>("/api/admin/promos/generate", { method: "POST" }).catch(() => null);
    setForm({ ...EMPTY_FORM, code: res?.code ?? "" });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: PromoCode) => {
    setForm({
      code:       p.code,
      type:       p.type,
      value:      String(p.value),
      maxUses:    p.maxUses != null ? String(p.maxUses) : "",
      minAmount:  p.minAmount != null ? String(p.minAmount) : "",
      validFrom:  p.validFrom ?? "",
      validUntil: p.validUntil ?? "",
      isActive:   p.isActive,
      appliesTo:  p.appliesTo,
    });
    setEditing(p);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      code:       form.code.trim().toUpperCase(),
      type:       form.type,
      value:      parseFloat(form.value),
      maxUses:    form.maxUses !== "" ? parseInt(form.maxUses) : null,
      minAmount:  form.minAmount !== "" ? parseFloat(form.minAmount) : null,
      validFrom:  form.validFrom || null,
      validUntil: form.validUntil || null,
      isActive:   form.isActive,
      appliesTo:  form.appliesTo,
    };

    try {
      if (editing) {
        const updated = await apiFetch<PromoCode>(`/api/admin/promos/${editing.id}`, {
          method: "PUT", body: JSON.stringify(body),
        });
        setItems((prev) => prev.map((p) => p.id === editing.id ? updated : p));
        toast("Code promo mis à jour", "success");
      } else {
        const created = await apiFetch<PromoCode>("/api/admin/promos", {
          method: "POST", body: JSON.stringify(body),
        });
        setItems((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        toast("Code promo créé", "success");
      }
      closeForm();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Supprimer ce code promo ?")) return;
    try {
      await apiFetch(`/api/admin/promos/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
      toast("Code promo supprimé", "success");
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  const setPage    = (p: number) => setSearchParams((prev) => { prev.set("page", String(p)); return prev; });
  const setPerPage = (pp: number) => setSearchParams({ page: "1", perPage: String(pp) });

  const field = (label: string, key: keyof typeof form, type = "text", required = false) => {
    const id = `promo-${key}`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
          {label} {required && <span className="text-blue-500">*</span>}
        </label>
        <input
          id={id}
          type={type}
          value={String(form[key])}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          required={required}
          aria-required={required || undefined}
          className="bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <section className="relative py-10 border-b border-gray-900">
        <div className="container space-y-4">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <Tag className="h-3 w-3" aria-hidden="true" />
            GESTION DES PROMOS
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Codes promo</h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Créez, modifiez et désactivez les codes de réduction.
          </p>
        </div>
      </section>

      <div className="container flex justify-end mt-8">
        <Button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500">
          <Plus size={18} aria-hidden="true" /> Nouveau code
        </Button>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="container mt-6">
          <div className="bg-gray-900 border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white">
                {editing ? `Modifier ${editing.code}` : "Nouveau code promo"}
              </h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="promo-code-input" className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                  Code <span className="text-blue-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo-code-input"
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    required
                    aria-required="true"
                    className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors font-mono uppercase"
                  />
                  <button
                    type="button"
                    aria-label="Générer un code aléatoire"
                    onClick={async () => {
                      const res = await apiFetch<{ code: string }>("/api/admin/promos/generate", { method: "POST" }).catch(() => null);
                      if (res) setForm((f) => ({ ...f, code: res.code }));
                    }}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="promo-type-select" className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Type <span className="text-blue-500">*</span></label>
                <select
                  id="promo-type-select"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
                  className="bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="percent">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (€)</option>
                </select>
              </div>

              {field("Valeur", "value", "number", true)}
              {field("Utilisations max", "maxUses", "number")}
              {field("Montant minimum (€)", "minAmount", "number")}
              {field("Valide du", "validFrom", "date")}
              {field("Valide jusqu'au", "validUntil", "date")}

              <div className="flex flex-col gap-1">
                <label htmlFor="promo-applies-to" className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">S'applique à</label>
                <select
                  id="promo-applies-to"
                  value={form.appliesTo}
                  onChange={(e) => setForm((f) => ({ ...f, appliesTo: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Tous les services</option>
                  <option value="saas">SaaS uniquement</option>
                  <option value="one_shot">Achat unique</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Statut</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`flex items-center gap-2 px-3 py-2 border text-sm font-mono transition-colors ${
                    form.isActive
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-gray-800 text-gray-500 border-gray-700"
                  }`}
                >
                  {form.isActive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {form.isActive ? "Actif" : "Inactif"}
                </button>
              </div>

              <div className="md:col-span-3 flex gap-3 justify-end pt-2 border-t border-gray-800">
                <Button type="button" variant="ghost" onClick={closeForm}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                  {saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="container mt-8 mb-20">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <h2 className="font-semibold text-white">Liste des codes promo</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-gray-500">Aucun code promo.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left bg-gray-950/40">
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Type / Valeur</th>
                  <th className="px-6 py-4 font-medium">Utilisations</th>
                  <th className="px-6 py-4 font-medium">Validité</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-mono text-white font-semibold">
                      {p.code}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {p.type === "percent" ? `${p.value}%` : `${p.value} €`}
                      {p.minAmount != null && (
                        <span className="ml-2 text-gray-500 text-xs">min {p.minAmount} €</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ""}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {p.validFrom || p.validUntil
                        ? `${p.validFrom ?? "∞"} → ${p.validUntil ?? "∞"}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 font-mono border ${
                        p.isActive
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-gray-700/30 text-gray-500 border-gray-700"
                      }`}>
                        {p.isActive ? "ACTIF" : "INACTIF"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          aria-label={`Modifier ${p.code}`}
                          className="text-gray-300 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(p.id)}
                          aria-label={`Supprimer ${p.code}`}
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
