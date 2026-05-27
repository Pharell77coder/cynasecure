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
            className={`p-4 border bg-gray-900 rounded-none text-left transition
              ${
                active
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/40"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {opt.label}
              </span>

              {opt.tag && (
                <span className="px-2 py-0.5 text-[11px] font-mono tracking-widest border border-blue-500/30 bg-blue-500/10 text-blue-400">
                  {opt.tag}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">
                {opt.price}
              </span>
              <span className="text-xs text-gray-400">{opt.suffix}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
