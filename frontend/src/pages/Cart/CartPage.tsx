import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, Package, Lock, Tag, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { formatPrice } from "../../lib/utils";
import { apiFetch } from "../../api/apiFetch";
import { useTranslation } from "react-i18next";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, removeFromCart, clearCart, total, promo, setPromo } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState(promo?.code ?? "");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const checkout = () => {
    if (!isAuthenticated) {
      toast(t("checkout.loginRequired"), "error");
      navigate("/connexion");
      return;
    }
    navigate("/checkout");
  };

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await apiFetch<{
        valid: boolean;
        code: string;
        type: string;
        discount: number;
        discountedTotal: number;
      }>("/api/cart/promo", {
        method: "POST",
        body: JSON.stringify({ code, total }),
      });

      setPromo({ code: res.code, discount: res.discount, discountedTotal: res.discountedTotal, type: res.type });
      toast(t("checkout.promoApplied"), "success");
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : t("checkout.promoInvalid"));
      setPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = async () => {
    await apiFetch("/api/cart/promo", { method: "DELETE" }).catch(() => {});
    setPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="border border-gray-800 bg-gray-900 p-8 mb-6">
          <ShoppingCart className="h-12 w-12 text-gray-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t("checkout.emptyCart")}</h1>
        <p className="mt-2 text-gray-500 text-sm max-w-xs">
          {t("checkout.emptyCartDesc")}
        </p>
        <Link to="/catalogue" className="mt-6">
          <Button className="gap-2">
            {t("checkout.seeCatalogue")} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const finalTotal = promo ? promo.discountedTotal : total;

  return (
    <PageTransition>
    <div className="container py-12 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-5 w-5 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">
          {t("checkout.cartTitle")}
          <span className="ml-2 text-gray-500 font-normal text-base">
            {items.length} {items.length > 1 ? t("checkout.articlesPlural") : t("checkout.articles")}
          </span>
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* Items */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 object-cover border border-gray-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{t("checkout.perpetualLicense")}</p>
                  </div>

                  <p className="text-lg font-bold text-white flex-shrink-0">
                    {formatPrice(item.priceMonthly)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
                    aria-label={t("checkout.remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside>
          <div className="border border-gray-800 bg-gray-900 p-6 sticky top-24 space-y-5">
            <h2 className="text-xs font-mono tracking-widest text-gray-500 uppercase">
              {t("checkout.summary")}
            </h2>

            <div className="space-y-2.5 pb-5 border-b border-gray-800">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400 truncate mr-2">{item.name}</span>
                  <span className="text-gray-300 flex-shrink-0">{formatPrice(item.priceMonthly)}</span>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div>
              <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block mb-2">
                {t("checkout.promoCode")}
              </label>
              {promo ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                    <span className="text-green-400 text-xs font-mono">{promo.code}</span>
                    <span className="text-green-300 text-xs">−{formatPrice(promo.discount)}</span>
                  </div>
                  <button onClick={removePromo} className="text-gray-500 hover:text-red-400 transition-colors" aria-label={t("checkout.removePromo")}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                    placeholder="CODEPROMO"
                    className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 uppercase"
                    aria-label={t("checkout.promoCode")}
                  />
                  <button
                    onClick={applyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
                    aria-label={t("checkout.applyPromo")}
                  >
                    <Tag className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {promoError && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {promoError}
                </p>
              )}
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-2">
              {promo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("checkout.subtotal")}</span>
                  <span className="text-gray-300">{formatPrice(total)}</span>
                </div>
              )}
              {promo && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">{t("checkout.discount")}</span>
                  <span className="text-green-400">−{formatPrice(promo.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-sm">{t("checkout.totalTtc")}</span>
                <span className="text-3xl font-black text-white">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={checkout} className="gap-2">
              {t("checkout.order")} <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-center py-1"
            >
              {t("checkout.clearCart")}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <Lock className="h-3 w-3" />
              {t("checkout.securePayment")}
            </div>
          </div>
        </aside>
      </div>
    </div>
    </PageTransition>
  );
}
