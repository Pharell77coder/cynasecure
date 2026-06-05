import { useEffect, useRef, useState } from "react";
import React from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ImageOff,
  Video,
  Image,
} from "lucide-react";
import { adminHomeApi, type CarouselSlide, type HomeCategory, type HomeService } from "../../api/home";

/* helpers */

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 text-sm font-mono border ${
        ok ? "bg-emerald-900/90 border-emerald-700 text-emerald-300" : "bg-red-900/90 border-red-700 text-red-300"
      }`}
    >
      {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      {msg}
    </div>
  );
}

function SectionTitle({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-6">
      <div className="text-blue-500 font-mono text-xs tracking-widest mb-1">{sub}</div>
      <h2 className="text-xl font-bold text-white">{label}</h2>
    </div>
  );
}

// Carrousel

type MediaMode = "image" | "video";

interface SlideFormData {
  title: string;
  subtitle: string;
  imagePath: string;
  videoPath: string;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
}

const SLIDE_EMPTY: SlideFormData = {
  title: "", subtitle: "", imagePath: "", videoPath: "", ctaLabel: "", ctaUrl: "", isActive: true,
};

function SlideModal({
  slide,
  onClose,
  onSave,
}: {
  slide: CarouselSlide | null;
  onClose: () => void;
  onSave: (data: SlideFormData) => Promise<void>;
}) {
  const initVideoPath = slide?.videoPath ?? "";
  const initImagePath = slide?.imagePath ?? "";
  const initMode: MediaMode = initVideoPath ? "video" : "image";

  const [form, setForm] = useState<SlideFormData>(
    slide
      ? { title: slide.title, subtitle: slide.subtitle ?? "", imagePath: initImagePath, videoPath: initVideoPath, ctaLabel: slide.ctaLabel ?? "", ctaUrl: slide.ctaUrl ?? "", isActive: slide.isActive }
      : SLIDE_EMPTY
  );
  const [mediaMode, setMediaMode] = useState<MediaMode>(initMode);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof SlideFormData, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const switchMode = (mode: MediaMode) => {
    setMediaMode(mode);
    if (mode === "image") set("videoPath", "");
    else set("imagePath", "");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const path = await adminHomeApi.uploadFile(file);
      if (mediaMode === "video") {
        set("videoPath", path);
        set("imagePath", "");
      } else {
        set("imagePath", path);
        set("videoPath", "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Le titre est obligatoire"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const currentMedia = mediaMode === "video" ? form.videoPath : form.imagePath;

  const acceptAttr = mediaMode === "video"
    ? "video/mp4,video/webm,video/ogg"
    : "image/jpeg,image/png,image/webp";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="slide-modal-title" className="w-full max-w-lg bg-gray-900 border border-gray-700 my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 id="slide-modal-title" className="text-white font-bold">{slide ? "Modifier la slide" : "Nouvelle slide"}</h3>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-white"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

          {/* Sélecteur Image / Vidéo */}
          <div>
            <p className="block text-xs font-mono text-gray-400 mb-2">MÉDIA</p>
            <div className="flex border border-gray-700">
              <button
                type="button"
                onClick={() => switchMode("image")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono transition-colors ${
                  mediaMode === "image" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Image className="h-3 w-3" aria-hidden="true" />
                Image
              </button>
              <button
                type="button"
                onClick={() => switchMode("video")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono border-l border-gray-700 transition-colors ${
                  mediaMode === "video" ? "bg-blue-600 text-white border-blue-600" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Video className="h-3 w-3" aria-hidden="true" />
                Vidéo courte
              </button>
            </div>
          </div>

          {/* Zone d'upload */}
          <div>
            <div className="flex items-center gap-3">
              {/* Prévisualisation */}
              {currentMedia ? (
                mediaMode === "video" ? (
                  <video
                    src={`/${currentMedia}`}
                    className="w-24 h-14 object-cover border border-gray-700 flex-shrink-0"
                    muted
                    playsInline
                  />
                ) : (
                  <img src={`/${currentMedia}`} alt="" className="w-24 h-14 object-cover border border-gray-700 flex-shrink-0" />
                )
              ) : (
                <div className="w-24 h-14 bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                  {mediaMode === "video"
                    ? <Video className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    : <ImageOff className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  }
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" aria-hidden="true" />
                  {uploading ? "Upload…" : "Choisir un fichier"}
                </button>
                {currentMedia && (
                  <button
                    type="button"
                    onClick={() => mediaMode === "video" ? set("videoPath", "") : set("imagePath", "")}
                    aria-label="Supprimer le média"
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept={acceptAttr}
                className="hidden"
                onChange={handleUpload}
              />
            </div>

            {mediaMode === "video" && (
              <p className="mt-2 text-[11px] text-gray-500 font-mono">
                Formats acceptés : MP4, WebM, OGG — durée recommandée &lt; 30 s
              </p>
            )}
          </div>

          {/* Titre */}
          <div>
            <label htmlFor="slide-title" className="block text-xs font-mono text-gray-400 mb-1">TITRE *</label>
            <input
              id="slide-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={120}
              required
              aria-required="true"
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sous-titre */}
          <div>
            <label htmlFor="slide-subtitle" className="block text-xs font-mono text-gray-400 mb-1">SOUS-TITRE</label>
            <input
              id="slide-subtitle"
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              maxLength={240}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="slide-cta-label" className="block text-xs font-mono text-gray-400 mb-1">BOUTON (texte)</label>
              <input
                id="slide-cta-label"
                value={form.ctaLabel}
                onChange={(e) => set("ctaLabel", e.target.value)}
                maxLength={60}
                placeholder="Ex : Découvrir"
                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="slide-cta-url" className="block text-xs font-mono text-gray-400 mb-1">BOUTON (lien)</label>
              <input
                id="slide-cta-url"
                value={form.ctaUrl}
                onChange={(e) => set("ctaUrl", e.target.value)}
                maxLength={255}
                placeholder="/catalogue"
                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actif */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-sm text-gray-300">Slide visible sur le site</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-mono text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-mono bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CarouselSection({ onToast }: { onToast: (msg: string, ok: boolean) => void }) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<CarouselSlide | null | "new">(null);

  const reload = () => adminHomeApi.listSlides().then(setSlides).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...slides];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setSlides(next);
    await adminHomeApi.reorderSlides(next.map((s) => s.id));
    onToast("Ordre mis à jour", true);
  };

  const toggleActive = async (slide: CarouselSlide) => {
    try {
      const updated = await adminHomeApi.updateSlide(slide.id, { isActive: !slide.isActive });
      setSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      onToast(updated.isActive ? "Slide activée" : "Slide masquée", true);
    } catch {
      onToast("Erreur", false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette slide ?")) return;
    try {
      await adminHomeApi.deleteSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      onToast("Slide supprimée", true);
    } catch {
      onToast("Erreur suppression", false);
    }
  };

  const handleSave = async (data: SlideFormData) => {
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      imagePath: data.imagePath || null,
      videoPath: data.videoPath || null,
      ctaLabel: data.ctaLabel,
      ctaUrl: data.ctaUrl,
      isActive: data.isActive,
    };
    if (modal === "new") {
      const created = await adminHomeApi.createSlide({ ...payload, position: slides.length });
      setSlides((prev) => [...prev, created]);
      onToast("Slide créée", true);
    } else if (modal) {
      const updated = await adminHomeApi.updateSlide(modal.id, payload);
      setSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      onToast("Slide mise à jour", true);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <SectionTitle label="Carrousel" sub="SECTION 1 — HERO" />

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Chargement…</p>
      ) : (
        <div className="space-y-2 mb-4">
          {slides.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 px-4 py-3">
              {/* Flèches */}
              <div className="flex flex-col gap-0.5">
                <button aria-label="Monter la slide" onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20">
                  <ChevronUp className="h-3 w-3" aria-hidden="true" />
                </button>
                <button aria-label="Descendre la slide" onClick={() => i < slides.length - 1 && move(i, 1)} disabled={i === slides.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20">
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
              <GripVertical className="h-4 w-4 text-gray-600 flex-shrink-0" aria-hidden="true" />

              {/* Miniature */}
              {s.videoPath ? (
                <div className="relative w-14 h-8 bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                  <Video className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-[8px] font-mono px-0.5">VID</span>
                </div>
              ) : s.imagePath ? (
                <img src={`/${s.imagePath}`} alt="" className="w-14 h-8 object-cover border border-gray-700 flex-shrink-0" />
              ) : (
                <div className="w-14 h-8 bg-gray-700 border border-gray-700 flex items-center justify-center flex-shrink-0">
                  <ImageOff className="h-3 w-3 text-gray-500" aria-hidden="true" />
                </div>
              )}

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{s.title}</p>
                {s.subtitle && <p className="text-gray-500 text-xs truncate">{s.subtitle}</p>}
              </div>

              {/* Actions */}
              <button onClick={() => toggleActive(s)} aria-label={s.isActive ? "Masquer la slide" : "Afficher la slide"} className={`${s.isActive ? "text-emerald-400 hover:text-gray-400" : "text-gray-500 hover:text-emerald-400"} transition-colors`}>
                {s.isActive ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button onClick={() => setModal(s)} aria-label={`Modifier la slide « ${s.title} »`} className="text-gray-400 hover:text-blue-400 transition-colors">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button onClick={() => handleDelete(s.id)} aria-label={`Supprimer la slide « ${s.title} »`} className="text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setModal("new")}
        className="flex items-center gap-2 px-4 py-2 text-sm font-mono border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Ajouter une slide
      </button>

      {modal !== null && (
        <SlideModal
          slide={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Contenu texte

function ContentSection({ onToast }: { onToast: (msg: string, ok: boolean) => void }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminHomeApi.getContent("hero_intro")
      .then((c) => { setContent(c.content); setTitle(c.title ?? ""); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminHomeApi.saveContent("hero_intro", { title, content });
      onToast("Texte enregistré", true);
    } catch {
      onToast("Erreur enregistrement", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <SectionTitle label="Texte d'introduction" sub="SECTION 2 — HÉRO INTRO" />

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Chargement…</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="content-title" className="block text-xs font-mono text-gray-400 mb-1">TITRE</label>
            <input
              id="content-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="content-body" className="block text-xs font-mono text-gray-400 mb-1">CONTENU</label>
            <textarea
              id="content-body"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-mono bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Catégories

function CategoriesSection({ onToast }: { onToast: (msg: string, ok: boolean) => void }) {
  const [cats, setCats] = useState<HomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const reload = () => adminHomeApi.listCategories().then(setCats).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const inHome = cats.filter((c) => c.homePosition !== null).sort((a, b) => (a.homePosition ?? 0) - (b.homePosition ?? 0));
  const notInHome = cats.filter((c) => c.homePosition === null);

  const addToHome = async (cat: HomeCategory) => {
    const maxPos = Math.max(-1, ...inHome.map((c) => c.homePosition ?? -1));
    try {
      const updated = await adminHomeApi.updateCategoryHome(cat.id, { homePosition: maxPos + 1 });
      setCats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      onToast(`${cat.name} ajoutée à l'accueil`, true);
    } catch {
      onToast("Erreur", false);
    }
  };

  const removeFromHome = async (cat: HomeCategory) => {
    try {
      const updated = await adminHomeApi.updateCategoryHome(cat.id, { homePosition: null });
      setCats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      onToast(`${cat.name} retirée de l'accueil`, true);
    } catch {
      onToast("Erreur", false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...inHome];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setCats((prev) => {
      const updated = [...prev];
      next.forEach((c, i) => {
        const found = updated.find((x) => x.id === c.id);
        if (found) found.homePosition = i;
      });
      return [...updated];
    });
    await adminHomeApi.reorderCategories(next.map((c) => c.id));
    onToast("Ordre mis à jour", true);
  };

  const handleImageUpload = async (cat: HomeCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(cat.id);
    try {
      const path = await adminHomeApi.uploadImage(file);
      const updated = await adminHomeApi.updateCategoryHome(cat.id, { imagePath: path });
      setCats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      onToast("Image mise à jour", true);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Erreur", false);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <SectionTitle label="Catégories affichées" sub="SECTION 3 — GRILLE DOMAINES" />

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Chargement…</p>
      ) : (
        <div className="space-y-6">
          {/* In home */}
          <div>
            <p className="text-xs font-mono text-gray-500 mb-3">AFFICHÉES SUR L'ACCUEIL ({inHome.length})</p>
            <div className="space-y-2">
              {inHome.map((cat, i) => (
                <div key={cat.id} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 px-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <button aria-label="Monter la catégorie" onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20">
                      <ChevronUp className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button aria-label="Descendre la catégorie" onClick={() => i < inHome.length - 1 && move(i, 1)} disabled={i === inHome.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20">
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Miniature */}
                  {cat.imagePath ? (
                    <img src={`/${cat.imagePath}`} alt="" className="w-10 h-10 object-cover border border-gray-700 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 border border-gray-700 flex items-center justify-center flex-shrink-0">
                      <ImageOff className="h-3 w-3 text-gray-500" />
                    </div>
                  )}

                  <span className="flex-1 text-sm text-white">{cat.name}</span>

                  {/* Upload image */}
                  <button
                    onClick={() => fileRefs.current.get(cat.id)?.click()}
                    disabled={uploading === cat.id}
                    className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-3 w-3" />
                    {uploading === cat.id ? "…" : "Image"}
                  </button>
                  <input
                    ref={(el) => { if (el) fileRefs.current.set(cat.id, el); }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageUpload(cat, e)}
                  />

                  {/* Retirer */}
                  <button onClick={() => removeFromHome(cat)} aria-label={`Retirer ${cat.name} de l'accueil`} className="text-gray-500 hover:text-red-400 transition-colors">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {inHome.length === 0 && (
                <p className="text-gray-500 text-sm font-mono py-2">Aucune catégorie affichée.</p>
              )}
            </div>
          </div>

          {/* Not in home */}
          {notInHome.length > 0 && (
            <div>
              <p className="text-xs font-mono text-gray-500 mb-3">AUTRES CATÉGORIES — cliquer pour ajouter</p>
              <div className="flex flex-wrap gap-2">
                {notInHome.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => addToHome(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Top produits

function TopProductsSection({ onToast }: { onToast: (msg: string, ok: boolean) => void }) {
  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => adminHomeApi.listTopProducts().then(setServices).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const inTop = services.filter((s) => s.homePosition !== null).sort((a, b) => (a.homePosition ?? 0) - (b.homePosition ?? 0));
  const notInTop = services.filter((s) => s.homePosition === null);

  const add = async (svc: HomeService) => {
    try {
      const updated = await adminHomeApi.addTopProduct(svc.id);
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      onToast(`${svc.name} ajouté`, true);
    } catch {
      onToast("Erreur", false);
    }
  };

  const remove = async (svc: HomeService) => {
    try {
      await adminHomeApi.removeTopProduct(svc.id);
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, homePosition: null } : s)));
      onToast(`${svc.name} retiré`, true);
    } catch {
      onToast("Erreur", false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...inTop];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setServices((prev) => {
      const updated = [...prev];
      next.forEach((s, i) => {
        const found = updated.find((x) => x.id === s.id);
        if (found) found.homePosition = i;
      });
      return [...updated];
    });
    await adminHomeApi.reorderTopProducts(next.map((s) => s.id));
    onToast("Ordre mis à jour", true);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <SectionTitle label="Solutions mises en avant" sub="SECTION 4 — TOP PRODUITS" />

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Chargement…</p>
      ) : (
        <div className="space-y-6">
          {/* In top */}
          <div>
            <p className="text-xs font-mono text-gray-500 mb-3">AFFICHÉS SUR L'ACCUEIL ({inTop.length})</p>
            <div className="space-y-2">
              {inTop.map((svc, i) => (
                <div key={svc.id} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 px-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <button aria-label="Monter le service" onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20">
                      <ChevronUp className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button aria-label="Descendre le service" onClick={() => i < inTop.length - 1 && move(i, 1)} disabled={i === inTop.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20">
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                  <GripVertical className="h-4 w-4 text-gray-600 flex-shrink-0" aria-hidden="true" />

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{svc.name}</p>
                    {svc.category && <p className="text-gray-500 text-xs truncate">{svc.category}</p>}
                  </div>

                  {svc.priceMonthly != null && (
                    <span className="text-xs font-mono text-blue-400">{svc.priceMonthly} €/mois</span>
                  )}

                  <button onClick={() => remove(svc)} aria-label={`Retirer ${svc.name} des solutions mises en avant`} className="text-gray-500 hover:text-red-400 transition-colors">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {inTop.length === 0 && (
                <p className="text-gray-500 text-sm font-mono py-2">Aucun produit mis en avant.</p>
              )}
            </div>
          </div>

          {/* Not in top */}
          {notInTop.length > 0 && (
            <div>
              <p className="text-xs font-mono text-gray-500 mb-3">AUTRES SERVICES — cliquer pour ajouter</p>
              <div className="flex flex-wrap gap-2">
                {notInTop.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => add(svc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {svc.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Page principale

export default function AdminHomePage() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Page d'accueil</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez le contenu affiché sur la page principale du site.</p>
      </div>

      <CarouselSection onToast={showToast} />
      <ContentSection onToast={showToast} />
      <CategoriesSection onToast={showToast} />
      <TopProductsSection onToast={showToast} />

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
