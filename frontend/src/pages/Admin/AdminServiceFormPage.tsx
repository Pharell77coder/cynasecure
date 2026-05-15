import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { servicesApi, type ServiceFeature, type CreateServicePayload } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toast } from "../../hooks/useToast";

export default function AdminServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);

  // FORM STATE — fully typed
  const [form, setForm] = useState<CreateServicePayload>({
    name: "",
    categorySlug: "",
    description: "",
    longDescription: "",
    priceMonthly: 0,
    priceYearly: 0,
    image: "",
    features: [] as ServiceFeature[],
    type: "saas",
  });

  /* LOAD SERVICE IF EDIT MODE */
  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

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
          features: (data.features ?? []) as ServiceFeature[],
          type: data.type as "saas" | "one_shot",
        });
      })
      .catch(() => toast("Erreur lors du chargement du service", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  /* UPDATE FIELD */
  const updateField = (key: keyof CreateServicePayload, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* SUBMIT */
  const submit = async () => {
    try {
      if (isEdit) {
        await servicesApi.update(id!, form);
        toast("Service mis à jour", "success");
      } else {
        await servicesApi.create(form);
        toast("Service créé", "success");
      }

      navigate("/admin/services");
    } catch (err: any) {
      toast(err.message || "Erreur lors de l’enregistrement", "error");
    }
  };

  if (loading) return <p className="text-gray-400 p-6">Chargement…</p>;

  return (
    <div className="relative">

      <h1 className="text-3xl font-black text-white">
        {isEdit ? "Modifier le service" : "Nouveau service"}
      </h1>

      <Card className="p-8 bg-gray-900 border-gray-800 space-y-6">

        {/* NAME */}
        <div>
          <label className="text-gray-300 text-sm">Nom</label>
          <input
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        {/* CATEGORY SLUG */}
        <div>
          <label className="text-gray-300 text-sm">Catégorie (slug)</label>
          <input
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            value={form.categorySlug}
            onChange={(e) => updateField("categorySlug", e.target.value)}
          />
        </div>

        {/* PRICE MONTHLY */}
        <div>
          <label className="text-gray-300 text-sm">Prix mensuel</label>
          <input
            type="number"
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            value={form.priceMonthly}
            onChange={(e) => updateField("priceMonthly", Number(e.target.value))}
          />
        </div>

        {/* PRICE YEARLY */}
        <div>
          <label className="text-gray-300 text-sm">Prix annuel</label>
          <input
            type="number"
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            value={form.priceYearly ?? 0}
            onChange={(e) => updateField("priceYearly", Number(e.target.value))}
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="text-gray-300 text-sm">Image (URL)</label>
          <input
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            value={form.image ?? ""}
            onChange={(e) => updateField("image", e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-gray-300 text-sm">Description</label>
          <textarea
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {/* LONG DESCRIPTION */}
        <div>
          <label className="text-gray-300 text-sm">Description longue</label>
          <textarea
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            rows={5}
            value={form.longDescription}
            onChange={(e) => updateField("longDescription", e.target.value)}
          />
        </div>

        {/* TYPE */}
        <div>
          <label className="text-gray-300 text-sm">Type</label>
          <select
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 text-white"
            value={form.type}
            onChange={(e) =>
              updateField("type", e.target.value as "saas" | "one_shot")
            }
          >
            <option value="saas">SaaS</option>
            <option value="one_shot">One Shot</option>
          </select>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={submit}>
          {isEdit ? "Mettre à jour" : "Créer le service"}
        </Button>
      </Card>
    </div>
  );
}
