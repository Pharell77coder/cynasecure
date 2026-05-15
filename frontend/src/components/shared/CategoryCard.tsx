import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";
import React from "react";

export interface CategoryItem {
  slug: string;
  name: string;
  description: string;
  count: number;
  icon: LucideIcon;
}

export function CategoryCard({ item }: { item: CategoryItem }) {
  const Icon = item.icon;

  return (
    <Link
      to={`/catalogue?cat=${item.slug}`}
      className="block group"
    >
      <Card className="flex h-full flex-col items-center text-center bg-gray-900 border border-gray-800 rounded-none p-6 transition hover:bg-gray-800 hover:border-blue-500/40">

        {/* Icône */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center border border-blue-500/30 bg-blue-500/10">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>

        {/* Titre */}
        <h3 className="text-base font-bold text-white tracking-tight">
          {item.name}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs text-gray-400">
          {item.description}
        </p>

        {/* Nombre de services */}
        <span className="mt-4 inline-flex items-center gap-1 text-xs text-blue-400 font-mono tracking-widest">
          {item.count} services
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition" />
        </span>
      </Card>
    </Link>
  );
}
