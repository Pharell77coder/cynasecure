import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ChartData } from "../../../api/admin";
import { formatPrice } from "../../../lib/utils";
import React from "react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#2563EB"];

type SalesPoint   = ChartData["salesOverTime"][number];
type StackedPoint = ChartData["salesByCategory"][number];
type SharePoint   = ChartData["categoryDistribution"][number];

const axisStyle  = { fill: "#6b7280", fontFamily: "monospace", fontSize: 10 };
const gridStyle  = { stroke: "#1f2937" };
const tickFmt    = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`;

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[280px] text-gray-500 text-sm font-mono">
      Pas encore de ventes sur la période sélectionnée
    </div>
  );
}

/* Tooltip ventes */
function SalesTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pt    = entry.payload as SalesPoint;
  return (
    <div className="bg-gray-900 border border-gray-700 px-3 py-2">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-blue-400">{formatPrice(entry.value as number)}</p>
      <p className="text-xs text-gray-500">{pt.ordersCount} commande{pt.ordersCount !== 1 ? "s" : ""}</p>
    </div>
  );
}

/* Graphique 1 : ventes par période */
export function SalesBarChart({ data, period }: { data: SalesPoint[]; period: "days" | "weeks" }) {
  const total    = data.reduce((s, d) => s + d.total, 0);
  const isEmpty  = total === 0;
  const ariaLabel = period === "days"
    ? `Histogramme des ventes des 7 derniers jours, total ${formatPrice(total)}`
    : `Histogramme des ventes des 5 dernières semaines, total ${formatPrice(total)}`;

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <h3 className="text-sm font-semibold text-white mb-1">Ventes par période</h3>
      <p className="text-xs text-gray-500 mb-4">
        {period === "days" ? "7 derniers jours" : "5 dernières semaines"} · total&nbsp;
        <span className="text-white">{formatPrice(total)}</span>
      </p>
      {isEmpty ? <EmptyState /> : (
        <>
        <p className="sr-only">{ariaLabel}</p>
        <div role="img" aria-label={ariaLabel} className="h-[280px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStyle.stroke} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={tickFmt} tick={axisStyle} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<SalesTooltip />} cursor={{ fill: "#1f2937" }} />
              <Bar dataKey="total" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </>
      )}
    </div>
  );
}

/* Tooltip empilé */
function StackedTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value as number ?? 0), 0);
  return (
    <div className="bg-gray-900 border border-gray-700 px-3 py-2 min-w-[160px]">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-xs text-gray-400 flex-1 truncate">{p.name}</span>
          <span className="text-xs text-blue-400">{formatPrice(p.value as number)}</span>
        </div>
      ))}
      <div className="border-t border-gray-700 pt-1 mt-1 flex justify-between">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-xs text-white">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

/* Graphique 2 : catégories empilées */
export function StackedCategoryChart({ data }: { data: StackedPoint[] }) {
  const cats = [...new Set(data.flatMap(d => Object.keys(d.categories)))];
  const isEmpty = cats.length === 0;

  type FlatEntry = { label: string } & Record<string, number>;
  const flat: FlatEntry[] = data.map(d => {
    const vals = cats.reduce<Record<string, number>>((acc, cat) => {
      acc[cat] = d.categories[cat] ?? 0;
      return acc;
    }, {});
    return { label: d.label, ...vals };
  });

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <h3 className="text-sm font-semibold text-white mb-1">Ventes par catégorie</h3>
      <p className="text-xs text-gray-500 mb-4">Paniers moyens par catégorie</p>
      {isEmpty ? <EmptyState /> : (
        <div role="img" aria-label="Histogramme des ventes par catégorie" className="h-[280px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flat} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStyle.stroke} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={tickFmt} tick={axisStyle} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<StackedTooltip />} cursor={{ fill: "#1f2937" }} />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace", color: "#6b7280", paddingTop: 8 }}
              />
              {cats.map((cat, i) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]}
                  radius={i === cats.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* Tooltip camembert */
function PieTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const share = entry.payload as SharePoint;
  return (
    <div className="bg-gray-900 border border-gray-700 px-3 py-2">
      <p className="text-xs text-white font-medium mb-0.5">{entry.name as string}</p>
      <p className="text-sm text-blue-400">{formatPrice(entry.value as number)}</p>
      <p className="text-xs text-gray-500">{share.percentage}%</p>
    </div>
  );
}

/* Graphique 3 : camembert catégories */
export function CategoryPieChart({ data }: { data: SharePoint[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);

  const renderLegend = () => (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3">
      {data.map((d, i) => (
        <div key={d.category} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
          <span className="text-[10px] font-mono text-gray-400">{d.category}</span>
          <span className="text-[10px] font-mono text-gray-500">{d.percentage}%</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 p-6">
      <h3 className="text-sm font-semibold text-white mb-1">Répartition par catégorie</h3>
      <p className="text-xs text-gray-500 mb-4">
        Total période : <span className="text-white">{formatPrice(total)}</span>
      </p>
      {data.length === 0 ? <EmptyState /> : (
        <div role="img" aria-label={`Camembert des ventes par catégorie, total ${formatPrice(total)}`}>
          <div className="h-[220px] md:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="72%"
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {renderLegend()}
        </div>
      )}
    </div>
  );
}
