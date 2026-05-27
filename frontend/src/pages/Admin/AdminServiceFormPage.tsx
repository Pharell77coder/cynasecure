import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { servicesApi, type ServiceFeature, type CreateServicePayload } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toast } from "../../hooks/useToast";
import { Plus, Trash2, Upload, X, ChevronUp, ChevronDown, ImageOff } from "lucide-react";

type Avail = "available" | "maintenance" | "unavailable";
type Spec = { label: string; value: string };

interface FormState extends CreateServicePayload {
  images: string[];
  technicalSpecs: Spec[];
  availability: Avail;
  trialAvailable: boolean;
}

const AVAIL_LABELS: Record<Avail, string> = {
  available: "Disponible",
  maintenance: "En maintenance",
  unavailable: "Indisponible",
};

export default function AdminServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    categorySlug: "",
    description: "",
    longDescription: "",
    priceMonthly: 0,
    priceYearly: 0,
    image: "",
    images: [],
    features: [],
    technicalSpecs: [],
    type: "saas",
    availability: "available",
    trialAvailable: false,
  });

  useEffect(() => {
    if (!isEdit) { setLoading(false); return; }
    servicesApi
      .getById(id!)
      .then((data) => {
        setForm({
          name: data.name,
          categorySlug: data.categorySlug ?? "",
          description: data.description ?? "",
          longDescription: data.longDescription ?? "",
          priceMonthly: data.priceMonthly,
          priceYearly: data.priceYearly ?? 0,
          image: data.image ?? "",
          images: data.images ?? [],
          features: (data.features ?? []) as ServiceFeature[],
          technicalSpecs: (data.technicalSpecs ?? []) as Spec[],
          type: data.type as "saas" | "one_shot",
          availability: (data.availability ?? "available") as Avail,
          trialAvailable: data.trialAvailable ?? false,
        });
      })
      .catch(() => toast("Erreur lors du chargement du service", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  /* ─ Images ─ */
  const uploadImg = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
    if (!r.ok) throw new Error("Upload échoué");
    const data = await r.json() as { path: string };
    return data.path;
  };

  const handleImgFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const paths = await Promise.all(files.map(uploadImg));
      set("images", [...form.images, ...paths].slice(0, 10));
    } catch {
      toast("Erreur d'upload", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const moveImg = (i: number, dir: -1 | 1) => {
    const next = [...form.images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set("images", next);
  };

  const removeImg = (i: number) =>
    set("images", form.images.filter((_, idx) => idx !== i));

  /* ─ Specs ─ */
  const addSpec = () =>
    set("technicalSpecs", [...form.technicalSpecs, { label: "", value: "" }]);

  const updateSpec = (i: number, k: "label" | "value", v: string) => {
    const next = form.technicalSpecs.map((s, idx) => idx === i ? { ...s, [k]: v } : s);
    set("technicalSpecs", next);
  };

  const removeSpec = (i: number) =>
    set("technicalSpecs", form.technicalSpecs.filter((_, idx) => idx !== i));

  /* ─ Features ─ */
  const addFeature = () =>
    set("features", [...form.features, { label: "", included: true }]);

  const updateFeature = (i: number, k: "label" | "included", v: string | boolean) => {
    const next = (form.features as ServiceFeature[]).map((f, idx) =>
      idx === i ? { ...f, [k]: v } : f
    );
    set("features", next);
  };

  const removeFeature = (i: number) =>
    set("features", (form.features as ServiceFeature[]).filter((_, idx) => idx !== i));

  /* ─ Submit ─ */
  const submit = async () => {
    try {
      const payload: FormState = {
        ...form,
        image: form.image || (form.images[0] ?? null),
        technicalSpecs: form.technicalSpecs.filter((s) => s.label.trim() && s.value.trim()),
      };
      if (isEdit) {
        await servicesApi.update(id!, payload);
        toast("Service mis à jour", "success");
      } else {
        await servicesApi.create(payload);
        toast("Service créé", "success");
      }
      navigate("/admin/services");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'enregistrement", "error");
    }
  };

  if (loading) return <p className="text-gray-400 p-6">Chargement…</p>;

  const inputCls = "w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500";
  const labelCls = "text-gray-300 text-sm";

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">
        {isEdit ? "Modifier le service" : "Nouveau service"}
      </h1>

      <Card className="p-8 bg-gray-900 border-gray-800 space-y-8">

        {/* Infos de base */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="svc-name" className={labelCls}>Nom</label>
            <input id="svc-name" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="svc-category" className={labelCls}>Catégorie (slug)</label>
            <input id="svc-category" className={inputCls} value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} />
          </div>
          <div>
            <label htmlFor="svc-price-monthly" className={labelCls}>Prix mensuel</label>
            <input id="svc-price-monthly" type="number" className={inputCls} value={form.priceMonthly} onChange={(e) => set("priceMonthly", Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="svc-price-yearly" className={labelCls}>Prix annuel</label>
            <input id="svc-price-yearly" type="number" className={inputCls} value={form.priceYearly ?? 0} onChange={(e) => set("priceYearly", Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="svc-type" className={labelCls}>Type</label>
            <select
              id="svc-type"
              className={inputCls}
              value={form.type}
              onChange={(e) => set("type", e.target.value as "saas" | "one_shot")}
            >
              <option value="saas">SaaS</option>
              <option value="one_shot">One Shot</option>
            </select>
          </div>
          <div>
            <label htmlFor="svc-availability" className={labelCls}>Disponibilité</label>
            <select
              id="svc-availability"
              className={inputCls}
              value={form.availability}
              onChange={(e) => set("availability", e.target.value as Avail)}
            >
              {(Object.entries(AVAIL_LABELS) as [Avail, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {form.type === "saas" && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={form.trialAvailable}
                onChange={(e) => set("trialAvailable", e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-300">Version d'essai disponible</span>
            </label>
          </div>
        )}

        <div>
          <label htmlFor="svc-image" className={labelCls}>Image principale (URL ou chemin)</label>
          <input id="svc-image" className={inputCls} value={form.image ?? ""} onChange={(e) => set("image", e.target.value)} />
        </div>

        <div>
          <label htmlFor="svc-description" className={labelCls}>Description courte</label>
          <textarea id="svc-description" className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div>
          <label htmlFor="svc-long-description" className={labelCls}>Description longue</label>
          <textarea id="svc-long-description" className={inputCls} rows={5} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} />
        </div>

        {/* ─ Images multiples ─ */}
        <div>
          <label className={labelCls + " block mb-3"}>
            Illustrations ({form.images.length}/10)
          </label>

          <div className="space-y-2 mb-3">
            {form.images.map((src, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800 border border-gray-700 px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" aria-label="Monter l'image" onClick={() => i > 0 && moveImg(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20">
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="Descendre l'image" onClick={() => i < form.images.length - 1 && moveImg(i, 1)} disabled={i === form.images.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20">
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
                {src ? (
                  <img src={`/${src}`} alt="" className="w-14 h-9 object-cover border border-gray-600 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-9 bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
                    <ImageOff className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <span className="flex-1 text-xs font-mono text-gray-400 truncate">{src}</span>
                <button type="button" aria-label="Retirer cette image" onClick={() => removeImg(i)} className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            {form.images.length === 0 && (
              <p className="text-gray-500 text-sm font-mono">Aucune illustration.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || form.images.length >= 10}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-40"
          >
            <Upload className="h-3 w-3" />
            {uploading ? "Upload en cours…" : "Ajouter des images"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImgFiles}
          />
        </div>

        {/* ─ Caractéristiques techniques ─ */}
        <div>
          <label className={labelCls + " block mb-3"}>
            Caractéristiques techniques ({form.technicalSpecs.length}/20)
          </label>

          <div className="space-y-2 mb-3">
            {form.technicalSpecs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="Label"
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={spec.label}
                  onChange={(e) => updateSpec(i, "label", e.target.value)}
                />
                <input
                  placeholder="Valeur"
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={spec.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                />
                <button type="button" aria-label="Supprimer cette caractéristique" onClick={() => removeSpec(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          {form.technicalSpecs.length < 20 && (
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Ajouter une caractéristique
            </button>
          )}
        </div>

        {/* ─ Fonctionnalités ─ */}
        <div>
          <label className={labelCls + " block mb-3"}>Fonctionnalités incluses</label>
          <div className="space-y-2 mb-3">
            {(form.features as ServiceFeature[]).map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={f.included}
                  onChange={(e) => updateFeature(i, "included", e.target.checked)}
                  className="accent-blue-500"
                />
                <input
                  placeholder="Fonctionnalité"
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={f.label}
                  onChange={(e) => updateFeature(i, "label", e.target.value)}
                />
                <button type="button" aria-label="Supprimer cette fonctionnalité" onClick={() => removeFeature(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Ajouter une fonctionnalité
          </button>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={submit}>
          {isEdit ? "Mettre à jour" : "Créer le service"}
        </Button>
      </Card>
    </div>
  );
}
