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
    <Link to={`/catalogue?cat=${item.slug}`} className="block">
      <Card className="flex h-full flex-col items-center text-center transition-colors hover:border-primary">
        {/* Icône */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        {/* Titre */}
        <h3 className="text-base font-bold">{item.name}</h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </p>

        {/* Nombre de services */}
        <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
          {item.count} services
          <ArrowRight className="h-3 w-3" />
        </span>
      </Card>
    </Link>
  );
}
