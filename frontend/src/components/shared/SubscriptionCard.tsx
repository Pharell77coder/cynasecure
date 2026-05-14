import { formatPrice } from "../../lib/utils";
import type { BillingCycle } from "../../context/CartContext";
import React from "react";

interface SubscriptionCardProps {
  cycle: BillingCycle;
  priceMonthly: number;
  onChange: (cycle: BillingCycle) => void;
}

const yearlyPrice = (m: number) => Math.round(m * 12 * 0.83);

export function SubscriptionCard({
  cycle,
  priceMonthly,
  onChange,
}: SubscriptionCardProps) {
  const options = [
    {
      value: "monthly" as BillingCycle,
      label: "Mensuel",
      price: formatPrice(priceMonthly),
      suffix: "/mois",
    },
    {
      value: "yearly" as BillingCycle,
      label: "Annuel",
      price: formatPrice(yearlyPrice(priceMonthly)),
      suffix: "/an",
      tag: "-17%",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = cycle === opt.value;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              active
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{opt.label}</span>

              {opt.tag && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {opt.tag}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold">{opt.price}</span>
              <span className="text-xs text-muted-foreground">{opt.suffix}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
